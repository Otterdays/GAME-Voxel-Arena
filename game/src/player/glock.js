import { getSetting } from '../core/settings.js';

export class Glock {
    constructor(parent, game) {
        this.parent = parent; // Can be camera (for player) or mesh (for bot)
        this.game = game;
        this.lastFireTime = 0;
        this.fireRate = 0.15; // seconds
        this.ammo = 30; // Default ammo
        this.maxAmmo = 30;
        this.isReloading = false;

        // Gun Model
        const gunGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
        const gunMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        this.mesh = new THREE.Mesh(gunGeometry, gunMaterial);
        this.mesh.position.set(0.2, -0.2, -0.4);

        // Bullet Spawn Point
        this.bulletSpawnPoint = new THREE.Object3D();
        this.bulletSpawnPoint.position.set(0, 0, -0.25); // Tip of the barrel
        this.mesh.add(this.bulletSpawnPoint);

        this.parent.add(this.mesh); // Attach gun to parent (camera or bot mesh)

        // Audio setup
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
    }

    update(deltaTime) {
        // Update weapon state (e.g., reloading animation)
        if (this.isReloading) {
            // Add reloading animation/logic here if needed
        }
        this.gainNode.gain.value = getSetting('audio', 'weaponVolume');
    }

    fire() {
        if (this.ammo <= 0 || this.isReloading) return;

        this.ammo--;
        this.lastFireTime = Date.now();

        // Create and register a bullet
        const bulletPosition = this.bulletSpawnPoint.getWorldPosition(new THREE.Vector3());
        const bulletDirection = this.parent.getWorldDirection(new THREE.Vector3()); // Get direction from parent
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

    reload() {
        if (this.isReloading) return;
        this.isReloading = true;
        setTimeout(() => {
            this.ammo = this.maxAmmo;
            this.isReloading = false;
        }, this.reloadTime);
    }

    needsReload() {
        return this.ammo === 0 && !this.isReloading;
    }
}