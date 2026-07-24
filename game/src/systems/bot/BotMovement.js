/**
 * BotMovement - Advanced Movement and Pathfinding System
 * 
 * This system provides sophisticated movement capabilities including:
 * - A* pathfinding with dynamic obstacle avoidance
 * - Flocking behavior for group movement
 * - Cover-seeking and tactical positioning
 * - Smooth movement interpolation
 * - Obstacle avoidance and collision prediction
 * - Formation movement for team coordination
 */

export class BotMovement {
    constructor(brain) {
        this.brain = brain;
        this.bot = brain.bot;

        // Movement parameters — snappy, match player feel
        this.maxSpeed = this.getMaxSpeed();
        this.acceleration = this.getAcceleration();
        this.turnSpeed = this.getTurnSpeed();
        this.stoppingDistance = 1.5;
        this.avoidanceRadius = 2.0;

        // Pathfinding (disabled for direct seek — A* was fighting patrol targets)
        this.pathfindingEnabled = false;
        this.currentPath = [];
        this.pathIndex = 0;
        this.pathUpdateInterval = 0.5;
        this.lastPathUpdate = 0;
        this.pathfindingGrid = null;
        this.gridResolution = 1.0;

        // Movement state
        this.currentTarget = null;
        this.movementState = 'idle';
        this.velocity = new THREE.Vector3();
        this.desiredVelocity = new THREE.Vector3();
        this.steeringForce = new THREE.Vector3();

        // Obstacle avoidance
        this.obstacles = [];
        this.avoidanceForce = new THREE.Vector3();
        this.lookAheadDistance = 3.0;
        this.avoidanceWeight = 0.5;

        // Flocking off by default — was canceling seek when bots clustered at spawn
        this.flockingEnabled = false;
        this.separationWeight = 0.8;
        this.alignmentWeight = 0.2;
        this.cohesionWeight = 0.1;
        this.flockingRadius = 4.0;

        // Cover seeking off by default — was stealing patrol/hunt targets every frame
        this.coverSeekingEnabled = false;
        this.currentCover = null;
        this.coverUpdateInterval = 1.0;
        this.lastCoverUpdate = 0;

        this.formationEnabled = false;
        this.formationPosition = null;
        this.formationOffset = new THREE.Vector3();

        this.smoothMovement = true;
        this.movementSmoothing = 0.1;
        this.rotationSmoothing = 0.15;
    }

    /**
     * Main update loop — keep it lean so bots actually move
     */
    update(deltaTime) {
        const dt = Math.min(deltaTime, 0.05); // clamp spike frames

        if (this.pathfindingEnabled) {
            this.updatePathfinding(dt);
        }

        this.updateMovement(dt);

        if (this.flockingEnabled) {
            this.updateFlocking(dt);
        }

        if (this.coverSeekingEnabled) {
            this.updateCoverSeeking(dt);
        }

        if (this.formationEnabled) {
            this.updateFormationMovement(dt);
        }

        this.applyMovement(dt);
    }

    /**
     * Horizontal distance (ignore Y so patrol Y mismatch never freezes bots)
     */
    horizontalDistance(a, b) {
        const dx = a.x - b.x;
        const dz = a.z - b.z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    /**
     * Update pathfinding system
     */
    updatePathfinding(deltaTime) {
        const currentTime = Date.now();

        if (currentTime - this.lastPathUpdate > this.pathUpdateInterval * 1000) {
            this.updatePath();
            this.lastPathUpdate = currentTime;
        }

        if (this.currentPath.length > 0) {
            this.followPath();
        }
    }

    /**
     * Direct seek with proper acceleration — no double friction, no tiny steering*dt
     */
    updateMovement(deltaTime) {
        try {
            // Bootstrap: if brain hasn't assigned a target yet, patrol
            if (!this.currentTarget) {
                this.executePatrol({});
            }

            if (!this.currentTarget) {
                // Coast to stop
                this.velocity.x *= 0.85;
                this.velocity.z *= 0.85;
                this.velocity.y = 0;
                this.desiredVelocity.set(0, 0, 0);
                this.movementState = 'idle';
                return;
            }

            const toTarget = new THREE.Vector3(
                this.currentTarget.x - this.bot.position.x,
                0,
                this.currentTarget.z - this.bot.position.z
            );
            const dist = toTarget.length();

            if (dist < this.stoppingDistance) {
                // Arrived — clear so next decision picks a new point
                this.currentTarget = null;
                this.velocity.multiplyScalar(0.5);
                this.movementState = 'idle';
                return;
            }

            if (dist < 0.0001) {
                this.desiredVelocity.set(0, 0, 0);
                return;
            }

            toTarget.normalize();
            this.desiredVelocity.copy(toTarget).multiplyScalar(this.maxSpeed);

            // Exponential approach toward desired velocity (frame-rate independent)
            const t = 1 - Math.exp(-this.acceleration * deltaTime);
            this.velocity.x += (this.desiredVelocity.x - this.velocity.x) * t;
            this.velocity.z += (this.desiredVelocity.z - this.velocity.z) * t;
            this.velocity.y = 0;

            // Light separation from nearby bots so they don't stack
            this.applySoftSeparation();

            if (this.velocity.length() > this.maxSpeed) {
                this.velocity.setLength(this.maxSpeed);
            }

            if (isNaN(this.velocity.x) || isNaN(this.velocity.z)) {
                this.velocity.set(0, 0, 0);
                console.warn(`Bot ${this.bot.id} velocity became NaN, resetting`);
            }

            this.movementState = 'moving';

            if (window.DEBUG_BOT_MOVEMENT && Math.random() < 0.01) {
                console.debug(`Bot ${this.bot.id} spd=${this.velocity.length().toFixed(2)} dist=${dist.toFixed(1)}`);
            }
        } catch (error) {
            console.error(`Bot ${this.bot.id} movement error:`, error);
            this.velocity.set(0, 0, 0);
        }
    }

    /**
     * Soft push away from overlapping teammates (doesn't cancel seek)
     */
    applySoftSeparation() {
        const others = this.getOtherBots();
        const push = new THREE.Vector3();
        for (const other of others) {
            const dx = this.bot.position.x - other.position.x;
            const dz = this.bot.position.z - other.position.z;
            const d = Math.sqrt(dx * dx + dz * dz);
            if (d > 0.01 && d < 2.0) {
                const strength = (2.0 - d) / 2.0;
                push.x += (dx / d) * strength * this.maxSpeed * 0.35;
                push.z += (dz / d) * strength * this.maxSpeed * 0.35;
            }
        }
        this.velocity.x += push.x * 0.15;
        this.velocity.z += push.z * 0.15;
    }
    
    /**
     * Calculate steering force
     */
    calculateSteeringForce() {
        this.steeringForce.set(0, 0, 0);
        
        // Seek target
        if (this.currentTarget) {
            const seekForce = this.calculateSeekForce(this.currentTarget);
            this.steeringForce.add(seekForce);
        }
        
        // Avoid obstacles
        const avoidanceForce = this.calculateAvoidanceForce();
        this.steeringForce.add(avoidanceForce.multiplyScalar(this.avoidanceWeight));
        
        // Flocking forces
        if (this.flockingEnabled) {
            const flockingForce = this.calculateFlockingForce();
            this.steeringForce.add(flockingForce);
        }
        
        // Limit steering force
        if (this.steeringForce.length() > this.maxSpeed) {
            this.steeringForce.normalize().multiplyScalar(this.maxSpeed);
        }
    }
    
    /**
     * Calculate seek force towards target
     */
    calculateSeekForce(target) {
        const desired = target.clone().sub(this.bot.position);
        const distance = desired.length();
        
        if (distance < this.stoppingDistance) {
            return new THREE.Vector3(0, 0, 0);
        }
        
        desired.normalize().multiplyScalar(this.maxSpeed);
        return desired.sub(this.velocity);
    }
    
    /**
     * Calculate avoidance force for obstacles
     */
    calculateAvoidanceForce() {
        const avoidanceForce = new THREE.Vector3(0, 0, 0);
        if (this.velocity.lengthSq() < 0.01) return avoidanceForce;

        const lookAhead = this.velocity.clone().normalize().multiplyScalar(this.lookAheadDistance);
        const ahead = this.bot.position.clone().add(lookAhead);

        for (const obstacle of this.obstacles) {
            const distance = ahead.distanceTo(obstacle.position);
            if (distance < obstacle.radius + this.avoidanceRadius) {
                const avoidance = ahead.clone().sub(obstacle.position);
                if (avoidance.lengthSq() < 0.0001) continue;
                avoidance.normalize().multiplyScalar(this.maxSpeed);
                avoidanceForce.add(avoidance);
            }
        }

        return avoidanceForce;
    }
    
    /**
     * Calculate flocking force
     */
    calculateFlockingForce() {
        const neighbors = this.getNeighbors();
        if (neighbors.length === 0) return new THREE.Vector3(0, 0, 0);
        
        const separation = this.calculateSeparation(neighbors);
        const alignment = this.calculateAlignment(neighbors);
        const cohesion = this.calculateCohesion(neighbors);
        
        return separation
            .multiplyScalar(this.separationWeight)
            .add(alignment.multiplyScalar(this.alignmentWeight))
            .add(cohesion.multiplyScalar(this.cohesionWeight));
    }
    
    /**
     * Calculate separation force
     */
    calculateSeparation(neighbors) {
        const separation = new THREE.Vector3(0, 0, 0);
        
        for (const neighbor of neighbors) {
            const distance = this.bot.position.distanceTo(neighbor.position);
            if (distance < this.flockingRadius) {
                const diff = this.bot.position.clone().sub(neighbor.position);
                diff.normalize().divideScalar(distance);
                separation.add(diff);
            }
        }
        
        return separation;
    }
    
    /**
     * Calculate alignment force
     */
    calculateAlignment(neighbors) {
        const alignment = new THREE.Vector3(0, 0, 0);
        
        for (const neighbor of neighbors) {
            alignment.add(neighbor.velocity);
        }
        
        if (neighbors.length > 0) {
            alignment.divideScalar(neighbors.length);
            alignment.normalize().multiplyScalar(this.maxSpeed);
            alignment.sub(this.velocity);
        }
        
        return alignment;
    }
    
    /**
     * Calculate cohesion force
     */
    calculateCohesion(neighbors) {
        const cohesion = new THREE.Vector3(0, 0, 0);
        
        for (const neighbor of neighbors) {
            cohesion.add(neighbor.position);
        }
        
        if (neighbors.length > 0) {
            cohesion.divideScalar(neighbors.length);
            return this.calculateSeekForce(cohesion);
        }
        
        return cohesion;
    }
    
    /**
     * Update obstacle avoidance
     */
    updateObstacleAvoidance(deltaTime) {
        // Update obstacle list from game world
        this.updateObstacleList();
        
        // Calculate avoidance force
        this.avoidanceForce = this.calculateAvoidanceForce();
    }
    
    /**
     * Update obstacle list
     */
    updateObstacleList() {
        this.obstacles = [];
        
        // Get obstacles from game world
        const gameObjects = this.getGameObjects();
        
        for (const obj of gameObjects) {
            if (obj.userData.isObstacle) {
                this.obstacles.push({
                    position: obj.position.clone(),
                    radius: this.getObjectRadius(obj),
                    type: obj.userData.type || 'obstacle'
                });
            }
        }
    }
    
    /**
     * Update flocking behavior
     */
    updateFlocking(deltaTime) {
        // Flocking is handled in calculateFlockingForce
        // This method can be extended for more complex flocking behaviors
    }
    
    /**
     * Update cover seeking
     */
    updateCoverSeeking(deltaTime) {
        const currentTime = Date.now();
        
        // Update cover if needed
        if (currentTime - this.lastCoverUpdate > this.coverUpdateInterval * 1000) {
            this.updateCover();
            this.lastCoverUpdate = currentTime;
        }
        
        // Move towards cover if needed
        if (this.currentCover && this.needsCover()) {
            this.moveToCover();
        }
    }
    
    /**
     * Update formation movement
     */
    updateFormationMovement(deltaTime) {
        if (this.formationPosition) {
            const targetPosition = this.formationPosition.clone().add(this.formationOffset);
            this.setTarget(targetPosition);
        }
    }
    
    /**
     * Apply movement to bot
     */
    applyMovement(deltaTime) {
        this.bot.velocity.copy(this.velocity);
        // Facing is owned by BotBrain (face enemy / travel / patrol target)
    }
    
    /**
     * Update path to current target
     */
    updatePath() {
        if (this.currentTarget) {
            this.currentPath = this.findPath(this.bot.position, this.currentTarget);
            this.pathIndex = 0;
        }
    }
    
    /**
     * Follow current path
     */
    followPath() {
        if (this.pathIndex >= this.currentPath.length) {
            this.currentPath = [];
            this.pathIndex = 0;
            return;
        }
        
        const nextWaypoint = this.currentPath[this.pathIndex];
        const distance = this.bot.position.distanceTo(nextWaypoint);
        
        if (distance < this.stoppingDistance) {
            this.pathIndex++;
        } else {
            this.setTarget(nextWaypoint);
        }
    }
    
    /**
     * Find path using A* algorithm
     */
    findPath(start, end) {
        // Initialize pathfinding grid if needed
        if (!this.pathfindingGrid) {
            this.initializePathfindingGrid();
        }
        
        // Convert world positions to grid coordinates
        const startGrid = this.worldToGrid(start);
        const endGrid = this.worldToGrid(end);
        
        // Run A* algorithm
        const path = this.aStar(startGrid, endGrid);
        
        // Convert grid path back to world coordinates
        return path.map(gridPos => this.gridToWorld(gridPos));
    }
    
    /**
     * A* pathfinding algorithm
     */
    aStar(start, end) {
        const openSet = [start];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        // Initialize scores
        gScore.set(this.gridToString(start), 0);
        fScore.set(this.gridToString(start), this.heuristic(start, end));
        
        while (openSet.length > 0) {
            // Find node with lowest fScore
            let current = openSet[0];
            let currentIndex = 0;
            
            for (let i = 1; i < openSet.length; i++) {
                if (fScore.get(this.gridToString(openSet[i])) < fScore.get(this.gridToString(current))) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }
            
            // Remove current from openSet
            openSet.splice(currentIndex, 1);
            closedSet.add(this.gridToString(current));
            
            // Check if we reached the goal
            if (this.gridEquals(current, end)) {
                return this.reconstructPath(cameFrom, current);
            }
            
            // Check neighbors
            const neighbors = this.getGridNeighbors(current);
            for (const neighbor of neighbors) {
                if (closedSet.has(this.gridToString(neighbor))) {
                    continue;
                }
                
                const tentativeGScore = gScore.get(this.gridToString(current)) + 1;
                
                if (!openSet.some(node => this.gridEquals(node, neighbor))) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= gScore.get(this.gridToString(neighbor))) {
                    continue;
                }
                
                cameFrom.set(this.gridToString(neighbor), current);
                gScore.set(this.gridToString(neighbor), tentativeGScore);
                fScore.set(this.gridToString(neighbor), tentativeGScore + this.heuristic(neighbor, end));
            }
        }
        
        return []; // No path found
    }
    
    /**
     * Initialize pathfinding grid
     */
    initializePathfindingGrid() {
        // This would integrate with the game's arena system
        // For now, create a simple grid
        const gridSize = 200; // Increased to cover negative coordinates
        this.gridOffset = 100; // Center offset
        this.pathfindingGrid = new Array(gridSize);
        
        for (let x = 0; x < gridSize; x++) {
            this.pathfindingGrid[x] = new Array(gridSize);
            for (let z = 0; z < gridSize; z++) {
                this.pathfindingGrid[x][z] = {
                    walkable: true,
                    cost: 1
                };
            }
        }
    }
    
    /**
     * Get grid neighbors for pathfinding (A*)
     */
    getGridNeighbors(gridPos) {
        const neighbors = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dx, dz] of directions) {
            const neighbor = { x: gridPos.x + dx, z: gridPos.z + dz };
            if (this.isValidGridPosition(neighbor) && this.pathfindingGrid[neighbor.x][neighbor.z].walkable) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }
    
    /**
     * Check if grid position is valid
     */
    isValidGridPosition(gridPos) {
        return gridPos.x >= 0 && gridPos.x < this.pathfindingGrid.length &&
               gridPos.z >= 0 && gridPos.z < this.pathfindingGrid[0].length;
    }
    
    /**
     * Heuristic function for A*
     */
    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
    }
    
    /**
     * Reconstruct path from A* result
     */
    reconstructPath(cameFrom, current) {
        const path = [current];
        
        while (cameFrom.has(this.gridToString(current))) {
            current = cameFrom.get(this.gridToString(current));
            path.unshift(current);
        }
        
        return path;
    }
    
    /**
     * Convert world position to grid coordinates
     */
    worldToGrid(worldPos) {
        const offset = this.gridOffset || 100;
        return {
            x: Math.floor(worldPos.x / this.gridResolution) + offset,
            z: Math.floor(worldPos.z / this.gridResolution) + offset
        };
    }
    
    /**
     * Convert grid coordinates to world position
     */
    gridToWorld(gridPos) {
        const offset = this.gridOffset || 100;
        const y = this.bot?.position?.y ?? 1.0;
        return new THREE.Vector3(
            (gridPos.x - offset) * this.gridResolution,
            y,
            (gridPos.z - offset) * this.gridResolution
        );
    }
    
    /**
     * Convert grid position to string for Map keys
     */
    gridToString(gridPos) {
        return `${gridPos.x},${gridPos.z}`;
    }
    
    /**
     * Check if two grid positions are equal
     */
    gridEquals(a, b) {
        return a.x === b.x && a.z === b.z;
    }
    
    /**
     * Update cover
     */
    updateCover() {
        const coverSpots = this.brain.senses.findCover();
        if (coverSpots.length > 0) {
            this.currentCover = coverSpots[0];
        }
    }
    
    /**
     * Check if bot needs cover
     */
    needsCover() {
        const threats = this.brain.senses.getThreats();
        return threats.length > 0 && this.brain.senses.getThreatLevel() > 0.5;
    }
    
    /**
     * Move to cover
     */
    moveToCover() {
        if (this.currentCover) {
            this.setTarget(this.currentCover.position);
        }
    }
    
    /**
     * Get nearby bots for flocking
     */
    getNeighbors() {
        const neighbors = [];
        const bots = this.getOtherBots();

        for (const bot of bots) {
            const distance = this.bot.position.distanceTo(bot.position);
            if (distance < this.flockingRadius && bot.id !== this.bot.id) {
                neighbors.push(bot);
            }
        }

        return neighbors;
    }

    /**
     * Get object radius
     */
    getObjectRadius(obj) {
        if (obj.geometry && obj.geometry.boundingBox) {
            const box = obj.geometry.boundingBox;
            return Math.max(box.max.x - box.min.x, box.max.z - box.min.z) / 2;
        }
        return 1.0;
    }

    /**
     * Get game objects
     */
    getGameObjects() {
        return this.bot.game?.scene?.children || [];
    }

    /**
     * Get other bots
     */
    getOtherBots() {
        const all = this.bot.game?.getBots?.() || [];
        return all.filter(b => b.id !== this.bot.id && b.isAlive);
    }
    
    /**
     * Get max speed based on difficulty
     */
    getMaxSpeed() {
        const speeds = {
            easy: 4.0,
            medium: 5.0,
            hard: 6.0,
            expert: 7.0
        };
        return speeds[this.brain.difficulty] || 5.0;
    }
    
    /**
     * Get acceleration based on difficulty
     */
    getAcceleration() {
        const accelerations = {
            easy: 5.0,
            medium: 7.0,
            hard: 9.0,
            expert: 11.0
        };
        return accelerations[this.brain.difficulty] || 7.0;
    }
    
    /**
     * Get turn speed based on difficulty
     */
    getTurnSpeed() {
        const turnSpeeds = {
            easy: 2.0,
            medium: 3.0,
            hard: 4.0,
            expert: 5.0
        };
        return turnSpeeds[this.brain.difficulty] || 3.0;
    }
    
    // Public API methods
    
    /**
     * Set movement target
     */
    setTarget(target) {
        this.currentTarget = target.clone();
        this.movementState = 'moving';
    }
    
    /**
     * Stop movement
     */
    stop() {
        this.currentTarget = null;
        this.currentPath = [];
        this.pathIndex = 0;
        this.velocity.set(0, 0, 0);
        this.movementState = 'idle';
    }
    
    /**
     * Move to position
     */
    moveTo(position) {
        this.setTarget(position);
    }
    
    /**
     * Follow another bot
     */
    follow(bot, distance = 3.0) {
        const direction = bot.position.clone().sub(this.bot.position).normalize();
        const targetPosition = bot.position.clone().sub(direction.multiplyScalar(distance));
        this.setTarget(targetPosition);
    }
    
    /**
     * Flee from position
     */
    fleeFrom(position, distance = 10.0) {
        const direction = this.bot.position.clone().sub(position).normalize();
        const targetPosition = this.bot.position.clone().add(direction.multiplyScalar(distance));
        this.setTarget(targetPosition);
    }
    
    /**
     * Set formation position
     */
    setFormationPosition(position, offset = new THREE.Vector3()) {
        this.formationPosition = position.clone();
        this.formationOffset = offset.clone();
        this.formationEnabled = true;
    }
    
    /**
     * Disable formation movement
     */
    disableFormation() {
        this.formationEnabled = false;
        this.formationPosition = null;
    }
    
    /**
     * Enable/disable flocking
     */
    setFlockingEnabled(enabled) {
        this.flockingEnabled = enabled;
    }
    
    /**
     * Enable/disable cover seeking
     */
    setCoverSeekingEnabled(enabled) {
        this.coverSeekingEnabled = enabled;
    }
    
    /**
     * Get current movement state
     */
    getMovementState() {
        return {
            state: this.movementState,
            target: this.currentTarget,
            velocity: this.velocity.clone(),
            path: this.currentPath,
            pathIndex: this.pathIndex
        };
    }
    
    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            movementState: this.movementState,
            currentTarget: this.currentTarget,
            velocity: this.velocity.length(),
            pathLength: this.currentPath.length,
            pathIndex: this.pathIndex,
            obstacles: this.obstacles.length,
            flockingEnabled: this.flockingEnabled,
            coverSeekingEnabled: this.coverSeekingEnabled,
            formationEnabled: this.formationEnabled
        };
    }
    
    /**
     * Execute movement action based on decision from BotBrain
     */
    executeAction(action, situation) {
        switch (action) {
            case 'movement_patrol':
                this.executePatrol(situation);
                break;
            case 'movement_hunt':
                this.executeHunt(situation);
                break;
            case 'movement_regroup':
                this.executeRegroup(situation);
                break;
            case 'movement_flank':
                this.executeFlank(situation);
                break;
            case 'movement_retreat':
                this.executeRetreat(situation);
                break;
            case 'movement_advance':
                this.executeAdvance(situation);
                break;
            default:
                console.warn(`Unknown movement action: ${action}`);
                this.executePatrol(situation);
                break;
        }
    }
    
    /**
     * Execute patrol movement
     */
    executePatrol(situation) {
        if (!this.currentTarget) {
            const patrolPoint = this.findPatrolPoint();
            if (patrolPoint) this.setTarget(patrolPoint);
            return;
        }

        const distance = this.horizontalDistance(this.bot.position, this.currentTarget);
        if (distance < this.stoppingDistance * 2) {
            const patrolPoint = this.findPatrolPoint();
            if (patrolPoint) this.setTarget(patrolPoint);
        }
    }

    /**
     * Execute hunt movement (move towards enemies)
     */
    executeHunt(situation) {
        const enemies = situation.enemies || [];
        if (enemies.length > 0 && enemies[0].position) {
            const huntPosition = this.calculateHuntPosition(enemies[0]);
            if (huntPosition) this.setTarget(huntPosition);
        } else {
            this.executePatrol(situation);
        }
    }
    
    /**
     * Execute regroup movement (move towards allies)
     */
    executeRegroup(situation) {
        if (situation.allies && situation.allies.length > 0) {
            const regroupPosition = this.calculateRegroupPosition(situation.allies);
            this.setTarget(regroupPosition);
        } else {
            this.executePatrol(situation);
        }
    }
    
    /**
     * Execute flank movement (move to side of target)
     */
    executeFlank(situation) {
        if (situation.nearestThreat) {
            const flankPosition = this.calculateFlankPosition(situation.nearestThreat);
            this.setTarget(flankPosition);
        } else {
            this.executePatrol(situation);
        }
    }
    
    /**
     * Execute retreat movement (move away from threats)
     */
    executeRetreat(situation) {
        if (situation.nearestThreat) {
            this.fleeFrom(situation.nearestThreat.position, 15.0);
        } else {
            this.executePatrol(situation);
        }
    }
    
    /**
     * Execute advance movement (move towards objectives)
     */
    executeAdvance(situation) {
        // For now, advance towards center of map or towards enemies
        if (situation.enemies && situation.enemies.length > 0) {
            const advancePosition = this.calculateAdvancePosition(situation.enemies);
            this.setTarget(advancePosition);
        } else {
            // Move towards center of arena
            this.setTarget(new THREE.Vector3(0, 0, 0));
        }
    }
    
    /**
     * Find a random patrol point
     */
    findPatrolPoint() {
        const y = this.bot.position.y || 1.0;
        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 80;

        const personality = this.bot.personality;
        if (personality) {
            const aggression = personality.getEffectiveAggression();
            const caution = personality.getEffectiveCaution();
            const centerBias = aggression * 0.3;
            const edgeBias = caution * 0.2;

            const centerX = x * (1 - centerBias);
            const centerZ = z * (1 - centerBias);
            const edgeX = x * (1 + edgeBias);
            const edgeZ = z * (1 + edgeBias);

            const finalX = centerX * (1 - edgeBias) + edgeX * edgeBias;
            const finalZ = centerZ * (1 - edgeBias) + edgeZ * edgeBias;

            return new THREE.Vector3(finalX, y, finalZ);
        }

        return new THREE.Vector3(x, y, z);
    }
    
    /**
     * Calculate hunt position (approach enemy but maintain distance)
     */
    calculateHuntPosition(enemy) {
        if (!enemy || !enemy.position) return null;
        const direction = enemy.position.clone().sub(this.bot.position);
        direction.y = 0;
        if (direction.lengthSq() < 0.0001) {
            return enemy.position.clone();
        }
        direction.normalize();
        const approachDistance = 8.0;
        const pos = enemy.position.clone().sub(direction.multiplyScalar(approachDistance));
        pos.y = this.bot.position.y;
        return pos;
    }
    
    /**
     * Calculate regroup position (center of allies)
     */
    calculateRegroupPosition(allies) {
        if (allies.length === 0) return this.bot.position.clone();
        
        const center = new THREE.Vector3();
        for (const ally of allies) {
            center.add(ally.position);
        }
        center.divideScalar(allies.length);
        return center;
    }
    
    /**
     * Calculate flank position (to the side of target)
     */
    calculateFlankPosition(target) {
        const direction = target.position.clone().sub(this.bot.position).normalize();
        const sideDirection = new THREE.Vector3(-direction.z, 0, direction.x); // Perpendicular
        const flankDistance = 6.0;
        return target.position.clone().add(sideDirection.multiplyScalar(flankDistance));
    }
    
    /**
     * Calculate advance position (towards enemy group)
     */
    calculateAdvancePosition(enemies) {
        if (enemies.length === 0) return this.bot.position.clone();
        
        const center = new THREE.Vector3();
        for (const enemy of enemies) {
            center.add(enemy.position);
        }
        center.divideScalar(enemies.length);
        
        // Move towards center but not too close
        const direction = center.clone().sub(this.bot.position).normalize();
        const advanceDistance = 12.0;
        return this.bot.position.clone().add(direction.multiplyScalar(advanceDistance));
    }

    /**
     * Reset movement system
     */
    reset() {
        this.currentPath = [];
        this.pathIndex = 0;
        this.currentTarget = null;
        this.movementState = 'idle';
        this.velocity.set(0, 0, 0);
        this.desiredVelocity.set(0, 0, 0);
        this.steeringForce.set(0, 0, 0);
        this.avoidanceForce.set(0, 0, 0);
        this.currentCover = null;
        this.formationPosition = null;
        this.obstacles = [];
    }
}
