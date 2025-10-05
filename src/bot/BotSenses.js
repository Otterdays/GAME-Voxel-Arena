/**
 * BotSenses - Advanced Sensory System for AI Bots
 * 
 * This system simulates realistic bot perception including:
 * - Vision system with field of view, distance, and occlusion
 * - Hearing system with sound propagation and direction
 * - Memory of past observations
 * - Threat assessment and prioritization
 * - Environmental awareness
 */

import { BotMemory } from './BotMemory.js';

export class BotSenses {
    constructor(brain) {
        this.brain = brain;
        this.bot = brain.bot;
        
        // Vision parameters
        this.visionRange = this.getVisionRange();
        this.fieldOfView = this.getFieldOfView();
        this.visionUpdateInterval = 0.1; // Update vision 10 times per second
        this.lastVisionUpdate = 0;
        
        // Hearing parameters
        this.hearingRange = this.getHearingRange();
        this.soundMemory = new Map(); // Store recent sounds
        this.soundDecayTime = 5.0; // How long sounds are remembered
        
        // Detection thresholds
        this.detectionThresholds = {
            movement: 0.3,
            gunfire: 0.8,
            footsteps: 0.2,
            health: 0.1
        };
        
        // Current observations
        this.visibleTargets = new Map();
        this.audibleTargets = new Map();
        this.threats = new Map();
        this.allies = new Map();
        this.enemies = new Map();
        
        // Environmental awareness
        this.coverSpots = [];
        this.healthPacks = [];
        this.ammoPacks = [];
        this.spawnPoints = [];
        
        // Memory integration
        this.memory = new BotMemory(this.brain);
        
    }
    
    /**
     * Main update loop
     */
    update(deltaTime) {
        const currentTime = Date.now();
        
        // Update vision at specified intervals
        if (currentTime - this.lastVisionUpdate > this.visionUpdateInterval * 1000) {
            this.updateVision();
            this.lastVisionUpdate = currentTime;
        }
        
        // Update hearing continuously
        this.updateHearing(deltaTime);
        
        // Update environmental awareness
        this.updateEnvironmentalAwareness(deltaTime);
        
        // Decay old observations
        this.decayObservations(deltaTime);
        
        // Update threat assessment
        this.updateThreatAssessment();
    }
    
    /**
     * Update vision system
     */
    updateVision() {
        // Clear previous observations
        this.visibleTargets.clear();
        
        // Get all potential targets in range
        const potentialTargets = this.getPotentialTargets();
        
        for (const target of potentialTargets) {
            if (this.canSeeTarget(target)) {
                this.visibleTargets.set(target.id, {
                    target,
                    position: target.position.clone(),
                    lastSeen: Date.now(),
                    confidence: this.calculateVisibilityConfidence(target),
                    type: this.classifyTarget(target)
                });
                
                // Update memory with new observation
                this.memory.recordObservation(target, 'vision');
            }
        }
        
        // Update environmental objects
        this.updateEnvironmentalObjects();
    }
    
    /**
     * Check if bot can see a target
     */
    canSeeTarget(target) {
        // Check distance
        const distance = this.bot.position.distanceTo(target.position);
        if (distance > this.visionRange) {
            return false;
        }
        
        // Check field of view
        if (!this.isInFieldOfView(target.position)) {
            return false;
        }
        
        // Check line of sight (occlusion)
        if (!this.hasLineOfSight(target.position)) {
            return false;
        }
        
        // Check if target is moving (easier to spot)
        if (target.velocity && target.velocity.length() > 0.1) {
            return true; // Moving targets are easier to spot
        }
        
        // Check target size and visibility
        const visibility = this.calculateTargetVisibility(target);
        return visibility > this.detectionThresholds.movement;
    }
    
    /**
     * Check if position is in field of view
     */
    isInFieldOfView(position) {
        const direction = position.clone().sub(this.bot.position).normalize();
        const forward = this.bot.getForwardDirection();
        
        const angle = Math.acos(direction.dot(forward));
        return angle <= this.fieldOfView / 2;
    }
    
    /**
     * Check line of sight using raycasting
     */
    hasLineOfSight(position) {
        const direction = position.clone().sub(this.bot.position).normalize();
        const distance = this.bot.position.distanceTo(position);
        
        // Create ray from bot to target
        const ray = new THREE.Raycaster(this.bot.position, direction);
        const intersects = ray.intersectObjects(this.bot.game.scene.children);
        
        // Check if any object blocks the line of sight
        for (const intersect of intersects) {
            if (intersect.distance < distance) {
                // Check if it's a wall or obstacle
                if (intersect.object.userData.isObstacle) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Calculate target visibility based on various factors
     */
    calculateTargetVisibility(target) {
        let visibility = 1.0;
        
        // Distance factor
        const distance = this.bot.position.distanceTo(target.position);
        visibility *= Math.max(0, 1 - (distance / this.visionRange));
        
        // Size factor
        if (target.size) {
            visibility *= Math.min(1, target.size / 2.0);
        }
        
        // Movement factor
        if (target.velocity && target.velocity.length() > 0.1) {
            visibility *= 1.2; // Moving targets are more visible
        }
        
        // Lighting factor (if implemented)
        if (target.lighting) {
            visibility *= target.lighting;
        }
        
        return Math.max(0, Math.min(1, visibility));
    }
    
    /**
     * Calculate visibility confidence
     */
    calculateVisibilityConfidence(target) {
        const visibility = this.calculateTargetVisibility(target);
        const distance = this.bot.position.distanceTo(target.position);
        
        // Base confidence on visibility and distance
        let confidence = visibility;
        
        // Reduce confidence for distant targets
        confidence *= Math.max(0.3, 1 - (distance / this.visionRange));
        
        // Increase confidence for moving targets
        if (target.velocity && target.velocity.length() > 0.1) {
            confidence *= 1.1;
        }
        
        return Math.max(0, Math.min(1, confidence));
    }
    
    /**
     * Update hearing system
     */
    updateHearing(deltaTime) {
        // Get all recent sounds in the game
        const recentSounds = this.getRecentSounds();
        
        for (const sound of recentSounds) {
            if (this.canHearSound(sound)) {
                this.audibleTargets.set(sound.id, {
                    sound,
                    position: sound.position.clone(),
                    heardAt: Date.now(),
                    confidence: this.calculateHearingConfidence(sound),
                    type: sound.type
                });
                
                // Update memory with new observation
                this.memory.recordObservation(sound, 'hearing');
            }
        }
        
        // Decay old sounds
        this.decaySoundMemory(deltaTime);
    }
    
    /**
     * Check if bot can hear a sound
     */
    canHearSound(sound) {
        const distance = this.bot.position.distanceTo(sound.position);
        return distance <= this.hearingRange;
    }
    
    /**
     * Calculate hearing confidence
     */
    calculateHearingConfidence(sound) {
        const distance = this.bot.position.distanceTo(sound.position);
        const volume = sound.volume || 1.0;
        
        // Base confidence on volume and distance
        let confidence = volume * Math.max(0, 1 - (distance / this.hearingRange));
        
        // Adjust for sound type
        switch (sound.type) {
            case 'gunfire':
                confidence *= 1.5;
                break;
            case 'footsteps':
                confidence *= 0.8;
                break;
            case 'explosion':
                confidence *= 2.0;
                break;
        }
        
        return Math.max(0, Math.min(1, confidence));
    }
    
    /**
     * Update environmental awareness
     */
    updateEnvironmentalAwareness(deltaTime) {
        // Update cover spots
        this.updateCoverSpots();
        
        // Update health and ammo packs
        this.updatePickups();
        
        // Update spawn points
        this.updateSpawnPoints();
    }
    
    /**
     * Update cover spots
     */
    updateCoverSpots() {
        this.coverSpots = [];
        
        // Find nearby obstacles that could provide cover
        const nearbyObjects = this.getNearbyObjects(20);
        
        for (const obj of nearbyObjects) {
            if (obj.userData.isObstacle) {
                const coverSpot = this.analyzeCoverSpot(obj);
                if (coverSpot.quality > 0.5) {
                    this.coverSpots.push(coverSpot);
                }
            }
        }
        
        // Sort by quality
        this.coverSpots.sort((a, b) => b.quality - a.quality);
    }
    
    /**
     * Analyze a potential cover spot
     */
    analyzeCoverSpot(obj) {
        const position = obj.position.clone();
        const size = obj.userData.size || { x: 1, y: 1, z: 1 };
        
        // Calculate cover quality based on size and position
        let quality = 0.5;
        
        // Larger objects provide better cover
        quality += Math.min(0.3, (size.x + size.y + size.z) / 10);
        
        // Objects closer to bot are more useful
        const distance = this.bot.position.distanceTo(position);
        quality += Math.max(0, 0.2 - (distance / 50));
        
        // Check if cover provides protection from threats
        const threats = this.getThreats();
        for (const threat of threats) {
            if (this.isCoverEffective(position, threat.position)) {
                quality += 0.2;
            }
        }
        
        return {
            position,
            object: obj,
            quality: Math.max(0, Math.min(1, quality)),
            type: 'cover'
        };
    }
    
    /**
     * Check if cover is effective against a threat
     */
    isCoverEffective(coverPosition, threatPosition) {
        // Simple check - if cover is between bot and threat
        const botToThreat = threatPosition.clone().sub(this.bot.position);
        const botToCover = coverPosition.clone().sub(this.bot.position);
        
        const angle = Math.acos(botToThreat.normalize().dot(botToCover.normalize()));
        return angle < Math.PI / 4; // Within 45 degrees
    }
    
    /**
     * Update threat assessment
     */
    updateThreatAssessment() {
        this.threats.clear();
        this.enemies.clear();
        this.allies.clear();
        
        // Process visible targets
        for (const [id, observation] of this.visibleTargets) {
            if (observation.type === 'enemy') {
                this.enemies.set(id, observation);
                this.threats.set(id, {
                    ...observation,
                    threatLevel: this.calculateThreatLevel(observation.target)
                });
            } else if (observation.type === 'ally') {
                this.allies.set(id, observation);
            }
        }
        
        // Process audible targets
        for (const [id, observation] of this.audibleTargets) {
            if (observation.type === 'enemy') {
                this.enemies.set(id, observation);
                this.threats.set(id, {
                    ...observation,
                    threatLevel: this.calculateThreatLevel(observation.sound)
                });
            }
        }
    }
    
    /**
     * Calculate threat level for a target
     */
    calculateThreatLevel(target) {
        let threatLevel = 0.5; // Base threat level
        
        // Distance factor
        const distance = this.bot.position.distanceTo(target.position);
        threatLevel += Math.max(0, 0.3 - (distance / 50));
        
        // Health factor
        if (target.health) {
            threatLevel += (1 - target.health) * 0.2;
        }
        
        // Weapon factor
        if (target.weapon) {
            threatLevel += target.weapon.damage * 0.1;
        }
        
        // Movement factor
        if (target.velocity && target.velocity.length() > 0.1) {
            threatLevel += 0.1;
        }
        
        return Math.max(0, Math.min(1, threatLevel));
    }
    
    /**
     * Get vision range based on difficulty
     */
    getVisionRange() {
        const ranges = {
            easy: 15,
            medium: 25,
            hard: 35,
            expert: 45
        };
        return ranges[this.brain.difficulty] || 25;
    }
    
    /**
     * Get field of view based on difficulty
     */
    getFieldOfView() {
        const fovs = {
            easy: Math.PI / 3, // 60 degrees
            medium: Math.PI / 2, // 90 degrees
            hard: Math.PI * 2 / 3, // 120 degrees
            expert: Math.PI * 3 / 4 // 135 degrees
        };
        return fovs[this.brain.difficulty] || Math.PI / 2;
    }
    
    /**
     * Get hearing range based on difficulty
     */
    getHearingRange() {
        const ranges = {
            easy: 20,
            medium: 30,
            hard: 40,
            expert: 50
        };
        return ranges[this.brain.difficulty] || 30;
    }
    
    /**
     * Get potential targets in range
     */
    getPotentialTargets() {
        // Get all bots and player from the game
        const targets = [];
        
        // Add player if exists
        if (this.bot.game.player && this.bot.game.player.mesh) {
            targets.push({
                id: 'player',
                position: this.bot.game.player.mesh.position,
                team: 'player',
                health: this.bot.game.player.health || 1.0,
                velocity: this.bot.game.player.velocity || new THREE.Vector3(),
                mesh: this.bot.game.player.mesh
            });
        }
        
        // Add other bots
        const allBots = this.bot.game.getBots();
        allBots.forEach(bot => {
            if (bot.id !== this.bot.id && bot.isAlive) {
                targets.push({
                    id: bot.id,
                    position: bot.position,
                    team: bot.team,
                    health: bot.health,
                    velocity: bot.velocity,
                    mesh: bot.mesh
                });
            }
        });
        
        return targets;
    }
    
    /**
     * Get recent sounds
     */
    getRecentSounds() {
        // This would integrate with the game's audio system
        // For now, return empty array - will be implemented when integrated
        return [];
    }
    
    /**
     * Get nearby objects
     */
    getNearbyObjects(range) {
        // This would integrate with the game's scene system
        // For now, return empty array - will be implemented when integrated
        return [];
    }
    
    /**
     * Classify target type
     */
    classifyTarget(target) {
        // Simple classification - would be more sophisticated in practice
        if (target.team && target.team !== this.bot.team) {
            return 'enemy';
        } else if (target.team && target.team === this.bot.team) {
            return 'ally';
        } else {
            return 'neutral';
        }
    }
    
    /**
     * Update environmental objects
     */
    updateEnvironmentalObjects() {
        // Update health packs, ammo packs, etc.
        // This would integrate with the game's pickup system
    }
    
    /**
     * Update pickups
     */
    updatePickups() {
        // This would integrate with the game's pickup system
    }
    
    /**
     * Update spawn points
     */
    updateSpawnPoints() {
        // This would integrate with the game's spawn system
    }
    
    /**
     * Decay old observations
     */
    decayObservations(deltaTime) {
        const currentTime = Date.now();
        const decayTime = 2000; // 2 seconds
        
        // Decay visible targets
        for (const [id, observation] of this.visibleTargets) {
            if (currentTime - observation.lastSeen > decayTime) {
                this.visibleTargets.delete(id);
            }
        }
        
        // Decay audible targets
        for (const [id, observation] of this.audibleTargets) {
            if (currentTime - observation.heardAt > decayTime) {
                this.audibleTargets.delete(id);
            }
        }
    }
    
    /**
     * Decay sound memory
     */
    decaySoundMemory(deltaTime) {
        const currentTime = Date.now();
        
        for (const [id, sound] of this.soundMemory) {
            if (currentTime - sound.timestamp > this.soundDecayTime * 1000) {
                this.soundMemory.delete(id);
            }
        }
    }
    
    // Public API methods
    
    /**
     * Get all threats
     */
    getThreats() {
        return Array.from(this.threats.values());
    }
    
    /**
     * Get nearest threat
     */
    getNearestThreat() {
        let nearest = null;
        let nearestDistance = Infinity;
        
        for (const threat of this.threats.values()) {
            const distance = this.bot.position.distanceTo(threat.position);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = threat;
            }
        }
        
        return nearest;
    }
    
    /**
     * Get overall threat level
     */
    getThreatLevel() {
        if (this.threats.size === 0) return 0;
        
        let totalThreat = 0;
        for (const threat of this.threats.values()) {
            totalThreat += threat.threatLevel;
        }
        
        return Math.min(1, totalThreat / this.threats.size);
    }
    
    /**
     * Get all allies
     */
    getAllies() {
        return Array.from(this.allies.values());
    }
    
    /**
     * Get all enemies
     */
    getEnemies() {
        return Array.from(this.enemies.values());
    }
    
    /**
     * Find cover spots
     */
    findCover() {
        return this.coverSpots.slice(0, 5); // Return top 5 cover spots
    }
    
    /**
     * Get best cover spot
     */
    getBestCover() {
        return this.coverSpots[0] || null;
    }
    
    /**
     * Check if position is safe
     */
    isPositionSafe(position) {
        // Check if position is exposed to threats
        for (const threat of this.threats.values()) {
            if (this.hasLineOfSight(position)) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            visionRange: this.visionRange,
            fieldOfView: this.fieldOfView,
            hearingRange: this.hearingRange,
            visibleTargets: this.visibleTargets.size,
            audibleTargets: this.audibleTargets.size,
            threats: this.threats.size,
            allies: this.allies.size,
            enemies: this.enemies.size,
            coverSpots: this.coverSpots.length
        };
    }
}
