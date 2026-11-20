# Fleuriste

Fleuriste is a modular, lossless source project for Atelier 3.3 Revision 9. It builds two independent Lumiverse imports: `dist/Fleuriste.loom.json` for Loom Builder and `dist/Fleuriste.regex.json` for Regex Scripts. Atelier 2.1 and Freaky Frankenstein 5.6 are reference files only. No simulation modules are active.

## Layout and editing

- `base/` holds untouched upstream JSON.
- `src/core`, `preferences`, `runtime`, `planning`, and `formatting` hold one exact UTF-8 prompt body per `.txt` file. Edit these files to change prompt content; macro syntax is copied as text and never evaluated by the build.
- `src/regex/` holds one editable SillyTavern source script per JSON file. Edit its `findRegex`, `replaceString`, flags, placement, targeting, and other fields there. Edit the matching manifest regex entry's `enabled` or `name` for effective state or display name.
- `manifest.json` owns identities, display names, metadata, settings, source order configurations, and output paths. Edit a block's `name`, `role`, or `enabled` there. For a block present in the active order, edit that order entry's `enabled` value to change its effective enabled state. Its initial value comes from Atelier's `prompt_order`, which can differ from the prompt definition.
- `src/simulation/` contains empty folders for future NPC thoughts, secrets, agendas, and GM Notebook modules. Add those as separate manifest entries later; upstream prompt files need no edits.

## Ordering

Set `activeCharacterId` in `manifest.json` to select an upstream `promptOrders` configuration. `100001` is the initial choice, matching Lumiverse's highest character ID legacy importer selection. This order contains 139 entries. The three definitions omitted by that order are retained and appended in their original definition order, matching the importer's fallback. All 142 definitions remain editable and compiled. To reorder, move entries in the selected `promptOrders[].entries` array. Stable block IDs are the upstream identifiers.

## Commands

Run `npm run build`, `npm run validate`, and `npm test`. `npm run validate -- --baseline` additionally requires exact original prompt content and regex objects; use it before intentional edits or after a fresh extraction. Ordinary validation permits intentional modular edits while checking source provenance, references, ordering, schemas, and compiled outputs. Build reads only the manifest and modular files. It does not read `base/`.

`npm run extract` is a bootstrap command and refuses to replace an existing manifest or modular file. To deliberately rebootstrap from a newer Atelier source, first back up or branch the project, place the new source in `base/`, review `scripts/lib.mjs` source discovery, then run `npm run extract -- --force`, review the diff, build, and validate. `--force` replaces modular edits. Do not change the original files under `base/`.

## Import

Import `Fleuriste.loom.json` through Loom Builder's native Loom preset import. Import `Fleuriste.regex.json` through the Regex Scripts import UI. The regex export is independent and is not embedded in the Loom preset. Imported regex scripts are global by default; enable or scope them in Lumiverse as needed.

## Conversion notes

The Loom output follows `frontend/src/lib/loom/types.ts` and `service.ts`; the regex output follows `frontend/src/types/regex.ts` and the server regex importer/exporter. Prompt IDs remain stable. Six explicit `@section-header true` prompts become Loom category blocks, with subsequent blocks grouped under them. Their exact source text remains in the compiled block; Lumiverse may skip category content at runtime. Known structural prompts become Loom markers. Empty legacy roles become `system`. `injection_position: 1` becomes `in_history`; position `0` becomes `pre_history`. Legacy `injection_order`, `system_prompt`, `forbid_overrides`, and `extra` have no direct Loom block properties and remain in manifest source metadata.

Supported sampler and behavior settings are mapped to native Loom settings. `manifest.compatibility.unsupportedSettings` lists every remaining source setting and its original value, including `top_a`, `wi_format`, `scenario_format`, `personality_format`, `tool_reasoning_mode`, and image options. Lumiverse does not expose direct counterparts for those in `LoomPreset`. The imported preset may therefore differ from SillyTavern in those behaviors. The legacy regex literal is split into pattern and flags; numeric placements and macro modes use Lumiverse's importer mappings. Regex script IDs become stable, normalized `script_id` values; the original IDs are retained in script metadata. Exact source regex objects remain in `src/regex/`.

These checks prove structural preservation and native JSON shape. Macro support, substitution timing, regex `runOnEdit`, actual execution order, depth behavior, and the impact of unsupported settings require a real Lumiverse import and runtime test. No application repository, installed preset, chat, or server setting is changed by these scripts.
