const BULLET_SPEED = 100.0;
const BULLET_LIFETIME = 2.0; // seconds

export class Bullet {
    constructor(scene, position, direction) {
        this.scene = scene;
        this.lifetime = BULLET_LIFETIME;

        const bulletGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const bulletMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        this.mesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
        this.mesh.position.copy(position);
        this.scene.add(this.mesh);

        this.velocity = direction.multiplyScalar(BULLET_SPEED);
    }

    update(deltaTime) {
        this.mesh.position.x += this.velocity.x * deltaTime;
        this.mesh.position.y += this.velocity.y * deltaTime;
        this.mesh.position.z += this.velocity.z * deltaTime;
        this.lifetime -= deltaTime;
    }
}