/**
 * BotCombat - Advanced Combat System for AI Bots
 * 
 * This system provides sophisticated combat capabilities including:
 * - Tactical weapon handling and aiming
 * - Target prioritization and threat assessment
 * - Cover usage and positioning
 * - Flanking and ambush tactics
 * - Suppressive fire and area denial
 * - Team coordination and communication
 * - Adaptive combat strategies
 */

export class BotCombat {
    constructor(brain) {
        this.brain = brain;
        this.bot = brain.bot;
        
        // Combat parameters
        this.accuracy = this.getAccuracy();
        this.reactionTime = this.getReactionTime();
        this.aggression = this.getAggression();
        this.caution = this.getCaution();
        this.teamwork = this.getTeamwork();
        
        // Weapon system
        this.currentWeapon = null;
        this.weaponSkills = new Map(); // Weapon-specific skills
        this.aimingMode = 'auto'; // auto, manual, burst, single
        this.aimingTarget = null;
        this.aimingOffset = new THREE.Vector3();
        
        // Combat state
        this.combatState = 'idle'; // idle, engaging, reloading, taking_cover
        this.currentTarget = null;
        this.targetPriority = [];
        this.threats = new Map();
        this.allies = new Map();
        
        // Tactical parameters
        this.engagementRange = this.getEngagementRange();
        this.optimalRange = this.getOptimalRange();
        this.minimumRange = this.getMinimumRange();
        this.coverUsage = 0.8; // How much to use cover (0-1)
        this.flankingPreference = 0.6; // How much to prefer flanking (0-1)
        
        // Performance tracking
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.damageDealt = 0;
        this.damageTaken = 0;
        this.kills = 0;
        this.deaths = 0;
        this.assists = 0;
        
        // Combat memory
        this.combatHistory = [];
        this.targetHistory = new Map();
        this.positionHistory = [];
        
        // Team coordination
        this.teamRole = 'assault'; // assault, support, sniper, medic
        this.teamPosition = null;
        this.teamObjectives = [];
        
    }
    
    /**
     * Main update loop
     */
    update(deltaTime) {
        // Update combat state
        this.updateCombatState(deltaTime);
        
        // Update target acquisition
        this.updateTargetAcquisition(deltaTime);
        
        // Update weapon handling
        this.updateWeaponHandling(deltaTime);
        
        // Update tactical positioning
        this.updateTacticalPositioning(deltaTime);
        
        // Update team coordination
        this.updateTeamCoordination(deltaTime);
        
        // Update combat memory
        this.updateCombatMemory(deltaTime);
    }
    
    /**
     * Update combat state
     */
    updateCombatState(deltaTime) {
        const threats = this.brain.senses.getThreats();
        const threatLevel = this.brain.senses.getThreatLevel();
        
        // Determine combat state based on threats
        if (threats.length === 0) {
            this.combatState = 'idle';
        } else if (threatLevel > 0.7) {
            this.combatState = 'engaging';
        } else if (threatLevel > 0.4) {
            this.combatState = 'alert';
        } else {
            this.combatState = 'cautious';
        }
        
        // Handle weapon reloading
        if (this.currentWeapon && this.currentWeapon.ammo === 0) {
            this.combatState = 'reloading';
            this.reloadWeapon();
        }
    }
    
    /**
     * Update target acquisition
     */
    updateTargetAcquisition(deltaTime) {
        // Get potential targets
        const enemies = this.brain.senses.getEnemies();
        
        if (enemies.length === 0) {
            this.currentTarget = null;
            return;
        }
        
        // Prioritize targets
        this.prioritizeTargets(enemies);
        
        // Select best target
        if (this.targetPriority.length > 0) {
            const bestTarget = this.targetPriority[0];
            if (this.currentTarget !== bestTarget.enemy) {
                this.switchTarget(bestTarget.enemy);
            }
        }
        
        // Update aiming
        if (this.currentTarget) {
            this.updateAiming(deltaTime);
        }
    }
    
    /**
     * Prioritize targets based on multiple factors
     */
    prioritizeTargets(enemies) {
        this.targetPriority = enemies.map(enemy => ({
            enemy,
            score: this.calculateTargetScore(enemy)
        })).sort((a, b) => b.score - a.score);
    }
    
    /**
     * Calculate target score for prioritization
     */
    calculateTargetScore(enemy) {
        let score = 0;
        const pos = enemy.position;
        if (!pos) return 0;

        const distance = this.bot.position.distanceTo(pos);
        score += Math.max(0, 1 - (distance / this.engagementRange));

        if (enemy.threatLevel) {
            score += enemy.threatLevel * 0.3;
        }

        const health = enemy.health ?? enemy.target?.health;
        if (health !== undefined) {
            // Normalize if health looks like 0-100
            const ratio = health > 1.5 ? health / 100 : health;
            score += (1 - ratio) * 0.2;
        }

        if (enemy.weapon) {
            score += (enemy.weapon.damage ?? 0) * 0.1;
        }

        if (enemy.confidence) {
            score += enemy.confidence * 0.2;
        }

        if (enemy.targetingAllies) {
            score += 0.3;
        }

        score *= this.aggression;
        return Math.max(0, Math.min(1, score));
    }
    
    /**
     * Switch to a new target
     */
    switchTarget(newTarget) {
        // Flatten observation wrappers so position/health are always on the target
        let target = newTarget;
        if (newTarget && newTarget.target && newTarget.position) {
            target = {
                id: newTarget.target.id || newTarget.id,
                position: newTarget.position.clone
                    ? newTarget.position.clone()
                    : new THREE.Vector3().copy(newTarget.position),
                health: newTarget.target.health ?? newTarget.health ?? 100,
                team: newTarget.target.team ?? newTarget.team,
                mesh: newTarget.target.mesh ?? newTarget.mesh,
                threatLevel: newTarget.threatLevel,
                confidence: newTarget.confidence
            };
        }

        if (!target || !target.position) {
            console.warn(`BotCombat.switchTarget: Invalid target provided`, newTarget);
            return;
        }

        if (this.currentTarget) {
            this.recordTargetEngagement(this.currentTarget, false);
        }

        this.currentTarget = target;
        this.aimingTarget = target.position.clone
            ? target.position.clone()
            : new THREE.Vector3(target.position.x, target.position.y, target.position.z);
        this.targetAcquiredTime = Date.now();

        this.recordTargetEngagement(target, true);
        this.combatState = 'engaging';
    }
    
    /**
     * Update aiming system
     */
    updateAiming(deltaTime) {
        if (!this.currentTarget || !this.aimingTarget) return;
        if (!this.aimingTarget || isNaN(this.aimingTarget.x)) return;

        const aimPos = this.currentTarget.position || this.aimingTarget;
        if (!aimPos || isNaN(aimPos.x)) return;

        this.aimingTarget.copy(aimPos);

        const desiredDirection = this.aimingTarget.clone().sub(this.bot.position);
        desiredDirection.y = 0;
        if (desiredDirection.lengthSq() < 0.0001) return;
        desiredDirection.normalize();

        const accuracyModifier = this.calculateAccuracyModifier();
        this.aimingOffset = this.calculateAimingOffset(accuracyModifier);

        const finalDirection = desiredDirection.clone().add(this.aimingOffset);
        if (finalDirection.lengthSq() < 0.0001 || isNaN(finalDirection.x)) return;
        finalDirection.normalize();

        // Three.js forward is -Z → use atan2(-x, -z)
        const targetRotation = Math.atan2(-finalDirection.x, -finalDirection.z);
        if (isNaN(targetRotation)) return;

        const lerpFactor = Math.min(1, Math.max(0, this.reactionTime * deltaTime * 2));
        // Don't fight locomotion facing while sprinting toward/away
        const movingFast = this.bot.velocity && this.bot.velocity.length() > 1.5;
        if (!movingFast) {
            const nextY = THREE.MathUtils.lerp(this.bot.rotation.y, targetRotation, lerpFactor);
            if (!isNaN(nextY)) {
                this.bot.rotation.y = nextY;
            }
        }

        if (this.isReadyToFire()) {
            this.fireWeapon();
        }
    }

    /**
     * Calculate accuracy modifier based on various factors
     */
    calculateAccuracyModifier() {
        let modifier = this.accuracy || 0.6;

        if (this.currentTarget && this.currentTarget.position) {
            const distance = this.bot.position.distanceTo(this.currentTarget.position);
            modifier *= Math.max(0.3, 1 - (distance / this.engagementRange));
        }

        if (this.bot.velocity && this.bot.velocity.length() > 0.1) {
            modifier *= 0.7;
        }

        // Bot health is 0-100; normalize
        const healthRatio = this.bot.health / (this.bot.maxHealth || 100);
        if (healthRatio < 0.5) {
            modifier *= 0.8;
        }

        if (this.currentWeapon) {
            modifier *= (this.currentWeapon.accuracy ?? 1);
        }

        if (isNaN(modifier)) modifier = 0.5;
        return Math.max(0.1, Math.min(1, modifier));
    }
    
    /**
     * Calculate aiming offset for accuracy simulation
     */
    calculateAimingOffset(accuracyModifier) {
        const maxOffset = (1 - accuracyModifier) * 0.1; // Maximum offset in radians
        const offsetX = (Math.random() - 0.5) * maxOffset;
        const offsetZ = (Math.random() - 0.5) * maxOffset;
        
        return new THREE.Vector3(offsetX, 0, offsetZ);
    }
    
    /**
     * Check if ready to fire
     */
    isReadyToFire() {
        if (!this.currentTarget || !this.currentWeapon) return false;

        if (this.currentWeapon.ammo === 0) return false;
        if (this.currentWeapon.isReloading) return false;

        const now = Date.now();
        if (now - (this.currentWeapon.lastFireTime || 0) < (this.currentWeapon.fireRate || 0.15) * 1000) {
            return false;
        }

        if (!this.currentTarget.position) return false;
        const distance = this.bot.position.distanceTo(this.currentTarget.position);
        if (distance > this.engagementRange) return false;

        // Use flattened target or original observation for LOS
        if (!this.brain.senses.canSeeTarget(this.currentTarget)) return false;

        const timeSinceTargetAcquired = now - (this.targetAcquiredTime || 0);
        if (timeSinceTargetAcquired < this.reactionTime * 1000) return false;

        return true;
    }

    /**
     * Fire weapon at current target
     */
    fireWeapon() {
        if (!this.currentWeapon || !this.currentTarget || !this.aimingTarget) return;

        const fireDirection = this.aimingTarget.clone().sub(this.bot.position);
        fireDirection.y += 1.0; // Aim toward torso
        if (this.aimingOffset) {
            fireDirection.add(this.aimingOffset);
        }
        if (fireDirection.lengthSq() < 0.0001 || isNaN(fireDirection.x)) return;
        fireDirection.normalize();

        this.currentWeapon.fire(fireDirection);
        this.shotsFired++;

        if (this.checkHit(this.currentTarget)) {
            this.shotsHit++;
            const dmg = this.currentWeapon.damage ?? 20;
            this.damageDealt += dmg;

            // Apply damage to actual bot entity if known
            const targetId = this.currentTarget.id;
            if (targetId && targetId !== 'player') {
                const bots = this.bot.game.getBots?.() || [];
                const hitBot = bots.find(b => b.id === targetId);
                if (hitBot && hitBot.takeDamage) {
                    hitBot.takeDamage(dmg, this.bot);
                }
            } else if (targetId === 'player' && this.bot.game.player) {
                if (this.bot.game.player.takeDamage) {
                    this.bot.game.player.takeDamage(dmg, this.bot);
                } else {
                    this.bot.game.player.health = Math.max(
                        0,
                        (this.bot.game.player.health || 1) - dmg / 100
                    );
                }
            }

            if (this.currentTarget.health !== undefined && this.currentTarget.health <= 0) {
                this.kills++;
                this.recordKill(this.currentTarget);
            }
        }

        this.recordShot(this.currentTarget, fireDirection);
    }
    
    /**
     * Check if shot hits target
     */
    checkHit(target) {
        if (!target) return false;
        
        // Calculate hit probability based on accuracy
        const hitProbability = this.calculateAccuracyModifier();
        return Math.random() < hitProbability;
    }
    
    /**
     * Update weapon handling
     */
    updateWeaponHandling(deltaTime) {
        if (!this.currentWeapon) return;
        
        // Update weapon state
        this.currentWeapon.update(deltaTime);
        
        // Handle reloading
        if (this.currentWeapon.needsReload() && this.combatState !== 'reloading') {
            this.reloadWeapon();
        }
        
        // Update weapon skills
        this.updateWeaponSkills(deltaTime);
    }
    
    /**
     * Reload weapon
     */
    reloadWeapon() {
        if (!this.currentWeapon) return;
        
        this.combatState = 'reloading';
        this.currentWeapon.reload();
        
        // Find cover while reloading
        this.findCoverWhileReloading();
    }
    
    /**
     * Find cover while reloading
     */
    findCoverWhileReloading() {
        const coverSpots = this.brain.senses.findCover();
        if (coverSpots.length > 0) {
            const bestCover = coverSpots[0];
            this.brain.movement.moveTo(bestCover.position);
        }
    }
    
    /**
     * Update weapon skills
     */
    updateWeaponSkills(deltaTime) {
        const weaponType = this.currentWeapon.type;
        const currentSkill = this.weaponSkills.get(weaponType) || {
            level: 0,
            experience: 0,
            accuracy: 0.5,
            reloadSpeed: 1.0,
            damage: 1.0
        };
        
        // Gain experience from use
        currentSkill.experience += deltaTime * 0.1;
        
        // Level up based on experience
        if (currentSkill.experience > 100) {
            currentSkill.level++;
            currentSkill.experience = 0;
            currentSkill.accuracy = Math.min(1, currentSkill.accuracy + 0.05);
            currentSkill.reloadSpeed = Math.max(0.5, currentSkill.reloadSpeed - 0.05);
            currentSkill.damage = Math.min(1.5, currentSkill.damage + 0.02);
        }
        
        this.weaponSkills.set(weaponType, currentSkill);
    }
    
    /**
     * Update tactical positioning — defer to movement decisions to avoid fight/jerk
     */
    updateTacticalPositioning(deltaTime) {
        // Disabled continuous repositioning — BotMovement hunt/patrol owns targets
        return;
    }
    
    /**
     * Calculate optimal position for combat
     */
    calculateOptimalPosition() {
        if (!this.currentTarget) return null;
        
        const targetPosition = this.currentTarget.position;
        const currentPosition = this.bot.position;
        const distance = currentPosition.distanceTo(targetPosition);
        
        // Determine desired distance
        let desiredDistance = this.optimalRange;
        
        // Adjust based on weapon type
        if (this.currentWeapon) {
            switch (this.currentWeapon.type) {
                case 'sniper':
                    desiredDistance = this.engagementRange * 0.8;
                    break;
                case 'shotgun':
                    desiredDistance = this.minimumRange * 2;
                    break;
                case 'rifle':
                    desiredDistance = this.optimalRange;
                    break;
            }
        }
        
        // Calculate position
        const direction = currentPosition.clone().sub(targetPosition).normalize();
        const optimalPosition = targetPosition.clone().add(direction.multiplyScalar(desiredDistance));
        
        // Find cover near optimal position
        const coverSpots = this.brain.senses.findCover();
        for (const cover of coverSpots) {
            if (cover.position.distanceTo(optimalPosition) < 5) {
                return cover.position;
            }
        }
        
        return optimalPosition;
    }
    
    /**
     * Update team coordination
     */
    updateTeamCoordination(deltaTime) {
        // This would integrate with team communication system
        // For now, implement basic team behaviors
        
        const allies = this.brain.senses.getAllies();
        if (allies.length > 0) {
            this.coordinateWithAllies(allies);
        }
    }
    
    /**
     * Coordinate with allies
     */
    coordinateWithAllies(allies) {
        // Basic team coordination
        for (const ally of allies) {
            // Share target information
            if (ally.currentTarget && !this.currentTarget) {
                this.switchTarget(ally.currentTarget);
            }
            
            // Provide covering fire
            if (ally.combatState === 'reloading') {
                this.provideCoveringFire(ally);
            }
        }
    }
    
    /**
     * Provide covering fire for ally
     */
    provideCoveringFire(ally) {
        // Fire at threats near the ally
        const threats = this.brain.senses.getThreats();
        for (const threat of threats) {
            if (threat.position.distanceTo(ally.position) < 10) {
                this.switchTarget(threat);
                break;
            }
        }
    }
    
    /**
     * Update combat memory
     */
    updateCombatMemory(deltaTime) {
        // Record current position
        this.positionHistory.push({
            position: this.bot.position.clone(),
            timestamp: Date.now(),
            combatState: this.combatState
        });
        
        // Keep only recent positions
        if (this.positionHistory.length > 100) {
            this.positionHistory.shift();
        }
        
        // Record combat events
        if (this.combatState === 'engaging') {
            this.recordCombatEvent('engaging', this.currentTarget);
        }
    }
    
    /**
     * Record combat event
     */
    recordCombatEvent(eventType, target) {
        const event = {
            type: eventType,
            target: target,
            timestamp: Date.now(),
            position: this.bot.position.clone(),
            weapon: this.currentWeapon?.type,
            success: false // Will be updated later
        };
        
        this.combatHistory.push(event);
        
        // Keep only recent events
        if (this.combatHistory.length > 50) {
            this.combatHistory.shift();
        }
    }
    
    /**
     * Record target engagement
     */
    recordTargetEngagement(target, engaged) {
        const id = target?.id ?? 'unknown';
        if (!this.targetHistory.has(id)) {
            this.targetHistory.set(id, {
                target,
                engagements: [],
                totalDamage: 0,
                kills: 0
            });
        }

        const history = this.targetHistory.get(id);
        history.engagements.push({
            engaged,
            timestamp: Date.now(),
            position: this.bot.position.clone()
        });
    }
    
    /**
     * Record shot
     */
    recordShot(target, direction) {
        const shot = {
            target,
            direction: direction.clone(),
            timestamp: Date.now(),
            position: this.bot.position.clone(),
            weapon: this.currentWeapon?.type
        };
        
        // This would be used for learning and improvement
    }
    
    /**
     * Record kill
     */
    recordKill(target) {
        if (this.targetHistory.has(target.id)) {
            const history = this.targetHistory.get(target.id);
            history.kills++;
        }
        
        // Update combat history
        const recentEvents = this.combatHistory.slice(-5);
        for (const event of recentEvents) {
            if (event.target === target) {
                event.success = true;
            }
        }
    }
    
    /**
     * Execute combat action
     */
    executeAction(action, situation) {
        switch (action) {
            case 'combat_engage':
                this.engageTarget(situation.nearestThreat);
                break;
            case 'combat_retreat':
                this.retreatFromThreat(situation.nearestThreat);
                break;
            case 'combat_flank':
                this.flankTarget(situation.nearestThreat);
                break;
            case 'combat_suppress':
                this.suppressTarget(situation.nearestThreat);
                break;
        }
    }
    
    /**
     * Engage target
     */
    engageTarget(target) {
        if (target) {
            this.switchTarget(target);
            this.combatState = 'engaging';
        }
    }
    
    /**
     * Retreat from threat
     */
    retreatFromThreat(threat) {
        if (threat) {
            const retreatDirection = this.bot.position.clone().sub(threat.position).normalize();
            const retreatPosition = this.bot.position.clone().add(retreatDirection.multiplyScalar(15));
            this.brain.movement.moveTo(retreatPosition);
            this.combatState = 'retreating';
        }
    }
    
    /**
     * Flank target
     */
    flankTarget(target) {
        if (target) {
            // Calculate flanking position
            const flankDirection = new THREE.Vector3(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize();
            
            const flankPosition = target.position.clone().add(flankDirection.multiplyScalar(8));
            this.brain.movement.moveTo(flankPosition);
            this.combatState = 'flanking';
        }
    }
    
    /**
     * Suppress target
     */
    suppressTarget(target) {
        if (target) {
            this.switchTarget(target);
            this.combatState = 'suppressing';
            // Fire continuously to suppress
        }
    }
    
    /**
     * Get accuracy based on difficulty
     */
    getAccuracy() {
        const accuracies = {
            easy: 0.4,
            medium: 0.6,
            hard: 0.8,
            expert: 0.9
        };
        return accuracies[this.brain.difficulty] || 0.6;
    }
    
    /**
     * Get reaction time based on difficulty
     */
    getReactionTime() {
        const reactionTimes = {
            easy: 0.8,
            medium: 0.5,
            hard: 0.3,
            expert: 0.2
        };
        return reactionTimes[this.brain.difficulty] || 0.5;
    }
    
    /**
     * Get aggression based on difficulty
     */
    getAggression() {
        const aggressions = {
            easy: 0.3,
            medium: 0.5,
            hard: 0.7,
            expert: 0.9
        };
        return aggressions[this.brain.difficulty] || 0.5;
    }
    
    /**
     * Get caution based on difficulty
     */
    getCaution() {
        const cautions = {
            easy: 0.8,
            medium: 0.6,
            hard: 0.4,
            expert: 0.2
        };
        return cautions[this.brain.difficulty] || 0.6;
    }
    
    /**
     * Get teamwork based on difficulty
     */
    getTeamwork() {
        const teamworks = {
            easy: 0.3,
            medium: 0.5,
            hard: 0.7,
            expert: 0.9
        };
        return teamworks[this.brain.difficulty] || 0.5;
    }
    
    /**
     * Get engagement range based on difficulty
     */
    getEngagementRange() {
        const ranges = {
            easy: 15,
            medium: 20,
            hard: 25,
            expert: 30
        };
        return ranges[this.brain.difficulty] || 20;
    }
    
    /**
     * Get optimal range based on difficulty
     */
    getOptimalRange() {
        const ranges = {
            easy: 8,
            medium: 12,
            hard: 16,
            expert: 20
        };
        return ranges[this.brain.difficulty] || 12;
    }
    
    /**
     * Get minimum range based on difficulty
     */
    getMinimumRange() {
        const ranges = {
            easy: 3,
            medium: 4,
            hard: 5,
            expert: 6
        };
        return ranges[this.brain.difficulty] || 4;
    }
    
    // Public API methods
    
    /**
     * Set weapon
     */
    setWeapon(weapon) {
        this.currentWeapon = weapon;
    }
    
    /**
     * Get current target
     */
    getCurrentTarget() {
        return this.currentTarget;
    }
    
    /**
     * Get combat state
     */
    getCombatState() {
        return this.combatState;
    }
    
    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        return {
            shotsFired: this.shotsFired,
            shotsHit: this.shotsHit,
            accuracy: this.shotsFired > 0 ? this.shotsHit / this.shotsFired : 0,
            damageDealt: this.damageDealt,
            damageTaken: this.damageTaken,
            kills: this.kills,
            deaths: this.deaths,
            assists: this.assists
        };
    }
    
    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            combatState: this.combatState,
            currentTarget: this.currentTarget?.id,
            targetPriority: this.targetPriority.length,
            threats: this.threats.size,
            allies: this.allies.size,
            weapon: this.currentWeapon?.type,
            accuracy: this.accuracy,
            reactionTime: this.reactionTime,
            aggression: this.aggression,
            caution: this.caution,
            teamwork: this.teamwork
        };
    }
    
    /**
     * Reset combat system
     */
    reset() {
        this.combatState = 'idle';
        this.currentTarget = null;
        this.targetPriority = [];
        this.threats.clear();
        this.allies.clear();
        this.aimingTarget = null;
        this.aimingOffset.set(0, 0, 0);
        this.combatHistory = [];
        this.targetHistory.clear();
        this.positionHistory = [];
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.damageDealt = 0;
        this.damageTaken = 0;
        this.kills = 0;
        this.deaths = 0;
        this.assists = 0;
    }
}
