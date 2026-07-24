const BULLET_SPEED = 120.0;
const BULLET_LIFETIME = 2.0;

/**
 * Tracer-style projectile — elongated emissive streak oriented along travel.
 * // [TRACE: SCRATCHPAD.md]
 */
export class Bullet {
    constructor(scene, position, direction, owner = null) {
        this.scene = scene;
        this.lifetime = BULLET_LIFETIME;
        this.owner = owner;

        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);

        // Hot core
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0xfff0a0,
            emissive: 0xffcc44,
            emissiveIntensity: 1.2,
            roughness: 0.2,
            metalness: 0.1
        });
        const core = new THREE.Mesh(
            new THREE.CylinderGeometry(0.018, 0.012, 0.55, 6),
            coreMat
        );
        core.rotation.x = Math.PI / 2;
        this.mesh.add(core);

        // Soft glow shell (slightly larger, darker orange)
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xff8800,
            transparent: true,
            opacity: 0.35,
            depthWrite: false
        });
        const glow = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.025, 0.7, 6),
            glowMat
        );
        glow.rotation.x = Math.PI / 2;
        this.mesh.add(glow);

        // Tip spark
        const tip = new THREE.Mesh(
            new THREE.SphereGeometry(0.025, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0xffffee })
        );
        tip.position.z = -0.32;
        this.mesh.add(tip);

        this.scene.add(this.mesh);

        const dir = direction.clone().normalize();
        this.velocity = dir.multiplyScalar(BULLET_SPEED);
        this.prevPosition = this.mesh.position.clone();
        this.orientToVelocity();
    }

    orientToVelocity() {
        if (this.velocity.lengthSq() < 0.0001) return;
        const lookTarget = this.mesh.position.clone().add(this.velocity);
        this.mesh.lookAt(lookTarget);
    }

    update(deltaTime) {
        this.prevPosition.copy(this.mesh.position);
        this.mesh.position.x += this.velocity.x * deltaTime;
        this.mesh.position.y += this.velocity.y * deltaTime;
        this.mesh.position.z += this.velocity.z * deltaTime;
        this.orientToVelocity();
        this.lifetime -= deltaTime;
    }
}
