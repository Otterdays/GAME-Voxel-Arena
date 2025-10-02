import { getInputState, clearLookInput } from './input.js';
import { getSetting } from './settings.js';

// Player constants
const PLAYER_RADIUS = 0.5;
const PLAYER_HEIGHT = 1.8;
const PLAYER_SPEED = 5.0; // meters per second
const MOUSE_SENSITIVITY = 0.002;
const JUMP_FORCE = 8.0; // Upward velocity when jumping
const GRAVITY = 20.0; // Downward acceleration


export class Player {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;

        // Player model
        const playerGeometry = new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_HEIGHT, 16);
        const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(playerGeometry, playerMaterial);
        this.mesh.position.set(0, PLAYER_HEIGHT / 2, 0);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);

        // Camera setup
        this.camera.position.set(0, PLAYER_HEIGHT * 0.9, 0);
        this.cameraBaseY = this.camera.position.y; // Store base camera Y position
        this.mesh.add(this.camera); // Attach camera to player mesh

        this.velocity = new THREE.Vector3();
        this.velocityY = 0; // Vertical velocity for jumping/falling
        this.isOnGround = false; // Flag to check if player is on the ground
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.minPitch = -Math.PI / 2;
        this.maxPitch = Math.PI / 2;

        this.wobbleTimer = 0;
        this.isMoving = false;
    }

    update(deltaTime) {
        const input = getInputState();

        // Mouse look
        const { dx, dy } = input.look;
        this.euler.y -= dx * MOUSE_SENSITIVITY;
        this.euler.x -= dy * MOUSE_SENSITIVITY;
        this.euler.x = Math.max(this.minPitch, Math.min(this.maxPitch, this.euler.x));
        this.camera.quaternion.setFromEuler(this.euler);
        clearLookInput();

        // Movement
        const moveDirection = new THREE.Vector3();
        if (input.move.forward) moveDirection.z -= 1;
        if (input.move.backward) moveDirection.z += 1;
        if (input.move.left) moveDirection.x -= 1;
        if (input.move.right) moveDirection.x += 1;

        this.isMoving = moveDirection.lengthSq() > 0;

        if (this.isMoving) {
            moveDirection.normalize().applyQuaternion(this.camera.quaternion);
            this.velocity.x = moveDirection.x * PLAYER_SPEED;
            this.velocity.z = moveDirection.z * PLAYER_SPEED;
        }

        // Apply velocity
        this.mesh.position.x += this.velocity.x * deltaTime;
        this.mesh.position.z += this.velocity.z * deltaTime;

        // Jump and Gravity
        if (input.move.jump && this.isOnGround) {
            this.velocityY = JUMP_FORCE;
            this.isOnGround = false;
        }
        this.velocityY -= GRAVITY * deltaTime;
        this.mesh.position.y += this.velocityY * deltaTime;

        // Simple ground check
        if (this.mesh.position.y < PLAYER_HEIGHT / 2) {
            this.mesh.position.y = PLAYER_HEIGHT / 2;
            this.velocityY = 0;
            this.isOnGround = true;
        }

        // Simple friction
        this.velocity.x *= 0.9;
        this.velocity.z *= 0.9;

        // Walk Wobble Effect
        if (getSetting('video', 'walkWobble') && this.isMoving) {
            this.wobbleTimer += deltaTime * 10; // Adjust speed of wobble
            this.camera.position.y = this.cameraBaseY + Math.sin(this.wobbleTimer) * 0.05; // Adjust wobble intensity
        } else {
            this.wobbleTimer = 0; // Reset timer when not moving
            this.camera.position.y = this.cameraBaseY; // Reset camera to base Y
        }
    }
}