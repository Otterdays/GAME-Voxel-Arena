
import {
    initInput,
    getInputState,
    clearEscapeInput,
    clearFireInput,
    clearReloadInput,
    setCursorActive,
    refreshKeybinds,
    onPointerLockChanged,
    resetGameplayInput,
} from './input.js';
import { createArena } from '../world/arena.js';
import { Player } from '../player/player.js';
import { Glock } from '../player/glock.js';
import { Bullet } from '../player/bullet.js';
import { getSetting, applyPerformanceProfile } from './settings.js';
import { initUI, UIManager, updateCustomCursorPosition } from '../ui/ui.js';
import { initAvatarEditor } from '../player/avatar.js';
import { BotManager } from '../systems/bot/BotManager.js';
import { Minimap } from '../ui/minimap.js';

const HIT_RADIUS = 0.95;
const GUN_DAMAGE = 20;

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 1000);
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
        this.isHandlingEscape = false; // Flag to prevent pointer lock conflicts

        // Performance monitoring (simplified)
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.mapId = null;

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

        // Lazy load non-critical systems
        this.lazyLoadSystems();
    }

    async lazyLoadSystems() {
        // Load bot system only when needed
        if (this.gameState === 'menu') {
            // Preload bot system in background
            setTimeout(() => {
                this.preloadBotSystem();
            }, 1000);
        }
    }

    async preloadBotSystem() {
        try {
            // Preload bot modules
            const botModules = [
                '../systems/bot/Bot.js',
                '../systems/bot/BotBrain.js',
                '../systems/bot/BotSenses.js',
                '../systems/bot/BotMemory.js',
                '../systems/bot/BotPersonality.js',
                '../systems/bot/BotCombat.js',
                '../systems/bot/BotMovement.js',
                '../systems/bot/BotCommunication.js',
                '../systems/bot/BotManager.js'
            ];

            // Preload modules without executing them
            for (const module of botModules) {
                await import(module);
            }

            console.log('Bot system preloaded successfully');
        } catch (error) {
            console.log('Bot system preload failed:', error);
        }
    }

    async loadMenuMusic() {
        console.log('loadMenuMusic: Attempting to load assets/audio/main.wav');

        // Check if audio is already cached globally
        if (window.audioCache && window.audioCache.has('main.wav')) {
            console.log('loadMenuMusic: Using cached audio');
            this.menuMusicBuffer = window.audioCache.get('main.wav');
            if (this.gameState === 'menu') {
                this.playMenuMusic();
            }
            return;
        }

        try {
            const response = await fetch('../assets/audio/main.wav');
            const arrayBuffer = await response.arrayBuffer();
            this.menuMusicBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            // Cache the audio buffer globally
            if (!window.audioCache) {
                window.audioCache = new Map();
            }
            window.audioCache.set('main.wav', this.menuMusicBuffer);

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

    async startGame(mapId, mapSettings = {}) { // Modified to accept mapId and settings
        // Show loading screen first
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('active');
        }

        this.gameState = 'loading';
        this.mapId = mapId;
        this.stopMenuMusic(); // Stop music when game starts
        setCursorActive(true); // Keep cursor active during loading

        if (!this.player) {
            const arena = createArena(this.scene, mapId);
            this.arenaMeshes = arena.meshes;
            this.arenaData = arena; // Store arena data for spawn points

            // Wait for textures to load
            if (arena.loadingPromise) {
                const loadingText = document.getElementById('loading-text');
                if (loadingText) {
                    loadingText.textContent = 'Loading Textures...';
                }

                try {
                    await arena.loadingPromise;
                    console.log('All textures loaded successfully');
                } catch (error) {
                    console.error('Error loading textures:', error);
                }
            }

            // Get spawn point (random if enabled)
            const spawnPoint = this.getRandomSpawnPoint(arena, mapSettings.randomSpawn);
            this.player = new Player(this.camera, this.scene, arena.structures, spawnPoint);
            this.gun = new Glock(this.camera, this, this.player);
            this.minimap = new Minimap();
            console.log('Minimap created for game start');

            // Initialize bot manager with arena and settings
            this.botManager.initialize(mapSettings);
            // Activate bots after initialization
            this.botManager.handleGameStart();
        }

        // Hide loading screen and show HUD
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
        }

        this.gameState = 'playing';
        UIManager.showHUD();
        this.canvas.requestPointerLock().catch(err => {
            console.error('Pointer lock request failed:', err);
        });
        setCursorActive(false);
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
        resetGameplayInput();
        UIManager.showPauseMenu();
        // Exit pointer lock when pausing
        if (document.pointerLockElement === this.canvas) {
            document.exitPointerLock();
        }
        setCursorActive(true);
    }

    resumeGame() {
        if (this.gameState !== 'paused') return;
        this.gameState = 'playing';
        UIManager.showHUD();

        // Only request pointer lock if we don't already have it
        if (document.pointerLockElement !== this.canvas) {
            this.canvas.requestPointerLock().catch(err => {
                console.error('Pointer lock request failed on resume:', err);
                // Continue without pointer lock if it fails
            });
        }
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

        // Restore original blue background for main menu
        this.scene.background = new THREE.Color(0x87ceeb);
        this.updateFogSettings(); // Also update fog settings
        // Re-start the animation loop for the menu screen (if it was stopped)
        if (!this.animationFrameId) {
            this.animate();
        }
    }

    addBullet(position, direction, owner = null) {
        const bullet = new Bullet(this.scene, position, direction, owner);
        this.bullets.push(bullet);
    }

    /**
     * Body-center hit test (bots/player pivot near feet)
     */
    getBodyCenter(entity) {
        const pos = entity.position || entity.mesh?.position;
        if (!pos) return null;
        return new THREE.Vector3(pos.x, pos.y + 1.0, pos.z);
    }

    /**
     * Closest distance from point to segment (prev→curr) — reduces fast-bullet tunneling
     */
    distPointToSegment(point, a, b) {
        const ab = new THREE.Vector3().subVectors(b, a);
        const ap = new THREE.Vector3().subVectors(point, a);
        const abLenSq = ab.lengthSq();
        if (abLenSq < 1e-8) return point.distanceTo(a);
        let t = ap.dot(ab) / abLenSq;
        t = Math.max(0, Math.min(1, t));
        const closest = a.clone().addScaledVector(ab, t);
        return point.distanceTo(closest);
    }

    isFriendly(owner, target) {
        if (!owner || !target) return false;
        if (owner === target) return true;
        const a = owner.team;
        const b = target.team;
        return !!(a && b && a === b);
    }

    showHitMarker(wasKill = false) {
        if (getSetting('gameplay', 'hitMarkers') === false) return;
        const el = document.getElementById('hitmarker');
        if (!el) return;
        el.classList.toggle('kill', wasKill);
        el.classList.add('active');
        clearTimeout(this._hitMarkerTimer);
        this._hitMarkerTimer = setTimeout(() => {
            el.classList.remove('active', 'kill');
        }, wasKill ? 220 : 90);
    }

    updateCombatHUD() {
        if (!this.player || this.gameState !== 'playing') return;

        const hpPct = Math.max(0, Math.min(100, Math.round((this.player.health || 0) * 100)));
        const fill = document.getElementById('health-fill');
        const hpText = document.getElementById('health-text');
        if (fill) {
            fill.style.width = `${hpPct}%`;
            fill.style.background = hpPct > 40
                ? 'linear-gradient(90deg, #008800, #00ff00)'
                : 'linear-gradient(90deg, #880000, #ff3333)';
        }
        if (hpText) hpText.textContent = String(hpPct);

        const ammoText = document.getElementById('ammo-text');
        const ammoLabel = document.querySelector('#hud-ammo .hud-label');
        if (ammoText && this.gun) {
            ammoText.textContent = this.gun.isReloading ? '...' : String(this.gun.ammo);
            ammoText.classList.toggle('low', !this.gun.isReloading && this.gun.ammo > 0 && this.gun.ammo <= 8);
            ammoText.classList.toggle('empty', !this.gun.isReloading && this.gun.ammo <= 0);
            if (ammoLabel) ammoLabel.textContent = `/ ${this.gun.maxAmmo}`;
        }

        const kills = document.getElementById('hud-kills');
        if (kills) kills.textContent = `Kills: ${this.player.kills || 0}`;

        const vignette = document.getElementById('damage-vignette');
        if (vignette) {
            vignette.style.opacity = String(Math.min(1, this.player.damageFlash || 0));
        }
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
        const locked = document.pointerLockElement === this.canvas;
        onPointerLockChanged(locked);
        // Don't auto-pause if we're handling escape key input
        if (!locked && this.gameState === 'playing' && !this.isHandlingEscape) {
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
        this.frameCount = (this.frameCount || 0) + 1;

        // Monitor performance and update UI scaling
        const avgFPS = this.monitorPerformance(deltaTime);
        this.updateUIScaling();

        // Update canvas resolution periodically (not every frame)
        if (Math.floor(time * 10) % 60 === 0) { // Update every 6 seconds
            this.updateCanvasResolution();
        }

        if (input.escape) {
            this.isHandlingEscape = true;
            if (this.gameState === 'paused') {
                this.resumeGame();
            } else if (this.gameState === 'playing') {
                this.pauseGame();
            }
            clearEscapeInput();
            // Reset flag after a short delay
            setTimeout(() => {
                this.isHandlingEscape = false;
            }, 100);
        }

        if (this.gameState === 'playing') {
            this.player.update(deltaTime);
            this.gun.update(deltaTime);

            // Player firing — Glock.fire() enforces fire rate
            if (this.player.isAlive && input.fire) {
                this.gun.fire();
                clearFireInput();
            }

            // Reload (R) + auto-reload when empty
            if (this.player.isAlive) {
                if (input.reload) {
                    this.gun.reload();
                    clearReloadInput();
                } else if (getSetting('gameplay', 'autoReload') !== false && this.gun.needsReload()) {
                    this.gun.reload();
                }
            }

            this.updateCombatHUD();
        }

        // Update minimap when it exists and we have a player
        if (this.minimap && this.player) {
            const structures = this.arenaData?.structures || [];
            const bots = this.botManager?.getAllBots() || [];
            this.minimap.update(this.player, structures, bots);
        }

        if (this.gameState === 'playing') {
            // Update and clean up bullets
            const bots = this.botManager ? this.botManager.getAllBots() : [];
            const structures = this.arenaData ? this.arenaData.structures : [];

            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                bullet.update(deltaTime);

                let hit = false;
                const owner = bullet.owner;

                // Check collision with bots (body center, team-aware)
                for (const bot of bots) {
                    if (!bot.isAlive) continue;
                    if (this.isFriendly(owner, bot)) continue;

                    const center = this.getBodyCenter(bot);
                    if (!center) continue;

                    const from = bullet.prevPosition || bullet.mesh.position;
                    const to = bullet.mesh.position;
                    if (this.distPointToSegment(center, from, to) < HIT_RADIUS) {
                        const wasAlive = bot.isAlive;
                        bot.takeDamage(GUN_DAMAGE, owner);

                        // Player kill feedback
                        if (owner && (owner === this.player || owner.isPlayer)) {
                            const killed = wasAlive && !bot.isAlive;
                            if (killed) this.player.kills = (this.player.kills || 0) + 1;
                            this.showHitMarker(killed);
                        }
                        hit = true;
                        break;
                    }
                }

                // Enemy bullets can hit the player
                if (!hit && this.player && this.player.isAlive) {
                    if (owner && !this.isFriendly(owner, this.player)) {
                        const center = this.getBodyCenter(this.player);
                        const from = bullet.prevPosition || bullet.mesh.position;
                        const to = bullet.mesh.position;
                        if (center && this.distPointToSegment(center, from, to) < HIT_RADIUS) {
                            this.player.takeDamage(GUN_DAMAGE, owner);
                            hit = true;
                        }
                    }
                }

                // Check collision with structures
                if (!hit) {
                    for (const structure of structures) {
                        const halfSizeX = structure.size.x / 2;
                        const halfSizeY = structure.size.y / 2;
                        const halfSizeZ = structure.size.z / 2;

                        if (Math.abs(bullet.mesh.position.x - structure.position.x) < halfSizeX &&
                            Math.abs(bullet.mesh.position.y - structure.position.y) < halfSizeY &&
                            Math.abs(bullet.mesh.position.z - structure.position.z) < halfSizeZ) {
                            hit = true;
                            break;
                        }
                    }
                }

                if (hit || bullet.lifetime <= 0) {
                    this.scene.remove(bullet.mesh);
                    this.bullets.splice(i, 1);
                }
            }

            // Update bot manager
            if (this.botManager) {
                this.botManager.update(deltaTime);

                if (window.DEBUG_BOT_MOVEMENT && this.frameCount % 120 === 0) {
                    const botCount = this.botManager.getAllBots().length;
                    const redBots = this.botManager.getBotsByTeam('red').length;
                    const blueBots = this.botManager.getBotsByTeam('blue').length;
                    console.log(`[DEBUG] Active bots: ${botCount} (Red: ${redBots}, Blue: ${blueBots})`);
                }
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
