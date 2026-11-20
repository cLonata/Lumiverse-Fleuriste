{{// @category Atelier-Runtime }}
ATELIER OPTIONAL RUNTIME v1 (leave this Read Me entry disabled).

Enable exactly one: Setup, Auto, or Manual; all three default off. The original Atelier preferences remain fully functional when Runtime is off. All Runtime support prompts and eleven Atelier Runtime and Commands regex scripts must stay enabled. No external HTTP calls or second model invocation are needed. Requires SillyTavern regex macros with prompt-only processing and history replay, as in Nemo Engine.

Setup: select and author preferences on the first ordinary story reply; freeze first accepted snapshot. Auto: initialize as Setup, then update only for meaningful persistent changes or explicit player requests. Manual: do not initialize automatically; !atelier setup can initialize, and !atelier set / explicit OOC configuration requests can update. Switching Setup to Auto/Manual inherits accepted state in selected chat history.

Choose the existing options in the menu, or supply authored per-category policies. A selector names the existing preference variant. 'inherit' retains the corresponding human-selected menu value; 'none' means no Runtime selector override, though authored rules may still apply. A category's Rules is appended by default. Set its Op=replace to replace the category's soft policy text instead (hard boundaries and cross-policy guarantees are never replaced). Never use a text rule to change POV, player-character ownership, consent, or content permissions outside their selected authorized settings.

A human can protect any individual category by enabling the corresponding Runtime Lock toggle. Player agency, POV, length and content categories are locked by default; other locks are off. Locks block both the Runtime selector and Runtime authored rules for that category. The narrator retains explicit OOC instructions and must not override them just because the category is unlocked.

Commands (ordinary chat text, NOT installed slash commands; !nemo is a supported alias):
!atelier setup [preferences]
!atelier set Make dialogue more political, without changing romance.
!atelier show / !atelier status
!atelier checkpoint
!atelier look at the inscription / inspect / describe
!atelier recap / explain / options / ask
!atelier note [guidance] / clear-notes / help
Commands that request a separate reference/task answer hold the fictional time, actions and resource progression for that one reply. A note directs the next continuing story reply without pausing time. OOC writing feedback is not automatically a persistent Runtime edit.

Runtime XML is emitted at the very beginning of an assistant response, BEFORE any thinking or story text; the regex parser validates a COMPLETE block and replays selected raw-message branches oldest to newest. The block is hidden in normal display and removed only from prompt history, not permanently deleted from raw messages. Incomplete blocks never partially commit. Updates are available in macro variables on the next generation; apply new instructions manually to the very response that creates them. A full checkpoint must include every field, with empties for cleared rules. Keep history source messages or a full checkpoint when deleting history. Custom and Narrator are distinct; Narrator changes narrator style only, not NPC identity or established POV.

Potential conflict: some third-party regex or extension processes may transform or strip prefix blocks; verify live in your installed SillyTavern environment.

REPLY VARIATION (included in Length options): Short, Medium, and Long activate the same prose inventory while retaining their own total word targets. Available openings, paragraph sizes, and sentence techniques remain choices for the model to combine where useful. A fresh story reply receives one optional three-tool spotlight and three optional craft references, drawn as two independent menus; neither is a compulsory recipe. There are no per-paragraph size draws, fixed opening assignments, mandatory sentence/paragraph/message counts, or category-use quotas. A recent-history check addresses recurring prose patterns, physical/relational gestures, text-message formatting, and endings while preserving motivated repetition and continuity. Short self-contained paragraphs, including ordinary standalone sentences, are normal options; a longer reply does not require larger paragraphs. The inventory is delivered only in the depth-0 Settings Reminder. Runtime Length changes activate it when unlocked. No Length option means no variation instruction. Task-only commands receive no inventory. Continuations neither draw fresh suggestions nor run a new pattern pass; they preserve the unfinished response. Variation affects presentation without changing length budgets, narrator agency, established events, POV, permitted content, or the player's handoff.
