# AGENTS.md — Voxel Arena

<!-- PRESERVATION RULE: Never delete or replace content. Append or annotate only. -->

**Project**: Voxel Arena — browser FPS (vanilla JS + Three.js r128 CDN)
**Version**: 0.47 (2026-07-24)
**Status**: SpecOps UI (SOCOM / Clancy briefing) + Phase 1 combat loop. Phase 2 = multiplayer / more content.
**Entry**: `game/index.html` → `game/src/core/main.js` (`Game` class)

> Agents: read this file first, then the status docs below. Prefer shipping working gameplay over elegant refactors.

---

## TL;DR (read this even if you skip everything else)

- No build step, no bundler, no npm for `game/` — static file server only.
- Three.js r128 is a CDN `<script>` tag, global `THREE` — don't add a second import path that creates a duplicate instance.
- Combat must stay team-safe — check `bullet.owner` before applying damage, no accidental friendly fire.
- Never silently refactor outside the current task — log anything tempting-but-unrelated in `docs/SCRATCHPAD.md` → `Out-of-Scope Observations`.
- SpecOps olive/brass aesthetic is canonical (0.47+). Don't regress to neon "AI-slop" UI.
- Ask before: new deps, Three.js version bump, networking/multiplayer, large architecture splits, destructive git.

---

## Init (every session)

Read in order (do not skip):

1. `docs/SUMMARY.md` — status + architecture overview
2. `docs/SBOM.md` — deps (expect Three.js CDN only; update on any package add/remove)
3. `docs/SCRATCHPAD.md` — active tasks, last actions, blockers
4. `docs/STYLE_GUIDE.md` — if missing, follow **Code standards** below and create it once conventions outgrow this file (see **Current priorities**)

Then use `docs/FILE_MAP.md` / `docs/ARCHITECTURE.md` for module locations. Bot deep-dives: `docs/BOT_*.md`.

---

## Commands

```bat
scripts\launch.bat
scripts\audit.bat
```

Manual (from `game/`):

```bat
python -m http.server 8000
```

Refactor size audit (from repo root):

```bat
python scripts/refactor_audit.py
python scripts/refactor_audit.py --md docs/REFACTOR_AUDIT.md
python scripts/refactor_audit.py --fail
```

Open `http://localhost:8000`.

Arena Builder (Electron, optional): `tools/arena-builder-desktop/` — a separate app with its own stack. Do not conflate with `game/`. (See **Cursor-specific notes** below for a better way to scope this than a parenthetical warning.)

---

## Layout (where to edit)

| Area | Path |
|------|------|
| Engine / loop / hits | `game/src/core/main.js` |
| Input / pointer lock / reload key | `game/src/core/input.js` |
| Settings / localStorage | `game/src/core/settings.js` |
| Collision AABB | `game/src/core/physics.js` |
| Player move / HP / death | `game/src/player/player.js` |
| FP gun / fire / reload | `game/src/player/glock.js` |
| Projectiles | `game/src/player/bullet.js` |
| Maps | `game/src/world/arena*.js` |
| HUD / menus CSS+DOM | `game/index.html`, `game/style.css`, `game/src/ui/` |
| SpecOps briefing / BUILD notes | `game/src/ui/versionBriefing.js` + start-menu markup/CSS |
| Bots | `game/src/systems/bot/` (`BotManager` owns lifecycle, `BotBrain.js` owns decision logic) |

ES modules + global `THREE` from CDN script tag. Do not add a second Three.js import path that duplicates the CDN instance unless you intentionally fix the multi-instance warning.

---

## Philosophy

- **KISS / YAGNI / DRY after 3rd repeat** — UX and feel beat elegance.
- **Fail fast** — surface errors; no silent `catch`.
- **Scope lock** — do not rename/refactor outside the task; log in SCRATCHPAD → `Out-of-Scope Observations`.
- **Verify before inventing** — never assume APIs/flags; check code or docs. If unsure: `// NOTE: verify before shipping`.

---

## Code standards

| Concern | Rule |
|---------|------|
| Naming | `camelCase` JS • `PascalCase` classes • `kebab-case` CSS |
| Limits | ≤100 char/line • ≤50 lines/function • ≤400 lines/file (split if growing) |
| Comments | WHY only; prefixes `TODO:` `FIXME:` `NOTE:` |
| Trace | `// [TRACE: filename.md]` when linking to a doc |
| Paths | Forward slashes in code; Windows-safe scripts |
| Async | `async/await`; try/catch at I/O / async boundaries |
| Secrets | Never hardcode env-specific URLs/ports/keys |
| Deps | Audit before install; update `docs/SBOM.md` immediately; prefer zero new packages |

Stack defaults: **vanilla ES modules**, Three.js r128, Web Audio, localStorage. No React/Svelte in this game tree.

### UI / visual direction (0.47+)

- Aesthetic: SpecOps briefing (SOCOM / early Clancy) — **not** neon Matrix arcade green.
- Palette: olive / brass / muted green-grey CSS vars in `game/style.css`.
- Type: Barlow Condensed + Share Tech Mono (already linked).
- Version bumps: update `BUILD_VERSION` + notes in `versionBriefing.js`, BUILD label in HTML, and status docs together.
- Do not regress to purple/glow AI-slop themes or flat single-color marketing layouts on branded surfaces.

---

## Docs workflow (`docs/`)

**Status docs** (update during work): `SCRATCHPAD.md`, `SBOM.md`, `CHANGELOG.md`, `SUMMARY.md` when version/status shifts.
**Content docs** (do not rewrite unless asked): `README.md`, `ARCHITECTURE.md`, `STYLE_GUIDE.md`, bot docs.

Rules:

- Header on every `docs/` file: `<!-- PRESERVATION RULE: Never delete or replace content. Append or annotate only. -->`
- Top-down updates (newest at top). Never delete log history.
- Stale facts: amend with `[AMENDED YYYY-MM-DD]:` — keep originals.
- Checkpoint SCRATCHPAD after ~3–5 tool-call bursts or each subtask.
- **Multiple agents may be working this repo in parallel** (Cursor supports parallel agents in separate git worktrees) — append-only status docs are what keeps that from turning into lost history or merge conflicts. Never overwrite another session's SCRATCHPAD entry; add your own dated section below it.
- Errors: `docs/debugs/debug_[timestamp].md`, max 3 fix attempts → stop, report in SCRATCHPAD, notify user.
- Handoff / context limit: write `## MID-TASK CHECKPOINT [DATE]` in SCRATCHPAD (done / in progress / next).

---

## Git

- Commits only when user asks: `<type>(<scope>): <description>` (`feat|fix|docs|refactor|chore|test`)
- Branches: `feature/` `fix/` `chore/` `docs/`
- Never force-push main/master; never amend unless user rules for amend are fully met
- Do not commit secrets (`.env`, credentials)

---

## Boundaries

**Always**

- Read before edit; leaf modules → entry (`main.js` / HTML) last on multi-file changes
- Keep combat hits team-safe (`owner` on bullets; no friendly fire)
- Preserve soft-pause + custom cursor pointer-lock pattern (do not `exitPointerLock` on Escape pause)
- Match player/bot physics assumptions (ground Y, collision box center, single friction pass)

**Ask first**

- Adding npm/Electron deps, upgrading Three.js, networking/multiplayer, large architecture splits
- Restructuring this file into `.cursor/rules/*.mdc` (or splitting rule sources in general) — see **Cursor-specific notes**
- Destructive git (force push, hard reset, history rewrite)

**Never**

- Delete or replace existing doc content
- Silent out-of-scope refactors
- Exploit / malware / attacking systems
- Commit without explicit user request

---

## Known gotchas (do not reintroduce)

Append new rows at the bottom with the version era — never remove or edit past rows, even if a lesson is later superseded (amend instead, per Docs workflow).

| Issue | Lesson | Era |
|-------|--------|-----|
| Bot mesh vanish / NaN rotation | Ensure `weapon.accuracy` (and similar) exist before use | 0.40 |
| Crawl / jitter | No double friction; accel lerp seek; don't thrash pathfinding over patrol | 0.42 |
| Viewmodel clip / red gun | Near-plane + position; don't paint FP gun with team color | 0.43 |
| Touchpad look spikes / stuck WASD | Clamp look deltas; `resetGameplayInput` on blur / lock loss | 0.45 |
| Immortal player / no HUD / reload dead | Wire HUD, `reload` input, `takeDamage`/`die`/`respawn`, bot→player hit tests | 0.46 |
| Foot-pivot hits / FF | Body center Y+1; swept segment; team check via bullet `owner` | 0.46 |
| Neon green "arcade hacker" UI | SpecOps olive/brass briefing is canonical; keep tactical copy (ops, intel, stand-down) | 0.47 |

Bot AI: prefer lean FSM (patrol → chase → attack) in `BotBrain.js` over re-adding heavy decision-tree thrash.

---

## Testing (manual)

No automated test suite yet. After combat/input/AI changes, verify:

1. Start map → pointer lock → WASD + look feel sane (esp. laptop touchpad)
2. Shoot enemy → hitmarker, bot HP, kill count at 0 HP
3. Take bot fire → vignette, HP drop, death → ~3s respawn at team spawn
4. Teammate bots ignore your bullets (and vice versa)
5. `R` / empty mag → reload fills ammo
6. Escape pause → custom cursor; resume without pointer-lock security errors
7. Hard refresh → SpecOps homescreen; BUILD stamp opens intel modal (Esc / CLOSE / backdrop)

---

## Current priorities

1. Phase 2 prep: networking, more maps/weapons, game modes — only when asked
2. Keep combat feel + SpecOps UI coherent; polish UX before new systems
3. Docs: keep SCRATCHPAD/CHANGELOG/SUMMARY in sync with version bumps
4. Create `docs/STYLE_GUIDE.md` once conventions grow past this file (see Init, step 4)

**Out of date if**: version > 0.47 and this header was not amended — bump version here and add a short `[AMENDED …]` note at top.

---

## Cursor-specific notes (2026)

- Cursor reads `AGENTS.md` automatically from the repo root **and from subdirectories** — the nearest file wins for that subtree. Since `tools/arena-builder-desktop/` already has a different stack (Electron, not vanilla-JS-CDN), consider giving it its own `tools/arena-builder-desktop/AGENTS.md` instead of relying on the "do not conflate" note above — an agent working in that folder would pick it up automatically.
- Cursor's native behavioral-rule engine is `.cursor/rules/*.mdc` (YAML frontmatter: `description`, `globs`, `alwaysApply`) — **not** the legacy `.cursorrules` file, which is no longer read in Agent mode (only Chat/Tab). If this project ever has a `.cursorrules` file lying around, it's not doing anything for agent sessions.
- Current best-practice split across tools: `AGENTS.md` answers "what is this project" (context, architecture, status — everything above). `.cursor/rules/*.mdc` answers "how should the agent write code" (behavioral rules, glob-scoped so they only load when relevant instead of on every request).
- This file currently does both jobs in one flat document. That's fine at its current size and matches the KISS/YAGNI philosophy above — **don't split it preemptively.** If it keeps growing past the point where the whole thing loads on every single request, the natural next step is peeling **Code standards**, **UI/visual direction**, and **Known gotchas** into scoped `.mdc` rules (e.g. one scoped to `game/src/systems/bot/**` for the bot gotchas, one scoped to `game/style.css` + `game/src/ui/**` for the SpecOps palette rule). Treat that as a large architecture split — ask the user first, per Boundaries.