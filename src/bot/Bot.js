/**
 * Bot - Main Bot Class that integrates all AI systems
 * 
 * This is the main bot class that brings together all the AI systems:
 * - BotBrain for decision making
 * - BotSenses for perception
 * - BotMemory for learning
 * - BotPersonality for behavior traits
 * - BotCombat for tactical combat
 * - BotMovement for navigation
 * - BotCommunication for team coordination
 */

import { BotBrain } from './BotBrain.js';
import { BotSenses } from './BotSenses.js';
import { BotMemory } from './BotMemory.js';
import { BotPersonality } from './BotPersonality.js';
import { BotCombat } from './BotCombat.js';
import { BotMovement } from './BotMovement.js';
import { BotCommunication } from './BotCommunication.js';
import { createCharacterModel } from '../character.js';
import { checkCollision } from '../physics.js';
import { Glock } from '../glock.js'; // Import Glock class

export class Bot {
    constructor(game, id, difficulty = 'medium', team = 'red') {
        this.game = game;
        this.id = id;
        this.difficulty = difficulty;
        this.team = team;
        
        // Bot properties
        this.position = new THREE.Vector3();
        this.rotation = new THREE.Euler();
        this.velocity = new THREE.Vector3();
        this.velocityY = 0; // Vertical velocity for gravity
        this.isOnGround = false; // Ground collision flag
        this.health = 1.0;
        this.maxHealth = 1.0;
        this.armor = 0;
        this.maxArmor = 0;
        
        // Physics constants (same as player)
        this.RADIUS = 0.5;
        this.HEIGHT = 1.8;
        this.SPEED = 3.0; // Slightly slower than player
        this.GRAVITY = 20.0; // Same gravity as player
        this.JUMP_FORCE = 6.0; // Slightly weaker than player
        
        // Bot state
        this.isAlive = true;
        this.isActive = true;
        this.spawnTime = Date.now();
        this.lastUpdateTime = 0;
        
        // Bot systems
        this.brain = null;
        this.senses = null;
        this.memory = null;
        this.personality = null;
        this.combat = null;
        this.movement = null;
        this.communication = null;
        
        // Bot model
        this.mesh = null;
        this.weapon = null;
        this.weaponMesh = null;
        
        // Bot statistics
        this.stats = {
            kills: 0,
            deaths: 0,
            assists: 0,
            damageDealt: 0,
            damageTaken: 0,
            shotsFired: 0,
            shotsHit: 0,
            survivalTime: 0,
            distanceTraveled: 0,
            objectivesCompleted: 0
        };
        
        // Bot configuration
        this.config = {
            name: this.generateBotName(),
            appearance: this.generateAppearance(),
            loadout: this.generateLoadout(),
            behavior: this.generateBehaviorConfig()
        };
        
        // Simple AI state
        this.aiState = 'patrol';
        this.patrolTarget = null;
        this.patrolPoints = [];
        this.lastPatrolUpdate = 0;
        this.patrolUpdateInterval = 2000; // 2 seconds
        
        // Initialize bot systems
        this.initializeSystems();
        
        // Create bot model
        this.createModel();
        this.isOnGround = true; // Assume bot starts on ground
        
        console.log(`Bot ${this.id} (${this.config.name}) initialized with difficulty ${difficulty}`);
    }
    
    /**
     * Initialize all bot systems
     */
    initializeSystems() {
        // Initialize brain first (core system)
        this.brain = new BotBrain(this, this.difficulty);
        
        // Initialize other systems
        this.senses = new BotSenses(this.brain);
        this.memory = new BotMemory(this.brain);
        this.personality = new BotPersonality(this.brain, this.difficulty);
        this.combat = new BotCombat(this.brain);
        this.movement = new BotMovement(this.brain);
        this.communication = new BotCommunication(this.brain);
        
        // Set up system references
        this.brain.senses = this.senses;
        this.brain.memory = this.memory;
        this.brain.personality = this.personality;
        this.brain.combat = this.combat;
        this.brain.movement = this.movement;
        this.communication = this.communication;
    }
    
    /**
     * Create bot model
     */
    createModel() {
        // Create bot mesh using shared character model
        const teamColor = this.team === 'red' ? 0xff0000 : 0x0000ff;
        this.mesh = createCharacterModel(teamColor);
        this.mesh.position.copy(this.position);
        this.mesh.rotation.copy(this.rotation);
        
        // Add team indicator
        this.addTeamIndicator();
        
        // Set user data
        this.mesh.userData = {
            isBot: true,
            botId: this.id,
            team: this.team,
            type: 'bot'
        };
        
        // Add to scene
        this.game.scene.add(this.mesh);
        
        // Create weapon
        this.createWeapon();
    }
    
    /**
     * Add team indicator to bot
     */
    addTeamIndicator() {
        // Add a small team indicator above the head
        const teamGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const teamMaterial = new THREE.MeshStandardMaterial({ 
            color: this.team === 'red' ? 0xff0000 : 0x0000ff,
            emissive: this.team === 'red' ? 0x330000 : 0x000033,
            emissiveIntensity: 0.3
        });
        const teamIndicator = new THREE.Mesh(teamGeometry, teamMaterial);
        teamIndicator.position.y = 2.6; // Above the head
        teamIndicator.userData = { isTeamIndicator: true };
        this.mesh.add(teamIndicator);
    }
    
    /**
     * Create weapon
     */
    createWeapon() {
        // Create Glock instance for the bot
        this.weapon = new Glock(this.mesh, this.game); // Pass bot's mesh and game instance
        this.weaponMesh = this.weapon.mesh; // Reference the Glock's mesh
        
        // Set weapon in combat system
        this.combat.setWeapon(this.weapon);
    }
    
    /**
     * Create bullet
     */
    createBullet(direction) {
        const bulletPosition = this.position.clone();
        bulletPosition.y += 1.5; // Eye level
        
        // Add bullet to game
        this.game.addBullet(bulletPosition, direction);
    }
    
    /**
     * Main update loop
     */
    update(deltaTime) {
        if (!this.isAlive || !this.isActive) return;
        
        // Update bot systems
        this.brain.update(deltaTime);
        
        // Only update simple AI behavior if BotBrain is not active
        // BotBrain system handles all AI decisions and movement
        // this.updateSimpleAI(deltaTime);
        
        // Apply physics
        this.updatePhysics(deltaTime);
        
        // Update bot model
        this.updateModel(deltaTime);
        
        // Update statistics
        this.updateStatistics(deltaTime);
        
        // Update last update time
        this.lastUpdateTime = Date.now();
    }
    
    /**
     * Update simple AI behavior
     */
    updateSimpleAI(deltaTime) {
        const currentTime = Date.now();
        
        
        // Check for enemies
        const enemies = this.findEnemies();
        const nearestEnemy = this.getNearestEnemy(enemies);
        
        if (nearestEnemy && this.canSeeTarget(nearestEnemy)) {
            // Engage enemy
            this.aiState = 'combat';
            this.engageEnemy(nearestEnemy);
        } else {
            // Patrol behavior
            this.aiState = 'patrol';
            this.updatePatrol(currentTime);
        }
    }
    
    /**
     * Find enemies in the game
     */
    findEnemies() {
        const enemies = [];
        
        // Check player
        if (this.game.player && this.game.player.health > 0) {
            enemies.push({
                position: this.game.player.mesh.position,
                health: this.game.player.health,
                isPlayer: true
            });
        }
        
        // Check other bots
        if (this.game.botManager) {
            const allBots = this.game.botManager.getAllBots();
            for (const bot of allBots) {
                if (bot.id !== this.id && bot.team !== this.team && bot.isAlive) {
                    enemies.push({
                        position: bot.position,
                        health: bot.health,
                        isPlayer: false,
                        bot: bot
                    });
                }
            }
        }
        
        return enemies;
    }
    
    /**
     * Get nearest enemy
     */
    getNearestEnemy(enemies) {
        if (enemies.length === 0) return null;
        
        let nearest = null;
        let nearestDistance = Infinity;
        
        for (const enemy of enemies) {
            const distance = this.position.distanceTo(enemy.position);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = enemy;
            }
        }
        
        return nearest;
    }
    
    /**
     * Check if bot can see target
     */
    canSeeTarget(target) {
        const distance = this.position.distanceTo(target.position);
        const maxVisionDistance = 25; // Same as medium difficulty
        
        if (distance > maxVisionDistance) return false;
        
        // Simple line of sight check (could be improved)
        return true; // For now, assume bots can see all targets in range
    }
    
    /**
     * Engage enemy
     */
    engageEnemy(enemy) {
        // Move towards enemy
        const direction = enemy.position.clone().sub(this.position).normalize();
        this.velocity.x = direction.x * this.SPEED;
        this.velocity.z = direction.z * this.SPEED;
        
        // Fire weapon if in range
        const distance = this.position.distanceTo(enemy.position);
        if (distance < 15 && this.weapon && this.weapon.ammo > 0) {
            this.fireWeapon(enemy.position);
        }
    }
    
    /**
     * Fire weapon at target
     */
    fireWeapon(targetPosition) {
        if (!this.weapon || this.weapon.ammo <= 0) return;
        
        // Simple fire rate limiting
        const currentTime = Date.now();
        if (currentTime - this.weapon.lastFireTime < 500) return; // 500ms between shots
        
        const direction = targetPosition.clone().sub(this.position).normalize();
        this.weapon.fire(direction);
    }
    
    /**
     * Update patrol behavior
     */
    updatePatrol(currentTime) {
        if (currentTime - this.lastPatrolUpdate < this.patrolUpdateInterval) return;
        
        this.lastPatrolUpdate = currentTime;
        
        // Generate patrol points if needed
        if (this.patrolPoints.length === 0) {
            this.generatePatrolPoints();
        }
        
        // Move to next patrol point
        if (this.patrolTarget) {
            const distance = this.position.distanceTo(this.patrolTarget);
            if (distance < 2) {
                // Reached patrol point, get next one
                this.getNextPatrolPoint();
            } else {
                // Move towards patrol point
                const direction = this.patrolTarget.clone().sub(this.position).normalize();
                this.velocity.x = direction.x * this.SPEED * 0.5; // Slower when patrolling
                this.velocity.z = direction.z * this.SPEED * 0.5;
            }
        } else {
            this.getNextPatrolPoint();
        }
    }
    
    /**
     * Generate patrol points around spawn area
     */
    generatePatrolPoints() {
        const spawnPoint = this.position.clone();
        const patrolRadius = 20;
        
        // Generate 4-6 patrol points in a circle around spawn
        const numPoints = 4 + Math.floor(Math.random() * 3);
        this.patrolPoints = [];
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const distance = patrolRadius * (0.5 + Math.random() * 0.5);
            
            const point = new THREE.Vector3(
                spawnPoint.x + Math.cos(angle) * distance,
                0.0, // Use ground level
                spawnPoint.z + Math.sin(angle) * distance
            );
            
            this.patrolPoints.push(point);
        }
    }
    
    /**
     * Get next patrol point
     */
    getNextPatrolPoint() {
        if (this.patrolPoints.length === 0) {
            this.generatePatrolPoints();
        }
        
        const randomIndex = Math.floor(Math.random() * this.patrolPoints.length);
        this.patrolTarget = this.patrolPoints[randomIndex];
    }
    
    /**
     * Update physics (gravity, collision, movement)
     */
    updatePhysics(deltaTime) {
        if (!this.mesh) return;
        
        // Apply gravity
        this.velocityY -= this.GRAVITY * deltaTime;
        
        // Store old position for collision detection
        const oldPosition = this.mesh.position.clone();
        
        // Apply horizontal movement
        const deltaX = this.velocity.x * deltaTime;
        const deltaZ = this.velocity.z * deltaTime;
        
        this.mesh.position.x += deltaX;
        if (checkCollision(this, this.game.arenaData?.structures || [])) {
            this.mesh.position.x = oldPosition.x;
            this.velocity.x = 0;
        }
        
        this.mesh.position.z += deltaZ;
        if (checkCollision(this, this.game.arenaData?.structures || [])) {
            this.mesh.position.z = oldPosition.z;
            this.velocity.z = 0;
        }
        
        
        // Apply vertical movement (gravity)
        this.mesh.position.y += this.velocityY * deltaTime;
        
        
        // Check for ground collision - temporarily disabled to test
        // if (checkCollision(this, this.game.arenaData?.structures || [])) {
        //     this.mesh.position.y = oldPosition.y;
        //     this.velocityY = 0;
        //     this.isOnGround = true;
        //     if (Math.random() < 0.1) console.log(`Bot ${this.id} ground collision at Y: ${this.mesh.position.y.toFixed(2)}`);
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
        
        // Update position from mesh
        this.position.copy(this.mesh.position);
        
        // Apply friction (less aggressive since BotMovement also applies friction)
        this.velocity.x *= 0.98;
        this.velocity.z *= 0.98;
    }
    
    /**
     * Update bot model
     */
    updateModel(deltaTime) {
        // Update position
        this.mesh.position.copy(this.position);
        this.mesh.rotation.copy(this.rotation);
        
        // Update weapon
        if (this.weapon) {
            this.weapon.update(deltaTime);
        }
        
        // Update visual effects
        this.updateVisualEffects(deltaTime);
    }
    
    /**
     * Update visual effects
     */
    updateVisualEffects(deltaTime) {
        // Health indicator
        if (this.health < 0.5) {
            // Flash red when low health
            const flashIntensity = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
            this.mesh.children.forEach(child => {
                if (child.material && child.material.color) {
                    child.material.color.setRGB(1, flashIntensity, flashIntensity);
                }
            });
        }
        
        // Team indicator
        const teamIndicator = this.mesh.children.find(child => 
            child.userData && child.userData.isTeamIndicator
        );
        if (teamIndicator) {
            teamIndicator.material.color.setHex(
                this.team === 'red' ? 0xff0000 : 0x0000ff
            );
        }
    }
    
    /**
     * Update statistics
     */
    updateStatistics(deltaTime) {
        this.stats.survivalTime += deltaTime;
        
        // Update distance traveled
        if (this.velocity.length() > 0) {
            this.stats.distanceTraveled += this.velocity.length() * deltaTime;
        }
    }
    
    /**
     * Take damage
     */
    takeDamage(amount, source = null) {
        if (!this.isAlive) return;
        
        // Apply armor reduction
        const actualDamage = Math.max(0, amount - this.armor * 0.5);
        
        // Reduce health
        this.health = Math.max(0, this.health - actualDamage);
        this.stats.damageTaken += actualDamage;
        
        // Update emotional state
        if (this.personality) {
            this.personality.addExperienceModifier('anger', 0.1);
            this.personality.addExperienceModifier('fear', 0.05);
        }
        
        // Check for death
        if (this.health <= 0) {
            this.die(source);
        }
        
        // Record damage event
        if (this.memory) {
            this.memory.recordObservation({
                type: 'damage',
                amount: actualDamage,
                source: source,
                position: this.position.clone(),
                timestamp: Date.now()
            }, 'damage');
        }
    }
    
    /**
     * Heal bot
     */
    heal(amount) {
        if (!this.isAlive) return;
        
        this.health = Math.min(this.maxHealth, this.health + amount);
        
        // Update emotional state
        if (this.personality) {
            this.personality.addExperienceModifier('confidence', 0.05);
        }
        
        // Record heal event
        if (this.memory) {
            this.memory.recordObservation({
                type: 'heal',
                amount: amount,
                position: this.position.clone(),
                timestamp: Date.now()
            }, 'heal');
        }
    }
    
    /**
     * Die
     */
    die(killer = null) {
        if (!this.isAlive) return;
        
        this.isAlive = false;
        this.stats.deaths++;
        
        // Update emotional state
        if (this.personality) {
            this.personality.addExperienceModifier('fear', 0.3);
            this.personality.addExperienceModifier('confidence', -0.2);
        }
        
        // Record death event
        if (this.memory) {
            this.memory.recordObservation({
                type: 'death',
                killer: killer,
                position: this.position.clone(),
                timestamp: Date.now()
            }, 'death');
        }
        
        // Update killer's stats
        if (killer && killer.stats) {
            killer.stats.kills++;
        }
        
        // Remove from scene
        this.game.scene.remove(this.mesh);
        
        // Schedule respawn
        this.scheduleRespawn();
        
        console.log(`Bot ${this.id} (${this.config.name}) died`);
    }
    
    /**
     * Schedule respawn
     */
    scheduleRespawn() {
        const respawnTime = 5000; // 5 seconds
        
        setTimeout(() => {
            this.respawn();
        }, respawnTime);
    }
    
    /**
     * Respawn bot
     */
    respawn() {
        // Reset bot state
        this.isAlive = true;
        this.health = this.maxHealth;
        this.armor = this.maxArmor;
        this.position.set(0, 0, 0); // Will be set to spawn point
        this.velocity.set(0, 0, 0);
        this.spawnTime = Date.now();
        
        // Reset weapon
        if (this.weapon) {
            this.weapon.ammo = this.weapon.maxAmmo;
            this.weapon.isReloading = false;
        }
        
        // Reset AI systems
        if (this.brain) {
            this.brain.reset();
        }
        
        // Recreate model
        this.createModel();
        
        // Set spawn position
        this.setSpawnPosition();
        
        console.log(`Bot ${this.id} (${this.config.name}) respawned`);
    }
    
    /**
     * Set spawn position
     */
    setSpawnPosition() {
        // Get spawn points from game
        const spawnPoints = this.game.getSpawnPoints();
        
        if (spawnPoints.length > 0) {
            // Find safe spawn point
            const safeSpawnPoint = this.findSafeSpawnPoint(spawnPoints);
            this.position.copy(safeSpawnPoint);
        }
    }
    
    /**
     * Find safe spawn point
     */
    findSafeSpawnPoint(spawnPoints) {
        // Simple implementation - find spawn point away from enemies
        for (const spawnPoint of spawnPoints) {
            const enemies = this.senses?.getEnemies() || [];
            let isSafe = true;
            
            for (const enemy of enemies) {
                if (spawnPoint.distanceTo(enemy.position) < 10) {
                    isSafe = false;
                    break;
                }
            }
            
            if (isSafe) {
                return spawnPoint;
            }
        }
        
        // Fallback to first spawn point
        return spawnPoints[0] || new THREE.Vector3(0, 0, 0);
    }
    
    /**
     * Get forward direction
     */
    getForwardDirection() {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyEuler(this.rotation);
        return direction;
    }
    
    /**
     * Get bot name
     */
    generateBotName() {
        const names = [
            'Alpha', 'Beta', 'Gamma', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel',
            'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa',
            'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 'Xray',
            'Yankee', 'Zulu'
        ];
        
        return names[Math.floor(Math.random() * names.length)];
    }
    
    /**
     * Generate appearance
     */
    generateAppearance() {
        const colors = [
            0x00ff00, 0x0080ff, 0xff8000, 0xff0080, 0x8000ff, 0xffff00
        ];
        
        return {
            bodyColor: colors[Math.floor(Math.random() * colors.length)],
            headColor: colors[Math.floor(Math.random() * colors.length)],
            legColor: colors[Math.floor(Math.random() * colors.length)]
        };
    }
    
    /**
     * Generate loadout
     */
    generateLoadout() {
        const loadouts = {
            assault: {
                weapon: 'assault_rifle',
                ammo: 30,
                maxAmmo: 30,
                damage: 25,
                accuracy: 0.7,
                fireRate: 0.1,
                reloadTime: 2000,
                range: 50
            },
            support: {
                weapon: 'machine_gun',
                ammo: 100,
                maxAmmo: 100,
                damage: 20,
                accuracy: 0.6,
                fireRate: 0.05,
                reloadTime: 3000,
                range: 60
            },
            sniper: {
                weapon: 'sniper_rifle',
                ammo: 5,
                maxAmmo: 5,
                damage: 80,
                accuracy: 0.9,
                fireRate: 1.0,
                reloadTime: 1500,
                range: 100
            }
        };
        
        const roles = Object.keys(loadouts);
        const role = roles[Math.floor(Math.random() * roles.length)];
        
        return loadouts[role];
    }
    
    /**
     * Generate behavior configuration
     */
    generateBehaviorConfig() {
        return {
            aggression: Math.random(),
            caution: Math.random(),
            teamwork: Math.random(),
            adaptability: Math.random(),
            intelligence: Math.random(),
            leadership: Math.random()
        };
    }
    
    // Public API methods
    
    /**
     * Get bot information
     */
    getInfo() {
        return {
            id: this.id,
            name: this.config.name,
            team: this.team,
            difficulty: this.difficulty,
            health: this.health,
            maxHealth: this.maxHealth,
            armor: this.armor,
            maxArmor: this.maxArmor,
            position: this.position.clone(),
            rotation: this.rotation.clone(),
            velocity: this.velocity.clone(),
            isAlive: this.isAlive,
            isActive: this.isActive,
            stats: { ...this.stats }
        };
    }
    
    /**
     * Get bot statistics
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * Get bot configuration
     */
    getConfig() {
        return { ...this.config };
    }
    
    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            id: this.id,
            name: this.config.name,
            team: this.team,
            difficulty: this.difficulty,
            health: this.health,
            position: this.position,
            isAlive: this.isAlive,
            isActive: this.isActive,
            stats: this.stats,
            brain: this.brain?.getDebugInfo(),
            senses: this.senses?.getDebugInfo(),
            memory: this.memory?.getDebugInfo(),
            personality: this.personality?.getDebugInfo(),
            combat: this.combat?.getDebugInfo(),
            movement: this.movement?.getDebugInfo(),
            communication: this.communication?.getDebugInfo()
        };
    }
    
    /**
     * Set bot position
     */
    setPosition(position) {
        this.position.copy(position);
        if (this.mesh) {
            this.mesh.position.copy(position);
        }
    }
    
    /**
     * Set bot rotation
     */
    setRotation(rotation) {
        this.rotation.copy(rotation);
        if (this.mesh) {
            this.mesh.rotation.copy(rotation);
        }
    }
    
    /**
     * Set bot velocity
     */
    setVelocity(velocity) {
        this.velocity.copy(velocity);
    }
    
    /**
     * Activate bot
     */
    activate() {
        this.isActive = true;
    }
    
    /**
     * Deactivate bot
     */
    deactivate() {
        this.isActive = false;
    }
    
    /**
     * Remove bot from game
     */
    remove() {
        if (this.mesh) {
            this.game.scene.remove(this.mesh);
        }
        
        this.isActive = false;
        this.isAlive = false;
    }
}
