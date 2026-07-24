# 🎮 Voxel Arena
<div align="center">

![Voxel Arena Screenshot](assets/main.png)

**An intense, browser-based 3D arena shooter with advanced AI combat.**

</div>

## 🛠️ **Tech Stack**

<div align="center">

[![Version](https://img.shields.io/badge/version-0.46-brightgreen.svg?style=for-the-badge&logo=github)](https://github.com/AfyKirby1/Voxel-Arena)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge&logo=opensourceinitiative)](LICENSE)
[![JavaScript](https://img.shields.io/badge/language-JavaScript-yellow.svg?style=for-the-badge&logo=javascript)](https://javascript.info/)
[![Three.js](https://img.shields.io/badge/engine-Three.js-orange.svg?style=for-the-badge&logo=threedotjs)](https://threejs.org/)
[![WebGL](https://img.shields.io/badge/WebGL-2.0-red.svg?style=for-the-badge&logo=webgl)](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
[![Browser](https://img.shields.io/badge/browser-compatible-green.svg?style=for-the-badge&logo=googlechrome)](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)

</div>

---

## ⚔️ **Experience intense voxel-based warfare with cutting-edge AI opponents**

Dive into epic battles where **Red vs Blue teams** clash in destructible arenas. Our advanced AI system creates intelligent, tactical opponents that patrol, flank, and engage with realistic combat behaviors. Built with vanilla JavaScript and Three.js for **smooth 60fps performance** - no downloads, no setup, just pure action.

<div align="center">

### 🚀 **Quick Start**

```bash
# Clone and play
git clone https://github.com/AfyKirby1/Voxel-Arena.git
cd Voxel-Arena

# Launch (Windows)
scripts/launch.bat

# Or manually
cd game
python -m http.server 8000
# Then visit http://localhost:8000
```

**That's it!** 🎯

</div>

---

## 🎯 **What You Get**

<div align="center">

### 🎮 **Core Experience**
| Feature | Description | Status |
|---------|-------------|--------|
| 🏃 **Smooth FPS Controls** | WASD movement with precise mouse look | ✅ |
| ⚔️ **Tactical Combat** | Jump, strafe, shoot, reload, die/respawn | ✅ |
| ❤️ **Combat HUD** | HP, ammo, kills, hitmarkers, damage flash | ✅ |
| 🗺️ **Two Unique Maps** | Classic Arena and Big Arena with different layouts | ✅ |
| 🔫 **Weapon System** | FP Glock + tracers + procedural audio | ✅ |
| 🤖 **AI Bots** | Lean chase/face/shoot AI with team-safe hits | ✅ |

</div>

---

## 🤖 **Revolutionary AI Combat System** *(Battle-Tested)*

<div align="center">

### 🧠 **Intelligent Warfare**
- **🧠 Advanced BotBrain** - Multi-module AI with decision trees, pathfinding, and tactical awareness
- **⚔️ Dynamic Combat** - Bots patrol, hunt, flank, retreat, and coordinate team attacks
- **🔴🔵 Team Warfare** - Red vs Blue bot armies with sophisticated coordination and team tactics
- **⚡ Realistic Physics** - Identical physics system to players (gravity, collision, movement)
- **🎯 Balanced Difficulty** - Competitive speeds with 4 difficulty levels (Easy to Expert)

### 🎨 **Strategic Team Management**
- **🎮 Team Selection** - Choose your allegiance: Red or Blue forces
- **⚙️ Custom Deployment** - Deploy 0-8 bots per team for asymmetric warfare
- **🎨 Visual Identity** - Player appearance changes based on team selection
- **🎛️ Tactical Controls** - Intuitive +/- deployment system with real-time feedback

</div>

---

## 🎮 **Controls**

<div align="center">

| 🎯 Action | ⌨️ Default | 📝 What It Does |
|-----------|------------|-----------------|
| **Move** | `WASD` | Walk around the arena |
| **Look** | `Mouse` | Aim your weapon |
| **Jump** | `Space` | Leap over obstacles |
| **Shoot** | `Left Click` | Fire your weapon |
| **Reload** | `R` | Reload magazine (also auto on empty) |
| **Pause** | `Escape` | Pause the game |

*All controls are fully customizable in Settings* ⚙️

</div>

---

## 🏗️ **Built Right**

<div align="center">

### 💻 **Technical Highlights**
- **Pure JavaScript** - No frameworks, no build process
- **Three.js Powered** - Hardware-accelerated 3D graphics
- **Modular Design** - Clean, maintainable code structure
- **60fps Target** - Smooth performance on modern hardware

### 🌐 **Browser Support**
- ✅ **Chrome 80+** - Full feature support
- ✅ **Firefox 75+** - Full feature support  
- ✅ **Safari 13+** - Full feature support
- ✅ **Edge 80+** - Full feature support

</div>

---

## 🚀 **Battle Roadmap**

<div align="center">

This is **Phase 1** - a complete single-player warfare experience. **Phase 2** brings the ultimate multiplayer combat:

| 🎯 Feature | 📋 Description | 🎮 Status |
|------------|----------------|-----------|
| 🤖 **Enhanced AI** | Advanced bot behaviors with machine learning | 🔄 Planned |
| 🌐 **Multiplayer** | Real-time online battles with friends | 🔄 Planned |
| 🗺️ **More Maps** | Desert, Urban, and Space arena environments | 🔄 Planned |
| 🔫 **Weapon Arsenal** | Assault rifles, sniper rifles, explosives | 🔄 Planned |
| 🏆 **Ranking System** | Competitive matchmaking and leaderboards | 🔄 Planned |

</div>

---

## 📁 **Project Structure**

```
🎮 Voxel-Arena/
├── 📁 game/               # Main game files
│   ├── 📄 index.html      # Main game file
│   ├── 🎨 style.css       # Retro UI styling  
│   └── 📁 src/            # Game modules
│       ├── core/          # Core engine systems
│       │   ├── 🎯 main.js # Main game engine
│       │   ├── ⚡ physics.js # Collision detection
│       │   ├── ⌨️ input.js # Input handling
│       │   └── ⚙️ settings.js # Game settings
│       ├── player/        # Player systems
│       │   ├── 👤 player.js # Player controller
│       │   ├── 🎭 character.js # Character model
│       │   ├── 🔫 glock.js # Weapon system
│       │   └── 💥 bullet.js # Projectile system
│       ├── world/         # World/arena systems
│       │   ├── 🏟️ arena*.js # Map definitions
│       │   └── 🧱 structures.js # Structure definitions
│       ├── ui/            # User interface systems
│       │   ├── 🖥️ ui.js # Main UI controller
│       │   └── 🗺️ minimap.js # Minimap system
│       └── systems/       # Game systems
│           └── 🤖 bot/    # AI bot system
│               ├── Bot.js # Main bot class
│               ├── BotBrain.js # AI decision making
│               ├── BotMovement.js # Pathfinding & movement
│               └── ...    # 6 more bot modules
├── 📁 assets/             # Game assets
│   ├── 🎵 audio/          # Sound files
│   └── 🖼️ *.png           # Images and icons
├── 📁 docs/               # Documentation
│   ├── 📋 SUMMARY.md      # Project overview
│   ├── 🏗️ ARCHITECTURE.md # Technical docs
│   └── 📝 SCRATCHPAD.md   # Development notes
├── 📁 scripts/            # Launch scripts
│   └── 🚀 launch.bat      # Windows launcher
├── 📁 tools/              # Development tools
└── 📄 README.md           # This file
```

---

## 🛠️ **For Developers**

<div align="center">

### 🚀 **Getting Started**
```bash
# Clone and serve locally
git clone https://github.com/AfyKirby1/Voxel-Arena.git
cd Voxel-Arena
scripts/launch.bat  # Windows
# or
cd game
python -m http.server 8000  # Manual
```

### 🤖 **Testing the Bot System**
Once the game is running:

1. **Click "Single Player"** from the main menu
2. **Select a Map** - Choose between Classic Arena or Big Arena  
3. **Configure Bots** - Set bot count (1-8), difficulty, and team balance
4. **Start the Game** - You'll see:
   - ✅ Bots spawning on the ground (not floating)
   - ✅ Bots patrolling around their spawn areas
   - ✅ Bots engaging enemies when detected
   - ✅ Team-based combat between Red and Blue bots
   - ✅ Bots firing weapons at targets

**Bot Behaviors to Watch For:**
- **Patrol Mode**: Bots walk in circular patterns around spawn points
- **Combat Mode**: When enemies are spotted, bots move towards them and fire
- **Team Fighting**: Red bots fight Blue bots, both teams target the player
- **Physics**: Bots have proper gravity, collision, and ground interaction

</div>

---

## 🆕 **Latest Battle Updates**

<div align="center">

### 🔥 **Version 0.34 - UI Polish & Custom Components**
- **🎯 Custom Cursor System** - Restored advanced cursor functionality for seamless menu navigation
- **🎨 Custom Scrollbar Styling** - Green-themed scrollbars matching the tactical interface
- **✨ Visual Consistency** - Cohesive styling across all menu systems and components

### 🔧 **Version 0.33 - Settings System Overhaul**
- **⚙️ Toggle Switch Fixes** - Corrected ON/OFF state display issues in settings menu
- **🎛️ Visual Feedback** - Proper state highlighting for all toggle controls
- **🔧 Settings Menu** - All controls now function correctly with accurate visual states

### 🔧 **Version 0.32 - Combat System Stabilization**
- **🎮 Button Interaction Fix** - Resolved double-click issues with deployment and map selection
- **🛡️ Enhanced Error Handling** - Comprehensive null checks preventing crashes
- **🔫 Weapon System Fix** - Eliminated gun firing crashes with proper import handling
- **⚡ Improved Stability** - Rock-solid performance with smooth UI interactions

### 🎨 **Version 0.31 - Tactical Interface Redesign**
- **🔴🔵 Team Selection** - Choose your side in the Red vs Blue conflict
- **⚙️ Custom Bot Deployment** - Deploy 0-8 bots per team for asymmetric warfare
- **📐 Expanded Layout** - Redesigned from 800px to 1500px for optimal space usage
- **🎯 Perfect Centering** - Mathematically precise screen centering
- **🎨 Professional Design** - Clean, modern tactical interface
- **🎨 Visual Team Identity** - Dynamic player appearance based on team allegiance
- **🎛️ Enhanced Controls** - Intuitive +/- deployment system with real-time feedback

</div>

---

## 🤝 **Join the Battle**

<div align="center">

### 🛠️ **For Developers**
- **📚 Clear Architecture** - Modular design with 17+ focused components
- **🔧 Easy Extension** - Add new maps, weapons, and AI behaviors
- **🐛 Debug-Friendly** - Comprehensive logging and error handling
- **🎯 Token Optimized** - Split components reduce AI development costs

### 🌟 **Community Features**
- **🎮 Open Source** - MIT licensed, free to modify and distribute
- **📖 Comprehensive Docs** - Complete technical documentation
- **🚀 Active Development** - Regular updates and improvements
- **💬 Discord Community** - Join our development discussions

</div>

---

## 📄 **License**

<div align="center">

**MIT License** - feel free to use, modify, and distribute.

</div>

---

## 🙏 **Acknowledgments**

<div align="center">

- **Three.js** - Amazing 3D graphics library
- **Web Audio API** - Browser-native audio processing
- **Open Web** - Built with standard web technologies

</div>

---

<div align="center">

## 🎯 **Ready for Battle?**

### 🚀 **Deploy Now**
```bash
# Quick deployment
git clone https://github.com/AfyKirby1/Voxel-Arena.git
cd Voxel-Arena
launch.bat  # Windows
```

### 🎮 **Jump Into Combat**
- **Single Player**: Battle against intelligent AI opponents
- **Team Selection**: Choose Red or Blue forces
- **Custom Deployment**: Deploy 0-16 bots for epic battles
- **Tactical Combat**: Use cover, flanking, and team coordination

*Optimized for Windows 11 systems with cross-platform browser support*

### 🌟 **Show Your Support**
**⭐ Star this repo** if you enjoy the intense combat!  
**🍴 Fork and contribute** to help expand the battlefield!

</div>

---

## 🎨 **Concept Art**

<div align="center">

### 🎮 **Epic Battle Scene**

![Voxel Arena Epic Battle Concept](assets/Gemini_Generated_Image_207tv0207tv0207t.png)

*Generated concept art showcasing the intense Red vs Blue team warfare in our voxel-based arena environments*

**Features depicted:**
- 🔴🔵 **Team-based combat** with Red and Blue forces
- ⚔️ **Advanced AI opponents** engaging in tactical warfare
- 🏛️ **Ancient arena architecture** with strategic cover
- 💥 **Dynamic combat effects** with laser fire and explosions
- 🎯 **Tactical positioning** and team coordination

</div>