# Voxel Arena - Project Structure

## 📁 Organized Project Layout

```
Voxel-Arena/
├── 🎮 game/                    # Main game application
│   ├── index.html             # Game entry point
│   ├── style.css              # Game styling
│   └── src/                   # Game source code
│       ├── core/              # Core engine systems
│       │   ├── main.js        # Main game engine
│       │   ├── physics.js     # Collision detection
│       │   ├── input.js       # Input handling
│       │   └── settings.js    # Game settings
│       ├── player/            # Player systems
│       │   ├── player.js      # Player controller
│       │   ├── character.js   # Character model
│       │   ├── avatar.js      # Avatar editor
│       │   ├── glock.js       # Weapon system
│       │   └── bullet.js      # Projectile system
│       ├── world/             # World/arena systems
│       │   ├── arena.js       # Arena dispatcher
│       │   ├── arena1.js      # Classic Arena
│       │   ├── arena2.js      # Big Arena
│       │   ├── structures.js  # Structure definitions
│       │   └── mapPreview.js  # Map preview system
│       ├── ui/                # User interface systems
│       │   ├── ui.js          # Main UI controller
│       │   ├── customComponents.js # Custom UI components
│       │   └── minimap.js     # Minimap system
│       └── systems/           # Game systems
│           └── bot/           # AI bot system (9 files)
│               ├── Bot.js     # Main bot class
│               ├── BotBrain.js # AI decision making
│               ├── BotMovement.js # Pathfinding & movement
│               └── ...        # 6 more bot modules
├── 🎨 assets/                  # Game assets
│   ├── audio/                 # Sound files
│   │   └── main.wav          # Menu music
│   ├── main.png              # Game icon
│   └── *.png                 # Other images
├── 📚 docs/                    # Documentation
│   ├── SUMMARY.md            # Project overview
│   ├── ARCHITECTURE.md       # Technical documentation
│   ├── SCRATCHPAD.md         # Development notes
│   ├── BOT_API.md            # Bot system documentation
│   └── ...                   # Other documentation
├── 🛠️ tools/                   # Development tools
│   └── arena-builder-desktop/ # Desktop arena builder
├── 🚀 scripts/                 # Launch scripts
│   └── launch.bat            # Windows game launcher
├── README.md                 # Main project readme
└── SUMMARY.md               # Project summary (legacy)
```

## 🎯 Key Changes from Reorganization

### ✅ **What Was Moved:**

1. **Game Files** → `game/` directory
   - `index.html` → `game/index.html`
   - `style.css` → `game/style.css`
   - `src/` → `game/src/`
   - `home.html` → `game/home.html`

2. **Assets** → `assets/` directory
   - `audio/` → `assets/audio/`
   - `*.png` files → `assets/`

3. **Documentation** → `docs/` directory
   - `documents/` → `docs/`

4. **Scripts** → `scripts/` directory
   - `launch.bat` → `scripts/launch.bat`

5. **Tools** → `tools/` directory
   - Arena Builder (when created) → `tools/arena-builder-desktop/`

### 🔧 **What Was Updated:**

1. **Launch Script** (`scripts/launch.bat`)
   - Now changes directory to `game/` before starting server
   - Updated error messages to reference correct paths

2. **Game Files**
   - Updated asset paths in `game/index.html` and `game/src/main.js`
   - Audio: `audio/main.wav` → `../assets/audio/main.wav`
   - Icon: `main.png` → `../assets/main.png`

3. **Documentation**
   - Updated all file references in `README.md`
   - Updated `docs/ARCHITECTURE.md` with new paths
   - Updated `docs/SUMMARY.md` with new structure

## 🚀 **How to Run the Game:**

### Option 1: Use the Launch Script (Recommended)
```bash
scripts/launch.bat
```

### Option 2: Manual Launch
```bash
cd game
python -m http.server 8000
# Then visit http://localhost:8000
```

## 📋 **Benefits of This Structure:**

1. **🎯 Clear Separation**: Game code, assets, docs, and tools are clearly separated
2. **🛠️ Developer Friendly**: Easy to find specific types of files
3. **📚 Organized Documentation**: All docs in one place with clear structure
4. **🎨 Asset Management**: All game assets centralized in `assets/`
5. **🔧 Tool Integration**: Development tools in dedicated `tools/` folder
6. **🚀 Easy Deployment**: Launch scripts in dedicated `scripts/` folder

## 📝 **File Path Updates:**

All references have been updated to reflect the new structure:
- ✅ Launch script points to correct directory
- ✅ Game files reference assets correctly
- ✅ Documentation reflects new structure
- ✅ README shows organized layout

**Nothing was deleted** - everything was moved and updated! 🎉
