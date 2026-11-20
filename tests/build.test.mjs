import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root, readJson, readText, sha } from '../scripts/lib.mjs';
import { compile } from '../scripts/build.mjs';
import { validate } from '../scripts/validate.mjs';

test('source inventory and native outputs validate', () => {
  assert.deepEqual(validate(), { blocks:142, regex:47, active:100001 });
});

test('build is deterministic and block edits remain isolated', () => {
  const manifest = readJson('manifest.json');
  const first = compile(manifest);
  const second = compile(manifest);
  assert.equal(sha(JSON.stringify(first)), sha(JSON.stringify(second)));
  const entry = manifest.blocks.find(x => x.file && x.id === first.loom.blocks[0].id);
  const file = path.join(root, entry.file);
  const original = readText(entry.file);
  try {
    fs.writeFileSync(file, original + '\nFLEURISTE_TEST_EDIT', 'utf8');
    const edited = compile(manifest);
    assert.equal(edited.loom.blocks[0].content, original + '\nFLEURISTE_TEST_EDIT');
    assert.deepEqual(edited.loom.blocks.slice(1), first.loom.blocks.slice(1));
    assert.deepEqual(edited.regex, first.regex);
  } finally {
    fs.writeFileSync(file, original, 'utf8');
  }
});
