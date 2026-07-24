import { getSetting } from '../core/settings.js';

/**
 * Procedural Glock viewmodel — first-person arm + detailed pistol for the player;
 * simpler world gun when parented to a bot mesh.
 * // [TRACE: SCRATCHPAD.md]
 */
export class Glock {
    constructor(parent, game, owner = null) {
        this.parent = parent;
        this.game = game;
        // Shooter entity (Player or Bot) for team-safe hit detection
        this.owner = owner;
        this.lastFireTime = 0;
        this.fireRate = 0.15;
        this.ammo = 30;
        this.maxAmmo = 30;
        this.isReloading = false;
        this.type = 'glock';
        this.damage = 20;
        this.accuracy = 0.85;
        this.reloadTime = 1500;

        this.isFirstPerson = !!(parent && parent.isCamera);
        this.recoil = 0;
        // Keep viewmodel inside frustum (near plane ~0.05) and on-screen
        this.basePosition = this.isFirstPerson
            ? new THREE.Vector3(0.18, -0.16, -0.32)
            : new THREE.Vector3(0.35, 0.7, -0.25);

        this.mesh = new THREE.Group();
        this.mesh.name = 'glockViewmodel';
        this.mesh.userData.skipTeamColor = true;

        if (this.isFirstPerson) {
            this.buildFirstPersonArm();
        }
        this.buildGun();

        this.bulletSpawnPoint = new THREE.Object3D();
        this.bulletSpawnPoint.position.set(0, 0.02, -0.36);
        this.gunRoot.add(this.bulletSpawnPoint);

        this.mesh.position.copy(this.basePosition);
        if (this.isFirstPerson) {
            this.mesh.scale.setScalar(1.15);
            this.mesh.rotation.set(0.05, -0.05, 0.02);
        } else {
            this.mesh.rotation.y = Math.PI;
            this.mesh.scale.setScalar(1.15);
        }

        // Never let team-color pass paint the viewmodel
        this.mesh.traverse((c) => {
            if (c.isMesh) c.userData.skipTeamColor = true;
        });

        this.parent.add(this.mesh);

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
    }

    buildFirstPersonArm() {
        const skin = new THREE.MeshStandardMaterial({
            color: 0xc68642,
            roughness: 0.85,
            metalness: 0.05
        });
        const sleeve = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9,
            metalness: 0.1
        });

        this.armRoot = new THREE.Group();
        this.armRoot.position.set(-0.02, -0.08, 0.08);
        this.armRoot.rotation.set(0.25, 0.05, -0.55);
        this.mesh.add(this.armRoot);

        // Upper forearm / sleeve
        const sleeveMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.065, 0.28, 10),
            sleeve
        );
        sleeveMesh.rotation.x = Math.PI / 2;
        sleeveMesh.position.set(0, 0, 0.18);
        this.armRoot.add(sleeveMesh);

        // Forearm
        const forearm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.045, 0.055, 0.32, 10),
            skin
        );
        forearm.rotation.x = Math.PI / 2;
        forearm.position.set(0, -0.01, 0.0);
        this.armRoot.add(forearm);

        // Hand — wraps grip; fingers curl under for a solid hold
        const hand = new THREE.Mesh(
            new THREE.BoxGeometry(0.095, 0.055, 0.11),
            skin
        );
        hand.position.set(0.01, -0.025, -0.17);
        this.armRoot.add(hand);

        for (let i = 0; i < 4; i++) {
            const finger = new THREE.Mesh(
                new THREE.BoxGeometry(0.02, 0.024, 0.055),
                skin
            );
            finger.position.set(-0.032 + i * 0.024, -0.055, -0.20);
            finger.rotation.x = 0.95;
            this.armRoot.add(finger);
        }

        const thumb = new THREE.Mesh(
            new THREE.BoxGeometry(0.022, 0.028, 0.048),
            skin
        );
        thumb.position.set(0.055, -0.005, -0.14);
        thumb.rotation.set(0.25, 0.55, 0.45);
        this.armRoot.add(thumb);
    }

    buildGun() {
        // Cohesive pistol: overlapping volumes so it reads as one shape, not floating bricks
        const slideMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1c,
            roughness: 0.32,
            metalness: 0.88
        });
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x222226,
            roughness: 0.45,
            metalness: 0.7
        });
        const polymer = new THREE.MeshStandardMaterial({
            color: 0x121214,
            roughness: 0.82,
            metalness: 0.08
        });
        const tipMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            roughness: 0.25,
            metalness: 0.95
        });
        const sightDot = new THREE.MeshStandardMaterial({
            color: 0xff2a2a,
            emissive: 0x661111,
            emissiveIntensity: 0.6,
            roughness: 0.4,
            metalness: 0.1
        });

        this.gunRoot = new THREE.Group();
        this.gunRoot.position.set(0.02, 0.02, -0.06);
        this.mesh.add(this.gunRoot);

        // --- Lower frame (receiver) — continuous with grip ---
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.055, 0.26), frameMat);
        frame.position.set(0, 0.0, -0.04);
        this.gunRoot.add(frame);

        // Dust cover / front under-barrel (connects frame to muzzle visually)
        const dustCover = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.028, 0.10), frameMat);
        dustCover.position.set(0, -0.005, -0.18);
        this.gunRoot.add(dustCover);

        // --- Slide (sits flush on frame, slight overhang) ---
        this.slide = new THREE.Group();
        this.slide.position.set(0, 0.038, -0.06);
        this.gunRoot.add(this.slide);
        this._slideBaseZ = -0.06;

        const slideBody = new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.048, 0.30), slideMat);
        slideBody.position.set(0, 0, 0);
        this.slide.add(slideBody);

        // Rounded-ish nose: slightly smaller front block flush with body
        const slideNose = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.042, 0.04), slideMat);
        slideNose.position.set(0, -0.002, -0.16);
        this.slide.add(slideNose);

        // Serrations cut into rear sides (inset, not floating on top)
        for (let i = 0; i < 6; i++) {
            const notch = new THREE.Mesh(
                new THREE.BoxGeometry(0.056, 0.028, 0.006),
                tipMat
            );
            notch.position.set(0, 0.0, 0.06 + i * 0.012);
            this.slide.add(notch);
        }

        // Ejection port recess (side cut)
        const eject = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.06), tipMat);
        eject.position.set(0.018, 0.005, -0.02);
        this.slide.add(eject);

        // Barrel tip peeking from slide (recessed, short)
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.009, 0.01, 0.055, 8),
            tipMat
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, -0.002, -0.195);
        this.slide.add(barrel);

        // Front sight — flush block on slide top
        const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.014, 0.012), tipMat);
        frontSight.position.set(0, 0.028, -0.13);
        this.slide.add(frontSight);
        const frontDot = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.005, 0.005), sightDot);
        frontDot.position.set(0, 0.036, -0.13);
        this.slide.add(frontDot);

        // Rear sight — U shape as one low block with notch
        const rearBase = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.012, 0.014), tipMat);
        rearBase.position.set(0, 0.027, 0.12);
        this.slide.add(rearBase);
        const rearL = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.016, 0.012), tipMat);
        rearL.position.set(-0.012, 0.032, 0.12);
        this.slide.add(rearL);
        const rearR = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.016, 0.012), tipMat);
        rearR.position.set(0.012, 0.032, 0.12);
        this.slide.add(rearR);

        // --- Grip (angles into frame, mag flush) ---
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.13, 0.085), polymer);
        grip.position.set(0, -0.08, 0.055);
        grip.rotation.x = 0.22;
        this.gunRoot.add(grip);

        // Bevel / backstrap continuity into frame
        const backstrap = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.05, 0.04), polymer);
        backstrap.position.set(0, -0.02, 0.09);
        backstrap.rotation.x = 0.35;
        this.gunRoot.add(backstrap);

        // Side panels (subtle grip texture — flush, thinner than body)
        for (const side of [-1, 1]) {
            const panel = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.09, 0.07), tipMat);
            panel.position.set(side * 0.026, -0.075, 0.055);
            panel.rotation.x = 0.22;
            this.gunRoot.add(panel);
        }

        // Mag base — flush with grip bottom
        const mag = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.028, 0.072), tipMat);
        mag.position.set(0, -0.145, 0.04);
        mag.rotation.x = 0.22;
        this.gunRoot.add(mag);

        // --- Trigger guard (connected U from frame pieces, not a floating torus) ---
        const guardFront = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.012, 0.012), frameMat);
        guardFront.position.set(0, -0.048, -0.06);
        this.gunRoot.add(guardFront);
        const guardBottom = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.012, 0.07), frameMat);
        guardBottom.position.set(0, -0.062, -0.025);
        this.gunRoot.add(guardBottom);
        const guardRear = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.035, 0.012), frameMat);
        guardRear.position.set(0, -0.045, 0.012);
        this.gunRoot.add(guardRear);

        // Trigger inside guard
        const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.028, 0.016), tipMat);
        trigger.position.set(0, -0.032, -0.02);
        trigger.rotation.x = 0.2;
        this.gunRoot.add(trigger);
    }

    update(deltaTime) {
        this.gainNode.gain.value = getSetting('audio', 'weaponVolume');

        // Settle recoil
        if (this.recoil > 0) {
            this.recoil = Math.max(0, this.recoil - deltaTime * 8);
        }

        if (this.isFirstPerson) {
            this.mesh.position.x = this.basePosition.x;
            this.mesh.position.y = this.basePosition.y + this.recoil * 0.04;
            this.mesh.position.z = this.basePosition.z + this.recoil * 0.06;
            this.mesh.rotation.x = 0.05 - this.recoil * 0.25;
            if (this.slide) {
                const baseZ = this._slideBaseZ ?? -0.06;
                this.slide.position.z = baseZ + this.recoil * 0.045;
            }
        }
    }

    /**
     * @param {THREE.Vector3} [direction]
     */
    fire(direction) {
        if (this.ammo <= 0 || this.isReloading) return;

        const now = Date.now();
        if (now - this.lastFireTime < this.fireRate * 1000) return;

        this.ammo--;
        this.lastFireTime = now;
        this.recoil = 1.0;

        const bulletPosition = this.bulletSpawnPoint.getWorldPosition(new THREE.Vector3());
        let bulletDirection;
        if (direction && direction.lengthSq && direction.lengthSq() > 0.0001) {
            bulletDirection = direction.clone().normalize();
        } else if (this.parent.getWorldDirection) {
            bulletDirection = this.parent.getWorldDirection(new THREE.Vector3());
        } else {
            bulletDirection = new THREE.Vector3(0, 0, -1);
            this.parent.getWorldDirection(bulletDirection);
        }
        const owner = this.owner || this.game.player || null;
        this.game.addBullet(bulletPosition, bulletDirection, owner);

        this.playFireSound();
    }

    playFireSound() {
        const time = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, time);
        oscillator.frequency.exponentialRampToValueAtTime(80, time + 0.05);

        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(1, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        const noise = this.audioContext.createBufferSource();
        const buffer = this.audioContext.createBuffer(
            1,
            this.audioContext.sampleRate * 0.05,
            this.audioContext.sampleRate
        );
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
        if (this.isReloading || this.ammo >= this.maxAmmo) return;
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
