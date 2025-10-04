# 🎮 ArenaFPS

> **A smooth, browser-based 3D shooter that just works.**

Jump into fast-paced arena combat without downloads, installations, or complex setup. Built with vanilla JavaScript and Three.js, ArenaFPS delivers 60fps gameplay directly in your browser.

![ArenaFPS Screenshot](main.png)

## ⚡ Quick Start

**Just open and play:**
```bash
# Clone the repo
git clone https://github.com/AfyKirby1/Voxel-Arena.git
cd Voxel-Arena

# Open in browser (Windows)
launch.bat

# Or manually
python -m http.server 8000
# Then visit http://localhost:8000
```

**That's it.** No build tools, no dependencies, no hassle.

## 🎯 What You Get

### Core Experience
- **Smooth FPS Controls** - WASD movement with precise mouse look
- **Tactical Combat** - Jump, strafe, and shoot in arena environments  
- **Two Unique Maps** - Classic Arena and Big Arena with different layouts
- **Weapon System** - Realistic gun mechanics with procedural audio

### Polish & Features
- **Retro-Futuristic UI** - Clean green-on-black interface
- **Customizable Settings** - Rebind any key, adjust audio levels
- **Avatar Viewer** - Check out your character model in 3D
- **Responsive Design** - Works on desktop and mobile browsers

## 🎮 Controls

| Action | Default | What It Does |
|--------|---------|--------------|
| **Move** | `WASD` | Walk around the arena |
| **Look** | `Mouse` | Aim your weapon |
| **Jump** | `Space` | Leap over obstacles |
| **Shoot** | `Left Click` | Fire your weapon |
| **Pause** | `Escape` | Pause the game |

*All controls are fully customizable in Settings*

## 🏗️ Built Right

### Technical Highlights
- **Pure JavaScript** - No frameworks, no build process
- **Three.js Powered** - Hardware-accelerated 3D graphics
- **Modular Design** - Clean, maintainable code structure
- **60fps Target** - Smooth performance on modern hardware

### Browser Support
- ✅ **Chrome 80+** - Full feature support
- ✅ **Firefox 75+** - Full feature support  
- ✅ **Safari 13+** - Full feature support
- ✅ **Edge 80+** - Full feature support

## 🚀 What's Next

This is **Phase 1** - a solid single-player foundation. Coming in **Phase 2**:

- 🤖 **AI Bots** - Computer opponents to fight
- 🌐 **Multiplayer** - Online battles with friends
- 🗺️ **More Maps** - Additional arena environments
- 🔫 **Weapon Variety** - Different guns and mechanics

## 📁 Project Structure

```
Voxel-Arena/
├── 🎮 index.html          # Main game file
├── 🎨 style.css           # Retro UI styling  
├── 🚀 launch.bat          # Windows launcher
├── 📁 src/                # Game modules
│   ├── 🎯 main.js         # Core engine
│   ├── 👤 player.js       # Player controls
│   ├── 🔫 glock.js        # Weapon system
│   ├── 🏟️ arena*.js       # Map definitions
│   └── 🖥️ ui.js           # Interface
└── 📚 documents/          # Documentation
```

## 🛠️ For Developers

### Getting Started
```bash
# Clone and serve locally
git clone https://github.com/AfyKirby1/Voxel-Arena.git
cd Voxel-Arena
launch.bat  # Windows
# or
python -m http.server 8000  # Manual
```

### Architecture
- **9 Modular Components** - Clean separation of concerns
- **ES6 Modules** - Modern JavaScript imports
- **Three.js r128** - Latest stable version
- **Web Audio API** - Procedural sound generation

### Contributing
We welcome contributions! The codebase is designed to be:
- **Easy to understand** - Clear module structure
- **Easy to extend** - Add new maps, weapons, features
- **Easy to debug** - Comprehensive logging and error handling

## 📄 License

MIT License - feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- **Three.js** - Amazing 3D graphics library
- **Web Audio API** - Browser-native audio processing
- **Open Web** - Built with standard web technologies

---

**Ready to play?** Just open `index.html` in your browser and start shooting! 🎯

*Currently optimized for Windows 11 systems*