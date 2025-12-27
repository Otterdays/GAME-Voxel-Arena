/**
 * BotManager - Game Integration System for Bot Management
 * 
 * This class integrates the bot system with the existing Voxel Arena game engine.
 * It handles bot lifecycle, performance optimization, and game integration.
 */

import { Bot } from './Bot.js';

export class BotManager {
    constructor(game) {
        this.game = game;
        this.bots = new Map();
        this.botCounter = 0;
        
        // Performance optimization
        this.updateGroups = {
            high: [],    // Close bots, full update
            medium: [],  // Medium distance, reduced update
            low: []      // Far bots, minimal update
        };
        this.lastGroupUpdate = 0;
        this.groupUpdateInterval = 1000; // 1 second
        
        // Bot configuration
        this.maxBots = 8;
        this.spawnPoints = [];
        this.teamSpawnPoints = {
            red: [],
            blue: []
        };
        
        // Statistics
        this.stats = {
            totalBotsCreated: 0,
            totalBotsDestroyed: 0,
            activeBots: 0,
            averagePerformance: 0,
            totalUpdateTime: 0
        };
        
        // Events
        this.eventListeners = new Map();
        
        console.log('BotManager initialized');

        // Add logging configuration
        this.debugLogging = true;
        this.logBotLifecycle = true;
        this.logPerformance = false;
    }

    /**
     * Log bot lifecycle event
     */
    logBotEvent(eventType, bot, data = {}) {
        if (!this.logBotLifecycle) return;

        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] Bot ${bot.id} (${bot.config.name}): ${eventType}`;

        console.log(logMessage, data);

        // Emit event for external logging systems
        this.emit('botLogEvent', {
            timestamp,
            botId: bot.id,
            botName: bot.config.name,
            eventType,
            data,
            stats: this.getBotStats()
        });
    }

    /**
     * Log performance metrics
     */
    logPerformanceMetrics(deltaTime, updateTime) {
        if (!this.logPerformance) return;

        const performanceData = {
            activeBots: this.stats.activeBots,
            updateTime: updateTime.toFixed(2) + 'ms',
            fps: (1000 / deltaTime).toFixed(1),
            botGroups: {
                high: this.updateGroups.high.length,
                medium: this.updateGroups.medium.length,
                low: this.updateGroups.low.length
            }
        };

        console.log('[PERF]', performanceData);
    }

    /**
     * Initialize bot manager with game
     */
    initialize(mapSettings = {}) {
        // Store map settings
        this.mapSettings = mapSettings;
        
        // Set up spawn points
        this.setupSpawnPoints();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Create initial bots based on settings
        this.createInitialBots();
        
        console.log('BotManager initialized with', this.bots.size, 'bots and settings:', mapSettings);
    }
    
    /**
     * Set up spawn points
     */
    setupSpawnPoints() {
        // Get spawn points from arena data
        const arena = this.game.arenaData;
        if (arena) {
            // Use bot spawn areas if available
            if (arena.botSpawnAreas) {
                // Add red team spawns
                arena.botSpawnAreas.red.forEach(spawn => {
                    this.spawnPoints.push(new THREE.Vector3(spawn.x, spawn.y, spawn.z));
                    this.teamSpawnPoints.red.push(new THREE.Vector3(spawn.x, spawn.y, spawn.z));
                });
                
                // Add blue team spawns
                arena.botSpawnAreas.blue.forEach(spawn => {
                    this.spawnPoints.push(new THREE.Vector3(spawn.x, spawn.y, spawn.z));
                    this.teamSpawnPoints.blue.push(new THREE.Vector3(spawn.x, spawn.y, spawn.z));
                });
            }
            
            // Fallback to general spawn points
            if (this.spawnPoints.length === 0 && arena.spawnPoints) {
                arena.spawnPoints.forEach(spawn => {
                    this.spawnPoints.push(new THREE.Vector3(spawn.x, spawn.y, spawn.z));
                });
            }
        }
        
        // Default spawn points if none found
        if (this.spawnPoints.length === 0) {
            this.spawnPoints = [
                new THREE.Vector3(10, 0, 10),
                new THREE.Vector3(-10, 0, 10),
                new THREE.Vector3(10, 0, -10),
                new THREE.Vector3(-10, 0, -10),
                new THREE.Vector3(0, 0, 15),
                new THREE.Vector3(0, 0, -15),
                new THREE.Vector3(15, 0, 0),
                new THREE.Vector3(-15, 0, 0)
            ];
        }
        
        // Distribute spawn points between teams
        this.distributeSpawnPoints();
    }
    
    /**
     * Distribute spawn points between teams
     */
    distributeSpawnPoints() {
        const halfPoints = Math.floor(this.spawnPoints.length / 2);
        
        // Red team gets first half
        this.teamSpawnPoints.red = this.spawnPoints.slice(0, halfPoints);
        
        // Blue team gets second half
        this.teamSpawnPoints.blue = this.spawnPoints.slice(halfPoints);
        
        console.log('Spawn points distributed:', {
            red: this.teamSpawnPoints.red.length,
            blue: this.teamSpawnPoints.blue.length
        });
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Note: Game class doesn't have addEventListener method
        // Event handling will be done through direct method calls
        // This method is kept for future event system implementation
        console.log('Event listeners setup (placeholder for future implementation)');
    }
    
    /**
     * Create initial bots
     */
    createInitialBots() {
        // Get team-specific bot counts from map settings
        const redTeamBotCount = this.mapSettings.redTeamBotCount || 2;
        const blueTeamBotCount = this.mapSettings.blueTeamBotCount || 2;
        const difficulty = this.mapSettings.botDifficulty || 'medium';
        
        // Create red team bots
        for (let i = 0; i < redTeamBotCount; i++) {
            this.createBot('red', difficulty);
        }
        
        // Create blue team bots
        for (let i = 0; i < blueTeamBotCount; i++) {
            this.createBot('blue', difficulty);
        }
        
        // Set player team if specified
        if (this.mapSettings.playerTeam && this.game.player) {
            this.game.player.team = this.mapSettings.playerTeam;
            this.assignPlayerToTeamSpawn();
        }

        // Debug: Log bot creation summary
        console.log(`Bot creation complete. Total bots: ${this.bots.size}`);
        console.log(`Red team bots: ${this.getBotsByTeam('red').length}`);
        console.log(`Blue team bots: ${this.getBotsByTeam('blue').length}`);
        console.log(`Player team: ${this.game.player?.team || 'not set'}`);
    }
    
    /**
     * Assign player to appropriate team spawn point
     */
    assignPlayerToTeamSpawn() {
        if (!this.game.player || !this.game.player.team) return;
        
        const playerTeam = this.game.player.team;
        const teamSpawns = this.teamSpawnPoints[playerTeam];
        
        if (teamSpawns && teamSpawns.length > 0) {
            // Move player to a random spawn point for their team
            const randomSpawn = teamSpawns[Math.floor(Math.random() * teamSpawns.length)];
            this.game.player.mesh.position.set(randomSpawn.x, randomSpawn.y, randomSpawn.z);
            
            // Update player color based on team
            this.updatePlayerTeamColor();
        }
    }
    
    /**
     * Update player visual appearance based on team
     */
    updatePlayerTeamColor() {
        if (!this.game.player || !this.game.player.mesh) return;
        
        const teamColor = this.game.player.team === 'red' ? 0xff0000 : 0x0000ff;
        
        // Update the player's mesh color
        this.game.player.mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.color.setHex(teamColor);
            }
        });
    }
    
    /**
     * Create a new bot
     */
    createBot(team = 'red', difficulty = 'medium') {
        if (this.bots.size >= this.maxBots) {
            console.warn('Maximum bot count reached');
            return null;
        }
        
        const botId = `bot_${this.botCounter++}`;
        const bot = new Bot(this.game, botId, difficulty, team);
        
        // Set spawn position
        const spawnPoint = this.getSpawnPoint(team);
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/a54cc6ed-de47-439c-aed6-cbc76d8a46bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BotManager.js:270',message:'createBot: got spawn point',data:{botId,team,spawnPoint:{x:spawnPoint?.x,y:spawnPoint?.y,z:spawnPoint?.z},spawnPointExists:!!spawnPoint},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
        // Adjust spawn point Y to be above the ground
        // Arena ground is at y=-2 to 0, character model has body at y=1.0, so spawn at y=1.0 to be above ground
        spawnPoint.y = 1.0; // Above ground level (character model offset)
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/a54cc6ed-de47-439c-aed6-cbc76d8a46bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BotManager.js:273',message:'createBot: adjusted spawn Y, calling setPosition',data:{botId,spawnPoint:{x:spawnPoint.x,y:spawnPoint.y,z:spawnPoint.z}},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
        bot.setPosition(spawnPoint);
        
        // Debug: Log bot spawn position
        console.log(`Bot ${botId} spawned at: ${spawnPoint.x.toFixed(1)}, ${spawnPoint.y.toFixed(1)}, ${spawnPoint.z.toFixed(1)}`);
        
        // Store bot
        this.bots.set(botId, bot);
        
        // Add bot to update groups immediately
        this.updateBotGroups();
        
        // Update statistics
        this.stats.totalBotsCreated++;
        this.stats.activeBots = this.bots.size;
        
        // Emit event
        this.emit('botCreated', { bot, team, difficulty });
        
        console.log(`Bot ${botId} created for team ${team} with difficulty ${difficulty}`);
        
        return bot;
    }
    
    /**
     * Remove a bot
     */
    removeBot(botId) {
        const bot = this.bots.get(botId);
        if (!bot) {
            console.warn(`Bot ${botId} not found`);
            return false;
        }
        
        // Remove from game
        this.game.scene.remove(bot.mesh);
        
        // Remove from bots map
        this.bots.delete(botId);
        
        // Update statistics
        this.stats.totalBotsDestroyed++;
        this.stats.activeBots = this.bots.size;
        
        // Emit event
        this.emit('botRemoved', { bot, botId });
        
        console.log(`Bot ${botId} removed`);
        
        return true;
    }
    
    /**
     * Get spawn point for team
     */
    getSpawnPoint(team) {
        const teamSpawns = this.teamSpawnPoints[team];
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/a54cc6ed-de47-439c-aed6-cbc76d8a46bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BotManager.js:328',message:'getSpawnPoint: called',data:{team,teamSpawnsLength:teamSpawns?.length||0,generalSpawnsLength:this.spawnPoints?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        
        if (teamSpawns.length === 0) {
            // Fallback to general spawn points
            const fallbackSpawn = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/a54cc6ed-de47-439c-aed6-cbc76d8a46bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BotManager.js:332',message:'getSpawnPoint: returning fallback',data:{team,fallbackSpawn:{x:fallbackSpawn?.x,y:fallbackSpawn?.y,z:fallbackSpawn?.z}},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'F'})}).catch(()=>{});
            // #endregion
            return fallbackSpawn;
        }
        
        // Return random spawn point for team
        const selectedSpawn = teamSpawns[Math.floor(Math.random() * teamSpawns.length)];
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/a54cc6ed-de47-439c-aed6-cbc76d8a46bc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BotManager.js:336',message:'getSpawnPoint: returning team spawn',data:{team,selectedSpawn:{x:selectedSpawn?.x,y:selectedSpawn?.y,z:selectedSpawn?.z}},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        return selectedSpawn;
    }
    
    /**
     * Get random difficulty
     */
    getRandomDifficulty() {
        const difficulties = ['easy', 'medium', 'hard', 'expert'];
        const weights = [0.2, 0.4, 0.3, 0.1]; // Weighted random selection
        
        const random = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < difficulties.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return difficulties[i];
            }
        }
        
        return 'medium'; // Fallback
    }
    
    /**
     * Main update loop
     */
    update(deltaTime) {
        const startTime = performance.now();
        
        // Update bot groups periodically
        if (Date.now() - this.lastGroupUpdate > this.groupUpdateInterval) {
            this.updateBotGroups();
            this.lastGroupUpdate = Date.now();
        }
        
        // Update bots based on priority
        this.updateBotsByPriority(deltaTime);
        
        // Update statistics
        this.updateStatistics(deltaTime, performance.now() - startTime);
        
        // Handle bot lifecycle
        this.handleBotLifecycle();
    }
    
    /**
     * Update bots by priority
     */
    updateBotsByPriority(deltaTime) {
        // Update all bots every frame to ensure smooth movement and consistent physics
        // Optimization: We can throttle AI decision making inside the Bot class if needed
        // but physics/movement must run every frame to prevent "slow motion" bugs at distance.
        
        this.updateBots(this.updateGroups.high, deltaTime);
        this.updateBots(this.updateGroups.medium, deltaTime);
        this.updateBots(this.updateGroups.low, deltaTime);
    }
    
    /**
     * Update specific group of bots
     */
    updateBots(bots, deltaTime) {
        bots.forEach(bot => {
            if (bot.isActive && bot.isAlive) {
                try {
                    bot.update(deltaTime);
                } catch (error) {
                    console.error(`Error updating bot ${bot.id}:`, error);
                    // Don't remove bot on error - try to recover instead
                    this.handleBotError(bot, error);
                }
            }
        });

    }
    
    /**
     * Update bot groups based on distance to player
     */
    updateBotGroups() {
        // Clear groups
        this.updateGroups.high = [];
        this.updateGroups.medium = [];
        this.updateGroups.low = [];
        
        // Get player position
        const playerPosition = this.game.player?.mesh?.position || new THREE.Vector3();
        
        
        // Group bots by distance
        this.bots.forEach(bot => {
            if (!bot.isActive || !bot.isAlive) return;
            
            // Use bot mesh position if available, fallback to bot position
            const botPosition = bot.mesh?.position || bot.position;
            const distance = botPosition.distanceTo(playerPosition);
            
            if (distance < 40) {
                this.updateGroups.high.push(bot);
            } else if (distance < 80) {
                this.updateGroups.medium.push(bot);
            } else {
                this.updateGroups.low.push(bot);
            }
        });

        // Debug: Log group counts occasionally
        if (this.game.frameCount % 60 === 0) {
            console.log(`Bot Groups - High: ${this.updateGroups.high.length}, Medium: ${this.updateGroups.medium.length}, Low: ${this.updateGroups.low.length}`);
        }
        
    }
    
    /**
     * Handle bot lifecycle
     */
    handleBotLifecycle() {
        this.bots.forEach(bot => {
            // Handle bot death
            if (!bot.isAlive && bot.isActive) {
                this.handleBotDeath(bot);
            }
            
            // Handle bot respawn
            if (bot.isAlive && !bot.isActive) {
                this.handleBotRespawn(bot);
            }
        });
    }
    
    /**
     * Handle bot death
     */
    handleBotDeath(bot) {
        // Emit event
        this.emit('botDeath', { bot });
        
        // Schedule respawn
        setTimeout(() => {
            if (this.bots.has(bot.id)) {
                this.respawnBot(bot);
            }
        }, 5000); // 5 second respawn delay
    }
    
    /**
     * Handle bot respawn
     */
    handleBotRespawn(bot) {
        // Set spawn position
        const spawnPoint = this.getSpawnPoint(bot.team);
        bot.setPosition(spawnPoint);

        // Reactivate bot
        bot.activate();

        // Emit event
        this.emit('botRespawn', { bot });
    }

    /**
     * Handle bot errors gracefully
     */
    handleBotError(bot, error) {
        console.error(`Bot ${bot.id} encountered error:`, error.message);

        // Try to recover the bot instead of removing it
        try {
            // Reset bot systems
            if (bot.brain) bot.brain.reset();
            if (bot.movement) bot.movement.reset();
            if (bot.combat) bot.combat.reset();

            // Reinitialize bot position
            const spawnPoint = this.getSpawnPoint(bot.team);
            bot.setPosition(spawnPoint);

            console.log(`Bot ${bot.id} recovered from error`);
        } catch (recoveryError) {
            console.error(`Failed to recover bot ${bot.id}:`, recoveryError);
            // Only remove as last resort
            this.removeBot(bot.id);
        }
    }
    
    /**
     * Respawn a bot
     */
    respawnBot(bot) {
        if (!this.bots.has(bot.id)) return;
        
        // Reset bot state
        bot.respawn();
        
        // Set spawn position
        const spawnPoint = this.getSpawnPoint(bot.team);
        bot.setPosition(spawnPoint);
        
        console.log(`Bot ${bot.id} respawned`);
    }
    
    /**
     * Update statistics
     */
    updateStatistics(deltaTime, updateTime) {
        this.stats.totalUpdateTime += updateTime;
        this.stats.averagePerformance = this.stats.totalUpdateTime / this.stats.totalBotsCreated;
    }
    
    /**
     * Handle player death
     */
    handlePlayerDeath(event) {
        // Bots might react to player death
        this.bots.forEach(bot => {
            if (bot.isAlive && bot.isActive) {
                // Update bot's emotional state
                if (bot.personality) {
                    bot.personality.addExperienceModifier('confidence', 0.1);
                }
            }
        });
    }
    
    /**
     * Handle player respawn
     */
    handlePlayerRespawn(event) {
        // Bots might react to player respawn
        this.bots.forEach(bot => {
            if (bot.isAlive && bot.isActive) {
                // Update bot's emotional state
                if (bot.personality) {
                    bot.personality.addExperienceModifier('caution', 0.05);
                }
            }
        });
    }
    
    /**
     * Handle game start
     */
    handleGameStart(event) {
        // Activate all bots
        this.bots.forEach(bot => {
            bot.activate();
        });
        
    }
    
    /**
     * Handle game end
     */
    handleGameEnd(event) {
        // Deactivate all bots
        this.bots.forEach(bot => {
            bot.deactivate();
        });
        
        console.log('Game ended, all bots deactivated');
    }
    
    /**
     * Get bot by ID
     */
    getBot(botId) {
        return this.bots.get(botId);
    }
    
    /**
     * Get all bots
     */
    getAllBots() {
        return Array.from(this.bots.values());
    }
    
    /**
     * Get bots by team
     */
    getBotsByTeam(team) {
        return Array.from(this.bots.values()).filter(bot => bot.team === team);
    }
    
    /**
     * Get bots by difficulty
     */
    getBotsByDifficulty(difficulty) {
        return Array.from(this.bots.values()).filter(bot => bot.difficulty === difficulty);
    }
    
    /**
     * Get alive bots
     */
    getAliveBots() {
        return Array.from(this.bots.values()).filter(bot => bot.isAlive);
    }
    
    /**
     * Get active bots
     */
    getActiveBots() {
        return Array.from(this.bots.values()).filter(bot => bot.isActive);
    }
    
    /**
     * Get bot statistics
     */
    getBotStats() {
        const bots = Array.from(this.bots.values());
        const stats = {
            total: bots.length,
            alive: bots.filter(bot => bot.isAlive).length,
            active: bots.filter(bot => bot.isActive).length,
            byTeam: {
                red: bots.filter(bot => bot.team === 'red').length,
                blue: bots.filter(bot => bot.team === 'blue').length
            },
            byDifficulty: {
                easy: bots.filter(bot => bot.difficulty === 'easy').length,
                medium: bots.filter(bot => bot.difficulty === 'medium').length,
                hard: bots.filter(bot => bot.difficulty === 'hard').length,
                expert: bots.filter(bot => bot.difficulty === 'expert').length
            }
        };
        
        return stats;
    }
    
    /**
     * Get manager statistics
     */
    getManagerStats() {
        return { ...this.stats };
    }
    
    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            bots: this.bots.size,
            maxBots: this.maxBots,
            spawnPoints: this.spawnPoints.length,
            teamSpawnPoints: {
                red: this.teamSpawnPoints.red.length,
                blue: this.teamSpawnPoints.blue.length
            },
            updateGroups: {
                high: this.updateGroups.high.length,
                medium: this.updateGroups.medium.length,
                low: this.updateGroups.low.length
            },
            stats: this.stats
        };
    }
    
    /**
     * Add event listener
     */
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }
    
    /**
     * Remove event listener
     */
    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    
    /**
     * Emit event
     */
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    
    /**
     * Set maximum bot count
     */
    setMaxBots(maxBots) {
        this.maxBots = Math.max(1, Math.min(16, maxBots));
        
        // Remove excess bots if necessary
        if (this.bots.size > this.maxBots) {
            const excessBots = this.bots.size - this.maxBots;
            const botsToRemove = Array.from(this.bots.values()).slice(0, excessBots);
            botsToRemove.forEach(bot => this.removeBot(bot.id));
        }
    }
    
    /**
     * Clear all bots
     */
    clearAllBots() {
        const botIds = Array.from(this.bots.keys());
        botIds.forEach(botId => this.removeBot(botId));
    }
    
    /**
     * Reset bot manager
     */
    reset() {
        this.clearAllBots();
        this.botCounter = 0;
        this.stats = {
            totalBotsCreated: 0,
            totalBotsDestroyed: 0,
            activeBots: 0,
            averagePerformance: 0,
            totalUpdateTime: 0
        };
        this.updateGroups = {
            high: [],
            medium: [],
            low: []
        };
    }
    
    /**
     * Destroy bot manager
     */
    destroy() {
        this.clearAllBots();
        this.eventListeners.clear();
        this.spawnPoints = [];
        this.teamSpawnPoints = { red: [], blue: [] };
    }
}
