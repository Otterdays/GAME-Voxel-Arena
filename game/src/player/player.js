import { createCharacterModel } from './character.js';
import { getInputState, clearLookInput } from '../core/input.js';
import { getSetting } from '../core/settings.js';
import { checkCollision } from '../core/physics.js';

// Player constants
const PLAYER_RADIUS = 0.5;
const PLAYER_HEIGHT = 1.8;
const PLAYER_SPEED = 5.0; // meters per second
const MOUSE_SENSITIVITY = 0.002;
const JUMP_FORCE = 8.0; // Upward velocity when jumping
const GRAVITY = 20.0; // Downward acceleration

export class Player {
    constructor(camera, scene, structures, spawnPoint) {
        this.camera = camera;
        this.scene = scene;
        this.structures = structures;

        // Player model
        this.mesh = createCharacterModel(0x00ff00); // Green for player
        this.mesh.position.set(spawnPoint.x, spawnPoint.y, spawnPoint.z);
        this.scene.add(this.mesh);
        
        // Team assignment
        this.team = 'red'; // Default team

        // Set the player model to a layer that the main camera doesn't render
        const LOCAL_PLAYER_LAYER = 1;
        this.mesh.traverse((child) => {
            if (child.isMesh) {
                child.layers.set(LOCAL_PLAYER_LAYER);
            }
        });
        // The camera, by default, renders layer 0. Everything else in the scene
        // is on layer 0 by default, so this effectively makes the player model
        // invisible to the main camera without affecting anything else.

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
        
        // Player health
        this.health = 1.0;
        this.maxHealth = 1.0;
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

        // Apply velocity and check for collisions
        const oldPosition = this.mesh.position.clone();

        this.mesh.position.x += this.velocity.x * deltaTime;
        if (checkCollision(this, this.structures)) {
            this.mesh.position.x = oldPosition.x;
        }

        this.mesh.position.z += this.velocity.z * deltaTime;
        if (checkCollision(this, this.structures)) {
            this.mesh.position.z = oldPosition.z;
        }

        // Jump and Gravity
        if (input.move.jump && this.isOnGround) {
            this.velocityY = JUMP_FORCE;
            this.isOnGround = false;
        }
        this.velocityY -= GRAVITY * deltaTime;
        this.mesh.position.y += this.velocityY * deltaTime;

        // Ground check and collision response - temporarily disabled to test
        // if (checkCollision(this, this.structures)) {
        //     this.mesh.position.y = oldPosition.y;
        //     this.velocityY = 0;
        //     this.isOnGround = true;
        // } else {
        //     this.isOnGround = false;
        // }
        
        // Simple ground check - if below y=1.0, set to y=1.0 and stop falling
        if (this.mesh.position.y < 1.0) {
            this.mesh.position.y = 1.0;
            this.velocityY = 0;
            this.isOnGround = true;
        } else {
            this.isOnGround = false;
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