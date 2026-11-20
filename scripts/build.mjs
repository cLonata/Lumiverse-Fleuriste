import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, readJson, readText, writeJson, stableUuid, orderedEntries, toBlock, toRegex } from './lib.mjs';

export function compile(manifest = readJson('manifest.json')) {
  const ordered = orderedEntries(manifest);
  let group = null;
  const blocks = ordered.map(({ entry, enabled }) => {
    const block = toBlock(entry, readText(entry.file), enabled, group);
    if (block.marker === 'category') group = block.id;
    return block;
  });
  const s = manifest.settings;
  const loom = {
    id:stableUuid('fleuriste:loom'), name:manifest.name,
    description:manifest.description, coverUrl:manifest.coverUrl,
    presetVersion:manifest.version, lumihubMeta:null, passthroughMetadata:{},
    schemaVersion:1, createdAt:0, updatedAt:0, blocks,
    source:{ type:'fleuriste', slug:null, importedVersion:manifest.upstream.revision, importedName:manifest.upstream.name, importedAt:0 },
    isDefault:false,
    samplerOverrides:{ enabled:true, maxTokens:s.openai_max_tokens, contextSize:s.openai_max_context,
      temperature:s.temperature, topP:s.top_p, minP:s.min_p, topK:s.top_k,
      frequencyPenalty:s.frequency_penalty, presencePenalty:s.presence_penalty,
      repetitionPenalty:s.repetition_penalty, streaming:s.stream_openai },
    customBody:{ enabled:false, rawJson:'{}' },
    promptBehavior:{ continueNudge:s.continue_nudge_prompt, emptySendNudge:'[Write the next reply only as {{char}}.]',
      impersonationPrompt:s.impersonation_prompt, groupNudge:s.group_nudge_prompt,
      newChatPrompt:s.new_chat_prompt, newGroupChatPrompt:s.new_group_chat_prompt,
      sendIfEmpty:s.send_if_empty },
    completionSettings:{ assistantPrefill:s.assistant_prefill, reasoningPrefill:'', assistantImpersonation:s.assistant_impersonation,
      continuePrefill:s.continue_prefill, continuePostfix:s.continue_postfix, namesBehavior:s.names_behavior,
      squashSystemMessages:s.squash_system_messages, useSystemPrompt:s.use_sysprompt,
      enableWebSearch:s.enable_web_search, sendInlineMedia:s.media_inlining,
      enableFunctionCalling:s.function_calling, includeUsage:false },
    advancedSettings:{ seed:s.seed, customStopStrings:[], collapseMessages:false, trimIncompleteWords:false },
    modelProfiles:{}, lastProfileKey:null, promptVariables:{},
  };
  const regex = { version:1, type:'lumiverse_regex_scripts',
    scripts:manifest.regex.map((entry,index) => toRegex(entry, readJson(entry.file), index)), exported_at:0 };
  return { loom, regex };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = readJson('manifest.json');
  const { loom, regex } = compile(manifest);
  fs.mkdirSync(path.join(root, 'dist'), { recursive:true });
  for (const file of fs.readdirSync(path.join(root,'dist'))) if (file.endsWith('.json') && !Object.values(manifest.output).some(x => path.basename(x) === file)) fs.rmSync(path.join(root,'dist',file));
  writeJson(manifest.output.loom, loom);
  const regexPath = path.join(root, manifest.output.regex);
  const regexJson = JSON.stringify(regex, null, 2) + '\n';
  if (!fs.existsSync(regexPath) || fs.readFileSync(regexPath, 'utf8') !== regexJson) writeJson(manifest.output.regex, regex);
  console.log(`Built ${loom.blocks.length} Loom blocks and ${regex.scripts.length} regex scripts`);
}
