/**
 * BotBrain — lean tactical AI
 * Patrol when idle; chase, face, and shoot enemies. No heavy decision-tree thrash.
 * // [TRACE: SCRATCHPAD.md]
 */

import { BotSenses } from './BotSenses.js';
import { BotMemory } from './BotMemory.js';
import { BotPersonality } from './BotPersonality.js';
import { BotCombat } from './BotCombat.js';
import { BotMovement } from './BotMovement.js';

export class BotBrain {
    constructor(bot, difficulty = 'medium') {
        this.bot = bot;
        this.difficulty = difficulty;

        this.senses = new BotSenses(this);
        this.memory = new BotMemory(this);
        this.personality = new BotPersonality(this, difficulty);
        this.combat = new BotCombat(this);
        this.movement = new BotMovement(this);

        this.currentState = 'patrol';
        this.stateHistory = [];
        this.lastDecisionTime = 0;
        this.decisionInterval = 0.2;

        this.engageRange = this.getEngageRange();
        this.shootRange = this.getShootRange();
        this.visionRange = this.getVisionRange();
        this.aimTurnSpeed = 8.0;

        this.activeEnemy = null;
        this.performanceMetrics = {
            kills: 0,
            deaths: 0,
            accuracy: 0,
            survivalTime: 0,
            damageDealt: 0,
            damageTaken: 0
        };

        this.learningRate = this.getLearningRate();
        this.behaviorWeights = this.initializeBehaviorWeights();
    }

    /**
     * Main update — simple FSM: patrol | chase | attack
     */
    update(deltaTime) {
        try {
            const dt = Math.min(deltaTime, 0.05);

            // Keep subsystems alive for memory/personality APIs, but drive combat ourselves
            this.memory.update(dt);

            const enemy = this.findBestEnemy();
            this.activeEnemy = enemy;

            if (enemy) {
                this.runCombatBehavior(enemy, dt);
            } else {
                this.runPatrolBehavior(dt);
            }

            this.movement.update(dt);
            this.applyFacing(enemy, dt);
            this.updatePerformanceMetrics(dt);
        } catch (error) {
            console.error(`Bot ${this.bot.id} brain error:`, error);
            this.recoverSystems();
        }
    }

    runPatrolBehavior(dt) {
        this.currentState = 'patrol';
        this.combat.currentTarget = null;
        this.movement.executePatrol({});
    }

    runCombatBehavior(enemy, dt) {
        const dist = this.horizontalDist(this.bot.position, enemy.position);

        if (dist > this.engageRange) {
            this.currentState = 'chase';
        } else {
            this.currentState = 'attack';
        }

        // Move toward a standoff point (don't stand on top of target)
        const standoff = Math.min(6.0, this.shootRange * 0.45);
        const toEnemy = new THREE.Vector3(
            enemy.position.x - this.bot.position.x,
            0,
            enemy.position.z - this.bot.position.z
        );
        if (toEnemy.lengthSq() > 0.0001) {
            toEnemy.normalize();
            if (dist > standoff + 1.0) {
                const dest = enemy.position.clone().sub(toEnemy.clone().multiplyScalar(standoff));
                dest.y = this.bot.position.y;
                this.movement.setTarget(dest);
            } else if (dist < standoff - 1.5) {
                // Back up a bit
                const dest = this.bot.position.clone().sub(toEnemy.clone().multiplyScalar(3));
                dest.y = this.bot.position.y;
                this.movement.setTarget(dest);
            } else {
                // Strafe / hold — clear move target so they stop and shoot
                this.movement.currentTarget = null;
                this.movement.velocity.multiplyScalar(0.85);
            }
        }

        // Shoot when roughly facing and in range
        if (dist <= this.shootRange && this.isFacing(enemy.position, 0.55)) {
            this.fireAt(enemy);
        }
    }

    /**
     * Face enemy when fighting; otherwise face travel direction
     */
    applyFacing(enemy, dt) {
        let targetYaw = null;

        if (enemy && enemy.position &&
            (this.currentState === 'attack' || this.currentState === 'chase')) {
            const dx = enemy.position.x - this.bot.position.x;
            const dz = enemy.position.z - this.bot.position.z;
            if (dx * dx + dz * dz > 0.01) {
                // Three.js forward is -Z
                targetYaw = Math.atan2(-dx, -dz);
            }
        } else if (this.bot.velocity.lengthSq() > 0.05) {
            targetYaw = Math.atan2(-this.bot.velocity.x, -this.bot.velocity.z);
        } else if (this.movement.currentTarget) {
            const dx = this.movement.currentTarget.x - this.bot.position.x;
            const dz = this.movement.currentTarget.z - this.bot.position.z;
            if (dx * dx + dz * dz > 0.01) {
                targetYaw = Math.atan2(-dx, -dz);
            }
        }

        if (targetYaw === null || isNaN(targetYaw)) return;

        // Shortest-path yaw lerp
        let delta = targetYaw - this.bot.rotation.y;
        while (delta > Math.PI) delta -= Math.PI * 2;
        while (delta < -Math.PI) delta += Math.PI * 2;
        const step = Math.max(-this.aimTurnSpeed * dt, Math.min(this.aimTurnSpeed * dt, delta));
        this.bot.rotation.y += step;

        // Sync mesh immediately so vision/forward match
        if (this.bot.mesh) {
            this.bot.mesh.rotation.y = this.bot.rotation.y;
        }
    }

    fireAt(enemy) {
        const weapon = this.bot.weapon;
        if (!weapon || weapon.ammo <= 0) {
            if (weapon && weapon.needsReload && weapon.needsReload()) weapon.reload();
            return;
        }

        const aim = new THREE.Vector3(
            enemy.position.x - this.bot.position.x,
            (enemy.position.y + 1.0) - (this.bot.position.y + 1.2),
            enemy.position.z - this.bot.position.z
        );
        if (aim.lengthSq() < 0.0001) return;
        aim.normalize();

        // Small inaccuracy by difficulty
        const spread = this.difficulty === 'easy' ? 0.08
            : this.difficulty === 'medium' ? 0.04
            : this.difficulty === 'hard' ? 0.02 : 0.01;
        aim.x += (Math.random() - 0.5) * spread;
        aim.y += (Math.random() - 0.5) * spread * 0.5;
        aim.z += (Math.random() - 0.5) * spread;
        aim.normalize();

        weapon.fire(aim);
        this.combat.shotsFired = (this.combat.shotsFired || 0) + 1;
    }

    isFacing(worldPos, minDot = 0.5) {
        const forward = this.bot.getForwardDirection();
        forward.y = 0;
        if (forward.lengthSq() < 0.0001) return false;
        forward.normalize();

        const to = new THREE.Vector3(
            worldPos.x - this.bot.position.x,
            0,
            worldPos.z - this.bot.position.z
        );
        if (to.lengthSq() < 0.0001) return true;
        to.normalize();
        return forward.dot(to) >= minDot;
    }

    findBestEnemy() {
        const candidates = [];
        const myTeam = this.bot.team;
        const origin = this.bot.position;

        // Player (opposite team only)
        const player = this.bot.game.player;
        if (player && player.mesh && (player.health ?? 1) > 0) {
            const pTeam = player.team || 'red';
            if (pTeam !== myTeam) {
                const pos = player.mesh.position;
                const d = this.horizontalDist(origin, pos);
                if (d <= this.visionRange) {
                    candidates.push({
                        id: 'player',
                        position: pos,
                        health: (player.health ?? 1) * 100,
                        team: pTeam,
                        dist: d
                    });
                }
            }
        }

        // Other bots
        const bots = this.bot.game.getBots?.() || [];
        for (const other of bots) {
            if (!other.isAlive || other.id === this.bot.id || other.team === myTeam) continue;
            const d = this.horizontalDist(origin, other.position);
            if (d <= this.visionRange) {
                candidates.push({
                    id: other.id,
                    position: other.position,
                    health: other.health,
                    team: other.team,
                    dist: d,
                    bot: other
                });
            }
        }

        if (candidates.length === 0) return null;
        candidates.sort((a, b) => a.dist - b.dist);
        return candidates[0];
    }

    horizontalDist(a, b) {
        const dx = a.x - b.x;
        const dz = a.z - b.z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    recoverSystems() {
        this.senses = new BotSenses(this);
        this.memory = new BotMemory(this);
        this.personality = new BotPersonality(this, this.difficulty);
        this.combat = new BotCombat(this);
        this.movement = new BotMovement(this);
        if (this.bot.weapon) this.combat.setWeapon(this.bot.weapon);
        this.bot.senses = this.senses;
        this.bot.memory = this.memory;
        this.bot.personality = this.personality;
        this.bot.combat = this.combat;
        this.bot.movement = this.movement;
    }

    getEngageRange() {
        return { easy: 35, medium: 45, hard: 55, expert: 65 }[this.difficulty] || 45;
    }

    getShootRange() {
        return { easy: 18, medium: 25, hard: 32, expert: 40 }[this.difficulty] || 25;
    }

    getVisionRange() {
        return { easy: 40, medium: 55, hard: 70, expert: 90 }[this.difficulty] || 55;
    }

    getLearningRate() {
        return { easy: 0.1, medium: 0.3, hard: 0.5, expert: 0.7 }[this.difficulty] || 0.3;
    }

    initializeBehaviorWeights() {
        return {
            aggression: this.personality.getEffectiveAggression(),
            caution: this.personality.getEffectiveCaution(),
            teamwork: this.personality.getEffectiveTeamwork(),
            adaptability: this.personality.getEffectiveAdaptability()
        };
    }

    updatePerformanceMetrics(deltaTime) {
        this.performanceMetrics.survivalTime += deltaTime;
        if (this.combat.shotsFired > 0) {
            this.performanceMetrics.accuracy = this.combat.shotsHit / this.combat.shotsFired;
        }
    }

    // ---- Compatibility stubs for older call sites ----

    makeDecision() { /* driven every frame in update() */ }

    analyzeSituation() {
        const maxHp = this.bot.maxHealth || 100;
        return {
            threats: this.activeEnemy ? [this.activeEnemy] : [],
            nearestThreat: this.activeEnemy,
            threatLevel: this.activeEnemy ? 0.8 : 0,
            health: Math.max(0, Math.min(1, this.bot.health / maxHp)),
            ammo: this.bot.weapon?.ammo ?? 30,
            position: this.bot.position,
            cover: [],
            allies: [],
            enemies: this.activeEnemy ? [this.activeEnemy] : [],
            gameTime: Date.now(),
            map: this.bot.game.mapId,
            recentEvents: [],
            learnedPatterns: []
        };
    }

    getDebugInfo() {
        return {
            currentState: this.currentState,
            activeEnemy: this.activeEnemy?.id || null,
            performanceMetrics: this.performanceMetrics,
            behaviorWeights: this.behaviorWeights
        };
    }

    reset() {
        this.currentState = 'patrol';
        this.activeEnemy = null;
        this.stateHistory = [];
        this.performanceMetrics = {
            kills: 0, deaths: 0, accuracy: 0,
            survivalTime: 0, damageDealt: 0, damageTaken: 0
        };
        this.memory.reset();
        this.combat.reset();
        this.movement.reset();
    }
}
