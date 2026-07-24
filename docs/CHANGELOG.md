<!-- PRESERVATION RULE: Never delete or replace content. Append or annotate only. -->

# Changelog

All notable changes to Voxel Arena are documented here.

## [0.47] — 2026-07-24

### Added
- SpecOps homescreen briefing (classified header, numbered ops list, build stamp)
- Intel / version modal with codenamed build notes (`versionBriefing.js`)
- Tactical type stack: Barlow Condensed + Share Tech Mono
- Refactor audit suite: `scripts/refactor_audit.py` / `scripts/audit.bat` → `docs/REFACTOR_AUDIT.md` (LOC + AGENTS.md size limits)

### Changed
- UI palette shifted from neon arcade green → olive / brass SOCOM–Clancy feel
- Stand-down `home.html` restyled to match briefing language
- Pause menu labels use mission hold / abort wording
- Custom cursor → square brass reticle

## [0.46] — 2026-07-24

### Added
- Combat HUD: HP bar, ammo, kills, damage vignette, hitmarkers
- Reload (R) + auto-reload when empty
- Player death / 3s respawn at team spawn
- Team-safe hits; bots can wound player

## [0.45] — 2026-07-24

### Fixed
- Laptop touchpad look spikes + stuck WASD after blur / pointer-lock loss
- Two-finger wheel fighting aim while locked
- Mouse sensitivity setting now applied

## [0.44] — 2026-07-24

### Changed
- Glock viewmodel cohesion (overlapping volumes, inset serrations, box guard)

## [0.43] — 2026-07-24

### Changed
- Bot AI lean chase/face/shoot FSM
- Viewmodel near-plane + team-color fix
- Player move uses world camera quaternion
