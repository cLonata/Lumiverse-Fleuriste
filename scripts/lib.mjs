import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
export const writeJson = (file, value) => {
  const dest = path.join(root, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(value, null, 2) + '\n');
};
export const readText = file => fs.readFileSync(path.join(root, file), 'utf8');
export const sha = value => crypto.createHash('sha256').update(value).digest('hex');
export const stableUuid = value => {
  const h = sha(value);
  return `${h.slice(0,8)}-${h.slice(8,12)}-5${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;
};
export const slug = value => value.normalize('NFKD').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 65) || 'untitled';
export const sourceFile = () => {
  const files = fs.readdirSync(path.join(root, 'base')).filter(f => /atelier/i.test(f) && /3[._ ]3/i.test(f) && /\.json$/i.test(f));
  if (files.length !== 1) throw new Error(`Expected one Atelier 3.3 JSON; found ${files.length}`);
  return `base/${files[0]}`;
};
export const mappedSettings = new Set([
  'temperature','frequency_penalty','presence_penalty','top_p','top_k','min_p','repetition_penalty',
  'openai_max_context','openai_max_tokens','names_behavior','send_if_empty','impersonation_prompt',
  'new_chat_prompt','new_group_chat_prompt','continue_nudge_prompt','group_nudge_prompt','stream_openai',
  'assistant_prefill','assistant_impersonation','use_sysprompt','squash_system_messages','media_inlining',
  'continue_prefill','continue_postfix','function_calling','enable_web_search','seed',
]);
export const orderedEntries = manifest => {
  const order = manifest.promptOrders.find(o => o.characterId === manifest.activeCharacterId);
  if (!order) throw new Error('Active prompt order missing');
  const byId = new Map(manifest.blocks.map(b => [b.id, b]));
  const seen = new Set();
  const entries = order.entries.map(({ id, enabled }) => {
    if (seen.has(id) || !byId.has(id)) throw new Error(`Invalid ordered block: ${id}`);
    seen.add(id);
    return { entry: byId.get(id), enabled };
  });
  for (const entry of manifest.blocks) if (!seen.has(entry.id)) entries.push({ entry, enabled: entry.enabled });
  return entries;
};

const markers = { chatHistory:'chat_history', worldInfoBefore:'world_info_before', worldInfoAfter:'world_info_after', charDescription:'char_description', charPersonality:'char_personality', personaDescription:'persona_description', scenario:'scenario', dialogueExamples:'dialogue_examples', main:'main_prompt', enhanceDefinitions:'enhance_definitions', jailbreak:'jailbreak', nsfw:'nsfw_prompt' };
export function toBlock(entry, content, enabled, group) {
  const marker = markers[entry.id] || ((entry.name.startsWith('━') || (content.includes('@section-header true') && /^===.+===$/.test(entry.name))) ? 'category' : null);
  const position = entry.injectionPosition === 1 ? 'in_history' : 'pre_history';
  return {
    id: entry.id, name: entry.name, content, role: entry.role || 'system', enabled,
    position, depth: position === 'in_history' ? entry.injectionDepth : 0,
    marker, isLocked: ['chat_history','world_info_before','world_info_after','char_description','char_personality','persona_description','scenario','dialogue_examples'].includes(marker), color: null, injectionTrigger: entry.injectionTrigger,
    group: marker === 'category' ? null : group, categoryMode: null,
  };
}

export function toRegex(entry, source, index) {
  const allowed = new Set(['id','scriptName','findRegex','replaceString','trimStrings','placement','disabled','markdownOnly','promptOnly','runOnEdit','substituteRegex','minDepth','maxDepth']);
  for (const key of Object.keys(source)) if (!allowed.has(key)) throw new Error(`Unsupported source regex field ${entry.id}.${key}`);
  if (!Array.isArray(source.placement) || source.placement.some(x => ![0,1,2,5,6].includes(x))) throw new Error(`Unsupported placement in ${entry.id}`);
  if (![0,1,2].includes(source.substituteRegex)) throw new Error(`Unsupported macro substitution in ${entry.id}`);
  const match = source.findRegex.match(/^\/(.+)\/([dgimsuvy]*)$/s);
  const placementMap = { 0:'user_input', 1:'user_input', 2:'ai_output', 5:'world_info', 6:'reasoning' };
  const placement = [...new Set(source.placement.map(x => placementMap[x]).filter(Boolean))];
  const target = [source.markdownOnly && 'display', source.promptOnly && 'prompt'].filter(Boolean);
  return {
    name: entry.name, script_id: `fleuriste_${entry.id.replace(/-/g,'_')}`, find_regex: match ? match[1] : source.findRegex,
    replace_string: source.replaceString, actions: [], flags: match ? (match[2] || 'gi') : 'gi',
    placement: placement.length ? placement : ['ai_output'], scope:'global', scope_id:null,
    target: target.length ? target : ['response'], min_depth: source.minDepth == null || source.minDepth < 0 ? null : source.minDepth,
    max_depth: source.maxDepth == null || source.maxDepth < 0 ? null : source.maxDepth,
    trim_strings: source.trimStrings, run_on_edit: source.runOnEdit,
    substitute_macros: ({ 0:'none', 1:'raw', 2:'escaped' })[source.substituteRegex],
    disabled: !entry.enabled, sort_order: index, description:'', folder:'Fleuriste',
    owner_extension_identifier:null, metadata:{ atelierSourceId:entry.id },
  };
}
