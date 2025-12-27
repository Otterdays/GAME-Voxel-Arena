/**
 * BotBrain - Core AI Decision Making System
 * 
 * This is the main AI brain that processes sensory input and makes decisions.
 * It uses a hierarchical state machine with decision trees for complex behaviors.
 * 
 * Architecture:
 * - Sensory System: Processes vision, hearing, and game state
 * - Decision Engine: Uses weighted decision trees and state machines
 * - Action Planner: Converts decisions into executable actions
 * - Learning System: Adapts behavior based on success/failure
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
        
        // Core systems
        this.senses = new BotSenses(this);
        this.memory = new BotMemory(this);
        this.personality = new BotPersonality(this, difficulty);
        this.combat = new BotCombat(this);
        this.movement = new BotMovement(this);
        
        // AI State
        this.currentState = 'patrol';
        this.stateHistory = [];
        this.decisionTree = this.buildDecisionTree();
        this.lastDecisionTime = 0;
        this.decisionInterval = 0.1; // 100ms between decisions
        
        // Performance metrics
        this.performanceMetrics = {
            kills: 0,
            deaths: 0,
            accuracy: 0,
            survivalTime: 0,
            damageDealt: 0,
            damageTaken: 0
        };
        
        // Learning system
        this.learningRate = this.getLearningRate();
        this.behaviorWeights = this.initializeBehaviorWeights();
        
    }
    
    /**
     * Main update loop - called every frame
     */
    update(deltaTime) {
        try {
            // Update all subsystems
            this.senses.update(deltaTime);
            this.memory.update(deltaTime);
            this.combat.update(deltaTime);
            this.movement.update(deltaTime);

            // Make decisions at specified intervals
            if (Date.now() - this.lastDecisionTime > this.decisionInterval * 1000) {
                this.makeDecision();
                this.lastDecisionTime = Date.now();
            }

            // Update performance metrics
            this.updatePerformanceMetrics(deltaTime);
        } catch (error) {
            console.error(`Bot ${this.bot.id} brain error:`, error);
            // Reset brain systems to recover
            this.senses = new BotSenses(this);
            this.memory = new BotMemory(this);
            this.combat = new BotCombat(this);
            this.movement = new BotMovement(this);
        }
    }
    
    /**
     * Core decision-making process
     */
    makeDecision() {
        // Gather current situation data
        const situation = this.analyzeSituation();
        
        // Apply personality modifiers
        const modifiedSituation = this.personality.modifySituation(situation);
        
        // Make decision using decision tree
        const decision = this.evaluateDecisionTree(modifiedSituation);
        
        // Execute decision
        this.executeDecision(decision);
        
        // Store decision for learning
        this.memory.recordDecision(situation, decision);
    }
    
    /**
     * Analyze current game situation
     */
    analyzeSituation() {
        return {
            // Threat assessment
            threats: this.senses.getThreats(),
            nearestThreat: this.senses.getNearestThreat(),
            threatLevel: this.senses.getThreatLevel(),
            
            // Environmental factors
            health: this.bot.health,
            ammo: this.bot.weapon.ammo,
            position: this.bot.position,
            cover: this.senses.findCover(),
            
            // Team situation
            allies: this.senses.getAllies(),
            enemies: this.senses.getEnemies(),
            
            // Game state
            gameTime: Date.now(),
            map: this.bot.game.mapId,
            
            // Memory context
            recentEvents: this.memory.getRecentEvents(5),
            learnedPatterns: this.memory.getLearnedPatterns()
        };
    }
    
    /**
     * Build the decision tree for AI behavior
     */
    buildDecisionTree() {
        return {
            // Combat decisions
            combat: {
                engage: {
                    condition: (situation) => situation.threatLevel > 0.7 && situation.health > 0.3,
                    action: 'combat_engage',
                    weight: 0.8
                },
                retreat: {
                    condition: (situation) => situation.threatLevel > 0.8 && situation.health < 0.3,
                    action: 'combat_retreat',
                    weight: 0.9
                },
                flank: {
                    condition: (situation) => situation.threatLevel > 0.5 && situation.cover.length > 0,
                    action: 'combat_flank',
                    weight: 0.6
                }
            },
            
            // Movement decisions
            movement: {
                patrol: {
                    condition: (situation) => situation.threatLevel < 0.3,
                    action: 'movement_patrol',
                    weight: 0.7
                },
                hunt: {
                    condition: (situation) => situation.enemies.length > 0 && situation.threatLevel < 0.5,
                    action: 'movement_hunt',
                    weight: 0.6
                },
                regroup: {
                    condition: (situation) => situation.allies.length < 2 && situation.threatLevel > 0.4,
                    action: 'movement_regroup',
                    weight: 0.5
                }
            },
            
            // Survival decisions
            survival: {
                heal: {
                    condition: (situation) => situation.health < 0.5 && situation.threatLevel < 0.4,
                    action: 'survival_heal',
                    weight: 0.8
                },
                reload: {
                    condition: (situation) => situation.ammo < 5 && situation.threatLevel < 0.6,
                    action: 'survival_reload',
                    weight: 0.7
                },
                hide: {
                    condition: (situation) => situation.threatLevel > 0.9,
                    action: 'survival_hide',
                    weight: 0.9
                }
            }
        };
    }
    
    /**
     * Evaluate decision tree and return best action
     */
    evaluateDecisionTree(situation) {
        let bestDecision = null;
        let bestScore = 0;
        
        // Evaluate each category
        for (const [category, decisions] of Object.entries(this.decisionTree)) {
            for (const [decisionName, decision] of Object.entries(decisions)) {
                if (decision.condition(situation)) {
                    const score = this.calculateDecisionScore(decision, situation);
                    if (score > bestScore) {
                        bestScore = score;
                        bestDecision = {
                            category,
                            name: decisionName,
                            action: decision.action,
                            score,
                            situation
                        };
                    }
                }
            }
        }
        
        // Default to patrol if no other decision is made
        return bestDecision || {
            category: 'movement',
            name: 'patrol',
            action: 'movement_patrol',
            score: 0.5,
            situation
        };
    }
    
    /**
     * Calculate score for a decision based on multiple factors
     */
    calculateDecisionScore(decision, situation) {
        let score = decision.weight;
        
        // Apply personality modifiers
        score *= this.personality.getDecisionModifier(decision.action);
        
        // Apply learning from past experiences
        score *= this.memory.getDecisionSuccessRate(decision.action);
        
        // Apply situational modifiers
        score *= this.getSituationalModifier(decision.action, situation);
        
        // Add some randomness for unpredictability
        score *= (0.8 + Math.random() * 0.4);
        
        return Math.max(0, Math.min(1, score));
    }
    
    /**
     * Get situational modifier for a decision
     */
    getSituationalModifier(action, situation) {
        switch (action) {
            case 'combat_engage':
                return situation.health > 0.7 ? 1.2 : 0.8;
            case 'combat_retreat':
                return situation.health < 0.2 ? 1.5 : 0.5;
            case 'movement_patrol':
                return situation.threatLevel < 0.2 ? 1.3 : 0.7;
            default:
                return 1.0;
        }
    }
    
    /**
     * Execute a decision by delegating to appropriate system
     */
    executeDecision(decision) {
        // Update state
        this.setState(decision.category);
        
        // Delegate to appropriate system
        switch (decision.category) {
            case 'combat':
                this.combat.executeAction(decision.action, decision.situation);
                break;
            case 'movement':
                this.movement.executeAction(decision.action, decision.situation);
                break;
            case 'survival':
                this.executeSurvivalAction(decision.action, decision.situation);
                break;
        }
        
        // Record decision for learning
        this.memory.recordDecision(decision.situation, decision);
    }
    
    /**
     * Execute survival actions
     */
    executeSurvivalAction(action, situation) {
        switch (action) {
            case 'survival_heal':
                // Look for health packs or safe healing spot
                // Use patrol behavior to find a safer location
                this.movement.executePatrol(situation);
                break;
            case 'survival_reload':
                // Find cover and reload - use retreat behavior
                this.movement.executeRetreat(situation);
                if (this.bot.weapon && this.bot.weapon.reload) {
                    this.bot.weapon.reload();
                }
                break;
            case 'survival_hide':
                // Find best hiding spot - use retreat behavior
                this.movement.executeRetreat(situation);
                break;
        }
    }
    
    /**
     * Set AI state and track history
     */
    setState(newState) {
        if (newState !== this.currentState) {
            this.stateHistory.push({
                state: this.currentState,
                timestamp: Date.now(),
                duration: Date.now() - (this.stateHistory[this.stateHistory.length - 1]?.timestamp || Date.now())
            });
            this.currentState = newState;
        }
    }
    
    /**
     * Get learning rate based on difficulty
     */
    getLearningRate() {
        const rates = {
            easy: 0.1,
            medium: 0.3,
            hard: 0.5,
            expert: 0.7
        };
        return rates[this.difficulty] || 0.3;
    }
    
    /**
     * Initialize behavior weights
     */
    initializeBehaviorWeights() {
        return {
            aggression: this.personality.getEffectiveAggression(),
            caution: this.personality.getEffectiveCaution(),
            teamwork: this.personality.getEffectiveTeamwork(),
            adaptability: this.personality.getEffectiveAdaptability()
        };
    }
    
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(deltaTime) {
        this.performanceMetrics.survivalTime += deltaTime;
        
        // Calculate accuracy
        if (this.combat.shotsFired > 0) {
            this.performanceMetrics.accuracy = this.combat.shotsHit / this.combat.shotsFired;
        }
    }
    
    /**
     * Learn from experience
     */
    learnFromExperience() {
        const recentDecisions = this.memory.getRecentDecisions(10);
        const successfulDecisions = recentDecisions.filter(d => d.success);
        
        // Adjust behavior weights based on success
        for (const decision of successfulDecisions) {
            this.adjustBehaviorWeights(decision.action, this.learningRate);
        }
    }
    
    /**
     * Adjust behavior weights based on success
     */
    adjustBehaviorWeights(action, learningRate) {
        // This would be implemented based on specific learning algorithms
        // For now, we'll use a simple reinforcement learning approach
        const successBonus = 0.1 * learningRate;
        
        // Adjust weights based on action type
        if (action.includes('combat')) {
            this.behaviorWeights.aggression += successBonus;
        } else if (action.includes('retreat')) {
            this.behaviorWeights.caution += successBonus;
        }
        
        // Normalize weights
        this.normalizeBehaviorWeights();
    }
    
    /**
     * Normalize behavior weights to keep them balanced
     */
    normalizeBehaviorWeights() {
        const total = Object.values(this.behaviorWeights).reduce((sum, weight) => sum + weight, 0);
        for (const key in this.behaviorWeights) {
            this.behaviorWeights[key] = this.behaviorWeights[key] / total;
        }
    }
    
    /**
     * Get current AI state for debugging
     */
    getDebugInfo() {
        return {
            currentState: this.currentState,
            stateHistory: this.stateHistory.slice(-5),
            performanceMetrics: this.performanceMetrics,
            behaviorWeights: this.behaviorWeights,
            lastDecision: this.memory.getLastDecision(),
            threats: this.senses.getThreats(),
            allies: this.senses.getAllies(),
            enemies: this.senses.getEnemies()
        };
    }
    
    /**
     * Reset AI state (for respawning)
     */
    reset() {
        this.currentState = 'patrol';
        this.stateHistory = [];
        this.performanceMetrics = {
            kills: 0,
            deaths: 0,
            accuracy: 0,
            survivalTime: 0,
            damageDealt: 0,
            damageTaken: 0
        };
        this.memory.reset();
        this.combat.reset();
        this.movement.reset();
    }
}
