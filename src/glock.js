import { getInputState, clearFireInput } from './input.js';
import { getSetting } from './settings.js';

export class Glock {
    constructor(camera, game) {
        this.camera = camera;
        this.game = game;
        this.lastFireTime = 0;
        this.fireRate = 0.15; // seconds

        // Gun Model
        const gunGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
        const gunMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        this.mesh = new THREE.Mesh(gunGeometry, gunMaterial);
        this.mesh.position.set(0.2, -0.2, -0.4);

        // Bullet Spawn Point
        this.bulletSpawnPoint = new THREE.Object3D();
        this.bulletSpawnPoint.position.set(0, 0, -0.25); // Tip of the barrel
        this.mesh.add(this.bulletSpawnPoint);

        this.camera.add(this.mesh);

        // Audio setup
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
    }

    update(time) {
        const input = getInputState();
        if (input.fire && time - this.lastFireTime > this.fireRate) {
            this.fire();
            this.lastFireTime = time;
            clearFireInput();
        }
        this.gainNode.gain.value = getSetting('audio', 'volume');
    }

    fire() {
        // Create and register a bullet
        const bulletPosition = this.bulletSpawnPoint.getWorldPosition(new THREE.Vector3());
        const bulletDirection = this.camera.getWorldDirection(new THREE.Vector3());
        this.game.addBullet(bulletPosition, bulletDirection);

        // Snappier procedural "bang" sound
        const time = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, time);
        oscillator.frequency.exponentialRampToValueAtTime(80, time + 0.05);

        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(1, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        const noise = this.audioContext.createBufferSource();
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.05, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        
        noise.connect(noiseGain);
        noiseGain.connect(this.gainNode);
        oscillator.connect(this.gainNode);

        oscillator.start(time);
        oscillator.stop(time + 0.05);
        noise.start(time);
        noise.stop(time + 0.05);
    }
}