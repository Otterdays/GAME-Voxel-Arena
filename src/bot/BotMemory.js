/**
 * BotMemory - Advanced Memory System for AI Bots
 * 
 * This system provides sophisticated memory capabilities including:
 * - Short-term memory for recent events
 * - Long-term memory for learned patterns
 * - Spatial memory for map knowledge
 * - Episodic memory for specific events
 * - Procedural memory for learned behaviors
 * - Working memory for current task context
 */

export class BotMemory {
    constructor(brain) {
        this.brain = brain;
        this.bot = brain.bot;
        
        // Memory types
        this.shortTermMemory = new Map(); // Recent events (last 30 seconds)
        this.longTermMemory = new Map(); // Learned patterns and behaviors
        this.spatialMemory = new Map(); // Map knowledge and navigation
        this.episodicMemory = []; // Specific events and experiences
        this.proceduralMemory = new Map(); // Learned behaviors and skills
        this.workingMemory = new Map(); // Current task context
        
        // Memory parameters
        this.shortTermCapacity = 50;
        this.longTermCapacity = 200;
        this.episodicCapacity = 100;
        this.memoryDecayRate = 0.1; // How fast memories fade
        this.consolidationThreshold = 0.7; // When to move to long-term
        
        // Learning parameters
        this.learningRate = this.brain.learningRate;
        this.attentionWeight = 0.8; // How much attention affects memory
        this.emotionalWeight = 0.6; // How much emotion affects memory
        
        // Current context
        this.currentContext = {
            location: null,
            situation: null,
            goals: [],
            threats: [],
            allies: []
        };
        
    }
    
    /**
     * Main update loop
     */
    update(deltaTime) {
        // Update memory decay
        this.updateMemoryDecay(deltaTime);
        
        // Consolidate important memories
        this.consolidateMemories();
        
        // Update working memory
        this.updateWorkingMemory();
        
        // Clean up old memories
        this.cleanupMemories();
    }
    
    /**
     * Record a new observation
     */
    recordObservation(observation, type) {
        const memory = {
            id: this.generateMemoryId(),
            type: type,
            observation: observation,
            timestamp: Date.now(),
            location: this.bot.position.clone(),
            context: this.getCurrentContext(),
            importance: this.calculateImportance(observation, type),
            emotionalWeight: this.calculateEmotionalWeight(observation),
            attentionWeight: this.calculateAttentionWeight(observation),
            consolidated: false
        };
        
        // Store in short-term memory
        this.shortTermMemory.set(memory.id, memory);
        
        // Check if it should be immediately consolidated
        if (memory.importance > this.consolidationThreshold) {
            this.consolidateMemory(memory);
        }
        
        return memory.id;
    }
    
    /**
     * Record a decision and its outcome
     */
    recordDecision(situation, decision) {
        const memory = {
            id: this.generateMemoryId(),
            type: 'decision',
            situation: situation,
            decision: decision,
            timestamp: Date.now(),
            location: this.bot.position.clone(),
            context: this.getCurrentContext(),
            importance: this.calculateDecisionImportance(decision),
            emotionalWeight: this.calculateEmotionalWeight(decision),
            attentionWeight: this.calculateAttentionWeight(decision),
            consolidated: false,
            outcome: null, // Will be updated later
            success: null // Will be updated later
        };
        
        // Store in short-term memory
        this.shortTermMemory.set(memory.id, memory);
        
        return memory.id;
    }
    
    /**
     * Update decision outcome
     */
    updateDecisionOutcome(memoryId, outcome, success) {
        const memory = this.shortTermMemory.get(memoryId);
        if (memory) {
            memory.outcome = outcome;
            memory.success = success;
            memory.importance = this.calculateOutcomeImportance(outcome, success);
            
            // Consolidate if important
            if (memory.importance > this.consolidationThreshold) {
                this.consolidateMemory(memory);
            }
        }
    }
    
    /**
     * Consolidate important memories to long-term
     */
    consolidateMemories() {
        for (const [id, memory] of this.shortTermMemory) {
            if (!memory.consolidated && memory.importance > this.consolidationThreshold) {
                this.consolidateMemory(memory);
            }
        }
    }
    
    /**
     * Consolidate a specific memory
     */
    consolidateMemory(memory) {
        // Move to long-term memory
        this.longTermMemory.set(memory.id, {
            ...memory,
            consolidated: true,
            consolidationTime: Date.now()
        });
        
        // Remove from short-term
        this.shortTermMemory.delete(memory.id);
        
        // Add to episodic memory if significant
        if (memory.importance > 0.8) {
            this.addToEpisodicMemory(memory);
        }
        
        // Update procedural memory if it's a successful behavior
        if (memory.type === 'decision' && memory.success) {
            this.updateProceduralMemory(memory);
        }
    }
    
    /**
     * Add memory to episodic memory
     */
    addToEpisodicMemory(memory) {
        this.episodicMemory.push({
            ...memory,
            episodeId: this.generateEpisodeId(),
            emotionalImpact: this.calculateEmotionalImpact(memory)
        });
        
        // Keep only recent episodes
        if (this.episodicMemory.length > this.episodicCapacity) {
            this.episodicMemory.shift();
        }
    }
    
    /**
     * Update procedural memory with successful behaviors
     */
    updateProceduralMemory(memory) {
        const behavior = memory.decision.action;
        const existing = this.proceduralMemory.get(behavior) || {
            count: 0,
            successRate: 0,
            lastUsed: 0,
            confidence: 0
        };
        
        // Update success rate
        existing.count++;
        existing.successRate = (existing.successRate * (existing.count - 1) + (memory.success ? 1 : 0)) / existing.count;
        existing.lastUsed = Date.now();
        existing.confidence = Math.min(1, existing.confidence + this.learningRate);
        
        this.proceduralMemory.set(behavior, existing);
    }
    
    /**
     * Update working memory with current context
     */
    updateWorkingMemory() {
        this.workingMemory.set('currentLocation', {
            position: this.bot.position.clone(),
            timestamp: Date.now(),
            importance: 0.5
        });
        
        this.workingMemory.set('currentSituation', {
            situation: this.brain.analyzeSituation(),
            timestamp: Date.now(),
            importance: 0.7
        });
        
        this.workingMemory.set('currentGoals', {
            goals: this.getCurrentGoals(),
            timestamp: Date.now(),
            importance: 0.8
        });
    }
    
    /**
     * Get recent events
     */
    getRecentEvents(count = 10) {
        const events = Array.from(this.shortTermMemory.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, count);
        
        return events;
    }
    
    /**
     * Get learned patterns
     */
    getLearnedPatterns() {
        const patterns = [];
        
        // Extract patterns from long-term memory
        for (const [id, memory] of this.longTermMemory) {
            if (memory.type === 'decision' && memory.success) {
                patterns.push({
                    situation: memory.situation,
                    decision: memory.decision,
                    successRate: memory.success ? 1 : 0,
                    confidence: memory.importance
                });
            }
        }
        
        return patterns;
    }
    
    /**
     * Get recent decisions
     */
    getRecentDecisions(count = 10) {
        const decisions = Array.from(this.shortTermMemory.values())
            .filter(memory => memory.type === 'decision')
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, count);
        
        return decisions;
    }
    
    /**
     * Get last decision
     */
    getLastDecision() {
        const decisions = this.getRecentDecisions(1);
        return decisions[0] || null;
    }
    
    /**
     * Get decision success rate for a specific action
     */
    getDecisionSuccessRate(action) {
        const decisions = Array.from(this.longTermMemory.values())
            .filter(memory => memory.type === 'decision' && memory.decision.action === action);
        
        if (decisions.length === 0) return 0.5; // Default neutral
        
        const successful = decisions.filter(d => d.success).length;
        return successful / decisions.length;
    }
    
    /**
     * Get spatial knowledge
     */
    getSpatialKnowledge() {
        return Array.from(this.spatialMemory.values());
    }
    
    /**
     * Get episodic memories
     */
    getEpisodicMemories(count = 10) {
        return this.episodicMemory
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, count);
    }
    
    /**
     * Get procedural knowledge
     */
    getProceduralKnowledge() {
        return Array.from(this.proceduralMemory.entries());
    }
    
    /**
     * Search memories by criteria
     */
    searchMemories(criteria) {
        const results = [];
        
        // Search short-term memory
        for (const [id, memory] of this.shortTermMemory) {
            if (this.matchesCriteria(memory, criteria)) {
                results.push(memory);
            }
        }
        
        // Search long-term memory
        for (const [id, memory] of this.longTermMemory) {
            if (this.matchesCriteria(memory, criteria)) {
                results.push(memory);
            }
        }
        
        return results.sort((a, b) => b.importance - a.importance);
    }
    
    /**
     * Check if memory matches search criteria
     */
    matchesCriteria(memory, criteria) {
        if (criteria.type && memory.type !== criteria.type) return false;
        if (criteria.minImportance && memory.importance < criteria.minImportance) return false;
        if (criteria.since && memory.timestamp < criteria.since) return false;
        if (criteria.location && !this.isNearLocation(memory.location, criteria.location, criteria.radius || 10)) return false;
        
        return true;
    }
    
    /**
     * Check if position is near a location
     */
    isNearLocation(pos1, pos2, radius) {
        return pos1.distanceTo(pos2) <= radius;
    }
    
    /**
     * Calculate memory importance
     */
    calculateImportance(observation, type) {
        let importance = 0.5; // Base importance
        
        // Type-based importance
        switch (type) {
            case 'vision':
                importance = 0.7;
                break;
            case 'hearing':
                importance = 0.6;
                break;
            case 'combat':
                importance = 0.9;
                break;
            case 'death':
                importance = 1.0;
                break;
        }
        
        // Threat-based importance
        if (observation.threatLevel) {
            importance += observation.threatLevel * 0.3;
        }
        
        // Distance-based importance
        if (observation.position) {
            const distance = this.bot.position.distanceTo(observation.position);
            importance += Math.max(0, 0.2 - (distance / 50));
        }
        
        return Math.max(0, Math.min(1, importance));
    }
    
    /**
     * Calculate decision importance
     */
    calculateDecisionImportance(decision) {
        let importance = 0.6; // Base importance for decisions
        
        // Action-based importance
        if (decision.action.includes('combat')) {
            importance += 0.3;
        } else if (decision.action.includes('retreat')) {
            importance += 0.2;
        }
        
        // Situation-based importance
        if (decision.situation.threatLevel > 0.7) {
            importance += 0.2;
        }
        
        return Math.max(0, Math.min(1, importance));
    }
    
    /**
     * Calculate outcome importance
     */
    calculateOutcomeImportance(outcome, success) {
        let importance = 0.5;
        
        if (success) {
            importance += 0.3;
        } else {
            importance += 0.2; // Failures are also important to learn from
        }
        
        return Math.max(0, Math.min(1, importance));
    }
    
    /**
     * Calculate emotional weight
     */
    calculateEmotionalWeight(observation) {
        let weight = 0.5; // Base emotional weight
        
        // Threat-based emotional weight
        if (observation.threatLevel) {
            weight += observation.threatLevel * 0.3;
        }
        
        // Death-related events have high emotional weight
        if (observation.type === 'death') {
            weight = 1.0;
        }
        
        return Math.max(0, Math.min(1, weight));
    }
    
    /**
     * Calculate attention weight
     */
    calculateAttentionWeight(observation) {
        let weight = 0.5; // Base attention weight
        
        // Moving objects get more attention
        if (observation.velocity && observation.velocity.length() > 0.1) {
            weight += 0.2;
        }
        
        // Loud sounds get more attention
        if (observation.volume && observation.volume > 0.5) {
            weight += 0.3;
        }
        
        return Math.max(0, Math.min(1, weight));
    }
    
    /**
     * Calculate emotional impact
     */
    calculateEmotionalImpact(memory) {
        return memory.emotionalWeight * memory.attentionWeight;
    }
    
    /**
     * Get current context
     */
    getCurrentContext() {
        return {
            location: this.bot.position.clone(),
            situation: this.brain.analyzeSituation(),
            timestamp: Date.now()
        };
    }
    
    /**
     * Get current goals
     */
    getCurrentGoals() {
        // This would be implemented based on the bot's current objectives
        return ['survive', 'eliminate_enemies', 'protect_allies'];
    }
    
    /**
     * Update memory decay
     */
    updateMemoryDecay(deltaTime) {
        const currentTime = Date.now();
        const decayTime = 30000; // 30 seconds
        
        // Decay short-term memories
        for (const [id, memory] of this.shortTermMemory) {
            const age = currentTime - memory.timestamp;
            memory.importance *= Math.exp(-this.memoryDecayRate * age / decayTime);
            
            // Remove very old or unimportant memories
            if (age > decayTime || memory.importance < 0.1) {
                this.shortTermMemory.delete(id);
            }
        }
    }
    
    /**
     * Clean up old memories
     */
    cleanupMemories() {
        // Clean up old long-term memories
        if (this.longTermMemory.size > this.longTermCapacity) {
            const entries = Array.from(this.longTermMemory.entries());
            entries.sort((a, b) => a[1].importance - b[1].importance);
            
            // Remove least important memories
            const toRemove = entries.slice(0, entries.length - this.longTermCapacity);
            for (const [id] of toRemove) {
                this.longTermMemory.delete(id);
            }
        }
        
        // Clean up old episodic memories
        if (this.episodicMemory.length > this.episodicCapacity) {
            this.episodicMemory.sort((a, b) => a.importance - b.importance);
            this.episodicMemory.splice(0, this.episodicMemory.length - this.episodicCapacity);
        }
    }
    
    /**
     * Generate unique memory ID
     */
    generateMemoryId() {
        return `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Generate unique episode ID
     */
    generateEpisodeId() {
        return `episode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Reset memory system
     */
    reset() {
        this.shortTermMemory.clear();
        this.longTermMemory.clear();
        this.spatialMemory.clear();
        this.episodicMemory = [];
        this.proceduralMemory.clear();
        this.workingMemory.clear();
        
        this.currentContext = {
            location: null,
            situation: null,
            goals: [],
            threats: [],
            allies: []
        };
    }
    
    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            shortTermCount: this.shortTermMemory.size,
            longTermCount: this.longTermMemory.size,
            spatialCount: this.spatialMemory.size,
            episodicCount: this.episodicMemory.length,
            proceduralCount: this.proceduralMemory.size,
            workingCount: this.workingMemory.size,
            currentContext: this.currentContext
        };
    }
}
