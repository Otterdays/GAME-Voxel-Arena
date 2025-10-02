
import { initInput, getInputState, clearEscapeInput, setCursorActive, refreshKeybinds } from './input.js';
import { createArena } from './arena.js';
import { Player } from './player.js';
import { Gun } from './gun.js';
import { Bullet } from './bullet.js';
import { getSetting } from './settings.js';

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
        this.animationFrameId = null; // New property to store animation frame ID
        this.arenaMeshes = []; // New property to store arena meshes

        // Audio for main menu
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.menuMusicSource = null;
        this.menuMusicGain = this.audioContext.createGain();
        this.menuMusicGain.connect(this.audioContext.destination);
        this.loadMenuMusic();

        this.init();
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
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;

        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 0, 75);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        initInput();
        initUI({
            onStartSinglePlayerGame: () => UIManager.showMapSelectionMenu(), // Changed
            onStartMap: (mapId) => this.startGame(mapId), // New
            onResumeGame: () => this.resumeGame(),
            onQuitToMainMenu: () => this.quitToMainMenu(),
            onRefreshKeybinds: () => refreshKeybinds(), // New
        });
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

    startGame(mapId) { // Modified to accept mapId
        this.gameState = 'playing';
        UIManager.showHUD();
        this.stopMenuMusic(); // Stop music when game starts
        this.canvas.requestPointerLock().catch(err => {
            console.error('Pointer lock request failed:', err);
        });
        setCursorActive(false);

        if (!this.player) {
            this.arenaMeshes = createArena(this.scene, mapId);
            this.player = new Player(this.camera, this.scene);
            this.gun = new Gun(this.camera, this);
        }
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
        this.bullets.forEach(bullet => this.scene.remove(bullet.mesh));
        this.bullets = [];

        // Remove arena meshes
        this.arenaMeshes.forEach(mesh => this.scene.remove(mesh));
        this.arenaMeshes = [];

        // Re-start the animation loop for the menu screen (if it was stopped)
        if (!this.animationFrameId) {
            this.animate();
        }
    }

    addBullet(position, direction) {
        const bullet = new Bullet(this.scene, position, direction);
        this.bullets.push(bullet);
    }

    onPointerlockChange() {
        if (document.pointerLockElement !== this.canvas && this.gameState === 'playing') {
            this.pauseGame();
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update() {
        const deltaTime = this.clock.getDelta();
        const time = this.clock.getElapsedTime();
        const input = getInputState();

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

            // Update and clean up bullets
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                bullet.update(deltaTime);
                if (bullet.lifetime <= 0) {
                    this.scene.remove(bullet.mesh);
                    this.bullets.splice(i, 1);
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

new Game();
