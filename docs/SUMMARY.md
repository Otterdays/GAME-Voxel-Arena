# Voxel Arena - Project Summary

<!-- PRESERVATION RULE: Never delete or replace content. Append or annotate only. -->

**Version**: 0.47  
**Last Updated**: 2026-07-24  
**Status**: SpecOps UI pass (SOCOM / Clancy briefing) + combat loop + input polish

> [AMENDED 2026-07-24]: Header bumped to 0.47 — SpecOps homescreen + version intel modal. Prior amend: 0.37 → 0.46 combat/input polish. Older sections below retained.

## 🆕 Recent Updates (2026-07-24)

### Refactor audit suite (same day as 0.47)
- `scripts/refactor_audit.py` + `scripts/audit.bat` — LOC / size-limit report
- Latest snapshot: `docs/REFACTOR_AUDIT.md` (31 files, ~14.4k LOC; 12 files over 400-line soft limit)

### v0.47 — SpecOps UI / version intel
- Homescreen = classified SpecOps briefing (brand hero, numbered ops, BUILD stamp)
- Version modal = INTEL BRIEFING with codenamed build notes
- Olive / brass tactical palette; Barlow Condensed + Share Tech Mono
- `docs/CHANGELOG.md` added

### v0.46 — Combat feel / FPS loop
- Combat HUD: HP bar, ammo, kill counter, damage vignette, hitmarkers
- Reload (`R`) wired + auto-reload on empty mag
- Player death / 3s respawn at team spawn
- Team-safe bullets; body-center + swept hit tests; bots damage player via tracers

### v0.45 — Laptop touchpad input
- Look spike clamps; clear stuck WASD on blur / pointer-lock loss
- Ignore look ~80ms after lock; mouse sensitivity setting applied

### v0.44 — Glock model cohesion
- Flush FP pistol volumes; recessed slide serrations; material contrast

### v0.43 — Lean bot AI + viewmodel / turn fixes
- BotBrain FSM: patrol → chase → attack (face + shoot)
- Viewmodel near-plane / team-color paint fix; world-space WASD

### v0.40–0.42 — Bot visibility, movement feel, FPS polish
- NaN rotation vanish fix; movement double-friction fix; arm+tracer visuals

## 🎯 Project Overview

Voxel Arena is a browser-based 3D first-person shooter built with vanilla JavaScript and Three.js. The game features smooth 60fps gameplay, modular architecture, and a retro-futuristic aesthetic. Phase 1 includes complete single-player mechanics with fully functional AI bots, ready for Phase 2 multiplayer development.

## 🏗️ Technical Architecture

### Core Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **3D Engine**: Three.js r128 (CDN)
- **Audio**: Web Audio API (procedural sound generation)
- **Storage**: localStorage for settings persistence
- **Build System**: None (vanilla JavaScript)

### Modular Component System (19 Core Modules + Supporting Systems)

**📁 File Locations**: All paths relative to `Voxel-Arena/game/src/`

#### Core Game Modules
1. **`core/main.js`** - Core game engine and main loop (Game class, scene management)
2. **`core/input.js`** - Input handling and keybind system (keyboard/mouse, custom cursor)
3. **`core/settings.js`** - Settings persistence and management (localStorage)
4. **`core/physics.js`** - Collision detection (AABB algorithm)

#### Player Modules
5. **`player/player.js`** - First-person player controls and physics (movement, camera)
6. **`player/character.js`** - Procedural character model (cylinder + spheres)
7. **`player/glock.js`** - Weapon system with procedural audio (firing, iron sights)
8. **`player/bullet.js`** - Projectile physics and rendering (bullet class)
9. **`player/avatar.js`** - Avatar editor (3D character viewer)

#### World Modules
10. **`world/arena.js`** - Arena dispatcher and map loading (loads arena1/arena2)
11. **`world/arena1.js`** - Classic Arena definition (100x100 units)
12. **`world/arena2.js`** - Big Arena definition (120x120 units)
13. **`world/structures.js`** - Structure class (collision data representation)
14. **`world/mapPreview.js`** - 3D map preview system (for map selection menu)

#### UI Modules
15. **`ui/ui.js`** - User interface management (menus, HUD, interactions)
16. **`ui/minimap.js`** - Renders the top-down minimap on the HUD (dynamic creation)
17. **`ui/customComponents.js`** - Custom UI components (CustomDropdown, CustomSlider)

### AI Bot System (9 Modules)

**📁 Location**: All bot modules in `game/src/systems/bot/`

18. **`systems/bot/Bot.js`** - Main bot class with physics and AI integration (938 lines)
19. **`systems/bot/BotBrain.js`** - Core AI decision-making system (state machines, decisions)
20. **`systems/bot/BotSenses.js`** - Perception and environmental awareness (vision, hearing, 700 lines)
21. **`systems/bot/BotMemory.js`** - Learning and experience storage (pattern recognition)
22. **`systems/bot/BotPersonality.js`** - Behavioral traits and emotional states (affects decisions)
23. **`systems/bot/BotCombat.js`** - Tactical combat and weapon handling (targeting, firing)
24. **`systems/bot/BotMovement.js`** - Navigation and pathfinding (A* algorithm, 1029 lines)
25. **`systems/bot/BotCommunication.js`** - Team coordination and information sharing
26. **`systems/bot/BotManager.js`** - Game integration and bot lifecycle management (729 lines)

### Supporting Systems

**Note**: These are listed separately but are part of the core module count above. They're utility modules used by multiple systems.

- **`core/physics.js`** - AABB collision detection (used by player.js and Bot.js)
- **`world/structures.js`** - World object data representation (used by arena1.js, arena2.js)
- **`player/character.js`** - Procedural player model (used by player.js and Bot.js)
- **`player/avatar.js`** - 3D character viewer (used by main.js for avatar menu)
- **`ui/customComponents.js`** - Custom UI components (used by ui.js for settings menu)
- **`world/mapPreview.js`** - 3D map preview system (used by ui.js for map selection)

**Total Modules**: 26 JavaScript modules (17 core game + 9 bot system)

**📖 For complete file locations and import relationships, see [`FILE_MAP.md`](./FILE_MAP.md)**  
**🤖 For comprehensive bot system analysis and pain points, see [`BOT_ANALYSIS.md`](./BOT_ANALYSIS.md)**

## 🎮 Current Features

> [AMENDED 2026-07-24]: Combat HUD / reload / death-respawn / team-safe hits added under Core Gameplay. BotBrain note: lean FSM (patrol/chase/attack) is current; older “decision tree” wording below is historical.

### Core Gameplay
- **First-Person Controls**: WASD movement with mouse look (touchpad spike-hardened)
- **Weapon System**: Procedural Glock viewmodel (arm + pistol), tracers, reload (`R` / auto)
- **Combat Loop**: HP/ammo/kills HUD, hitmarkers, damage vignette, player death + 3s respawn
- **Hit Detection**: Owner-tagged bullets, no friendly fire, body-center + swept segment tests
- **Physics Engine**: Jumping, gravity, and collision detection
- **Multiple Maps**: Two distinct arena environments
- **Custom UI**: Retro-futuristic green-on-black interface
- **AI Bots**: Fully functional computer-controlled opponents with physics and combat

### Technical Features
- **60fps Performance**: Optimized rendering pipeline
- **Custom Cursor System**: Solves browser pointer lock issues
- **Custom UI Components**: CustomDropdown and CustomSlider components that match game aesthetic
- **In-Game Minimap**: A top-down, rotating minimap provides spatial awareness of the immediate surroundings.
- **Settings Persistence**: Customizable keybinds and preferences
- **Audio System**: Background music and procedural weapon sounds
- **Avatar Editor**: 3D character model viewer
- **Custom Scrollbar Styling**: Green-themed scrollbars matching overall design
- **Responsive Design**: Works on desktop and mobile browsers

### AI Bot Features (Fully Functional)
- **Physics Integration**: Bots use identical physics system as player (gravity, collision, movement)
- **Advanced AI System**: Multi-module BotBrain with decision trees, pathfinding, and combat
- **Intelligent Behavior**: Patrol, hunt, regroup, flank, retreat, and advance behaviors
- **Team Combat**: Red vs Blue team battles with proper team awareness and coordination
- **Weapon Systems**: Bots fire weapons at enemies with realistic fire rates and targeting
- **Patrol System**: Bots patrol around spawn areas with dynamic target selection
- **Enemy Detection**: Vision-based targeting with configurable detection ranges
- **Combat Engagement**: Bots engage enemies with tactical positioning and weapon use
- **Movement**: Smooth movement at competitive speeds (5.0 units/second for medium difficulty)
- **Collision Avoidance**: Proper obstacle avoidance and pathfinding around structures
- **Team Management**: Per-team bot count controls (0-8 bots per team)
- **Custom Distribution**: Flexible bot allocation (e.g., 3 red, 1 blue)

### Arena Maps
- **Classic Arena**: 100x100 unit arena with strategic cover
- **Big Arena**: 120x120 unit arena with elevated platforms

### Enhanced Map System
- **Map Preview**: 3D real-time preview with spawn location indicators
- **Team Selection**: Player can choose Red or Blue team
- **Team-Based Spawning**: Players spawn on their selected team's side
- **Visual Team ID**: Player color changes based on team (red/blue)
- **Random Spawning**: Players and bots spawn at random locations within team areas
- **Team Spawn Areas**: Red and blue team-specific spawn zones
- **Map Metadata**: Comprehensive map information and statistics

### User Interface Improvements
- **Wider Layout**: Redesigned from 800px to 1500px max-width for better space utilization
- **Horizontal Organization**: Changed from vertical stacking to horizontal layout
- **Perfect Centering**: Absolute positioning with transform for precise screen centering
- **Professional Design**: Clean, modern interface with proper spacing and alignment
- **Responsive Layout**: Adaptive design that works on different screen sizes
- **Enhanced Controls**: Intuitive +/- buttons for bot count management with visual feedback
- **Bot Configuration**: Customizable bot count, difficulty, and team balance

## 📊 Development Progress

### ✅ Phase 1 Complete (Current)
- [x] Core single-player mechanics
- [x] Player movement and controls
- [x] Weapon system with audio
- [x] Physics and collision detection
- [x] UI system with settings
- [x] Multiple arena maps
- [x] Documentation suite
- [x] Launch script for Windows
- [x] AI Bot System with physics and combat
- [x] Bot team combat and patrol behaviors
- [x] Bot movement system (patrol, hunt, combat behaviors)
- [x] Collision detection and positioning fixes
- [x] Character model grounding and visual improvements
- [x] Speed balancing and friction optimization
- [x] Combat system integration and target acquisition
- [x] Pause menu functionality and background restoration

### 🚧 Phase 2 Planned (Future)
- [ ] Multiplayer Networking
- [ ] Additional Maps
- [ ] Weapon Variety
- [ ] Game Modes (Team Deathmatch, etc.)
- [ ] Advanced AI behaviors
- [ ] Bot customization options

## 🔧 Technical Achievements

### Custom Cursor System
- **Problem**: Browser pointer lock API limitations
- **Solution**: "Soft pause" menu with custom in-game cursor
- **Result**: Smooth pause/resume without security errors

### Modular Architecture
- **Benefit**: Reduced token consumption for AI development
- **Structure**: 9 focused modules with clear separation of concerns
- **Maintainability**: Easy to modify individual components

### Procedural Audio
- **Implementation**: Web Audio API for weapon sounds
- **Features**: Realistic gunshot audio without external files
- **Performance**: Low memory footprint

### Settings System
- **Features**: Temporary settings with apply/cancel
- **Storage**: localStorage persistence
- **Customization**: Fully rebindable controls

### AI Bot System
- **Problem**: Complex AI system with floating bots, crashes, and no movement
- **Solution**: Comprehensive overhaul of AI integration, collision detection, and movement systems
- **Result**: Fully functional bots with advanced AI, smooth movement, combat, and team awareness

### Bot System Debugging Journey
- **Version 0.22**: Fixed initial `executeAction` method missing in BotMovement
- **Version 0.23**: Resolved AI conflicts between BotBrain and legacy simple AI
- **Version 0.24**: Fixed BotCombat target switching crashes
- **Version 0.25**: Fixed survival system method calls
- **Version 0.26**: Resolved collision detection bounds issues
- **Version 0.27**: Fixed ground collision and speed balancing
- **Version 0.28**: Corrected collision box positioning
- **Version 0.29**: Fixed spawn height issues
- **Version 0.30**: Adjusted character model visual positioning

## 🚀 Deployment

### Local Development
- **Windows**: Use `launch.bat` for automatic server startup
- **Manual**: `python -m http.server 8000` or `npx http-server -p 8000`
- **Access**: Open `http://localhost:8000` in browser

### Production Ready
- **Static Hosting**: Compatible with any web server
- **CDN**: Can be deployed to GitHub Pages, Netlify, etc.
- **HTTPS**: Recommended for production deployment

## 📈 Performance Metrics

### Target Specifications
- **Frame Rate**: 60fps on recommended hardware
- **Memory Usage**: < 100MB RAM
- **Load Time**: < 3 seconds initial load
- **Browser Support**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+

### Optimization Features
- **Modular Loading**: Components load as needed
- **Efficient Rendering**: Optimized Three.js pipeline
- **Memory Management**: Proper cleanup of game objects
- **Input Optimization**: Efficient event handling

## 🔒 Security & Compliance

### Dependencies
- **External Libraries**: Only Three.js (MIT License)
- **Browser APIs**: Standard Web APIs only
- **Data Storage**: Local preferences only
- **Network**: No external communication

### Security Features
- **XSS Protection**: Input sanitization
- **CSP Compatible**: Content Security Policy ready
- **HTTPS Ready**: Secure deployment support
- **Privacy**: No user tracking or analytics

## 📚 Documentation Status

### Complete Documentation Suite
- ✅ **README.md** - User-friendly getting started guide
- ✅ **ARCHITECTURE.md** - Technical architecture details
- ✅ **REQUIREMENTS.md** - System requirements and compatibility
- ✅ **SBOM.md** - Software bill of materials and security
- ✅ **SCRATCHPAD.md** - Development notes and progress
- ✅ **SUMMARY.md** - This file - project overview
- ✅ **CHANGELOG.md** - Version history (Keep a Changelog) — [added 2026-07-24]
- ✅ **FILE_MAP.md** - Module location reference

### Documentation Quality
- **Comprehensive**: Covers all aspects of the project
- **Up-to-Date**: Reflects current project status
- **User-Friendly**: Clear instructions and examples
- **Technical**: Detailed architecture and implementation

## 🎯 Next Steps

> [AMENDED 2026-07-24]: AI bots are shipped; priorities refreshed.

### Immediate Priorities
1. **Multiplayer Infrastructure**: WebSocket-based networking
2. **Additional Content**: More maps and weapons
3. **Game Modes**: Score limits / round timer / team deathmatch UI
4. **Performance Optimization**: WebGL enhancements

### Historical note (December 2024 priorities — superseded)
1. ~~AI Bot Development~~ → done (lean FSM + combat loop as of 0.46)
2. Multiplayer Infrastructure
3. Additional Content
4. Performance Optimization

### Major Bot System Fixes (December 2024)

#### Bot AI System Overhaul
- **Initial Crashes**: Fixed `TypeError: this.movement.executeAction is not a function`
- **AI Conflicts**: Resolved legacy simple AI interfering with BotBrain system
- **Survival System**: Fixed missing methods (`findHidingSpot`, `findCover`, `moveToSafeLocation`)
- **Method Integration**: Properly connected BotBrain decision-making to BotMovement execution

#### Collision Detection System
- **Oversized Bounds**: Fixed collision box including limbs causing false collisions
- **Ground Collision**: Resolved bots colliding with ground structure instead of standing on it
- **Positioning**: Adjusted collision box center from y=0.5 to y=1.5 to prevent ground overlap
- **Physics Integration**: Optimized collision detection for obstacles only

#### Movement and Speed Issues
- **Velocity Propagation**: Fixed velocity not being applied from BotMovement to Bot physics
- **Speed Balance**: Increased bot speeds to match player (easy: 4.0, medium: 5.0, hard: 6.0, expert: 7.0)
- **Friction Issues**: Resolved double friction application (0.95 * 0.9 = 0.855) causing slow movement
- **Patrol Logic**: Fixed bots constantly changing targets preventing movement buildup

#### Character Positioning
- **Spawn Heights**: Fixed bots spawning at y=0.0 instead of y=1.0 (below ground level)
- **Visual Grounding**: Repositioned character model components to appear properly grounded
- **Model Alignment**: Adjusted body (y=0.0), head (y=1.2), arms (y=0.8), legs (y=-0.5)

#### Combat System Fixes
- **Target Switching**: Fixed `BotCombat.switchTarget` crash with undefined target objects
- **Target Prioritization**: Corrected target object passing in `prioritizeTargets` method
- **Safety Checks**: Added null checks for invalid targets and weapon operations

### UI and Visual Fixes (December 2024)
- **Canvas Viewport Issues**: Fixed white background cutoff and F12 dependency
- **UI Scaling System**: Simplified scaling system to fix oversized menus and containers
- **Map Preview Scaling**: Reduced map preview from 400x300px to 300x200px
- **Settings Container**: Reduced max-width from 1400px to 1000px
- **Custom Cursor**: Fixed positioning and visibility issues
- **Canvas Sizing**: Added multiple resize triggers and forced canvas sizing
- **CSS Improvements**: Fixed canvas positioning and viewport units
- **Preview Positioning**: Fixed avatar and map previews rendering outside containers
- **Menu Sizing Optimization**: Established UI sizing standards (900px max-width for menus)
- **Container Overflow**: Fixed settings boxes overflowing parent containers
- **Keybinds Layout Redesign**: Transformed from vertical stack to horizontal 3-column grid (60% space reduction)
- **Button Text Overflow**: Fixed text overflow issues for longer keybinds (Space, escape, mouse0, shift)
- **Text Alignment**: Perfect horizontal and vertical centering of text within buttons
- **Back Button Integration**: Positioned back button to the right with proper spacing

### Custom Components and UI System Fixes (December 2024)
- **Custom UI Components**: Implemented CustomDropdown and CustomSlider components
- **Custom Cursor Compatibility**: Fixed cursor positioning issues with native HTML elements
- **Toggle Switch Bug**: Fixed toggle switches showing incorrect ON/OFF states
- **Button Interaction Fixes**: Resolved double-click issues with bot count and Start Map buttons
- **Enhanced Error Handling**: Added comprehensive null checks for UI elements
- **Custom Scrollbar Styling**: Added green-themed scrollbars matching game aesthetic
- **Visual Consistency**: Improved overall UI consistency and professional appearance

### Critical Bug Fixes (December 2024)
- **Pause Menu Display Issue**: Fixed pause menu not appearing when pressing Escape key
- **Root Cause**: Pause menu DOM element was incorrectly nested inside settings-menu instead of ui-container
- **Solution**: Added `ensurePauseMenuInCorrectLocation()` function to fix DOM structure
- **CSS Z-Index Fix**: Enhanced pause menu z-index to ensure visibility above all game elements
- **Background Restoration**: Fixed main menu returning to black background instead of blue
- **Solution**: Changed `quitToMainMenu()` to restore original blue background color
- **Escape Key Detection**: Improved escape key handling for both uppercase and lowercase detection
- **Pointer Events**: Fixed UI container pointer events for proper menu interaction

## 🛠️ Development Tools

### Arena Builder Desktop (Version 1.0 - December 2024)

A sleek Windows desktop application for visually designing custom arena maps with an integrated asset library system.

**Major Features:**
- **Modern Dark UI**: VSCode-inspired interface (no retro green theme)
- **Asset Library**: 12 built-in assets with drag-and-drop functionality
- **Dual View Editor**: 2D grid + 3D preview with mouse controls
- **Native Integration**: Windows file dialogs for save/load/export
- **Interactive 3D**: Drag to rotate, scroll to zoom, optional auto-rotate
- **Structure Tools**: Place, move, resize, delete, duplicate with presets
- **Spawn Point Editor**: Player and team-specific bot spawn placement
- **Export System**: Generate game-ready JavaScript code
- **Project Management**: Native file operations with Windows dialogs

**Location**: `tools/arena-builder-desktop/` directory (Electron desktop app)

**Usage Workflow**:
1. Run `npm start` or built .exe
2. Drag assets from library onto canvas
3. Use mouse to interact with 3D preview
4. Export to JavaScript with native dialog
5. Import into game

**Technical Stack**:
- **Desktop**: Electron 28 with native Windows integration
- **Frontend**: Three.js r128 for 3D, HTML5 Canvas 2D
- **Assets**: 12 built-in presets (structures, walls, platforms, obstacles)
- **Storage**: Native file system with Windows dialogs
- **UI**: Modern dark theme inspired by VSCode

**Asset Library**:
- Built-in: Large Ground, Medium Ground, 3 Wall types, 3 Platform types, 4 Obstacle types
- Import custom: JSON format with drag-and-drop support
- Categories: Structures, Walls, Platforms, Obstacles
- Search and filter functionality
- Persistent storage between sessions

**3D Controls**:
- Click + Drag: Rotate camera around scene
- Vertical Drag: Adjust camera height
- Mouse Wheel: Zoom in/out
- Toggle Button: Enable/disable auto-rotation

**Integration**: Exports match game's Structure system format exactly, allowing seamless integration of custom arenas.

### Long-term Goals
- **Community Features**: User-generated content
- **Advanced Graphics**: Particle effects and lighting
- **Mobile Optimization**: Touch controls
- **Accessibility**: Enhanced keyboard navigation

---

**Project Maintainer**: Ry  
**Contact**: motorcycler14@yahoo.com  
**Repository**: https://github.com/AfyKirby1/Voxel-Arena  
**License**: MIT License
