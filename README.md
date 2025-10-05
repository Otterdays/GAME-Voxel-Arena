# 🎮 Voxel Arena
<div align="center">

![Voxel Arena Screenshot](main.png)

**A smooth, browser-based 3D shooter that just works.**

[![Version](https://img.shields.io/badge/version-0.32-brightgreen.svg)](https://github.com/AfyKirby1/Voxel-Arena)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/language-JavaScript-yellow.svg)](https://javascript.info/)
[![Three.js](https://img.shields.io/badge/engine-Three.js-orange.svg)](https://threejs.org/)

</div>

---

## ✨ **Jump into fast-paced arena combat without downloads, installations, or complex setup.**

Built with vanilla JavaScript and Three.js, Voxel Arena delivers **60fps gameplay** directly in your browser. No build tools, no dependencies, no hassle.

<div align="center">

### 🚀 **Quick Start**

```bash
# Clone and play
git clone https://github.com/AfyKirby1/Voxel-Arena.git
cd Voxel-Arena

# Launch (Windows)
launch.bat

# Or manually
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
| ⚔️ **Tactical Combat** | Jump, strafe, and shoot in arena environments | ✅ |
| 🗺️ **Two Unique Maps** | Classic Arena and Big Arena with different layouts | ✅ |
| 🔫 **Weapon System** | Realistic gun mechanics with procedural audio | ✅ |
| 🤖 **AI Bots** | Intelligent computer opponents with physics and combat | ✅ |

</div>

---

## 🤖 **Advanced AI Bot System** *(Fully Functional)*

<div align="center">

### 🧠 **Smart Opponents**
- **Multi-Module AI** - BotBrain with decision trees and pathfinding
- **Tactical Combat** - Bots patrol, hunt, flank, retreat, and engage
- **Team Combat** - Red vs Blue bot teams with proper coordination
- **Realistic Physics** - Same physics system as player (gravity, collision, movement)
- **Competitive Speeds** - Balanced speeds (5.0 units/second for medium difficulty)

### 🎨 **Team Management**
- **Team Selection** - Choose Red or Blue team before starting
- **Custom Bot Distribution** - Set different bot counts per team (0-8 each)
- **Visual Team ID** - Player color changes based on selected team
- **Enhanced Controls** - Intuitive +/- buttons for bot management

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

## 🚀 **What's Next**

<div align="center">

This is **Phase 1** - a solid single-player foundation. Coming in **Phase 2**:

| 🎯 Feature | 📋 Description |
|------------|----------------|
| 🤖 **Enhanced AI** | More sophisticated bot behaviors |
| 🌐 **Multiplayer** | Online battles with friends |
| 🗺️ **More Maps** | Additional arena environments |
| 🔫 **Weapon Variety** | Different guns and mechanics |

</div>

---

## 📁 **Project Structure**

```
🎮 Voxel-Arena/
├── 📄 index.html          # Main game file
├── 🎨 style.css           # Retro UI styling  
├── 🚀 launch.bat          # Windows launcher
├── 📁 src/                # Game modules
│   ├── 🎯 main.js         # Core engine
│   ├── 👤 player.js       # Player controls
│   ├── 🔫 glock.js        # Weapon system
│   ├── 🤖 bot/            # AI bot system
│   │   ├── Bot.js         # Main bot class
│   │   ├── BotBrain.js    # AI decision making
│   │   ├── BotMovement.js # Pathfinding & movement
│   │   └── ...            # 6 more bot modules
│   ├── 🏟️ arena*.js       # Map definitions
│   └── 🖥️ ui.js           # Interface
└── 📚 documents/          # Documentation
```

---

## 🛠️ **For Developers**

<div align="center">

### 🚀 **Getting Started**
```bash
# Clone and serve locally
git clone https://github.com/AfyKirby1/Voxel-Arena.git
cd Voxel-Arena
launch.bat  # Windows
# or
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

## 🆕 **Recent Updates**

<div align="center">

### 🔥 **Version 0.32 - UI & Weapon System Fixes**
- **Button Interaction Fix** - Resolved double-click issues with bot count and Start Map buttons
- **Enhanced Error Handling** - Added comprehensive null checks for UI elements
- **Weapon System Fix** - Fixed missing import causing gun firing crashes
- **Improved Stability** - Eliminated crashes and improved overall game reliability
- **Better User Experience** - Smooth, predictable UI interactions

### 🎨 **Version 0.31 - Team Selection & UI Redesign**
- **Team Selection** - Choose Red or Blue team before starting
- **Custom Bot Distribution** - Set different bot counts per team (0-8 each)
- **Wider Layout** - Redesigned UI from 800px to 1500px for better space usage
- **Perfect Centering** - Menu now perfectly centered on screen
- **Professional Design** - Clean, modern interface with improved spacing
- **Visual Team ID** - Player color changes based on selected team
- **Enhanced Controls** - Intuitive +/- buttons for bot management

</div>

---

## 🤝 **Contributing**

<div align="center">

We welcome contributions! The codebase is designed to be:
- **Easy to understand** - Clear module structure
- **Easy to extend** - Add new maps, weapons, features
- **Easy to debug** - Comprehensive logging and error handling

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

## 🎯 **Ready to play?**

Just open `index.html` in your browser and start shooting!

*Currently optimized for Windows 11 systems*

**⭐ Star this repo if you enjoy it!**

</div>