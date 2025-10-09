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
        // Adjust spawn point Y to be above the ground
        // Arena ground is at y=-2 to 0, character model has body at y=1.0, so spawn at y=1.0 to be above ground
        spawnPoint.y = 1.0; // Above ground level (character model offset)
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
        if (teamSpawns.length === 0) {
            // Fallback to general spawn points
            return this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
        }
        
        // Return random spawn point for team
        return teamSpawns[Math.floor(Math.random() * teamSpawns.length)];
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
                    // Remove problematic bot
                    this.removeBot(bot.id);
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
            
            if (distance < 20) {
                this.updateGroups.high.push(bot);
            } else if (distance < 50) {
                this.updateGroups.medium.push(bot);
            } else {
                this.updateGroups.low.push(bot);
            }
        });
        
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
