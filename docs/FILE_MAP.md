# Voxel Arena - Complete File Map & Module Reference

**Version**: 0.37  
**Last Updated**: December 2024  
**Purpose**: Comprehensive file location guide for AI systems and developers

---

## 📁 Complete Directory Structure

```
Voxel-Arena/
├── game/                                    # Main game application directory
│   ├── index.html                          # 🎯 ENTRY POINT: Main HTML file, loads Three.js and initializes game
│   ├── home.html                           # Quit/exit page
│   ├── style.css                           # Global CSS styling (retro green-on-black theme)
│   ├── assets/                              # Game assets directory
│   │   ├── audio/
│   │   │   └── main.wav                    # Background music file
│   │   ├── main.png                        # Game logo/screenshot
│   │   └── Gemini_Generated_Image_*.png   # Concept art
│   └── src/                                # Source code directory
│       ├── core/                           # Core engine systems (4 files)
│       │   ├── main.js                     # 🎯 MAIN ENGINE: Game class, game loop, scene management
│       │   ├── physics.js                  # Collision detection (AABB)
│       │   ├── input.js                    # Input handling, keybinds, custom cursor
│       │   └── settings.js                 # Settings persistence (localStorage)
│       ├── player/                         # Player-related systems (5 files)
│       │   ├── player.js                   # Player controller, movement, camera
│       │   ├── character.js                # Character model (procedural "bean")
│       │   ├── glock.js                    # Weapon system, firing, audio
│       │   ├── bullet.js                   # Bullet physics and rendering
│       │   └── avatar.js                  # Avatar editor (3D viewer)
│       ├── world/                          # World/arena systems (5 files)
│       │   ├── arena.js                    # Arena dispatcher (loads arena1/arena2)
│       │   ├── arena1.js                   # Classic Arena definition
│       │   ├── arena2.js                   # Big Arena definition
│       │   ├── structures.js               # Structure class (collision data)
│       │   └── mapPreview.js               # 3D map preview for selection menu
│       ├── ui/                             # User interface systems (3 files)
│       │   ├── ui.js                       # Main UI controller (menus, HUD)
│       │   ├── minimap.js                  # Minimap rendering system
│       │   └── customComponents.js         # CustomDropdown, CustomSlider
│       └── systems/                        # Complex game systems
│           └── bot/                        # AI bot system (9 files)
│               ├── Bot.js                  # Main bot class (physics + AI)
│               ├── BotBrain.js             # AI decision-making core
│               ├── BotSenses.js            # Perception system (vision, hearing)
│               ├── BotMemory.js             # Learning and memory
│               ├── BotPersonality.js       # Behavioral traits
│               ├── BotCombat.js            # Combat tactics and weapons
│               ├── BotMovement.js          # Pathfinding and movement
│               ├── BotCommunication.js      # Team coordination
│               └── BotManager.js           # Bot lifecycle management
├── docs/                                   # Documentation directory
│   ├── ARCHITECTURE.md                    # Technical architecture
│   ├── SUMMARY.md                         # Project overview
│   ├── SCRATCHPAD.md                      # Development notes
│   ├── SBOM.md                            # Software bill of materials
│   ├── REQUIREMENTS.md                    # System requirements
│   ├── FILE_MAP.md                        # This file
│   ├── BOT_SYSTEM.md                      # Bot system documentation
│   ├── BOT_API.md                         # Bot API reference
│   ├── BOT_EXAMPLES.md                    # Bot usage examples
│   └── BOT_FIXES.md                       # Bot system bug fixes
├── scripts/
│   └── launch.bat                          # Windows launcher script
├── README.md                               # User-facing documentation
├── SUMMARY.md                              # Quick project summary
├── PROJECT_STRUCTURE.md                    # Project organization guide
└── GAME_STRUCTURE_ORGANIZED.md             # Game structure details
```

---

## 🎯 Entry Points & Initialization Flow

### Primary Entry Point
**File**: `game/index.html`  
**Path**: `Voxel-Arena/game/index.html`  
**Purpose**: 
- Loads Three.js library from CDN (global `THREE` object)
- Contains HTML structure for all UI menus
- Creates canvas element (`#game-canvas`)
- Imports and initializes `main.js` module

**Key Elements**:
```html
<canvas id="game-canvas"></canvas>  <!-- Main game canvas -->
<div id="ui-container">...</div>    <!-- All UI menus -->
<script type="module" src="src/core/main.js"></script>  <!-- Game initialization -->
```

### Game Initialization Flow
1. **`index.html`** loads → Creates DOM structure
2. **`main.js`** imports → `Game` class constructor runs
3. **`main.js`** imports dependencies:
   - `input.js` → Input system initialization
   - `ui.js` → UI system initialization
   - `settings.js` → Load saved settings
4. **Game loop starts** → `animate()` function runs at 60fps
5. **User clicks "Single Player"** → Map selection menu appears
6. **User selects map** → `startGame(mapId)` creates arena, player, bots

---

## 📦 Module Dependencies & Import Graph

### Core Systems (`game/src/core/`)

#### `main.js` - Game Engine Hub
**Path**: `game/src/core/main.js`  
**Purpose**: Central game engine, manages game loop, scene, and all systems  
**Imports**:
- `./input.js` → Input handling
- `./settings.js` → Settings management
- `../world/arena.js` → Arena creation
- `../player/player.js` → Player class
- `../player/glock.js` → Weapon system
- `../player/bullet.js` → Bullet class
- `../ui/ui.js` → UI management
- `../ui/minimap.js` → Minimap system
- `../player/avatar.js` → Avatar editor
- `../systems/bot/BotManager.js` → Bot system

**Exports**: `Game` class (instantiated in `index.html`)

#### `physics.js` - Collision Detection
**Path**: `game/src/core/physics.js`  
**Purpose**: AABB collision detection between player/bots and structures  
**Imports**: None (pure utility functions)  
**Exports**: `checkCollision(player, structures)` function  
**Used By**: 
- `player.js` (player collision)
- `Bot.js` (bot collision)

#### `input.js` - Input System
**Path**: `game/src/core/input.js`  
**Purpose**: Keyboard/mouse input, keybind management, custom cursor  
**Imports**: `./settings.js` (for keybind loading)  
**Exports**: 
- `initInput(callback)` → Initialize input system
- `getInputState()` → Current input state
- `setCursorActive(bool)` → Enable/disable custom cursor
- `refreshKeybinds()` → Reload keybinds from settings

**Used By**: `main.js`, `player.js`

#### `settings.js` - Settings Persistence
**Path**: `game/src/core/settings.js`  
**Purpose**: Load/save settings to localStorage  
**Imports**: None  
**Exports**:
- `getSetting(key)` → Get setting value
- `setSetting(key, value)` → Save setting
- `applyPerformanceProfile()` → Apply performance settings

**Used By**: `main.js`, `input.js`, `ui.js`

---

### Player Systems (`game/src/player/`)

#### `player.js` - Player Controller
**Path**: `game/src/player/player.js`  
**Purpose**: First-person player movement, camera controls, physics  
**Imports**:
- `./character.js` → Character model creation
- `../core/physics.js` → Collision detection
- `../core/input.js` → Input state

**Exports**: `Player` class  
**Used By**: `main.js`

**Key Methods**:
- `update(deltaTime)` → Update position, handle input
- `getPosition()` → Get current position
- `getDirection()` → Get facing direction

#### `character.js` - Character Model
**Path**: `game/src/player/character.js`  
**Purpose**: Procedural character model (cylinder + spheres)  
**Imports**: None (uses global `THREE`)  
**Exports**: `createCharacter(team)` → Creates character mesh  
**Used By**: 
- `player.js` (player character)
- `Bot.js` (bot characters)

#### `glock.js` - Weapon System
**Path**: `game/src/player/glock.js`  
**Purpose**: Weapon model, firing, procedural audio  
**Imports**: 
- `./bullet.js` → Create bullets
- `../core/input.js` → Fire input

**Exports**: `Glock` class  
**Used By**: `main.js` (attached to player)

#### `bullet.js` - Projectile System
**Path**: `game/src/player/bullet.js`  
**Purpose**: Bullet physics, rendering, lifetime  
**Imports**: None (uses global `THREE`)  
**Exports**: `Bullet` class  
**Used By**: `glock.js`, `Bot.js` (bot weapons)

#### `avatar.js` - Avatar Editor
**Path**: `game/src/player/avatar.js`  
**Purpose**: 3D character viewer in separate scene  
**Imports**: `./character.js`  
**Exports**: `initAvatarEditor()` function  
**Used By**: `main.js` (avatar menu)

---

### World Systems (`game/src/world/`)

#### `arena.js` - Arena Dispatcher
**Path**: `game/src/world/arena.js`  
**Purpose**: Loads appropriate arena based on mapId  
**Imports**:
- `./arena1.js` → Classic Arena
- `./arena2.js` → Big Arena
- `./structures.js` → Structure class

**Exports**: `createArena(scene, mapId)` function  
**Used By**: `main.js`

**Returns**: Arena data object with:
- `structures[]` → Array of Structure objects
- `spawnPoint` → Default spawn
- `spawnPoints[]` → Multiple spawn points
- `botSpawnAreas` → Team spawn areas
- `metadata` → Map information
- `meshes[]` → Three.js meshes

#### `arena1.js` - Classic Arena
**Path**: `game/src/world/arena1.js`  
**Purpose**: Defines Classic Arena (100x100 units)  
**Imports**: `./structures.js`  
**Exports**: `createArena1()` function  
**Used By**: `arena.js`

#### `arena2.js` - Big Arena
**Path**: `game/src/world/arena2.js`  
**Purpose**: Defines Big Arena (120x120 units)  
**Imports**: `./structures.js`  
**Exports**: `createArena2()` function  
**Used By**: `arena.js`

#### `structures.js` - Structure Class
**Path**: `game/src/world/structures.js`  
**Purpose**: Data representation for collision objects  
**Imports**: None  
**Exports**: `Structure` class  
**Used By**: `arena1.js`, `arena2.js`, `physics.js`

**Structure Format**:
```javascript
new Structure(
    {x, y, z},      // position
    {x, y, z},      // size
    'box'           // type
)
```

#### `mapPreview.js` - Map Preview System
**Path**: `game/src/world/mapPreview.js`  
**Purpose**: 3D preview of maps in selection menu  
**Imports**: `./arena.js` (to load arena data)  
**Exports**: `MapPreview` class  
**Used By**: `ui.js` (map selection menu)

---

### UI Systems (`game/src/ui/`)

#### `ui.js` - UI Controller
**Path**: `game/src/ui/ui.js`  
**Purpose**: Manages all UI menus, visibility, interactions  
**Imports**:
- `../core/settings.js` → Settings management
- `../world/mapPreview.js` → Map preview
- `./customComponents.js` → Custom UI components

**Exports**: 
- `initUI()` → Initialize UI system
- `UIManager` object → Menu management methods

**Key Methods**:
- `showMenu(menuId)` → Show specific menu
- `showHUD()` → Show in-game HUD
- `showPauseMenu()` → Show pause menu
- `updateCustomCursorPosition(x, y)` → Move custom cursor

**Used By**: `main.js`

#### `minimap.js` - Minimap System
**Path**: `game/src/ui/minimap.js`  
**Purpose**: Top-down minimap rendering  
**Imports**: None (creates own DOM elements)  
**Exports**: `Minimap` class  
**Used By**: `main.js`

**Features**:
- Dynamic DOM creation (no HTML dependencies)
- Player position (green dot)
- Bot positions (red/blue dots by team)
- Structures (gray rectangles)
- Direction indicator

#### `customComponents.js` - Custom UI Components
**Path**: `game/src/ui/customComponents.js`  
**Purpose**: CustomDropdown and CustomSlider components  
**Imports**: None  
**Exports**: 
- `CustomDropdown` class
- `CustomSlider` class

**Used By**: `ui.js` (settings menu)

---

### AI Bot Systems (`game/src/systems/bot/`)

#### `Bot.js` - Main Bot Class
**Path**: `game/src/systems/bot/Bot.js`  
**Purpose**: Bot physics, rendering, AI integration  
**Imports**:
- `./BotBrain.js` → AI decision-making
- `./BotSenses.js` → Perception
- `./BotMemory.js` → Learning
- `./BotPersonality.js` → Behavior traits
- `./BotCombat.js` → Combat system
- `./BotMovement.js` → Movement system
- `./BotCommunication.js` → Team coordination
- `../../player/character.js` → Character model
- `../../core/physics.js` → Collision detection
- `../../player/bullet.js` → Bullet creation

**Exports**: `Bot` class  
**Used By**: `BotManager.js`

**Key Properties**:
- `mesh` → Three.js mesh (character model)
- `position` → Current position
- `velocity` → Movement velocity
- `team` → 'red' or 'blue'
- `health` → Health value
- `brain` → BotBrain instance

#### `BotBrain.js` - AI Core
**Path**: `game/src/systems/bot/BotBrain.js`  
**Purpose**: Central AI decision-making system  
**Imports**:
- `./BotSenses.js`
- `./BotMemory.js`
- `./BotPersonality.js`
- `./BotCombat.js`
- `./BotMovement.js`

**Exports**: `BotBrain` class  
**Used By**: `Bot.js`

**Key Methods**:
- `update(deltaTime, situation)` → Main AI update
- `makeDecision(situation)` → Choose action
- `evaluateSituation()` → Assess current state

#### `BotSenses.js` - Perception System
**Path**: `game/src/systems/bot/BotSenses.js`  
**Purpose**: Vision, hearing, environmental awareness  
**Imports**: None (uses global `THREE` for raycasting)  
**Exports**: `BotSenses` class  
**Used By**: `BotBrain.js`

**Key Methods**:
- `detectEnemies()` → Find visible enemies
- `detectStructures()` → Find nearby obstacles
- `calculateThreatLevel()` → Assess danger

#### `BotMemory.js` - Learning System
**Path**: `game/src/systems/bot/BotMemory.js`  
**Purpose**: Experience storage, pattern recognition  
**Imports**: None  
**Exports**: `BotMemory` class  
**Used By**: `BotBrain.js`

#### `BotPersonality.js` - Behavioral Traits
**Path**: `game/src/systems/bot/BotPersonality.js`  
**Purpose**: Personality traits affecting decisions  
**Imports**: None  
**Exports**: `BotPersonality` class  
**Used By**: `BotBrain.js`

#### `BotCombat.js` - Combat System
**Path**: `game/src/systems/bot/BotCombat.js`  
**Purpose**: Tactical combat, weapon handling, targeting  
**Imports**: None (uses global `THREE`)  
**Exports**: `BotCombat` class  
**Used By**: `BotBrain.js`

**Key Methods**:
- `engageEnemy(enemy)` → Attack enemy
- `prioritizeTargets(enemies)` → Choose best target
- `fireWeapon()` → Fire at target

#### `BotMovement.js` - Movement System
**Path**: `game/src/systems/bot/BotMovement.js`  
**Purpose**: Pathfinding, obstacle avoidance, movement  
**Imports**: None (uses global `THREE`)  
**Exports**: `BotMovement` class  
**Used By**: `BotBrain.js`

**Key Methods**:
- `executeAction(action, situation)` → Execute movement action
- `executePatrol(situation)` → Patrol behavior
- `executeHunt(situation)` → Hunt behavior
- `findPath(target)` → Pathfinding

#### `BotCommunication.js` - Team Coordination
**Path**: `game/src/systems/bot/BotCommunication.js`  
**Purpose**: Bot-to-bot communication, team tactics  
**Imports**: None  
**Exports**: `BotCommunication` class  
**Used By**: `BotBrain.js`

#### `BotManager.js` - Bot Lifecycle
**Path**: `game/src/systems/bot/BotManager.js`  
**Purpose**: Bot spawning, updates, cleanup  
**Imports**: `./Bot.js`  
**Exports**: `BotManager` class  
**Used By**: `main.js`

**Key Methods**:
- `createBot(team, difficulty)` → Spawn new bot
- `update(deltaTime)` → Update all bots
- `getBots()` → Get all active bots
- `clearBots()` → Remove all bots

---

## 🔗 Import Relationship Graph

### Top-Level Dependencies
```
index.html
  └── main.js (Game class)
      ├── input.js
      │   └── settings.js
      ├── settings.js
      ├── arena.js
      │   ├── arena1.js
      │   │   └── structures.js
      │   ├── arena2.js
      │   │   └── structures.js
      │   └── structures.js
      ├── player.js
      │   ├── character.js
      │   ├── physics.js
      │   └── input.js
      ├── glock.js
      │   ├── bullet.js
      │   └── input.js
      ├── ui.js
      │   ├── settings.js
      │   ├── mapPreview.js
      │   │   └── arena.js
      │   └── customComponents.js
      ├── minimap.js
      ├── avatar.js
      │   └── character.js
      └── BotManager.js
          └── Bot.js
              ├── BotBrain.js
              │   ├── BotSenses.js
              │   ├── BotMemory.js
              │   ├── BotPersonality.js
              │   ├── BotCombat.js
              │   └── BotMovement.js
              ├── BotCommunication.js
              ├── character.js
              ├── physics.js
              └── bullet.js
```

---

## 🎮 Game State Flow

### State Transitions
1. **Menu State** (`gameState = 'menu'`)
   - `index.html` loaded
   - `main.js` initialized
   - Start menu visible
   - Background music playing

2. **Map Selection** (user clicks "Single Player")
   - `ui.js` shows map selection menu
   - `mapPreview.js` renders 3D preview
   - User configures bots, selects team

3. **Game Start** (user clicks "Start Map")
   - `main.js.startGame(mapId)` called
   - `arena.js` creates arena meshes
   - `Player` instance created
   - `Glock` instance created
   - `BotManager` creates bots
   - `Minimap` initialized
   - Game loop starts (`gameState = 'playing'`)

4. **Playing State** (`gameState = 'playing'`)
   - Game loop runs at 60fps
   - `player.update()` called each frame
   - `botManager.update()` called each frame
   - `minimap.update()` called each frame
   - Input processed each frame

5. **Paused State** (`gameState = 'paused'`)
   - User presses Escape
   - `ui.js` shows pause menu
   - Custom cursor enabled
   - Game loop continues but no updates

6. **Game End** (user clicks "Quit to Main Menu")
   - All game objects cleaned up
   - `gameState = 'menu'`
   - Background music resumes

---

## 📝 File Purpose Quick Reference

| File | Purpose | Key Exports | Used By |
|------|---------|-------------|---------|
| `index.html` | Entry point, DOM structure | - | Browser |
| `main.js` | Game engine, game loop | `Game` class | `index.html` |
| `physics.js` | Collision detection | `checkCollision()` | `player.js`, `Bot.js` |
| `input.js` | Input handling | `getInputState()`, `initInput()` | `main.js`, `player.js` |
| `settings.js` | Settings persistence | `getSetting()`, `setSetting()` | `main.js`, `input.js`, `ui.js` |
| `player.js` | Player controller | `Player` class | `main.js` |
| `character.js` | Character model | `createCharacter()` | `player.js`, `Bot.js` |
| `glock.js` | Weapon system | `Glock` class | `main.js` |
| `bullet.js` | Projectile system | `Bullet` class | `glock.js`, `Bot.js` |
| `arena.js` | Arena loader | `createArena()` | `main.js` |
| `arena1.js` | Classic Arena | `createArena1()` | `arena.js` |
| `arena2.js` | Big Arena | `createArena2()` | `arena.js` |
| `structures.js` | Structure class | `Structure` class | `arena1.js`, `arena2.js` |
| `ui.js` | UI management | `UIManager`, `initUI()` | `main.js` |
| `minimap.js` | Minimap rendering | `Minimap` class | `main.js` |
| `Bot.js` | Bot class | `Bot` class | `BotManager.js` |
| `BotBrain.js` | AI core | `BotBrain` class | `Bot.js` |
| `BotManager.js` | Bot lifecycle | `BotManager` class | `main.js` |

---

## 🔍 Finding Specific Functionality

### Where to Find Things:

**Player Movement**: `game/src/player/player.js` → `update()` method  
**Collision Detection**: `game/src/core/physics.js` → `checkCollision()` function  
**Input Handling**: `game/src/core/input.js` → `getInputState()` function  
**Weapon Firing**: `game/src/player/glock.js` → `fire()` method  
**Bot AI Decisions**: `game/src/systems/bot/BotBrain.js` → `makeDecision()` method  
**Bot Movement**: `game/src/systems/bot/BotMovement.js` → `executeAction()` method  
**UI Menu Management**: `game/src/ui/ui.js` → `UIManager` object  
**Arena Creation**: `game/src/world/arena.js` → `createArena()` function  
**Settings Loading**: `game/src/core/settings.js` → `getSetting()` function  
**Minimap Rendering**: `game/src/ui/minimap.js` → `update()` method  

---

**Last Updated**: December 2024  
**Maintained By**: Project Documentation System

