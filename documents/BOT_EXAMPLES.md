# Bot System Examples

## Overview

This document provides practical examples of how to use the Voxel Arena Bot System. It covers basic usage, advanced configurations, team coordination, and custom implementations.

## Basic Examples

### Creating a Simple Bot

```javascript
// Basic bot creation
const bot = new Bot(game, 'bot_001', 'medium', 'red');

// Add to game
game.addBot(bot);

// Update bot
function gameLoop(deltaTime) {
    bot.update(deltaTime);
}
```

### Creating Multiple Bots

```javascript
// Create a team of bots
const bots = [];
const teamSize = 4;

for (let i = 0; i < teamSize; i++) {
    const bot = new Bot(game, `bot_${i}`, 'medium', 'red');
    bots.push(bot);
    game.addBot(bot);
}

// Update all bots
function updateBots(deltaTime) {
    bots.forEach(bot => bot.update(deltaTime));
}
```

### Bot Configuration

```javascript
// Create bot with custom configuration
const bot = new Bot(game, 'bot_001', 'hard', 'blue');

// Access AI systems
const brain = bot.brain;
const senses = bot.senses;
const memory = bot.memory;
const personality = bot.personality;
const combat = bot.combat;
const movement = bot.movement;
const communication = bot.communication;

// Customize personality
personality.setTrait('aggression', 0.8);
personality.setTrait('teamwork', 0.9);
personality.setTrait('intelligence', 0.7);

// Configure combat
combat.setEngagementRange(30);
combat.setAccuracy(0.85);
combat.setReactionTime(0.3);

// Configure movement
movement.setMaxSpeed(5.5);
movement.setFlockingEnabled(true);
movement.setCoverSeekingEnabled(true);
```

## Advanced Examples

### Custom Bot Behavior

```javascript
// Create a custom bot with specific behavior
class CustomBot extends Bot {
    constructor(game, id, difficulty, team) {
        super(game, id, difficulty, team);
        
        // Override default behavior
        this.customBehavior = true;
        this.specialAbility = 'stealth';
    }
    
    update(deltaTime) {
        // Call parent update
        super.update(deltaTime);
        
        // Add custom behavior
        this.updateCustomBehavior(deltaTime);
    }
    
    updateCustomBehavior(deltaTime) {
        // Implement custom stealth behavior
        if (this.specialAbility === 'stealth') {
            this.updateStealthBehavior(deltaTime);
        }
    }
    
    updateStealthBehavior(deltaTime) {
        // Reduce visibility when not moving
        if (this.velocity.length() < 0.1) {
            this.visibility = 0.3; // 30% visibility
        } else {
            this.visibility = 1.0; // 100% visibility
        }
    }
}

// Use custom bot
const stealthBot = new CustomBot(game, 'stealth_001', 'hard', 'blue');
game.addBot(stealthBot);
```

### Dynamic Difficulty Adjustment

```javascript
// Bot with dynamic difficulty
class AdaptiveBot extends Bot {
    constructor(game, id, difficulty, team) {
        super(game, id, difficulty, team);
        this.baseDifficulty = difficulty;
        this.performanceHistory = [];
        this.difficultyAdjustment = 0;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        this.updateDifficulty(deltaTime);
    }
    
    updateDifficulty(deltaTime) {
        // Track performance
        const performance = this.calculatePerformance();
        this.performanceHistory.push(performance);
        
        // Keep only recent history
        if (this.performanceHistory.length > 100) {
            this.performanceHistory.shift();
        }
        
        // Adjust difficulty based on performance
        const avgPerformance = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;
        
        if (avgPerformance > 0.7) {
            // Too easy, increase difficulty
            this.difficultyAdjustment = Math.min(0.3, this.difficultyAdjustment + 0.01);
        } else if (avgPerformance < 0.3) {
            // Too hard, decrease difficulty
            this.difficultyAdjustment = Math.max(-0.3, this.difficultyAdjustment - 0.01);
        }
        
        // Apply difficulty adjustment
        this.applyDifficultyAdjustment();
    }
    
    calculatePerformance() {
        const stats = this.getStats();
        const survivalTime = stats.survivalTime;
        const kills = stats.kills;
        const deaths = stats.deaths;
        
        // Calculate performance score
        let performance = 0.5; // Base performance
        
        if (survivalTime > 60) performance += 0.2; // Bonus for surviving
        if (kills > 0) performance += 0.3; // Bonus for kills
        if (deaths > 0) performance -= 0.2; // Penalty for deaths
        
        return Math.max(0, Math.min(1, performance));
    }
    
    applyDifficultyAdjustment() {
        // Adjust AI parameters based on difficulty adjustment
        const adjustment = this.difficultyAdjustment;
        
        // Adjust accuracy
        this.combat.accuracy = Math.max(0.1, Math.min(1, this.combat.accuracy + adjustment));
        
        // Adjust reaction time
        this.combat.reactionTime = Math.max(0.1, Math.min(1, this.combat.reactionTime - adjustment));
        
        // Adjust movement speed
        this.movement.maxSpeed = Math.max(1, Math.min(10, this.movement.maxSpeed + adjustment * 2));
    }
}
```

### Team Coordination

```javascript
// Advanced team coordination
class TeamManager {
    constructor(game) {
        this.game = game;
        this.teams = {
            red: [],
            blue: []
        };
        this.teamRoles = {
            red: ['leader', 'assault', 'support', 'sniper'],
            blue: ['leader', 'assault', 'support', 'sniper']
        };
    }
    
    createTeam(teamColor, size = 4) {
        const team = [];
        
        for (let i = 0; i < size; i++) {
            const bot = new Bot(this.game, `${teamColor}_bot_${i}`, 'medium', teamColor);
            team.push(bot);
            this.game.addBot(bot);
        }
        
        this.teams[teamColor] = team;
        this.assignTeamRoles(teamColor);
        this.setupTeamCommunication(teamColor);
        
        return team;
    }
    
    assignTeamRoles(teamColor) {
        const team = this.teams[teamColor];
        const roles = this.teamRoles[teamColor];
        
        team.forEach((bot, index) => {
            const role = roles[index] || 'assault';
            bot.communication.setTeamRole(role);
            
            // Configure bot based on role
            this.configureBotForRole(bot, role);
        });
    }
    
    configureBotForRole(bot, role) {
        switch (role) {
            case 'leader':
                bot.personality.setTrait('leadership', 0.9);
                bot.personality.setTrait('intelligence', 0.8);
                bot.combat.setEngagementRange(25);
                break;
                
            case 'assault':
                bot.personality.setTrait('aggression', 0.8);
                bot.combat.setEngagementRange(15);
                bot.movement.setMaxSpeed(5.0);
                break;
                
            case 'support':
                bot.personality.setTrait('teamwork', 0.9);
                bot.combat.setEngagementRange(20);
                bot.movement.setMaxSpeed(4.0);
                break;
                
            case 'sniper':
                bot.personality.setTrait('caution', 0.8);
                bot.combat.setEngagementRange(40);
                bot.movement.setMaxSpeed(3.0);
                break;
        }
    }
    
    setupTeamCommunication(teamColor) {
        const team = this.teams[teamColor];
        
        // Set up team communication
        team.forEach(bot => {
            bot.communication.setTeamMembers(team);
            bot.communication.setTeamStatus('organized');
        });
        
        // Set up formation
        this.setupTeamFormation(teamColor);
    }
    
    setupTeamFormation(teamColor) {
        const team = this.teams[teamColor];
        const formation = this.calculateFormation(team);
        
        team.forEach((bot, index) => {
            if (formation.positions[index]) {
                bot.movement.setFormationPosition(formation.center, formation.positions[index]);
            }
        });
    }
    
    calculateFormation(team) {
        const center = new THREE.Vector3(0, 0, 0);
        const positions = [];
        
        // Calculate formation positions
        team.forEach((bot, index) => {
            const angle = (index / team.length) * Math.PI * 2;
            const radius = 5;
            const position = new THREE.Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            positions.push(position);
        });
        
        return {
            center,
            positions,
            type: 'circle'
        };
    }
    
    updateTeams(deltaTime) {
        // Update all teams
        Object.values(this.teams).forEach(team => {
            team.forEach(bot => bot.update(deltaTime));
        });
        
        // Update team coordination
        this.updateTeamCoordination(deltaTime);
    }
    
    updateTeamCoordination(deltaTime) {
        // Update team formations
        Object.keys(this.teams).forEach(teamColor => {
            this.updateTeamFormation(teamColor);
        });
        
        // Update team objectives
        this.updateTeamObjectives();
    }
    
    updateTeamFormation(teamColor) {
        const team = this.teams[teamColor];
        if (team.length < 2) return;
        
        // Check if formation needs updating
        const coordinationLevel = team[0].communication.getTeamStatus().coordinationLevel;
        
        if (coordinationLevel > 0.7) {
            // High coordination, maintain formation
            this.maintainFormation(team);
        } else {
            // Low coordination, regroup
            this.regroupTeam(team);
        }
    }
    
    maintainFormation(team) {
        const leader = team.find(bot => bot.communication.getTeamRole() === 'leader');
        if (!leader) return;
        
        const formation = this.calculateFormation(team);
        
        team.forEach((bot, index) => {
            if (bot !== leader && formation.positions[index]) {
                const targetPosition = leader.position.clone().add(formation.positions[index]);
                bot.movement.moveTo(targetPosition);
            }
        });
    }
    
    regroupTeam(team) {
        const leader = team.find(bot => bot.communication.getTeamRole() === 'leader');
        if (!leader) return;
        
        // Move all bots towards leader
        team.forEach(bot => {
            if (bot !== leader) {
                const distance = bot.position.distanceTo(leader.position);
                if (distance > 10) {
                    bot.movement.moveTo(leader.position);
                }
            }
        });
    }
    
    updateTeamObjectives() {
        // Implement team objective management
        Object.keys(this.teams).forEach(teamColor => {
            const team = this.teams[teamColor];
            const objectives = this.getTeamObjectives(teamColor);
            
            team.forEach(bot => {
                bot.communication.setTeamObjectives(objectives);
            });
        });
    }
    
    getTeamObjectives(teamColor) {
        // Return team-specific objectives
        return [
            'eliminate_enemies',
            'control_territory',
            'protect_allies',
            'complete_mission'
        ];
    }
}

// Use team manager
const teamManager = new TeamManager(game);

// Create teams
const redTeam = teamManager.createTeam('red', 4);
const blueTeam = teamManager.createTeam('blue', 4);

// Update teams
function updateTeams(deltaTime) {
    teamManager.updateTeams(deltaTime);
}
```

### Custom Combat Strategies

```javascript
// Custom combat strategy
class TacticalBot extends Bot {
    constructor(game, id, difficulty, team) {
        super(game, id, difficulty, team);
        this.combatStrategy = 'tactical';
        this.tacticalState = 'reconnaissance';
        this.lastTacticalUpdate = 0;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        this.updateTacticalBehavior(deltaTime);
    }
    
    updateTacticalBehavior(deltaTime) {
        const currentTime = Date.now();
        
        // Update tactical state every 2 seconds
        if (currentTime - this.lastTacticalUpdate > 2000) {
            this.updateTacticalState();
            this.lastTacticalUpdate = currentTime;
        }
        
        // Execute tactical behavior
        this.executeTacticalBehavior(deltaTime);
    }
    
    updateTacticalState() {
        const situation = this.brain.analyzeSituation();
        const threats = this.senses.getThreats();
        const allies = this.senses.getAllies();
        
        // Determine tactical state
        if (threats.length === 0) {
            this.tacticalState = 'reconnaissance';
        } else if (threats.length > 0 && allies.length >= 2) {
            this.tacticalState = 'coordinated_attack';
        } else if (threats.length > 0 && allies.length < 2) {
            this.tacticalState = 'guerrilla_warfare';
        } else if (situation.health < 0.3) {
            this.tacticalState = 'retreat';
        }
    }
    
    executeTacticalBehavior(deltaTime) {
        switch (this.tacticalState) {
            case 'reconnaissance':
                this.executeReconnaissance();
                break;
            case 'coordinated_attack':
                this.executeCoordinatedAttack();
                break;
            case 'guerrilla_warfare':
                this.executeGuerrillaWarfare();
                break;
            case 'retreat':
                this.executeRetreat();
                break;
        }
    }
    
    executeReconnaissance() {
        // Move to high ground or cover
        const coverSpots = this.senses.findCover();
        if (coverSpots.length > 0) {
            this.movement.moveTo(coverSpots[0].position);
        }
        
        // Look for enemies
        const enemies = this.senses.getEnemies();
        if (enemies.length > 0) {
            this.combat.engageTarget(enemies[0]);
        }
    }
    
    executeCoordinatedAttack() {
        const allies = this.senses.getAllies();
        const threats = this.senses.getThreats();
        
        if (threats.length > 0) {
            // Coordinate attack with allies
            this.coordinateAttackWithAllies(threats[0], allies);
        }
    }
    
    executeGuerrillaWarfare() {
        const threats = this.senses.getThreats();
        
        if (threats.length > 0) {
            // Hit and run tactics
            this.executeHitAndRun(threats[0]);
        }
    }
    
    executeRetreat() {
        const threats = this.senses.getThreats();
        
        if (threats.length > 0) {
            // Retreat to safe position
            this.movement.fleeFrom(threats[0].position, 20);
        }
    }
    
    coordinateAttackWithAllies(target, allies) {
        // Send attack command to allies
        const message = this.communication.createMessage('command', {
            type: 'attack',
            target: target,
            position: target.position,
            strategy: 'coordinated'
        });
        
        allies.forEach(ally => {
            this.communication.sendMessage(message);
        });
        
        // Execute own attack
        this.combat.engageTarget(target);
    }
    
    executeHitAndRun(target) {
        // Fire at target
        this.combat.engageTarget(target);
        
        // Move to new position
        const newPosition = this.calculateHitAndRunPosition(target);
        this.movement.moveTo(newPosition);
    }
    
    calculateHitAndRunPosition(target) {
        // Calculate position for hit and run
        const direction = this.position.clone().sub(target.position).normalize();
        const distance = 15;
        const angle = Math.random() * Math.PI * 2;
        
        const offset = new THREE.Vector3(
            Math.cos(angle) * distance,
            0,
            Math.sin(angle) * distance
        );
        
        return target.position.clone().add(offset);
    }
}
```

### Memory-Based Learning

```javascript
// Bot with advanced learning
class LearningBot extends Bot {
    constructor(game, id, difficulty, team) {
        super(game, id, difficulty, team);
        this.learningEnabled = true;
        this.learningRate = 0.1;
        this.experienceBuffer = [];
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        this.updateLearning(deltaTime);
    }
    
    updateLearning(deltaTime) {
        if (!this.learningEnabled) return;
        
        // Collect experience
        this.collectExperience();
        
        // Learn from experience
        this.learnFromExperience();
        
        // Update behavior based on learning
        this.updateBehaviorFromLearning();
    }
    
    collectExperience() {
        const currentState = this.getCurrentState();
        const action = this.getCurrentAction();
        const reward = this.calculateReward();
        
        this.experienceBuffer.push({
            state: currentState,
            action: action,
            reward: reward,
            timestamp: Date.now()
        });
        
        // Keep only recent experience
        if (this.experienceBuffer.length > 1000) {
            this.experienceBuffer.shift();
        }
    }
    
    getCurrentState() {
        return {
            position: this.position.clone(),
            health: this.health,
            ammo: this.weapon.ammo,
            threats: this.senses.getThreats().length,
            allies: this.senses.getAllies().length,
            cover: this.senses.findCover().length
        };
    }
    
    getCurrentAction() {
        return {
            combatState: this.combat.getCombatState(),
            movementState: this.movement.getMovementState(),
            target: this.combat.getCurrentTarget()?.id
        };
    }
    
    calculateReward() {
        const stats = this.getStats();
        let reward = 0;
        
        // Positive rewards
        if (stats.kills > 0) reward += 10;
        if (stats.survivalTime > 60) reward += 5;
        if (this.health > 0.5) reward += 2;
        
        // Negative rewards
        if (stats.deaths > 0) reward -= 20;
        if (this.health < 0.2) reward -= 5;
        if (this.weapon.ammo === 0) reward -= 3;
        
        return reward;
    }
    
    learnFromExperience() {
        if (this.experienceBuffer.length < 100) return;
        
        // Simple Q-learning implementation
        const recentExperiences = this.experienceBuffer.slice(-100);
        
        for (const experience of recentExperiences) {
            this.updateQValue(experience);
        }
    }
    
    updateQValue(experience) {
        // Simple Q-learning update
        const { state, action, reward } = experience;
        const qValue = this.getQValue(state, action);
        const newQValue = qValue + this.learningRate * (reward - qValue);
        
        this.setQValue(state, action, newQValue);
    }
    
    getQValue(state, action) {
        const key = this.getStateActionKey(state, action);
        return this.qValues[key] || 0;
    }
    
    setQValue(state, action, value) {
        const key = this.getStateActionKey(state, action);
        this.qValues[key] = value;
    }
    
    getStateActionKey(state, action) {
        return JSON.stringify({ state, action });
    }
    
    updateBehaviorFromLearning() {
        // Update behavior based on learned Q-values
        const currentState = this.getCurrentState();
        const bestAction = this.getBestAction(currentState);
        
        // Apply learned behavior
        this.applyLearnedBehavior(bestAction);
    }
    
    getBestAction(state) {
        const actions = ['patrol', 'engage', 'retreat', 'seek_cover'];
        let bestAction = 'patrol';
        let bestValue = -Infinity;
        
        for (const action of actions) {
            const value = this.getQValue(state, action);
            if (value > bestValue) {
                bestValue = value;
                bestAction = action;
            }
        }
        
        return bestAction;
    }
    
    applyLearnedBehavior(action) {
        switch (action) {
            case 'patrol':
                this.movement.setTarget(this.getRandomPatrolPoint());
                break;
            case 'engage':
                const threats = this.senses.getThreats();
                if (threats.length > 0) {
                    this.combat.engageTarget(threats[0]);
                }
                break;
            case 'retreat':
                const threats = this.senses.getThreats();
                if (threats.length > 0) {
                    this.movement.fleeFrom(threats[0].position, 20);
                }
                break;
            case 'seek_cover':
                const coverSpots = this.senses.findCover();
                if (coverSpots.length > 0) {
                    this.movement.moveTo(coverSpots[0].position);
                }
                break;
        }
    }
    
    getRandomPatrolPoint() {
        // Return random patrol point
        return new THREE.Vector3(
            (Math.random() - 0.5) * 50,
            0,
            (Math.random() - 0.5) * 50
        );
    }
}
```

## Integration Examples

### Game Integration

```javascript
// Game class with bot integration
class GameWithBots extends Game {
    constructor() {
        super();
        this.bots = [];
        this.botManager = new BotManager(this);
    }
    
    addBot(bot) {
        this.bots.push(bot);
        this.scene.add(bot.mesh);
    }
    
    removeBot(bot) {
        const index = this.bots.indexOf(bot);
        if (index > -1) {
            this.bots.splice(index, 1);
            this.scene.remove(bot.mesh);
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        this.updateBots(deltaTime);
    }
    
    updateBots(deltaTime) {
        this.bots.forEach(bot => {
            if (bot.isActive) {
                bot.update(deltaTime);
            }
        });
    }
    
    getSpawnPoints() {
        // Return available spawn points
        return [
            new THREE.Vector3(10, 0, 10),
            new THREE.Vector3(-10, 0, 10),
            new THREE.Vector3(10, 0, -10),
            new THREE.Vector3(-10, 0, -10)
        ];
    }
    
    addBullet(position, direction) {
        // Add bullet to game
        const bullet = new Bullet(this.scene, position, direction);
        this.bullets.push(bullet);
    }
}
```

### Performance Optimization

```javascript
// Optimized bot manager
class OptimizedBotManager {
    constructor(game) {
        this.game = game;
        this.bots = [];
        this.updateGroups = {
            high: [],    // Close bots, full update
            medium: [],  // Medium distance, reduced update
            low: []      // Far bots, minimal update
        };
        this.lastGroupUpdate = 0;
    }
    
    addBot(bot) {
        this.bots.push(bot);
        this.updateBotGroups();
    }
    
    update(deltaTime) {
        // Update high priority bots every frame
        this.updateBots(this.updateGroups.high, deltaTime);
        
        // Update medium priority bots every 2 frames
        if (this.game.frameCount % 2 === 0) {
            this.updateBots(this.updateGroups.medium, deltaTime * 2);
        }
        
        // Update low priority bots every 5 frames
        if (this.game.frameCount % 5 === 0) {
            this.updateBots(this.updateGroups.low, deltaTime * 5);
        }
        
        // Update groups every second
        if (Date.now() - this.lastGroupUpdate > 1000) {
            this.updateBotGroups();
            this.lastGroupUpdate = Date.now();
        }
    }
    
    updateBots(bots, deltaTime) {
        bots.forEach(bot => {
            if (bot.isActive) {
                bot.update(deltaTime);
            }
        });
    }
    
    updateBotGroups() {
        // Clear groups
        this.updateGroups.high = [];
        this.updateGroups.medium = [];
        this.updateGroups.low = [];
        
        // Group bots by distance to player
        const playerPosition = this.game.player?.position || new THREE.Vector3();
        
        this.bots.forEach(bot => {
            const distance = bot.position.distanceTo(playerPosition);
            
            if (distance < 20) {
                this.updateGroups.high.push(bot);
            } else if (distance < 50) {
                this.updateGroups.medium.push(bot);
            } else {
                this.updateGroups.low.push(bot);
            }
        });
    }
}
```

## Debugging Examples

### Debug Visualization

```javascript
// Debug visualization for bots
class BotDebugVisualizer {
    constructor(scene) {
        this.scene = scene;
        this.debugObjects = [];
    }
    
    visualizeBot(bot) {
        // Clear previous debug objects
        this.clearDebugObjects();
        
        // Visualize bot state
        this.visualizeBotState(bot);
        this.visualizeBotSenses(bot);
        this.visualizeBotMemory(bot);
        this.visualizeBotCombat(bot);
        this.visualizeBotMovement(bot);
        this.visualizeBotCommunication(bot);
    }
    
    visualizeBotState(bot) {
        // Health indicator
        const healthBar = this.createHealthBar(bot);
        this.scene.add(healthBar);
        this.debugObjects.push(healthBar);
        
        // Team indicator
        const teamIndicator = this.createTeamIndicator(bot);
        this.scene.add(teamIndicator);
        this.debugObjects.push(teamIndicator);
    }
    
    visualizeBotSenses(bot) {
        const senses = bot.senses;
        
        // Vision range
        const visionRange = this.createVisionRange(bot, senses.visionRange);
        this.scene.add(visionRange);
        this.debugObjects.push(visionRange);
        
        // Field of view
        const fieldOfView = this.createFieldOfView(bot, senses.fieldOfView);
        this.scene.add(fieldOfView);
        this.debugObjects.push(fieldOfView);
        
        // Threats
        const threats = senses.getThreats();
        threats.forEach(threat => {
            const threatIndicator = this.createThreatIndicator(threat);
            this.scene.add(threatIndicator);
            this.debugObjects.push(threatIndicator);
        });
    }
    
    visualizeBotMemory(bot) {
        const memory = bot.memory;
        
        // Recent events
        const recentEvents = memory.getRecentEvents(5);
        recentEvents.forEach((event, index) => {
            const eventIndicator = this.createEventIndicator(event, index);
            this.scene.add(eventIndicator);
            this.debugObjects.push(eventIndicator);
        });
    }
    
    visualizeBotCombat(bot) {
        const combat = bot.combat;
        
        // Current target
        const target = combat.getCurrentTarget();
        if (target) {
            const targetLine = this.createTargetLine(bot, target);
            this.scene.add(targetLine);
            this.debugObjects.push(targetLine);
        }
        
        // Engagement range
        const engagementRange = this.createEngagementRange(bot, combat.engagementRange);
        this.scene.add(engagementRange);
        this.debugObjects.push(engagementRange);
    }
    
    visualizeBotMovement(bot) {
        const movement = bot.movement;
        
        // Current path
        const path = movement.currentPath;
        if (path.length > 0) {
            const pathLine = this.createPathLine(path);
            this.scene.add(pathLine);
            this.debugObjects.push(pathLine);
        }
        
        // Movement target
        const target = movement.currentTarget;
        if (target) {
            const targetIndicator = this.createTargetIndicator(target);
            this.scene.add(targetIndicator);
            this.debugObjects.push(targetIndicator);
        }
    }
    
    visualizeBotCommunication(bot) {
        const communication = bot.communication;
        
        // Communication range
        const commRange = this.createCommunicationRange(bot, communication.communicationRange);
        this.scene.add(commRange);
        this.debugObjects.push(commRange);
        
        // Team members
        const teamMembers = communication.teamMembers;
        teamMembers.forEach(member => {
            const teamLine = this.createTeamLine(bot, member);
            this.scene.add(teamLine);
            this.debugObjects.push(teamLine);
        });
    }
    
    createHealthBar(bot) {
        const geometry = new THREE.BoxGeometry(2, 0.1, 0.1);
        const material = new THREE.MeshBasicMaterial({ 
            color: bot.health > 0.5 ? 0x00ff00 : 0xff0000 
        });
        const healthBar = new THREE.Mesh(geometry, material);
        healthBar.position.copy(bot.position);
        healthBar.position.y += 3;
        return healthBar;
    }
    
    createTeamIndicator(bot) {
        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = new THREE.MeshBasicMaterial({ 
            color: bot.team === 'red' ? 0xff0000 : 0x0000ff 
        });
        const indicator = new THREE.Mesh(geometry, material);
        indicator.position.copy(bot.position);
        indicator.position.y += 2.5;
        return indicator;
    }
    
    createVisionRange(bot, range) {
        const geometry = new THREE.CircleGeometry(range, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            transparent: true, 
            opacity: 0.1 
        });
        const visionRange = new THREE.Mesh(geometry, material);
        visionRange.position.copy(bot.position);
        visionRange.rotation.x = -Math.PI / 2;
        return visionRange;
    }
    
    createFieldOfView(bot, fov) {
        const geometry = new THREE.ConeGeometry(bot.senses.visionRange, fov, 8);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xffff00, 
            transparent: true, 
            opacity: 0.2 
        });
        const fieldOfView = new THREE.Mesh(geometry, material);
        fieldOfView.position.copy(bot.position);
        fieldOfView.rotation.copy(bot.rotation);
        return fieldOfView;
    }
    
    createThreatIndicator(threat) {
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff0000, 
            transparent: true, 
            opacity: 0.5 
        });
        const indicator = new THREE.Mesh(geometry, material);
        indicator.position.copy(threat.position);
        return indicator;
    }
    
    createEventIndicator(event, index) {
        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff, 
            transparent: true, 
            opacity: 0.7 
        });
        const indicator = new THREE.Mesh(geometry, material);
        indicator.position.copy(event.position);
        indicator.position.y += index * 0.5;
        return indicator;
    }
    
    createTargetLine(bot, target) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            bot.position.x, bot.position.y, bot.position.z,
            target.position.x, target.position.y, target.position.z
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const line = new THREE.Line(geometry, material);
        return line;
    }
    
    createEngagementRange(bot, range) {
        const geometry = new THREE.CircleGeometry(range, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff0000, 
            transparent: true, 
            opacity: 0.1 
        });
        const engagementRange = new THREE.Mesh(geometry, material);
        engagementRange.position.copy(bot.position);
        engagementRange.rotation.x = -Math.PI / 2;
        return engagementRange;
    }
    
    createPathLine(path) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(path.length * 3);
        
        path.forEach((point, index) => {
            positions[index * 3] = point.x;
            positions[index * 3 + 1] = point.y;
            positions[index * 3 + 2] = point.z;
        });
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const line = new THREE.Line(geometry, material);
        return line;
    }
    
    createTargetIndicator(target) {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x0000ff, 
            transparent: true, 
            opacity: 0.5 
        });
        const indicator = new THREE.Mesh(geometry, material);
        indicator.position.copy(target);
        return indicator;
    }
    
    createCommunicationRange(bot, range) {
        const geometry = new THREE.CircleGeometry(range, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x0000ff, 
            transparent: true, 
            opacity: 0.1 
        });
        const commRange = new THREE.Mesh(geometry, material);
        commRange.position.copy(bot.position);
        commRange.rotation.x = -Math.PI / 2;
        return commRange;
    }
    
    createTeamLine(bot, member) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            bot.position.x, bot.position.y, bot.position.z,
            member.position.x, member.position.y, member.position.z
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const line = new THREE.Line(geometry, material);
        return line;
    }
    
    clearDebugObjects() {
        this.debugObjects.forEach(obj => {
            this.scene.remove(obj);
        });
        this.debugObjects = [];
    }
}

// Use debug visualizer
const debugVisualizer = new BotDebugVisualizer(game.scene);

// Visualize bot state
function visualizeBot(bot) {
    debugVisualizer.visualizeBot(bot);
}
```

## Conclusion

These examples demonstrate the flexibility and power of the Voxel Arena Bot System. From basic bot creation to advanced team coordination and learning systems, the framework provides the tools needed to create sophisticated AI opponents.

The modular architecture allows for easy customization and extension, while the comprehensive API ensures that complex behaviors can be implemented with relative ease. Whether you're creating simple patrol bots or advanced tactical teams, the system provides the foundation for engaging and challenging AI opponents.
