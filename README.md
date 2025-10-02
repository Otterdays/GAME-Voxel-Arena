# 🎮 ArenaFPS

A modern browser-based 3D first-person shooter built with Three.js. Experience fast-paced arena combat in a retro-futuristic environment with smooth 60fps gameplay.

![ArenaFPS](main.png)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/AfyKirby1/Voxel-Arena.git
   cd Voxel-Arena
   ```

2. **Open in browser**
   - Simply open `index.html` in any modern web browser
   - Or serve locally: `python -m http.server 8000` then visit `http://localhost:8000`

3. **Start playing!**
   - Click "Single Player" → Select a map → Start shooting!

### ⚠️ Troubleshooting
If you see JavaScript errors or a black background:
- **Hard refresh**: Press `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
- **Clear cache**: Right-click refresh button → "Empty Cache and Hard Reload"
- **Incognito mode**: Try opening in a private/incognito window

## 🎯 Features

### Core Gameplay
- **First-Person Controls**: Smooth WASD movement with mouse look
- **Weapon System**: Realistic gun mechanics with procedural sound effects
- **Physics Engine**: Jumping, gravity, and projectile ballistics
- **Multiple Arenas**: Two distinct maps with unique layouts and obstacles

### Technical Highlights
- **60fps Performance**: Optimized Three.js rendering pipeline
- **Custom UI System**: Retro-futuristic green-on-black interface
- **Audio Engine**: Procedural sound generation and background music
- **Settings Persistence**: Customizable keybinds and preferences
- **Responsive Design**: Works on desktop and mobile browsers

### Arena Maps
- **Classic Arena**: 100x100 unit arena with strategic cover points
- **Big Arena**: 120x120 unit arena with elevated platforms and ramps

## 🎮 Controls

| Action | Default Key | Description |
|--------|-------------|-------------|
| Move Forward | `W` | Move forward |
| Move Backward | `S` | Move backward |
| Strafe Left | `A` | Strafe left |
| Strafe Right | `D` | Strafe right |
| Jump | `Space` | Jump |
| Fire | `Left Mouse` | Shoot weapon |
| Look Around | `Mouse` | Camera control |
| Pause | `Escape` | Pause game |

*All controls are fully customizable in the Settings menu*

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **3D Engine**: Three.js r128
- **Audio**: Web Audio API
- **Storage**: localStorage for settings persistence
- **Build**: No build process required - pure vanilla JavaScript

## 📁 Project Structure

```
ArenaFPS/
├── 📄 index.html              # Main entry point
├── 🎨 style.css               # Complete UI styling
├── 🖼️ main.png                # Game icon
├── 🔊 audio/
│   └── main.wav               # Background music
├── 📁 src/
│   ├── 🎮 main.js             # Core game engine
│   ├── 🏟️ arena.js            # Arena dispatcher
│   ├── 🏟️ arena1.js           # Classic arena
│   ├── 🏟️ arena2.js           # Big arena
│   ├── 👤 player.js           # Player character
│   ├── 🔫 gun.js              # Weapon system
│   ├── 💥 bullet.js           # Projectile physics
│   ├── 🖥️ ui.js               # User interface
│   ├── ⌨️ input.js             # Input handling
│   └── ⚙️ settings.js          # Settings management
└── 📚 documents/
    ├── 🏗️ ARCHITECTURE.md     # Technical architecture
    ├── 📋 SBOM.md             # Software dependencies
    └── 📝 SCRATCHPAD.md       # Development notes
```

## 🎨 Customization

### Settings Menu
- **Audio**: Master volume and music volume controls
- **Video**: Walk wobble effect toggle
- **Keybinds**: Fully customizable control scheme

### Adding New Maps
1. Create a new arena file in `src/arena*.js`
2. Export a `createArena*` function
3. Add the map to `arena.js` dispatcher
4. Register in `ui.js` available maps array

## 🚧 Development Roadmap

### Phase 2: AI & Multiplayer
- [ ] AI Bot System: Computer-controlled opponents
- [ ] Multiplayer Networking: Online multiplayer support
- [ ] Additional Maps: More arena environments
- [ ] Weapon Variety: Different weapon types
- [ ] Game Modes: Team deathmatch, capture the flag

### Future Enhancements
- [ ] Particle Effects: Muzzle flash, explosions
- [ ] Sound Design: Environmental audio, footsteps
- [ ] Graphics Improvements: Better textures, lighting
- [ ] Mobile Optimization: Touch controls
- [ ] Performance: WebGL optimizations

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly in multiple browsers
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js Community**: For the amazing 3D graphics library
- **Web Audio API**: For browser-native audio processing
- **Open Source**: Built with open web technologies

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/AfyKirby1/Voxel-Arena/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AfyKirby1/Voxel-Arena/discussions)
- **Email**: motorcycler14@yahoo.com

---

**Made with ❤️ for the web gaming community**

*Currently optimized for Windows 11 systems*
