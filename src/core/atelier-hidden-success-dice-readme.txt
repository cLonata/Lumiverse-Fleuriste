{{// @category System }}
{{// @tooltip Documentation only. Leave disabled. }}
ATELIER SUCCESS DICE v2 — HIDDEN / VISIBLE

In the System section, choose ONE of these human-controlled Prompt Manager options:
- 🎲 Success Dice · Hidden: resolve meaningful uncertainty with d100, publish only the fictional outcome.
- 🎲 Success Dice · Visible: identical resolution, plus one roll card beside each actual resolved check. The card includes the actor/action, total, seven-tier outcome, influence, and a collapsed calculation/source detail view.
- Both OFF: no optional Success Dice system (the default).
Never enable both: the resolver detects the conflict and refuses to draw dice.

These toggles are independent of Atelier Runtime Setup/Auto/Manual and cannot be changed by Alex or !atelier set. They use the same three-slot d100 protocol (User, Primary NPC, Flex), seven outcome tiers, modifiers, World Bias, Stakes, World Logic and tactical combat contracts. Existing scenario-specific resolution mechanics take priority; don't stack checks.

For Visible mode, the output must contain structured <nemo-roll system="d100" slot="User|Primary NPC|Flex"> blocks immediately after the affected narrative beat. The three display-only regex scripts supplied in this JSON turn the blocks into styled cards. Keep those scripts enabled. An expanded dice macro value is the only value that can be labeled ST macro; missing/unexpanded values are not invented.

Held command-only tasks and explicit setup never roll or advance time. Continuing an unfinished generation does not redraw or repeat previous roll cards. Swiping/regenerating may redraw; accepted prose is canonical. The optional Scene Scratchpad never gains a dice ledger in either mode. Disable both controls to turn off future dice resolution without undoing past story facts.
