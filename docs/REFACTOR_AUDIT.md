<!-- PRESERVATION RULE: Never delete or replace content. Append or annotate only. -->

# Refactor Audit — Voxel Arena

**Generated**: 2026-07-24  
**Source**: `python scripts/refactor_audit.py --md`  
**Limits** (AGENTS.md): file <= 400 LOC · function <= 50 lines · line <= 100 chars

> Re-run the script to refresh. Append new snapshots below older ones; do not delete prior audit history.

## Snapshot 2026-07-24

- Files audited: **31**
- Total LOC: **14407** (non-blank **12415**)
- Files over limit: **12**
- Files with oversized funcs: **14**
- Files with long lines: **19**

### Priority key

| Pri | Meaning |
|-----|---------|
| P0 | File >400 AND has funcs >50 |
| P1 | File >400 only |
| P2 | Func(s) >50 only |
| P3 | Many long lines (>=10) |
| OK | Within soft limits |

### LOC by file

| Pri | Path | LOC | Non-blank | Funcs | Max func | Long lines |
|-----|------|----:|----------:|------:|---------:|-----------:|
| P1 | `game/style.css` | 2301 | 2013 | 0 | 0 | 0 |
| P0 | `game/src/systems/bot/Bot.js` | 1116 | 962 | 49 | 93 | 10 |
| P0 | `game/src/systems/bot/BotMovement.js` | 1073 | 924 | 65 | 68 | 4 |
| P0 | `game/src/ui/ui.js` | 946 | 803 | 25 | 78 | 11 |
| P0 | `game/src/systems/bot/BotCombat.js` | 922 | 794 | 46 | 52 | 3 |
| P1 | `game/src/systems/bot/BotCommunication.js` | 889 | 761 | 55 | 50 | 5 |
| P0 | `game/src/systems/bot/BotManager.js` | 797 | 674 | 44 | 54 | 3 |
| P0 | `game/src/systems/bot/BotPersonality.js` | 731 | 631 | 48 | 71 | 2 |
| P0 | `game/src/core/main.js` | 728 | 621 | 32 | 146 | 7 |
| P1 | `game/src/systems/bot/BotSenses.js` | 720 | 610 | 38 | 45 | 0 |
| P1 | `game/src/systems/bot/BotMemory.js` | 589 | 502 | 35 | 34 | 2 |
| P1 | `game/index.html` | 402 | 376 | 0 | 0 | 12 |
| P2 | `game/src/player/glock.js` | 367 | 318 | 8 | 145 | 0 |
| OK | `game/src/systems/bot/BotBrain.js` | 347 | 302 | 20 | 45 | 0 |
| P2 | `game/src/player/avatar.js` | 318 | 267 | 9 | 52 | 1 |
| P2 | `game/src/ui/customComponents.js` | 300 | 253 | 16 | 60 | 0 |
| OK | `game/src/world/mapPreview.js` | 272 | 224 | 13 | 34 | 3 |
| OK | `game/src/core/input.js` | 248 | 215 | 13 | 23 | 1 |
| OK | `game/src/core/settings.js` | 227 | 203 | 2 | 21 | 3 |
| P2 | `game/src/player/player.js` | 214 | 181 | 7 | 91 | 1 |
| OK | `game/src/systems/bot/BotModel.js` | 194 | 159 | 2 | 34 | 0 |
| P2 | `game/src/world/arena.js` | 108 | 95 | 1 | 77 | 0 |
| OK | `game/home.html` | 100 | 100 | 0 | 0 | 1 |
| P2 | `game/src/ui/minimap.js` | 95 | 74 | 3 | 73 | 1 |
| OK | `game/src/ui/versionBriefing.js` | 82 | 77 | 0 | 0 | 0 |
| P2 | `game/src/player/bullet.js` | 76 | 67 | 3 | 52 | 0 |
| OK | `game/src/world/arena2.js` | 76 | 67 | 0 | 0 | 6 |
| OK | `game/src/player/character.js` | 68 | 55 | 0 | 0 | 0 |
| OK | `game/src/world/arena1.js` | 62 | 55 | 0 | 0 | 4 |
| OK | `game/src/core/physics.js` | 32 | 25 | 0 | 0 | 0 |
| OK | `game/src/world/structures.js` | 7 | 7 | 1 | 5 | 0 |

### Refactor queue (violations only)

| Pri | Path | Issue | Suggested split / action |
|-----|------|-------|--------------------------|
| P1 | `game/style.css` | file 2301 LOC (+1901) | Split SpecOps menu / HUD / modal sections |
| P0 | `game/src/systems/bot/Bot.js` | file 1116 LOC (+716); funcs: `updatePhysics()` 93L, `constructor()` 90L; 10 lines >100ch | Extract `updatePhysics()` helpers |
| P0 | `game/src/systems/bot/BotMovement.js` | file 1073 LOC (+673); funcs: `updateMovement()` 68L, `aStar()` 55L, `constructor()` 54L | Split seek / path / collision helpers |
| P0 | `game/src/ui/ui.js` | file 946 LOC (+546); funcs: `populateKeybinds()` 78L, `setupTeamSelectionHandlers()` 58L, `populateVideoSettings()` 56L; 11 lines >100ch | Split menus / HUD / settings bindings |
| P0 | `game/src/systems/bot/BotCombat.js` | file 922 LOC (+522); funcs: `constructor()` 52L | Extract `constructor()` helpers |
| P1 | `game/src/systems/bot/BotCommunication.js` | file 889 LOC (+489) | Split by responsibility when next touching file |
| P0 | `game/src/systems/bot/BotManager.js` | file 797 LOC (+397); funcs: `setupSpawnPoints()` 54L | Keep lifecycle; move spawn/team helpers out |
| P0 | `game/src/systems/bot/BotPersonality.js` | file 731 LOC (+331); funcs: `constructor()` 71L | Extract `constructor()` helpers |
| P0 | `game/src/core/main.js` | file 728 LOC (+328); funcs: `update()` 146L, `init()` 66L, `startGame()` 57L | Extract combat/hit-test, pause, spawn into helpers |
| P1 | `game/src/systems/bot/BotSenses.js` | file 720 LOC (+320) | Split by responsibility when next touching file |
| P1 | `game/src/systems/bot/BotMemory.js` | file 589 LOC (+189) | Split by responsibility when next touching file |
| P1 | `game/index.html` | file 402 LOC (+2); 12 lines >100ch | Extract modal/menu markup fragments if growing |
| P2 | `game/src/player/glock.js` | funcs: `buildGun()` 145L, `buildFirstPersonArm()` 61L, `constructor()` 55L | Split model build vs fire/reload audio |
| P2 | `game/src/player/avatar.js` | funcs: `createGunShowcaseControls()` 52L | Extract `createGunShowcaseControls()` helpers |
| P2 | `game/src/ui/customComponents.js` | funcs: `setupEventListeners()` 60L | Extract `setupEventListeners()` helpers |
| P2 | `game/src/player/player.js` | funcs: `update()` 91L | Extract damage/death/respawn or look helpers |
| P2 | `game/src/world/arena.js` | funcs: `createMeshesFromStructures()` 77L | Extract `createMeshesFromStructures()` helpers |
| P2 | `game/src/ui/minimap.js` | funcs: `update()` 73L | Extract `update()` helpers |
| P2 | `game/src/player/bullet.js` | funcs: `constructor()` 52L | Extract `constructor()` helpers |

### Oversized functions (detail)

| Lines | Location | Function |
|------:|----------|----------|
| 146 | `game/src/core/main.js:562-707` | `update()` |
| 145 | `game/src/player/glock.js:127-271` | `buildGun()` |
| 93 | `game/src/systems/bot/Bot.js:503-595` | `updatePhysics()` |
| 91 | `game/src/player/player.js:73-163` | `update()` |
| 90 | `game/src/systems/bot/Bot.js:21-110` | `constructor()` |
| 78 | `game/src/ui/ui.js:163-240` | `populateKeybinds()` |
| 77 | `game/src/world/arena.js:4-80` | `createMeshesFromStructures()` |
| 73 | `game/src/ui/minimap.js:15-87` | `update()` |
| 71 | `game/src/systems/bot/BotPersonality.js:14-84` | `constructor()` |
| 68 | `game/src/systems/bot/BotMovement.js:124-191` | `updateMovement()` |
| 66 | `game/src/core/main.js:172-237` | `init()` |
| 61 | `game/src/player/glock.js:65-125` | `buildFirstPersonArm()` |
| 60 | `game/src/ui/customComponents.js:222-281` | `setupEventListeners()` |
| 58 | `game/src/ui/ui.js:512-569` | `setupTeamSelectionHandlers()` |
| 57 | `game/src/core/main.js:239-295` | `startGame()` |
| 56 | `game/src/ui/ui.js:242-297` | `populateVideoSettings()` |
| 55 | `game/src/systems/bot/BotMovement.js:479-533` | `aStar()` |
| 55 | `game/src/player/glock.js:9-63` | `constructor()` |
| 54 | `game/src/systems/bot/BotMovement.js:14-67` | `constructor()` |
| 54 | `game/src/systems/bot/BotManager.js:115-168` | `setupSpawnPoints()` |
| 52 | `game/src/systems/bot/BotCombat.js:15-66` | `constructor()` |
| 52 | `game/src/player/avatar.js:78-129` | `createGunShowcaseControls()` |
| 52 | `game/src/player/bullet.js:9-60` | `constructor()` |

### Notes

- Function sizes are brace-heuristic (not a full JS parser). Nested/class methods may under/over-count — verify before splitting.
- CSS/HTML are included for LOC awareness; function checks apply to `.js` only.
- Do not silent-refactor outside an active task; log tempting splits in SCRATCHPAD → Out-of-Scope Observations.

---

## Prior snapshots (retained)

<!-- PRESERVATION RULE: Never delete or replace content. Append or annotate only. -->

# Refactor Audit — Voxel Arena

**Generated**: 2026-07-24  
**Source**: `python scripts/refactor_audit.py --md`  
**Limits** (AGENTS.md): file ≤ 400 LOC · function ≤ 50 lines · line ≤ 100 chars

> Re-run the script to refresh. Append new snapshots below older ones; do not delete prior audit history.

## Snapshot 2026-07-24

- Files audited: **31**
- Total LOC: **14407** (non-blank **12415**)
- Files over limit: **12**
- Files with oversized funcs: **14**
- Files with long lines: **19**

### Priority key

| Pri | Meaning |
|-----|---------|
| P0 | File >400 AND has funcs >50 |
| P1 | File >400 only |
| P2 | Func(s) >50 only |
| P3 | Many long lines (≥10) |
| OK | Within soft limits |

### LOC by file

| Pri | Path | LOC | Non-blank | Funcs | Max func | Long lines |
|-----|------|----:|----------:|------:|---------:|-----------:|
| P1 | `game/style.css` | 2301 | 2013 | 0 | 0 | 0 |
| P0 | `game/src/systems/bot/Bot.js` | 1116 | 962 | 49 | 93 | 10 |
| P0 | `game/src/systems/bot/BotMovement.js` | 1073 | 924 | 65 | 68 | 4 |
| P0 | `game/src/ui/ui.js` | 946 | 803 | 25 | 78 | 11 |
| P0 | `game/src/systems/bot/BotCombat.js` | 922 | 794 | 46 | 52 | 3 |
| P1 | `game/src/systems/bot/BotCommunication.js` | 889 | 761 | 55 | 50 | 5 |
| P0 | `game/src/systems/bot/BotManager.js` | 797 | 674 | 44 | 54 | 3 |
| P0 | `game/src/systems/bot/BotPersonality.js` | 731 | 631 | 48 | 71 | 2 |
| P0 | `game/src/core/main.js` | 728 | 621 | 32 | 146 | 7 |
| P1 | `game/src/systems/bot/BotSenses.js` | 720 | 610 | 38 | 45 | 0 |
| P1 | `game/src/systems/bot/BotMemory.js` | 589 | 502 | 35 | 34 | 2 |
| P1 | `game/index.html` | 402 | 376 | 0 | 0 | 12 |
| P2 | `game/src/player/glock.js` | 367 | 318 | 8 | 145 | 0 |
| OK | `game/src/systems/bot/BotBrain.js` | 347 | 302 | 20 | 45 | 0 |
| P2 | `game/src/player/avatar.js` | 318 | 267 | 9 | 52 | 1 |
| P2 | `game/src/ui/customComponents.js` | 300 | 253 | 16 | 60 | 0 |
| OK | `game/src/world/mapPreview.js` | 272 | 224 | 13 | 34 | 3 |
| OK | `game/src/core/input.js` | 248 | 215 | 13 | 23 | 1 |
| OK | `game/src/core/settings.js` | 227 | 203 | 2 | 21 | 3 |
| P2 | `game/src/player/player.js` | 214 | 181 | 7 | 91 | 1 |
| OK | `game/src/systems/bot/BotModel.js` | 194 | 159 | 2 | 34 | 0 |
| P2 | `game/src/world/arena.js` | 108 | 95 | 1 | 77 | 0 |
| OK | `game/home.html` | 100 | 100 | 0 | 0 | 1 |
| P2 | `game/src/ui/minimap.js` | 95 | 74 | 3 | 73 | 1 |
| OK | `game/src/ui/versionBriefing.js` | 82 | 77 | 0 | 0 | 0 |
| P2 | `game/src/player/bullet.js` | 76 | 67 | 3 | 52 | 0 |
| OK | `game/src/world/arena2.js` | 76 | 67 | 0 | 0 | 6 |
| OK | `game/src/player/character.js` | 68 | 55 | 0 | 0 | 0 |
| OK | `game/src/world/arena1.js` | 62 | 55 | 0 | 0 | 4 |
| OK | `game/src/core/physics.js` | 32 | 25 | 0 | 0 | 0 |
| OK | `game/src/world/structures.js` | 7 | 7 | 1 | 5 | 0 |

### Refactor queue (violations only)

| Pri | Path | Issue | Suggested split / action |
|-----|------|-------|--------------------------|
| P1 | `game/style.css` | file 2301 LOC (+1901) | Split SpecOps menu / HUD / modal sections |
| P0 | `game/src/systems/bot/Bot.js` | file 1116 LOC (+716); funcs: `updatePhysics()` 93L, `constructor()` 90L; 10 lines >100ch | Extract `constructor()` helpers |
| P0 | `game/src/systems/bot/BotMovement.js` | file 1073 LOC (+673); funcs: `updateMovement()` 68L, `aStar()` 55L, `constructor()` 54L | Split seek / path / collision helpers |
| P0 | `game/src/ui/ui.js` | file 946 LOC (+546); funcs: `populateKeybinds()` 78L, `setupTeamSelectionHandlers()` 58L, `populateVideoSettings()` 56L; 11 lines >100ch | Split menus / HUD / settings bindings |
| P0 | `game/src/systems/bot/BotCombat.js` | file 922 LOC (+522); funcs: `constructor()` 52L | Extract `constructor()` helpers |
| P1 | `game/src/systems/bot/BotCommunication.js` | file 889 LOC (+489) | Split by responsibility when next touching file |
| P0 | `game/src/systems/bot/BotManager.js` | file 797 LOC (+397); funcs: `setupSpawnPoints()` 54L | Keep lifecycle; move spawn/team helpers out |
| P0 | `game/src/systems/bot/BotPersonality.js` | file 731 LOC (+331); funcs: `constructor()` 71L | Extract `constructor()` helpers |
| P0 | `game/src/core/main.js` | file 728 LOC (+328); funcs: `update()` 146L, `init()` 66L, `startGame()` 57L | Extract combat/hit-test, pause, spawn into helpers |
| P1 | `game/src/systems/bot/BotSenses.js` | file 720 LOC (+320) | Split by responsibility when next touching file |
| P1 | `game/src/systems/bot/BotMemory.js` | file 589 LOC (+189) | Split by responsibility when next touching file |
| P1 | `game/index.html` | file 402 LOC (+2); 12 lines >100ch | Extract modal/menu markup fragments if growing |
| P2 | `game/src/player/glock.js` | funcs: `buildGun()` 145L, `buildFirstPersonArm()` 61L, `constructor()` 55L | Split model build vs fire/reload audio |
| P2 | `game/src/player/avatar.js` | funcs: `createGunShowcaseControls()` 52L | Extract `createGunShowcaseControls()` helpers |
| P2 | `game/src/ui/customComponents.js` | funcs: `setupEventListeners()` 60L | Extract `setupEventListeners()` helpers |
| P2 | `game/src/player/player.js` | funcs: `update()` 91L | Extract damage/death/respawn or look helpers |
| P2 | `game/src/world/arena.js` | funcs: `createMeshesFromStructures()` 77L | Extract `createMeshesFromStructures()` helpers |
| P2 | `game/src/ui/minimap.js` | funcs: `update()` 73L | Extract `update()` helpers |
| P2 | `game/src/player/bullet.js` | funcs: `constructor()` 52L | Extract `constructor()` helpers |

### Oversized functions (detail)

| Lines | Location | Function |
|------:|----------|----------|
| 146 | `game/src/core/main.js:562-707` | `update()` |
| 145 | `game/src/player/glock.js:127-271` | `buildGun()` |
| 93 | `game/src/systems/bot/Bot.js:503-595` | `updatePhysics()` |
| 91 | `game/src/player/player.js:73-163` | `update()` |
| 90 | `game/src/systems/bot/Bot.js:21-110` | `constructor()` |
| 78 | `game/src/ui/ui.js:163-240` | `populateKeybinds()` |
| 77 | `game/src/world/arena.js:4-80` | `createMeshesFromStructures()` |
| 73 | `game/src/ui/minimap.js:15-87` | `update()` |
| 71 | `game/src/systems/bot/BotPersonality.js:14-84` | `constructor()` |
| 68 | `game/src/systems/bot/BotMovement.js:124-191` | `updateMovement()` |
| 66 | `game/src/core/main.js:172-237` | `init()` |
| 61 | `game/src/player/glock.js:65-125` | `buildFirstPersonArm()` |
| 60 | `game/src/ui/customComponents.js:222-281` | `setupEventListeners()` |
| 58 | `game/src/ui/ui.js:512-569` | `setupTeamSelectionHandlers()` |
| 57 | `game/src/core/main.js:239-295` | `startGame()` |
| 56 | `game/src/ui/ui.js:242-297` | `populateVideoSettings()` |
| 55 | `game/src/systems/bot/BotMovement.js:479-533` | `aStar()` |
| 55 | `game/src/player/glock.js:9-63` | `constructor()` |
| 54 | `game/src/systems/bot/BotMovement.js:14-67` | `constructor()` |
| 54 | `game/src/systems/bot/BotManager.js:115-168` | `setupSpawnPoints()` |
| 52 | `game/src/systems/bot/BotCombat.js:15-66` | `constructor()` |
| 52 | `game/src/player/avatar.js:78-129` | `createGunShowcaseControls()` |
| 52 | `game/src/player/bullet.js:9-60` | `constructor()` |

### Notes

- Function sizes are brace-heuristic (not a full JS parser). Nested/class methods may under/over-count — verify before splitting.
- CSS/HTML are included for LOC awareness; function checks apply to `.js` only.
- Do not silent-refactor outside an active task; log tempting splits in SCRATCHPAD → Out-of-Scope Observations.
