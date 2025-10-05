
import { initInput, getInputState, clearEscapeInput, clearFireInput, setCursorActive, refreshKeybinds } from './input.js';
import { createArena } from './arena.js';
import { Player } from './player.js';
import { Glock } from './glock.js';
import { Bullet } from './bullet.js';
import { getSetting, applyPerformanceProfile } from './settings.js';
import { initUI, UIManager, updateCustomCursorPosition } from './ui.js';
import { initAvatarEditor } from './avatar.js';
import { BotManager } from './bot/BotManager.js';
import { Minimap } from './minimap.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
        this.clock = new THREE.Clock();

        this.gameState = 'menu'; // menu, playing, paused
        this.player = null;
        this.gun = null;
        this.bullets = [];
        this.minimap = null;
        this.animationFrameId = null; // New property to store animation frame ID
        this.arenaMeshes = []; // New property to store arena meshes
        this.botManager = null; // Bot management system

        // Performance monitoring (simplified)
        this.lastFrameTime = 0;

        // Audio for main menu
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.menuMusicSource = null;
        this.menuMusicGain = this.audioContext.createGain();
        this.menuMusicGain.connect(this.audioContext.destination);
        this.loadMenuMusic();

        this.init();
        
        // Force canvas resize after a short delay to handle any timing issues
        setTimeout(() => {
            this.onWindowResize();
        }, 100);
    }

    async loadMenuMusic() {
        console.log('loadMenuMusic: Attempting to load audio/main.wav');
        try {
            const response = await fetch('audio/main.wav');
            const arrayBuffer = await response.arrayBuffer();
            this.menuMusicBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            console.log('loadMenuMusic: Music loaded successfully.', this.menuMusicBuffer);
            if (this.gameState === 'menu') {
                this.playMenuMusic(); // Play music once loaded if still in menu
            }
        } catch (error) {
            console.error('loadMenuMusic: Error loading menu music:', error);
        }
    }

    playMenuMusic() {
        if (this.menuMusicBuffer && !this.menuMusicSource) {
            this.menuMusicSource = this.audioContext.createBufferSource();
            this.menuMusicSource.buffer = this.menuMusicBuffer;
            this.menuMusicSource.loop = true;
            this.menuMusicSource.connect(this.menuMusicGain);

            const targetVolume = getSetting('audio', 'musicVolume');
            const fadeDuration = 1; // seconds
            const startTime = this.audioContext.currentTime;

            this.menuMusicGain.gain.setValueAtTime(targetVolume / 4, startTime); // Start at quarter volume
            this.menuMusicGain.gain.linearRampToValueAtTime(targetVolume, startTime + fadeDuration); // Ramp up to full volume

            this.menuMusicSource.start(0);
            // this.updateMenuMusicVolume(); // Volume is now handled by ramp
        }
    }

    stopMenuMusic() {
        console.log('stopMenuMusic: Called. menuMusicSource:', this.menuMusicSource);
        if (this.menuMusicSource) {
            this.menuMusicSource.stop();
            this.menuMusicSource.disconnect();
            this.menuMusicSource = null;
            console.log('stopMenuMusic: Music stopped.');
        }
    }

    updateMenuMusicVolume() {
        // console.log('updateMenuMusicVolume: Called. menuMusicGain:', this.menuMusicGain, 'musicVolume:', getSetting('audio', 'musicVolume'));
        if (this.menuMusicGain) {
            this.menuMusicGain.gain.value = getSetting('audio', 'musicVolume');
        }
    }

    init() {
        // Force canvas to fill viewport immediately
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;

        this.scene.background = new THREE.Color(0x87ceeb);
        this.updateFogSettings();
        this.updateUIScaling();
        this.updateCanvasResolution();

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        initUI({
            onStartSinglePlayerGame: () => UIManager.showMapSelectionMenu(), // Changed
            onStartMap: (mapId, mapSettings) => this.startGame(mapId, mapSettings), // New
            onResumeGame: () => this.resumeGame(),
            onQuitToMainMenu: () => this.quitToMainMenu(),
            onRefreshKeybinds: () => refreshKeybinds(), // New
        });
        
        // Initialize bot manager
        this.botManager = new BotManager(this);
        initInput(updateCustomCursorPosition); // Moved after initUI
        setCursorActive(true); // Activate cursor on menu screen
        this.playMenuMusic(); // Play music on menu screen

        // Resume AudioContext on first user gesture
        const resumeAudioContext = () => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            document.removeEventListener('click', resumeAudioContext);
            document.removeEventListener('keydown', resumeAudioContext);
            document.removeEventListener('mousedown', resumeAudioContext);
        };
        document.addEventListener('click', resumeAudioContext);
        document.addEventListener('keydown', resumeAudioContext);
        document.addEventListener('mousedown', resumeAudioContext);

        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('pointerlockchange', () => this.onPointerlockChange(), false);

        this.canvas.addEventListener('click', () => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            if (this.gameState === 'playing' && !document.pointerLockElement) {
                this.canvas.requestPointerLock().catch(err => {
                    console.error('Pointer lock request failed on click:', err);
                });
            }
        });

        this.animate();
    }

    startGame(mapId, mapSettings = {}) { // Modified to accept mapId and settings
        this.gameState = 'playing';
        UIManager.showHUD();
        this.stopMenuMusic(); // Stop music when game starts
        this.canvas.requestPointerLock().catch(err => {
            console.error('Pointer lock request failed:', err);
        });
        setCursorActive(false);

        if (!this.player) {
            const arena = createArena(this.scene, mapId);
            this.arenaMeshes = arena.meshes;
            this.arenaData = arena; // Store arena data for spawn points
            
            // Get spawn point (random if enabled)
            const spawnPoint = this.getRandomSpawnPoint(arena, mapSettings.randomSpawn);
            this.player = new Player(this.camera, this.scene, arena.structures, spawnPoint);
            this.gun = new Glock(this.camera, this);
            this.minimap = new Minimap();
            console.log('Minimap created for game start');
            
            // Initialize bot manager with arena and settings
            this.botManager.initialize(mapSettings);
            // Activate bots after initialization
            this.botManager.handleGameStart();
        }
    }
    
    getRandomSpawnPoint(arena, useRandom = true) {
        if (!useRandom || !arena.spawnPoints || arena.spawnPoints.length === 0) {
            return arena.spawnPoint;
        }
        
        const randomIndex = Math.floor(Math.random() * arena.spawnPoints.length);
        return arena.spawnPoints[randomIndex];
    }
    
    updateFogSettings() {
        const fogEnabled = getSetting('video', 'fogEnabled');
        const fogDensity = getSetting('video', 'fogDensity');
        const fogColor = getSetting('video', 'fogColor');
        const renderDistance = getSetting('video', 'renderDistance');
        
        if (fogEnabled) {
            const color = new THREE.Color(fogColor);
            const near = 0;
            const far = renderDistance * fogDensity;
            this.scene.fog = new THREE.Fog(color, near, far);
        } else {
            this.scene.fog = null;
        }
    }

    updateUIScaling() {
        // Simplified scaling - just apply the setting directly
        const uiScale = getSetting('video', 'uiScale') || 1.0;
        document.documentElement.style.setProperty('--ui-scale', uiScale);
    }

    updateCanvasResolution() {
        const resolution = getSetting('video', 'resolution');
        
        if (resolution && resolution !== 'auto') {
            const [width, height] = resolution.split('x').map(Number);
            this.canvas.width = width;
            this.canvas.height = height;
            this.renderer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        } else {
            // Auto resolution based on window size
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.canvas.width = width;
            this.canvas.height = height;
            this.renderer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }

    monitorPerformance(deltaTime) {
        // Simplified performance monitoring
        return 1000 / deltaTime;
    }

    pauseGame() {
        if (this.gameState !== 'playing') return;
        this.gameState = 'paused';
        UIManager.showPauseMenu();
        setCursorActive(true);
    }

    resumeGame() {
        if (this.gameState !== 'paused') return;
        this.gameState = 'playing';
        UIManager.showHUD();
        this.canvas.requestPointerLock().catch(err => {
            console.error('Pointer lock request failed on resume:', err);
        });
        setCursorActive(false);
    }

    quitToMainMenu() {
        this.gameState = 'menu';
        UIManager.showStartMenu();
        document.exitPointerLock();
        setCursorActive(true);
        this.playMenuMusic(); // Play music when returning to main menu

        // Stop the animation loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Clean up game objects
        if (this.player) {
            this.scene.remove(this.player.mesh);
            this.player = null;
        }
        if (this.gun) {
            this.scene.remove(this.gun.mesh);
            this.gun = null;
        }
        if (this.minimap) {
            this.minimap.destroy();
            this.minimap = null;
        }
        this.bullets.forEach(bullet => this.scene.remove(bullet.mesh));
        this.bullets = [];

        // Remove arena meshes
        this.arenaMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
        });
        this.arenaMeshes = [];
        
        // Clear bot manager
        if (this.botManager) {
            this.botManager.clearAllBots();
        }

        // Clear scene background
        this.scene.background = null;
        // Re-start the animation loop for the menu screen (if it was stopped)
        if (!this.animationFrameId) {
            this.animate();
        }
    }

    addBullet(position, direction) {
        const bullet = new Bullet(this.scene, position, direction);
        this.bullets.push(bullet);
    }
    
    // Bot management methods
    addBot(bot) {
        if (this.botManager) {
            this.botManager.addBot(bot);
        }
    }
    
    removeBot(botId) {
        if (this.botManager) {
            this.botManager.removeBot(botId);
        }
    }
    
    getBots() {
        return this.botManager ? this.botManager.getAllBots() : [];
    }
    
    getBotsByTeam(team) {
        return this.botManager ? this.botManager.getBotsByTeam(team) : [];
    }
    
    getSpawnPoints() {
        return this.botManager ? this.botManager.spawnPoints : [];
    }

    onPointerlockChange() {
        if (document.pointerLockElement !== this.canvas && this.gameState === 'playing') {
            this.pauseGame();
        }
    }

    onWindowResize() {
        // Force canvas sizing
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update UI scaling after resize
        this.updateUIScaling();
    }

    update() {
        const deltaTime = this.clock.getDelta();
        const time = this.clock.getElapsedTime();
        const input = getInputState();

        // Monitor performance and update UI scaling
        const avgFPS = this.monitorPerformance(deltaTime);
        this.updateUIScaling();
        
        // Update canvas resolution periodically (not every frame)
        if (Math.floor(time * 10) % 60 === 0) { // Update every 6 seconds
            this.updateCanvasResolution();
        }

        if (input.escape) {
            if (this.gameState === 'paused') {
                this.resumeGame();
            } else if (this.gameState === 'playing') {
                this.pauseGame();
            }
            clearEscapeInput();
        }

        if (this.gameState === 'playing') {
            this.player.update(deltaTime);
            this.gun.update(time);

            // Player firing logic
            if (input.fire && time - this.gun.lastFireTime > this.gun.fireRate) {
                this.gun.fire();
                this.gun.lastFireTime = time;
                clearFireInput();
            }
        }
        
        // Update minimap when it exists and we have a player
        if (this.minimap && this.player) {
            const structures = this.arenaData?.structures || [];
            const bots = this.botManager?.getAllBots() || [];
            this.minimap.update(this.player, structures, bots);
        }

        if (this.gameState === 'playing') {
            // Update and clean up bullets
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                bullet.update(deltaTime);
                if (bullet.lifetime <= 0) {
                    this.scene.remove(bullet.mesh);
                    this.bullets.splice(i, 1);
                }
            }
            
            // Update bot manager
            if (this.botManager) {
                this.botManager.update(deltaTime);
            }
        }
        
        this.updateMenuMusicVolume(); // Update music volume in the loop
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the game
const game = new Game();
window.game = game; // Make game globally accessible for settings updates

// Ensure proper initialization after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    game.onWindowResize();
});

// Also handle window load event
window.addEventListener('load', () => {
    game.onWindowResize();
});
