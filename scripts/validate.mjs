import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, readJson, readText, sha, orderedEntries, toRegex, mappedSettings } from './lib.mjs';
import { compile } from './build.mjs';

export function validate({ baseline = false } = {}) {
  const m = readJson('manifest.json');
  assert.equal(m.name, 'Fleuriste');
  assert.equal(m.activeCharacterId, 100001);
  assert.equal(new Set(m.blocks.map(x => x.id)).size, m.blocks.length);
  assert.equal(new Set(m.regex.map(x => x.id)).size, m.regex.length);
  assert.equal(new Set(m.blocks.map(x => x.file)).size, m.blocks.length);
  assert.equal(new Set(m.regex.map(x => x.file)).size, m.regex.length);
  const upstream = readJson(m.upstream.file);
  assert.equal(sha(fs.readFileSync(path.join(root,m.upstream.file))), m.upstream.sha256, 'Upstream source changed');
  assert.equal(m.blocks.length, upstream.prompts.length);
  assert.equal(m.regex.length, upstream.extensions.regex_scripts.length);
  assert.deepEqual(m.settings, Object.fromEntries(Object.entries(upstream).filter(([k]) => !['prompts','prompt_order','extensions'].includes(k))));
  assert.deepEqual(m.compatibility.unsupportedSettings, Object.fromEntries(Object.entries(m.settings).filter(([k]) => !mappedSettings.has(k))));
  for (const [i,e] of m.blocks.entries()) {
    assert.equal(e.id, upstream.prompts[i].identifier);
    assert.deepEqual(e.sourceMetadata, Object.fromEntries(Object.entries(upstream.prompts[i]).filter(([k]) => k !== 'content')));
    assert.equal(e.sourceContentSha256, sha(upstream.prompts[i].content));
    assert.equal(typeof readText(e.file), 'string');
    if (baseline) assert.equal(readText(e.file), upstream.prompts[i].content, `Changed source content: ${e.id}`);
  }
  for (const [i,e] of m.regex.entries()) {
    assert.equal(e.id, upstream.extensions.regex_scripts[i].id);
    assert.equal(e.sourceSha256, sha(JSON.stringify(upstream.extensions.regex_scripts[i])));
    if (baseline) assert.deepEqual(readJson(e.file), upstream.extensions.regex_scripts[i]);
  }
  for (const order of m.promptOrders) {
    const original = upstream.prompt_order.find(x => x.character_id === order.characterId);
    assert.ok(original);
    assert.deepEqual(order.entries, original.order.map(x => ({ id:x.identifier, enabled:x.enabled })));
    assert.equal(new Set(order.entries.map(x => x.id)).size, order.entries.length);
    for (const e of order.entries) assert.ok(m.blocks.some(x => x.id === e.id));
  }
  const { loom, regex } = compile(m);
  assert.equal(loom.schemaVersion, 1);
  assert.equal(typeof loom.id, 'string');
  assert.equal(loom.blocks.length, m.blocks.length);
  assert.equal(new Set(loom.blocks.map(x => x.id)).size, loom.blocks.length);
  const ordered = orderedEntries(m);
  assert.deepEqual(loom.blocks.map(x => x.id), ordered.map(x => x.entry.id));
  for (const [i,b] of loom.blocks.entries()) {
    const { entry, enabled } = ordered[i];
    assert.equal(b.content, readText(entry.file));
    assert.equal(b.enabled, enabled);
    assert.equal(b.role, entry.role || 'system');
    assert.deepEqual(b.injectionTrigger, entry.injectionTrigger);
    assert.equal(b.position, entry.injectionPosition === 1 ? 'in_history' : 'pre_history');
    assert.equal(b.depth, entry.injectionPosition === 1 ? entry.injectionDepth : 0);
    assert.ok(b.marker === null || typeof b.marker === 'string');
    assert.ok(b.group === null || loom.blocks.some(x => x.id === b.group && x.marker === 'category'));
  }
  for (const key of ['samplerOverrides','promptBehavior','completionSettings','advancedSettings','source']) assert.ok(loom[key]);
  assert.equal(regex.type, 'lumiverse_regex_scripts');
  assert.equal(regex.version, 1);
  assert.equal(regex.scripts.length, m.regex.length);
  assert.equal(new Set(regex.scripts.map(x => x.script_id)).size, regex.scripts.length);
  for (const [i,s] of regex.scripts.entries()) {
    assert.deepEqual(s, toRegex(m.regex[i], readJson(m.regex[i].file), i));
    assert.ok(Array.isArray(s.placement) && Array.isArray(s.target));
  }
  for (const [key,obj] of [['loom',loom],['regex',regex]]) {
    assert.deepEqual(readJson(m.output[key]), obj, `${key} output is stale; run npm run build`);
  }
  assert.deepEqual(fs.readdirSync(path.join(root,'dist')).filter(x => x.endsWith('.json')).sort(), Object.values(m.output).map(x => path.basename(x)).sort());
  return { blocks:m.blocks.length, regex:m.regex.length, active:m.activeCharacterId };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = validate({ baseline:process.argv.includes('--baseline') });
  console.log(`Validated ${result.blocks} blocks and ${result.regex} regex scripts; prompt_order ${result.active}`);
}
