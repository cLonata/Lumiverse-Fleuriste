import fs from 'node:fs';
import path from 'node:path';
import { root, readJson, writeJson, sha, slug, sourceFile, mappedSettings } from './lib.mjs';

const force = process.argv.includes('--force');
const source = sourceFile();
const data = readJson(source);
const manifestPath = path.join(root, 'manifest.json');
if (fs.existsSync(manifestPath) && !force) throw new Error('manifest.json exists; extraction would replace modular metadata. Use --force deliberately.');
const used = new Set();
const sections = ['core','preferences','runtime','planning','formatting'];
function section(p) {
  const key = `${p.identifier} ${p.name}`.toLowerCase();
  if (/runtime|mode|lock/.test(key)) return 'runtime';
  if (/pref|setting|toggle|stakes|bias|smut|violence|romance|humor|length|sensory|tone|pov|agency|dialogue|worldbuilding|development|worldlogic|visual/.test(key)) return 'preferences';
  if (/plan|outline|beat|scene|arc/.test(key)) return 'planning';
  if (/format|prefill|footer|header|output/.test(key)) return 'formatting';
  return sections[0];
}
const blocks = data.prompts.map((p, index) => {
  if (!p.identifier || used.has(p.identifier)) throw new Error(`Duplicate or missing prompt identifier at ${index}`);
  used.add(p.identifier);
  const file = `src/${section(p)}/${slug(p.identifier)}.txt`;
  const dest = path.join(root, file);
  if (fs.existsSync(dest) && !force) throw new Error(`Refusing overwrite: ${file}`);
  fs.mkdirSync(path.dirname(dest), { recursive:true });
  fs.writeFileSync(dest, p.content, 'utf8');
  const { content, ...sourceMetadata } = p;
  return { id:p.identifier, name:p.name, file, enabled:p.enabled, role:p.role,
    marker:p.marker, injectionPosition:p.injection_position, injectionDepth:p.injection_depth,
    injectionOrder:p.injection_order, injectionTrigger:p.injection_trigger,
    sourceIndex:index, sourceContentSha256:sha(content), sourceMetadata };
});
const seenRegex = new Set();
const regex = data.extensions.regex_scripts.map((r, index) => {
  if (!r.id || seenRegex.has(r.id)) throw new Error(`Duplicate or missing regex id at ${index}`);
  seenRegex.add(r.id);
  const file = `src/regex/${String(index+1).padStart(2,'0')}-${slug(r.scriptName)}.json`;
  if (fs.existsSync(path.join(root, file)) && !force) throw new Error(`Refusing overwrite: ${file}`);
  writeJson(file, r);
  return { id:r.id, name:r.scriptName, file, enabled:!r.disabled, order:index, sourceSha256:sha(JSON.stringify(r)) };
});
const { prompts, prompt_order, extensions, ...settings } = data;
const manifest = {
  name:'Fleuriste', version:'0.1.0', upstream:{ file:source, name:'Atelier 3.3', revision:'9', sha256:sha(fs.readFileSync(path.join(root, source))) },
  activeCharacterId:100001,
  promptOrders:prompt_order.map(o => ({ characterId:o.character_id, entries:o.order.map(e => ({ id:e.identifier, enabled:e.enabled })) })),
  blocks, regex, settings,
  compatibility:{ unsupportedSettings:Object.fromEntries(Object.entries(settings).filter(([k]) => !mappedSettings.has(k))),
    promptFieldsRetainedOnly:['system_prompt','injection_order','forbid_overrides','extra'],
    regexNotes:['SillyTavern regex literal flags and numeric placement are converted using the Lumiverse importer mapping.','Macro execution and runOnEdit timing require a real Lumiverse runtime test.'] },
  output:{ loom:'dist/Fleuriste.loom.json', regex:'dist/Fleuriste.regex.json' },
};
writeJson('manifest.json', manifest);
for (const dir of ['src/simulation/npc-thoughts','src/simulation/secrets','src/simulation/agendas','src/simulation/gm-notebook']) {
  fs.mkdirSync(path.join(root,dir), { recursive:true });
  fs.writeFileSync(path.join(root,dir,'.gitkeep'), '');
}
console.log(`Extracted ${blocks.length} blocks and ${regex.length} regex scripts from ${source}`);
