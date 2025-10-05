/**
 * BotCommunication - Advanced Communication System for AI Bots
 * 
 * This system provides sophisticated bot-to-bot communication including:
 * - Real-time information sharing
 * - Tactical coordination and planning
 * - Threat assessment and warnings
 * - Resource sharing and requests
 * - Team formation and role assignment
 * - Emotional support and morale
 * - Learning from team experiences
 */

export class BotCommunication {
    constructor(brain) {
        this.brain = brain;
        this.bot = brain.bot;
        
        // Communication parameters
        this.communicationRange = this.getCommunicationRange();
        this.communicationDelay = this.getCommunicationDelay();
        this.messageQueue = [];
        this.receivedMessages = new Map();
        this.sentMessages = new Map();
        
        // Team coordination
        this.teamMembers = new Map();
        this.teamRoles = new Map();
        this.teamObjectives = [];
        this.teamStatus = 'disorganized'; // disorganized, forming, organized, coordinated
        
        // Communication protocols
        this.protocols = {
            threat: this.createThreatProtocol(),
            resource: this.createResourceProtocol(),
            position: this.createPositionProtocol(),
            objective: this.createObjectiveProtocol(),
            emotion: this.createEmotionProtocol()
        };
        
        // Message types
        this.messageTypes = {
            threat: 'Threat information',
            resource: 'Resource sharing',
            position: 'Position updates',
            objective: 'Objective coordination',
            emotion: 'Emotional support',
            command: 'Command and control',
            request: 'Request for assistance',
            response: 'Response to request'
        };
        
        // Communication history
        this.communicationHistory = [];
        this.teamInteractionHistory = [];
        
        // Learning from communication
        this.communicationLearning = {
            effectiveMessages: new Map(),
            teamCoordination: new Map(),
            responsePatterns: new Map()
        };
        
    }
    
    /**
     * Main update loop
     */
    update(deltaTime) {
        // Process message queue
        this.processMessageQueue(deltaTime);
        
        // Update team coordination
        this.updateTeamCoordination(deltaTime);
        
        // Send periodic updates
        this.sendPeriodicUpdates(deltaTime);
        
        // Learn from communication
        this.updateCommunicationLearning(deltaTime);
        
        // Clean up old messages
        this.cleanupOldMessages(deltaTime);
    }
    
    /**
     * Process message queue
     */
    processMessageQueue(deltaTime) {
        for (let i = this.messageQueue.length - 1; i >= 0; i--) {
            const message = this.messageQueue[i];
            
            // Check if message is ready to be sent
            if (Date.now() - message.timestamp > this.communicationDelay) {
                this.sendMessage(message);
                this.messageQueue.splice(i, 1);
            }
        }
    }
    
    /**
     * Send a message to another bot
     */
    sendMessage(message) {
        // Validate message
        if (!this.validateMessage(message)) {
            return false;
        }
        
        // Add to sent messages
        this.sentMessages.set(message.id, message);
        
        // Send to target bot
        if (message.target) {
            this.deliverMessage(message);
        } else {
            // Broadcast to all nearby bots
            this.broadcastMessage(message);
        }
        
        // Record communication
        this.recordCommunication(message, 'sent');
        
        return true;
    }
    
    /**
     * Deliver message to specific bot
     */
    deliverMessage(message) {
        const targetBot = this.getBotById(message.target);
        if (targetBot && targetBot.communication) {
            targetBot.communication.receiveMessage(message);
        }
    }
    
    /**
     * Broadcast message to nearby bots
     */
    broadcastMessage(message) {
        const nearbyBots = this.getNearbyBots();
        
        for (const bot of nearbyBots) {
            if (bot.id !== this.bot.id && bot.communication) {
                const broadcastMessage = { ...message, target: bot.id };
                bot.communication.receiveMessage(broadcastMessage);
            }
        }
    }
    
    /**
     * Receive a message from another bot
     */
    receiveMessage(message) {
        // Validate received message
        if (!this.validateReceivedMessage(message)) {
            return false;
        }
        
        // Add to received messages
        this.receivedMessages.set(message.id, message);
        
        // Process message based on type
        this.processReceivedMessage(message);
        
        // Record communication
        this.recordCommunication(message, 'received');
        
        return true;
    }
    
    /**
     * Process received message
     */
    processReceivedMessage(message) {
        switch (message.type) {
            case 'threat':
                this.processThreatMessage(message);
                break;
            case 'resource':
                this.processResourceMessage(message);
                break;
            case 'position':
                this.processPositionMessage(message);
                break;
            case 'objective':
                this.processObjectiveMessage(message);
                break;
            case 'emotion':
                this.processEmotionMessage(message);
                break;
            case 'command':
                this.processCommandMessage(message);
                break;
            case 'request':
                this.processRequestMessage(message);
                break;
            case 'response':
                this.processResponseMessage(message);
                break;
        }
    }
    
    /**
     * Process threat message
     */
    processThreatMessage(message) {
        const threatData = message.data;
        
        // Update threat awareness
        this.brain.senses.updateThreatFromCommunication(threatData);
        
        // Share with other team members
        this.shareThreatInformation(threatData);
        
        // Update team coordination
        this.updateTeamThreatResponse(threatData);
    }
    
    /**
     * Process resource message
     */
    processResourceMessage(message) {
        const resourceData = message.data;
        
        // Update resource awareness
        this.updateResourceAwareness(resourceData);
        
        // Coordinate resource sharing
        this.coordinateResourceSharing(resourceData);
    }
    
    /**
     * Process position message
     */
    processPositionMessage(message) {
        const positionData = message.data;
        
        // Update team member positions
        this.updateTeamMemberPosition(message.sender, positionData);
        
        // Update formation coordination
        this.updateFormationCoordination(positionData);
    }
    
    /**
     * Process objective message
     */
    processObjectiveMessage(message) {
        const objectiveData = message.data;
        
        // Update team objectives
        this.updateTeamObjectives(objectiveData);
        
        // Coordinate objective execution
        this.coordinateObjectiveExecution(objectiveData);
    }
    
    /**
     * Process emotion message
     */
    processEmotionMessage(message) {
        const emotionData = message.data;
        
        // Update team morale
        this.updateTeamMorale(emotionData);
        
        // Provide emotional support
        this.provideEmotionalSupport(emotionData);
    }
    
    /**
     * Process command message
     */
    processCommandMessage(message) {
        const commandData = message.data;
        
        // Evaluate command authority
        if (this.evaluateCommandAuthority(message.sender, commandData)) {
            this.executeCommand(commandData);
        }
    }
    
    /**
     * Process request message
     */
    processRequestMessage(message) {
        const requestData = message.data;
        
        // Evaluate request
        const response = this.evaluateRequest(requestData);
        
        // Send response
        this.sendResponse(message.sender, requestData, response);
    }
    
    /**
     * Process response message
     */
    processResponseMessage(message) {
        const responseData = message.data;
        
        // Process response to previous request
        this.processRequestResponse(responseData);
    }
    
    /**
     * Update team coordination
     */
    updateTeamCoordination(deltaTime) {
        // Update team status
        this.updateTeamStatus();
        
        // Coordinate team formation
        this.coordinateTeamFormation();
        
        // Assign team roles
        this.assignTeamRoles();
        
        // Update team objectives
        this.updateTeamObjectives();
    }
    
    /**
     * Update team status
     */
    updateTeamStatus() {
        const teamSize = this.teamMembers.size;
        const coordinationLevel = this.calculateCoordinationLevel();
        
        if (teamSize < 2) {
            this.teamStatus = 'disorganized';
        } else if (teamSize >= 2 && coordinationLevel < 0.5) {
            this.teamStatus = 'forming';
        } else if (coordinationLevel >= 0.5 && coordinationLevel < 0.8) {
            this.teamStatus = 'organized';
        } else {
            this.teamStatus = 'coordinated';
        }
    }
    
    /**
     * Calculate coordination level
     */
    calculateCoordinationLevel() {
        let coordination = 0;
        
        // Communication frequency
        const recentMessages = this.getRecentMessages(30); // Last 30 seconds
        coordination += Math.min(0.3, recentMessages.length / 10);
        
        // Role assignment
        if (this.teamRoles.size > 0) {
            coordination += 0.2;
        }
        
        // Objective sharing
        if (this.teamObjectives.length > 0) {
            coordination += 0.2;
        }
        
        // Formation coordination
        const formationCoordination = this.calculateFormationCoordination();
        coordination += formationCoordination * 0.3;
        
        return Math.max(0, Math.min(1, coordination));
    }
    
    /**
     * Calculate formation coordination
     */
    calculateFormationCoordination() {
        if (this.teamMembers.size < 2) return 0;
        
        let coordination = 0;
        const teamPositions = Array.from(this.teamMembers.values());
        
        // Check if bots are maintaining formation
        for (let i = 0; i < teamPositions.length - 1; i++) {
            for (let j = i + 1; j < teamPositions.length; j++) {
                const distance = teamPositions[i].position.distanceTo(teamPositions[j].position);
                const optimalDistance = 5; // Optimal team spacing
                const distanceError = Math.abs(distance - optimalDistance);
                coordination += Math.max(0, 1 - distanceError / optimalDistance);
            }
        }
        
        return coordination / (teamPositions.length * (teamPositions.length - 1) / 2);
    }
    
    /**
     * Coordinate team formation
     */
    coordinateTeamFormation() {
        if (this.teamStatus === 'coordinated' && this.teamMembers.size >= 2) {
            const formation = this.calculateOptimalFormation();
            this.broadcastFormationUpdate(formation);
        }
    }
    
    /**
     * Calculate optimal formation
     */
    calculateOptimalFormation() {
        const teamSize = this.teamMembers.size;
        const formation = {
            type: 'line', // line, wedge, circle, spread
            positions: [],
            spacing: 5
        };
        
        // Calculate formation based on team size and situation
        if (teamSize <= 2) {
            formation.type = 'line';
        } else if (teamSize <= 4) {
            formation.type = 'wedge';
        } else {
            formation.type = 'spread';
        }
        
        // Calculate positions
        formation.positions = this.calculateFormationPositions(formation);
        
        return formation;
    }
    
    /**
     * Calculate formation positions
     */
    calculateFormationPositions(formation) {
        const positions = [];
        const center = this.calculateTeamCenter();
        
        switch (formation.type) {
            case 'line':
                for (let i = 0; i < this.teamMembers.size; i++) {
                    const offset = (i - (this.teamMembers.size - 1) / 2) * formation.spacing;
                    positions.push(center.clone().add(new THREE.Vector3(offset, 0, 0)));
                }
                break;
            case 'wedge':
                // V-formation
                for (let i = 0; i < this.teamMembers.size; i++) {
                    const row = Math.floor(i / 2);
                    const side = i % 2 === 0 ? -1 : 1;
                    const offset = new THREE.Vector3(
                        side * formation.spacing * (row + 1),
                        0,
                        -formation.spacing * row
                    );
                    positions.push(center.clone().add(offset));
                }
                break;
            case 'spread':
                // Circular formation
                for (let i = 0; i < this.teamMembers.size; i++) {
                    const angle = (i / this.teamMembers.size) * Math.PI * 2;
                    const offset = new THREE.Vector3(
                        Math.cos(angle) * formation.spacing,
                        0,
                        Math.sin(angle) * formation.spacing
                    );
                    positions.push(center.clone().add(offset));
                }
                break;
        }
        
        return positions;
    }
    
    /**
     * Calculate team center
     */
    calculateTeamCenter() {
        const positions = Array.from(this.teamMembers.values()).map(member => member.position);
        const center = new THREE.Vector3();
        
        for (const position of positions) {
            center.add(position);
        }
        
        return center.divideScalar(positions.length);
    }
    
    /**
     * Assign team roles
     */
    assignTeamRoles() {
        if (this.teamStatus === 'organized' || this.teamStatus === 'coordinated') {
            const teamMembers = Array.from(this.teamMembers.keys());
            const roles = ['leader', 'assault', 'support', 'sniper', 'medic'];
            
            for (let i = 0; i < teamMembers.length && i < roles.length; i++) {
                const memberId = teamMembers[i];
                const role = roles[i];
                
                if (!this.teamRoles.has(memberId)) {
                    this.teamRoles.set(memberId, role);
                    this.broadcastRoleAssignment(memberId, role);
                }
            }
        }
    }
    
    /**
     * Send periodic updates
     */
    sendPeriodicUpdates(deltaTime) {
        // Send position updates
        this.sendPositionUpdate();
        
        // Send status updates
        this.sendStatusUpdate();
        
        // Send threat updates
        this.sendThreatUpdate();
    }
    
    /**
     * Send position update
     */
    sendPositionUpdate() {
        const message = this.createMessage('position', {
            position: this.bot.position.clone(),
            velocity: this.bot.velocity?.clone() || new THREE.Vector3(),
            health: this.bot.health,
            ammo: this.bot.weapon?.ammo || 0,
            combatState: this.brain.combat?.getCombatState() || 'idle'
        });
        
        this.queueMessage(message);
    }
    
    /**
     * Send status update
     */
    sendStatusUpdate() {
        const message = this.createMessage('status', {
            health: this.bot.health,
            ammo: this.bot.weapon?.ammo || 0,
            combatState: this.brain.combat?.getCombatState() || 'idle',
            emotionalState: this.brain.personality?.getEmotionalState() || {},
            teamRole: this.teamRoles.get(this.bot.id) || 'unknown'
        });
        
        this.queueMessage(message);
    }
    
    /**
     * Send threat update
     */
    sendThreatUpdate() {
        const threats = this.brain.senses.getThreats();
        
        if (threats.length > 0) {
            const message = this.createMessage('threat', {
                threats: threats.map(threat => ({
                    position: threat.position.clone(),
                    threatLevel: threat.threatLevel,
                    type: threat.type,
                    confidence: threat.confidence
                })),
                threatLevel: this.brain.senses.getThreatLevel()
            });
            
            this.queueMessage(message);
        }
    }
    
    /**
     * Update communication learning
     */
    updateCommunicationLearning(deltaTime) {
        // Learn from effective messages
        this.learnFromEffectiveMessages();
        
        // Learn from team coordination
        this.learnFromTeamCoordination();
        
        // Learn from response patterns
        this.learnFromResponsePatterns();
    }
    
    /**
     * Learn from effective messages
     */
    learnFromEffectiveMessages() {
        const recentMessages = this.getRecentMessages(60); // Last minute
        
        for (const message of recentMessages) {
            if (message.effective) {
                const messageType = message.type;
                const currentEffectiveness = this.communicationLearning.effectiveMessages.get(messageType) || 0;
                this.communicationLearning.effectiveMessages.set(messageType, currentEffectiveness + 0.1);
            }
        }
    }
    
    /**
     * Learn from team coordination
     */
    learnFromTeamCoordination() {
        const coordinationLevel = this.calculateCoordinationLevel();
        
        if (coordinationLevel > 0.7) {
            // Successful coordination
            const currentCoordination = this.communicationLearning.teamCoordination.get('success') || 0;
            this.communicationLearning.teamCoordination.set('success', currentCoordination + 0.1);
        } else if (coordinationLevel < 0.3) {
            // Poor coordination
            const currentCoordination = this.communicationLearning.teamCoordination.get('failure') || 0;
            this.communicationLearning.teamCoordination.set('failure', currentCoordination + 0.1);
        }
    }
    
    /**
     * Learn from response patterns
     */
    learnFromResponsePatterns() {
        const recentResponses = this.getRecentMessages(30).filter(msg => msg.type === 'response');
        
        for (const response of recentResponses) {
            const responsePattern = response.data.pattern;
            const currentPattern = this.communicationLearning.responsePatterns.get(responsePattern) || 0;
            this.communicationLearning.responsePatterns.set(responsePattern, currentPattern + 0.1);
        }
    }
    
    /**
     * Clean up old messages
     */
    cleanupOldMessages(deltaTime) {
        const currentTime = Date.now();
        const cleanupTime = 30000; // 30 seconds
        
        // Clean up sent messages
        for (const [id, message] of this.sentMessages) {
            if (currentTime - message.timestamp > cleanupTime) {
                this.sentMessages.delete(id);
            }
        }
        
        // Clean up received messages
        for (const [id, message] of this.receivedMessages) {
            if (currentTime - message.timestamp > cleanupTime) {
                this.receivedMessages.delete(id);
            }
        }
        
        // Clean up communication history
        this.communicationHistory = this.communicationHistory.filter(
            record => currentTime - record.timestamp < cleanupTime
        );
    }
    
    /**
     * Create message
     */
    createMessage(type, data, target = null) {
        return {
            id: this.generateMessageId(),
            type: type,
            data: data,
            sender: this.bot.id,
            target: target,
            timestamp: Date.now(),
            priority: this.getMessagePriority(type),
            effective: false
        };
    }
    
    /**
     * Queue message for sending
     */
    queueMessage(message) {
        this.messageQueue.push(message);
    }
    
    /**
     * Get message priority
     */
    getMessagePriority(type) {
        const priorities = {
            threat: 1,
            command: 1,
            request: 2,
            response: 2,
            resource: 3,
            position: 4,
            status: 4,
            emotion: 5
        };
        return priorities[type] || 5;
    }
    
    /**
     * Generate unique message ID
     */
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Validate message
     */
    validateMessage(message) {
        return message && message.type && message.data && message.sender;
    }
    
    /**
     * Validate received message
     */
    validateReceivedMessage(message) {
        return this.validateMessage(message) && message.sender !== this.bot.id;
    }
    
    /**
     * Get recent messages
     */
    getRecentMessages(seconds) {
        const cutoffTime = Date.now() - (seconds * 1000);
        return this.communicationHistory.filter(record => record.timestamp > cutoffTime);
    }
    
    /**
     * Record communication
     */
    recordCommunication(message, direction) {
        const record = {
            message: message,
            direction: direction,
            timestamp: Date.now()
        };
        
        this.communicationHistory.push(record);
    }
    
    /**
     * Get communication range based on difficulty
     */
    getCommunicationRange() {
        const ranges = {
            easy: 15,
            medium: 25,
            hard: 35,
            expert: 45
        };
        return ranges[this.brain.difficulty] || 25;
    }
    
    /**
     * Get communication delay based on difficulty
     */
    getCommunicationDelay() {
        const delays = {
            easy: 500,
            medium: 300,
            hard: 200,
            expert: 100
        };
        return delays[this.brain.difficulty] || 300;
    }
    
    /**
     * Get nearby bots
     */
    getNearbyBots() {
        // This would integrate with the game's bot system
        return [];
    }
    
    /**
     * Get bot by ID
     */
    getBotById(id) {
        // This would integrate with the game's bot system
        return null;
    }
    
    /**
     * Create communication protocols
     */
    createThreatProtocol() {
        return {
            priority: 1,
            frequency: 1000, // 1 second
            dataFields: ['position', 'threatLevel', 'type', 'confidence']
        };
    }
    
    createResourceProtocol() {
        return {
            priority: 3,
            frequency: 5000, // 5 seconds
            dataFields: ['type', 'amount', 'position', 'available']
        };
    }
    
    createPositionProtocol() {
        return {
            priority: 4,
            frequency: 2000, // 2 seconds
            dataFields: ['position', 'velocity', 'health', 'ammo', 'combatState']
        };
    }
    
    createObjectiveProtocol() {
        return {
            priority: 2,
            frequency: 3000, // 3 seconds
            dataFields: ['objective', 'status', 'progress', 'requirements']
        };
    }
    
    createEmotionProtocol() {
        return {
            priority: 5,
            frequency: 10000, // 10 seconds
            dataFields: ['mood', 'stress', 'confidence', 'fear', 'anger']
        };
    }
    
    // Public API methods
    
    /**
     * Get team status
     */
    getTeamStatus() {
        return {
            status: this.teamStatus,
            members: this.teamMembers.size,
            roles: Object.fromEntries(this.teamRoles),
            objectives: this.teamObjectives,
            coordinationLevel: this.calculateCoordinationLevel()
        };
    }
    
    /**
     * Get communication statistics
     */
    getCommunicationStats() {
        return {
            messagesSent: this.sentMessages.size,
            messagesReceived: this.receivedMessages.size,
            messagesQueued: this.messageQueue.length,
            communicationHistory: this.communicationHistory.length,
            teamStatus: this.teamStatus,
            coordinationLevel: this.calculateCoordinationLevel()
        };
    }
    
    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            communicationRange: this.communicationRange,
            communicationDelay: this.communicationDelay,
            messageQueue: this.messageQueue.length,
            sentMessages: this.sentMessages.size,
            receivedMessages: this.receivedMessages.size,
            teamMembers: this.teamMembers.size,
            teamRoles: this.teamRoles.size,
            teamStatus: this.teamStatus,
            coordinationLevel: this.calculateCoordinationLevel(),
            communicationLearning: this.communicationLearning
        };
    }
    
    /**
     * Reset communication system
     */
    reset() {
        this.messageQueue = [];
        this.receivedMessages.clear();
        this.sentMessages.clear();
        this.teamMembers.clear();
        this.teamRoles.clear();
        this.teamObjectives = [];
        this.teamStatus = 'disorganized';
        this.communicationHistory = [];
        this.teamInteractionHistory = [];
        this.communicationLearning = {
            effectiveMessages: new Map(),
            teamCoordination: new Map(),
            responsePatterns: new Map()
        };
    }
}
