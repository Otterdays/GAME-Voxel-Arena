/**
 * BotPersonality - Advanced Personality System for AI Bots
 * 
 * This system provides sophisticated personality traits that affect bot behavior:
 * - Core personality traits (aggression, caution, teamwork, adaptability)
 * - Dynamic personality changes based on experience
 * - Personality-based decision modifiers
 * - Emotional states and mood changes
 * - Learning preferences and adaptation rates
 * - Communication style and team interaction
 */

export class BotPersonality {
    constructor(brain, difficulty) {
        this.brain = brain;
        this.bot = brain.bot;
        this.difficulty = difficulty;
        
        // Core personality traits (0-1 scale)
        this.traits = {
            aggression: this.getBaseAggression(),
            caution: this.getBaseCaution(),
            teamwork: this.getBaseTeamwork(),
            adaptability: this.getBaseAdaptability(),
            intelligence: this.getBaseIntelligence(),
            leadership: this.getBaseLeadership(),
            loyalty: this.getBaseLoyalty(),
            curiosity: this.getBaseCuriosity()
        };
        
        // Dynamic personality modifiers
        this.modifiers = {
            aggression: 0,
            caution: 0,
            teamwork: 0,
            adaptability: 0,
            intelligence: 0,
            leadership: 0,
            loyalty: 0,
            curiosity: 0
        };
        
        // Emotional state
        this.emotionalState = {
            mood: 'neutral', // neutral, happy, angry, fearful, excited, sad
            stress: 0, // 0-1 scale
            confidence: 0.5, // 0-1 scale
            fear: 0, // 0-1 scale
            anger: 0, // 0-1 scale
            excitement: 0 // 0-1 scale
        };
        
        // Learning preferences
        this.learningPreferences = {
            exploration: 0.5, // How much to explore new areas
            experimentation: 0.5, // How much to try new strategies
            imitation: 0.5, // How much to copy successful behaviors
            innovation: 0.5 // How much to create new behaviors
        };
        
        // Communication style
        this.communicationStyle = {
            verbosity: 0.5, // How much to communicate
            directness: 0.5, // How direct to be
            empathy: 0.5, // How empathetic to be
            assertiveness: 0.5 // How assertive to be
        };
        
        // Team interaction preferences
        this.teamPreferences = {
            rolePreference: this.getRolePreference(),
            leadershipStyle: this.getLeadershipStyle(),
            conflictResolution: this.getConflictResolution(),
            supportLevel: this.getSupportLevel()
        };
        
        // Personality history for tracking changes
        this.personalityHistory = [];
        this.emotionalHistory = [];
        
        // Experience-based personality changes
        this.experienceModifiers = new Map();
        
    }
    
    /**
     * Main update loop
     */
    update(deltaTime) {
        // Update emotional state
        this.updateEmotionalState(deltaTime);
        
        // Update personality modifiers based on experience
        this.updatePersonalityModifiers(deltaTime);
        
        // Update learning preferences
        this.updateLearningPreferences(deltaTime);
        
        // Record personality state
        this.recordPersonalityState();
    }
    
    /**
     * Update emotional state based on current situation
     */
    updateEmotionalState(deltaTime) {
        const situation = this.brain.analyzeSituation();
        
        // Update stress based on threats
        if (situation.threatLevel > 0.5) {
            this.emotionalState.stress = Math.min(1, this.emotionalState.stress + deltaTime * 0.1);
        } else {
            this.emotionalState.stress = Math.max(0, this.emotionalState.stress - deltaTime * 0.05);
        }
        
        // Update fear based on threats and health
        if (situation.threatLevel > 0.7 || situation.health < 0.3) {
            this.emotionalState.fear = Math.min(1, this.emotionalState.fear + deltaTime * 0.2);
        } else {
            this.emotionalState.fear = Math.max(0, this.emotionalState.fear - deltaTime * 0.1);
        }
        
        // Update anger based on damage taken
        if (situation.damageTaken > 0) {
            this.emotionalState.anger = Math.min(1, this.emotionalState.anger + deltaTime * 0.3);
        } else {
            this.emotionalState.anger = Math.max(0, this.emotionalState.anger - deltaTime * 0.05);
        }
        
        // Update excitement based on kills and successful actions
        if (situation.kills > 0 || situation.successfulActions > 0) {
            this.emotionalState.excitement = Math.min(1, this.emotionalState.excitement + deltaTime * 0.2);
        } else {
            this.emotionalState.excitement = Math.max(0, this.emotionalState.excitement - deltaTime * 0.1);
        }
        
        // Update confidence based on performance
        this.updateConfidence(situation);
        
        // Update mood based on emotional state
        this.updateMood();
    }
    
    /**
     * Update confidence based on performance
     */
    updateConfidence(situation) {
        const performance = this.calculatePerformance(situation);
        const targetConfidence = performance;
        
        // Smooth confidence changes
        this.emotionalState.confidence = THREE.MathUtils.lerp(
            this.emotionalState.confidence,
            targetConfidence,
            0.1
        );
    }
    
    /**
     * Calculate performance score
     */
    calculatePerformance(situation) {
        let performance = 0.5; // Base performance
        
        // Kills boost confidence
        if (situation.kills > 0) {
            performance += 0.2;
        }
        
        // Deaths reduce confidence
        if (situation.deaths > 0) {
            performance -= 0.3;
        }
        
        // Accuracy affects confidence
        if (situation.accuracy > 0.5) {
            performance += 0.1;
        } else if (situation.accuracy < 0.3) {
            performance -= 0.1;
        }
        
        // Survival time affects confidence
        if (situation.survivalTime > 60) { // 1 minute
            performance += 0.1;
        }
        
        return Math.max(0, Math.min(1, performance));
    }
    
    /**
     * Update mood based on emotional state
     */
    updateMood() {
        const { stress, fear, anger, excitement, confidence } = this.emotionalState;
        
        if (stress > 0.7 || fear > 0.7) {
            this.emotionalState.mood = 'fearful';
        } else if (anger > 0.7) {
            this.emotionalState.mood = 'angry';
        } else if (excitement > 0.7) {
            this.emotionalState.mood = 'excited';
        } else if (confidence > 0.7) {
            this.emotionalState.mood = 'happy';
        } else if (confidence < 0.3) {
            this.emotionalState.mood = 'sad';
        } else {
            this.emotionalState.mood = 'neutral';
        }
    }
    
    /**
     * Update personality modifiers based on experience
     */
    updatePersonalityModifiers(deltaTime) {
        const recentEvents = this.brain.memory.getRecentEvents(10);
        
        for (const event of recentEvents) {
            this.processEventForPersonality(event);
        }
        
        // Apply experience modifiers
        this.applyExperienceModifiers();
    }
    
    /**
     * Process event for personality changes
     */
    processEventForPersonality(event) {
        const eventType = event.type;
        const importance = event.importance;
        const emotionalWeight = event.emotionalWeight;
        
        switch (eventType) {
            case 'combat':
                this.processCombatEvent(event, importance, emotionalWeight);
                break;
            case 'death':
                this.processDeathEvent(event, importance, emotionalWeight);
                break;
            case 'kill':
                this.processKillEvent(event, importance, emotionalWeight);
                break;
            case 'teamwork':
                this.processTeamworkEvent(event, importance, emotionalWeight);
                break;
        }
    }
    
    /**
     * Process combat event
     */
    processCombatEvent(event, importance, emotionalWeight) {
        if (event.success) {
            // Successful combat increases aggression and confidence
            this.addExperienceModifier('aggression', 0.1 * importance * emotionalWeight);
            this.addExperienceModifier('confidence', 0.05 * importance * emotionalWeight);
        } else {
            // Failed combat increases caution
            this.addExperienceModifier('caution', 0.1 * importance * emotionalWeight);
            this.addExperienceModifier('aggression', -0.05 * importance * emotionalWeight);
        }
    }
    
    /**
     * Process death event
     */
    processDeathEvent(event, importance, emotionalWeight) {
        // Death increases caution and fear
        this.addExperienceModifier('caution', 0.2 * importance * emotionalWeight);
        this.addExperienceModifier('fear', 0.3 * importance * emotionalWeight);
        this.addExperienceModifier('aggression', -0.1 * importance * emotionalWeight);
    }
    
    /**
     * Process kill event
     */
    processKillEvent(event, importance, emotionalWeight) {
        // Kills increase aggression and confidence
        this.addExperienceModifier('aggression', 0.15 * importance * emotionalWeight);
        this.addExperienceModifier('confidence', 0.1 * importance * emotionalWeight);
        this.addExperienceModifier('caution', -0.05 * importance * emotionalWeight);
    }
    
    /**
     * Process teamwork event
     */
    processTeamworkEvent(event, importance, emotionalWeight) {
        if (event.success) {
            // Successful teamwork increases teamwork trait
            this.addExperienceModifier('teamwork', 0.1 * importance * emotionalWeight);
            this.addExperienceModifier('leadership', 0.05 * importance * emotionalWeight);
        }
    }
    
    /**
     * Add experience modifier
     */
    addExperienceModifier(trait, modifier) {
        if (!this.experienceModifiers.has(trait)) {
            this.experienceModifiers.set(trait, 0);
        }
        
        const current = this.experienceModifiers.get(trait);
        this.experienceModifiers.set(trait, current + modifier);
    }
    
    /**
     * Apply experience modifiers to personality
     */
    applyExperienceModifiers() {
        for (const [trait, modifier] of this.experienceModifiers) {
            if (this.modifiers[trait] !== undefined) {
                this.modifiers[trait] = Math.max(-0.5, Math.min(0.5, modifier));
            }
        }
        
        // Decay modifiers over time
        for (const trait in this.modifiers) {
            this.modifiers[trait] *= 0.99; // 1% decay per update
        }
    }
    
    /**
     * Update learning preferences based on experience
     */
    updateLearningPreferences(deltaTime) {
        // Adjust learning preferences based on personality traits
        this.learningPreferences.exploration = this.traits.curiosity * 0.8 + 0.2;
        this.learningPreferences.experimentation = this.traits.adaptability * 0.8 + 0.2;
        this.learningPreferences.imitation = this.traits.teamwork * 0.6 + 0.4;
        this.learningPreferences.innovation = this.traits.intelligence * 0.8 + 0.2;
    }
    
    /**
     * Record personality state for tracking
     */
    recordPersonalityState() {
        const state = {
            timestamp: Date.now(),
            traits: { ...this.traits },
            modifiers: { ...this.modifiers },
            emotionalState: { ...this.emotionalState },
            learningPreferences: { ...this.learningPreferences }
        };
        
        this.personalityHistory.push(state);
        
        // Keep only recent history
        if (this.personalityHistory.length > 100) {
            this.personalityHistory.shift();
        }
    }
    
    /**
     * Modify situation based on personality
     */
    modifySituation(situation) {
        const modifiedSituation = { ...situation };
        
        // Apply personality modifiers to threat assessment
        if (situation.threatLevel) {
            modifiedSituation.threatLevel = this.modifyThreatLevel(situation.threatLevel);
        }
        
        // Apply personality modifiers to decision weights
        modifiedSituation.personalityModifiers = {
            aggression: this.getEffectiveAggression(),
            caution: this.getEffectiveCaution(),
            teamwork: this.getEffectiveTeamwork(),
            adaptability: this.getEffectiveAdaptability()
        };
        
        // Apply emotional state modifiers
        modifiedSituation.emotionalModifiers = {
            stress: this.emotionalState.stress,
            fear: this.emotionalState.fear,
            anger: this.emotionalState.anger,
            excitement: this.emotionalState.excitement,
            confidence: this.emotionalState.confidence
        };
        
        return modifiedSituation;
    }
    
    /**
     * Modify threat level based on personality
     */
    modifyThreatLevel(threatLevel) {
        const caution = this.getEffectiveCaution();
        const fear = this.emotionalState.fear;
        
        // More cautious personalities perceive higher threat
        const modifiedThreat = threatLevel * (1 + caution * 0.5 + fear * 0.3);
        
        return Math.max(0, Math.min(1, modifiedThreat));
    }
    
    /**
     * Get decision modifier for a specific action
     */
    getDecisionModifier(action) {
        let modifier = 1.0;
        
        // Apply personality traits
        if (action.includes('combat') || action.includes('engage')) {
            modifier *= (1 + this.getEffectiveAggression() * 0.5);
        }
        
        if (action.includes('retreat') || action.includes('hide')) {
            modifier *= (1 + this.getEffectiveCaution() * 0.5);
        }
        
        if (action.includes('team') || action.includes('support')) {
            modifier *= (1 + this.getEffectiveTeamwork() * 0.5);
        }
        
        if (action.includes('explore') || action.includes('new')) {
            modifier *= (1 + this.getEffectiveAdaptability() * 0.3);
        }
        
        // Apply emotional state
        if (this.emotionalState.mood === 'angry') {
            modifier *= 1.2; // More aggressive when angry
        } else if (this.emotionalState.mood === 'fearful') {
            modifier *= 0.8; // More cautious when fearful
        } else if (this.emotionalState.mood === 'excited') {
            modifier *= 1.1; // Slightly more aggressive when excited
        }
        
        return Math.max(0.1, Math.min(2.0, modifier));
    }
    
    /**
     * Get effective personality trait value
     */
    getEffectiveTrait(traitName) {
        const baseTrait = this.traits[traitName] || 0.5;
        const modifier = this.modifiers[traitName] || 0;
        return Math.max(0, Math.min(1, baseTrait + modifier));
    }
    
    /**
     * Get effective aggression
     */
    getEffectiveAggression() {
        return this.getEffectiveTrait('aggression');
    }
    
    /**
     * Get effective caution
     */
    getEffectiveCaution() {
        return this.getEffectiveTrait('caution');
    }
    
    /**
     * Get effective teamwork
     */
    getEffectiveTeamwork() {
        return this.getEffectiveTrait('teamwork');
    }
    
    /**
     * Get effective adaptability
     */
    getEffectiveAdaptability() {
        return this.getEffectiveTrait('adaptability');
    }
    
    /**
     * Get effective intelligence
     */
    getEffectiveIntelligence() {
        return this.getEffectiveTrait('intelligence');
    }
    
    /**
     * Get effective leadership
     */
    getEffectiveLeadership() {
        return this.getEffectiveTrait('leadership');
    }
    
    /**
     * Get effective loyalty
     */
    getEffectiveLoyalty() {
        return this.getEffectiveTrait('loyalty');
    }
    
    /**
     * Get effective curiosity
     */
    getEffectiveCuriosity() {
        return this.getEffectiveTrait('curiosity');
    }
    
    /**
     * Get base personality traits based on difficulty
     */
    getBaseAggression() {
        const aggressions = {
            easy: 0.3,
            medium: 0.5,
            hard: 0.7,
            expert: 0.9
        };
        return aggressions[this.difficulty] || 0.5;
    }
    
    getBaseCaution() {
        const cautions = {
            easy: 0.8,
            medium: 0.6,
            hard: 0.4,
            expert: 0.2
        };
        return cautions[this.difficulty] || 0.6;
    }
    
    getBaseTeamwork() {
        const teamworks = {
            easy: 0.3,
            medium: 0.5,
            hard: 0.7,
            expert: 0.9
        };
        return teamworks[this.difficulty] || 0.5;
    }
    
    getBaseAdaptability() {
        const adaptabilities = {
            easy: 0.2,
            medium: 0.4,
            hard: 0.6,
            expert: 0.8
        };
        return adaptabilities[this.difficulty] || 0.4;
    }
    
    getBaseIntelligence() {
        const intelligences = {
            easy: 0.3,
            medium: 0.5,
            hard: 0.7,
            expert: 0.9
        };
        return intelligences[this.difficulty] || 0.5;
    }
    
    getBaseLeadership() {
        const leaderships = {
            easy: 0.2,
            medium: 0.4,
            hard: 0.6,
            expert: 0.8
        };
        return leaderships[this.difficulty] || 0.4;
    }
    
    getBaseLoyalty() {
        const loyalties = {
            easy: 0.6,
            medium: 0.7,
            hard: 0.8,
            expert: 0.9
        };
        return loyalties[this.difficulty] || 0.7;
    }
    
    getBaseCuriosity() {
        const curiosities = {
            easy: 0.3,
            medium: 0.5,
            hard: 0.7,
            expert: 0.9
        };
        return curiosities[this.difficulty] || 0.5;
    }
    
    /**
     * Get role preference based on personality
     */
    getRolePreference() {
        const aggression = this.getEffectiveAggression();
        const teamwork = this.getEffectiveTeamwork();
        const intelligence = this.getEffectiveIntelligence();
        
        if (aggression > 0.7 && teamwork < 0.5) {
            return 'assault';
        } else if (intelligence > 0.7 && aggression < 0.5) {
            return 'sniper';
        } else if (teamwork > 0.7) {
            return 'support';
        } else {
            return 'assault';
        }
    }
    
    /**
     * Get leadership style based on personality
     */
    getLeadershipStyle() {
        const leadership = this.getEffectiveLeadership();
        const assertiveness = this.communicationStyle.assertiveness;
        
        if (leadership > 0.7 && assertiveness > 0.7) {
            return 'directive';
        } else if (leadership > 0.7 && assertiveness < 0.3) {
            return 'supportive';
        } else if (leadership < 0.3) {
            return 'follower';
        } else {
            return 'collaborative';
        }
    }
    
    /**
     * Get conflict resolution style
     */
    getConflictResolution() {
        const aggression = this.getEffectiveAggression();
        const empathy = this.communicationStyle.empathy;
        
        if (aggression > 0.7 && empathy < 0.3) {
            return 'competitive';
        } else if (empathy > 0.7 && aggression < 0.3) {
            return 'accommodating';
        } else if (aggression > 0.5 && empathy > 0.5) {
            return 'collaborative';
        } else {
            return 'compromising';
        }
    }
    
    /**
     * Get support level
     */
    getSupportLevel() {
        const teamwork = this.getEffectiveTeamwork();
        const loyalty = this.getEffectiveLoyalty();
        
        return (teamwork + loyalty) / 2;
    }
    
    // Public API methods
    
    /**
     * Get current personality traits
     */
    getTraits() {
        return { ...this.traits };
    }
    
    /**
     * Get current emotional state
     */
    getEmotionalState() {
        return { ...this.emotionalState };
    }
    
    /**
     * Get learning preferences
     */
    getLearningPreferences() {
        return { ...this.learningPreferences };
    }
    
    /**
     * Get communication style
     */
    getCommunicationStyle() {
        return { ...this.communicationStyle };
    }
    
    /**
     * Get team preferences
     */
    getTeamPreferences() {
        return { ...this.teamPreferences };
    }
    
    /**
     * Get personality history
     */
    getPersonalityHistory() {
        return [...this.personalityHistory];
    }
    
    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            traits: this.traits,
            modifiers: this.modifiers,
            emotionalState: this.emotionalState,
            learningPreferences: this.learningPreferences,
            communicationStyle: this.communicationStyle,
            teamPreferences: this.teamPreferences,
            experienceModifiers: Object.fromEntries(this.experienceModifiers)
        };
    }
    
    /**
     * Reset personality system
     */
    reset() {
        // Reset modifiers
        for (const trait in this.modifiers) {
            this.modifiers[trait] = 0;
        }
        
        // Reset emotional state
        this.emotionalState = {
            mood: 'neutral',
            stress: 0,
            confidence: 0.5,
            fear: 0,
            anger: 0,
            excitement: 0
        };
        
        // Reset experience modifiers
        this.experienceModifiers.clear();
        
        // Reset history
        this.personalityHistory = [];
        this.emotionalHistory = [];
    }
}
