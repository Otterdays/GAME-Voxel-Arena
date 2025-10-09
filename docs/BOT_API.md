# Bot System API Reference

## Overview

This document provides a comprehensive API reference for the Voxel Arena Bot System. It covers all public methods, properties, and events for each component in the bot system.

## Bot Class

### Constructor

```javascript
new Bot(game, id, difficulty, team)
```

**Parameters**:
- `game` (Object): Game instance
- `id` (String): Unique bot identifier
- `difficulty` (String): Difficulty level ('easy', 'medium', 'hard', 'expert')
- `team` (String): Team assignment ('red', 'blue')

**Example**:
```javascript
const bot = new Bot(game, 'bot_001', 'medium', 'red');
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Unique bot identifier |
| `difficulty` | String | Difficulty level |
| `team` | String | Team assignment |
| `position` | THREE.Vector3 | Current position |
| `rotation` | THREE.Euler | Current rotation |
| `velocity` | THREE.Vector3 | Current velocity |
| `health` | Number | Current health (0-1) |
| `maxHealth` | Number | Maximum health |
| `armor` | Number | Current armor (0-1) |
| `maxArmor` | Number | Maximum armor |
| `isAlive` | Boolean | Whether bot is alive |
| `isActive` | Boolean | Whether bot is active |
| `mesh` | THREE.Group | Bot 3D model |
| `weapon` | Object | Weapon system |
| `stats` | Object | Performance statistics |

### Methods

#### Core Methods

```javascript
update(deltaTime)
```
Updates the bot and all its systems.

**Parameters**:
- `deltaTime` (Number): Time elapsed since last update

---

```javascript
takeDamage(amount, source)
```
Applies damage to the bot.

**Parameters**:
- `amount` (Number): Damage amount
- `source` (Object): Damage source (optional)

**Returns**: `void`

---

```javascript
heal(amount)
```
Heals the bot.

**Parameters**:
- `amount` (Number): Healing amount

**Returns**: `void`

---

```javascript
die(killer)
```
Kills the bot.

**Parameters**:
- `killer` (Object): Killer reference (optional)

**Returns**: `void`

---

```javascript
respawn()
```
Respawns the bot.

**Returns**: `void`

#### Information Methods

```javascript
getInfo()
```
Gets comprehensive bot information.

**Returns**: `Object` - Bot information

---

```javascript
getStats()
```
Gets bot performance statistics.

**Returns**: `Object` - Performance statistics

---

```javascript
getConfig()
```
Gets bot configuration.

**Returns**: `Object` - Bot configuration

---

```javascript
getDebugInfo()
```
Gets debug information for all systems.

**Returns**: `Object` - Debug information

#### Control Methods

```javascript
setPosition(position)
```
Sets bot position.

**Parameters**:
- `position` (THREE.Vector3): New position

**Returns**: `void`

---

```javascript
setRotation(rotation)
```
Sets bot rotation.

**Parameters**:
- `rotation` (THREE.Euler): New rotation

**Returns**: `void`

---

```javascript
setVelocity(velocity)
```
Sets bot velocity.

**Parameters**:
- `velocity` (THREE.Vector3): New velocity

**Returns**: `void`

---

```javascript
activate()
```
Activates the bot.

**Returns**: `void`

---

```javascript
deactivate()
```
Deactivates the bot.

**Returns**: `void`

---

```javascript
remove()
```
Removes bot from game.

**Returns**: `void`

---

```javascript
getForwardDirection()
```
Gets forward direction vector.

**Returns**: `THREE.Vector3` - Forward direction

## BotBrain Class

### Constructor

```javascript
new BotBrain(bot, difficulty)
```

**Parameters**:
- `bot` (Bot): Bot instance
- `difficulty` (String): Difficulty level

### Methods

#### Core Methods

```javascript
update(deltaTime)
```
Updates the brain system.

**Parameters**:
- `deltaTime` (Number): Time elapsed since last update

**Returns**: `void`

---

```javascript
makeDecision()
```
Makes a decision based on current situation.

**Returns**: `void`

---

```javascript
analyzeSituation()
```
Analyzes current game situation.

**Returns**: `Object` - Situation analysis

---

```javascript
executeDecision(decision)
```
Executes a decision.

**Parameters**:
- `decision` (Object): Decision to execute

**Returns**: `void`

#### Information Methods

```javascript
getDebugInfo()
```
Gets brain debug information.

**Returns**: `Object` - Debug information

---

```javascript
getPerformanceMetrics()
```
Gets performance metrics.

**Returns**: `Object` - Performance metrics

#### Control Methods

```javascript
reset()
```
Resets the brain system.

**Returns**: `void`

## BotSenses Class

### Constructor

```javascript
new BotSenses(brain)
```

**Parameters**:
- `brain` (BotBrain): Brain instance

### Methods

#### Core Methods

```javascript
update(deltaTime)
```
Updates the senses system.

**Parameters**:
- `deltaTime` (Number): Time elapsed since last update

**Returns**: `void`

---

```javascript
updateVision()
```
Updates visual perception.

**Returns**: `void`

---

```javascript
updateHearing()
```
Updates auditory perception.

**Returns**: `void`

---

```javascript
canSeeTarget(target)
```
Checks if target is visible.

**Parameters**:
- `target` (Object): Target to check

**Returns**: `Boolean` - Whether target is visible

---

```javascript
canHearSound(sound)
```
Checks if sound is audible.

**Parameters**:
- `sound` (Object): Sound to check

**Returns**: `Boolean` - Whether sound is audible

#### Information Methods

```javascript
getThreats()
```
Gets all current threats.

**Returns**: `Array` - Array of threats

---

```javascript
getNearestThreat()
```
Gets nearest threat.

**Returns**: `Object` - Nearest threat or null

---

```javascript
getThreatLevel()
```
Gets overall threat level.

**Returns**: `Number` - Threat level (0-1)

---

```javascript
getAllies()
```
Gets all allies.

**Returns**: `Array` - Array of allies

---

```javascript
getEnemies()
```
Gets all enemies.

**Returns**: `Array` - Array of enemies

---

```javascript
findCover()
```
Finds cover spots.

**Returns**: `Array` - Array of cover spots

---

```javascript
getBestCover()
```
Gets best cover spot.

**Returns**: `Object` - Best cover spot or null

---

```javascript
isPositionSafe(position)
```
Checks if position is safe.

**Parameters**:
- `position` (THREE.Vector3): Position to check

**Returns**: `Boolean` - Whether position is safe

---

```javascript
getDebugInfo()
```
Gets senses debug information.

**Returns**: `Object` - Debug information

## BotMemory Class

### Constructor

```javascript
new BotMemory(brain)
```

**Parameters**:
- `brain` (BotBrain): Brain instance

### Methods

#### Core Methods

```javascript
update(deltaTime)
```
Updates the memory system.

**Parameters**:
- `deltaTime` (Number): Time elapsed since last update

**Returns**: `void`

---

```javascript
recordObservation(observation, type)
```
Records a new observation.

**Parameters**:
- `observation` (Object): Observation data
- `type` (String): Observation type

**Returns**: `String` - Memory ID

---

```javascript
recordDecision(situation, decision)
```
Records a decision.

**Parameters**:
- `situation` (Object): Situation data
- `decision` (Object): Decision data

**Returns**: `String` - Memory ID

---

```javascript
updateDecisionOutcome(memoryId, outcome, success)
```
Updates decision outcome.

**Parameters**:
- `memoryId` (String): Memory ID
- `outcome` (Object): Outcome data
- `success` (Boolean): Whether decision was successful

**Returns**: `void`

#### Information Methods

```javascript
getRecentEvents(count)
```
Gets recent events.

**Parameters**:
- `count` (Number): Number of events to retrieve

**Returns**: `Array` - Array of recent events

---

```javascript
getLearnedPatterns()
```
Gets learned patterns.

**Returns**: `Array` - Array of learned patterns

---

```javascript
getRecentDecisions(count)
```
Gets recent decisions.

**Parameters**:
- `count` (Number): Number of decisions to retrieve

**Returns**: `Array` - Array of recent decisions

---

```javascript
getLastDecision()
```
Gets last decision.

**Returns**: `Object` - Last decision or null

---

```javascript
getDecisionSuccessRate(action)
```
Gets decision success rate.

**Parameters**:
- `action` (String): Action to check

**Returns**: `Number` - Success rate (0-1)

---

```javascript
searchMemories(criteria)
```
Searches memories by criteria.

**Parameters**:
- `criteria` (Object): Search criteria

**Returns**: `Array` - Array of matching memories

---

```javascript
getDebugInfo()
```
Gets memory debug information.

**Returns**: `Object` - Debug information

#### Control Methods

```javascript
reset()
```
Resets the memory system.

**Returns**: `void`

## BotPersonality Class

### Constructor

```javascript
new BotPersonality(brain, difficulty)
```

**Parameters**:
- `brain` (BotBrain): Brain instance
- `difficulty` (String): Difficulty level

### Methods

#### Core Methods

```javascript
update(deltaTime)
```
Updates the personality system.

**Parameters**:
- `deltaTime` (Number): Time elapsed since last update

**Returns**: `void`

---

```javascript
modifySituation(situation)
```
Modifies situation based on personality.

**Parameters**:
- `situation` (Object): Situation to modify

**Returns**: `Object` - Modified situation

---

```javascript
getDecisionModifier(action)
```
Gets decision modifier for action.

**Parameters**:
- `action` (String): Action to check

**Returns**: `Number` - Decision modifier

#### Information Methods

```javascript
getTraits()
```
Gets personality traits.

**Returns**: `Object` - Personality traits

---

```javascript
getEmotionalState()
```
Gets emotional state.

**Returns**: `Object` - Emotional state

---

```javascript
getLearningPreferences()
```
Gets learning preferences.

**Returns**: `Object` - Learning preferences

---

```javascript
getCommunicationStyle()
```
Gets communication style.

**Returns**: `Object` - Communication style

---

```javascript
getTeamPreferences()
```
Gets team preferences.

**Returns**: `Object` - Team preferences

---

```javascript
getPersonalityHistory()
```
Gets personality history.

**Returns**: `Array` - Personality history

---

```javascript
getDebugInfo()
```
Gets personality debug information.

**Returns**: `Object` - Debug information

#### Control Methods

```javascript
reset()
```
Resets the personality system.

**Returns**: `void`

## BotCombat Class

### Constructor

```javascript
new BotCombat(brain)
```

**Parameters**:
- `brain` (BotBrain): Brain instance

### Methods

#### Core Methods

```javascript
update(deltaTime)
```
Updates the combat system.

**Parameters**:
- `deltaTime` (Number): Time elapsed since last update

**Returns**: `void`

---

```javascript
executeAction(action, situation)
```
Executes a combat action.

**Parameters**:
- `action` (String): Action to execute
- `situation` (Object): Current situation

**Returns**: `void`

---

```javascript
setWeapon(weapon)
```
Sets the weapon.

**Parameters**:
- `weapon` (Object): Weapon object

**Returns**: `void`

#### Information Methods

```javascript
getCurrentTarget()
```
Gets current target.

**Returns**: `Object` - Current target or null

---

```javascript
getCombatState()
```
Gets combat state.

**Returns**: `String` - Combat state

---

```javascript
getPerformanceStats()
```
Gets performance statistics.

**Returns**: `Object` - Performance statistics

---

```javascript
getDebugInfo()
```
Gets combat debug information.

**Returns**: `Object` - Debug information

#### Control Methods

```javascript
reset()
```
Resets the combat system.

**Returns**: `void`

## BotMovement Class

### Constructor

```javascript
new BotMovement(brain)
```

**Parameters**:
- `brain` (BotBrain): Brain instance

### Methods

#### Core Methods

```javascript
update(deltaTime)
```
Updates the movement system.

**Parameters**:
- `deltaTime` (Number): Time elapsed since last update

**Returns**: `void`

---

```javascript
setTarget(target)
```
Sets movement target.

**Parameters**:
- `target` (THREE.Vector3): Target position

**Returns**: `void`

---

```javascript
moveTo(position)
```
Moves to position.

**Parameters**:
- `position` (THREE.Vector3): Target position

**Returns**: `void`

---

```javascript
stop()
```
Stops movement.

**Returns**: `void`

---

```javascript
follow(bot, distance)
```
Follows another bot.

**Parameters**:
- `bot` (Bot): Bot to follow
- `distance` (Number): Follow distance

**Returns**: `void`

---

```javascript
fleeFrom(position, distance)
```
Flees from position.

**Parameters**:
- `position` (THREE.Vector3): Position to flee from
- `distance` (Number): Flee distance

**Returns**: `void`

#### Information Methods

```javascript
getMovementState()
```
Gets movement state.

**Returns**: `Object` - Movement state

---

```javascript
getDebugInfo()
```
Gets movement debug information.

**Returns**: `Object` - Debug information

#### Control Methods

```javascript
setFlockingEnabled(enabled)
```
Enables/disables flocking.

**Parameters**:
- `enabled` (Boolean): Whether to enable flocking

**Returns**: `void`

---

```javascript
setCoverSeekingEnabled(enabled)
```
Enables/disables cover seeking.

**Parameters**:
- `enabled` (Boolean): Whether to enable cover seeking

**Returns**: `void`

---

```javascript
setFormationPosition(position, offset)
```
Sets formation position.

**Parameters**:
- `position` (THREE.Vector3): Formation position
- `offset` (THREE.Vector3): Formation offset

**Returns**: `void`

---

```javascript
disableFormation()
```
Disables formation movement.

**Returns**: `void`

---

```javascript
reset()
```
Resets the movement system.

**Returns**: `void`

## BotCommunication Class

### Constructor

```javascript
new BotCommunication(brain)
```

**Parameters**:
- `brain` (BotBrain): Brain instance

### Methods

#### Core Methods

```javascript
update(deltaTime)
```
Updates the communication system.

**Parameters**:
- `deltaTime` (Number): Time elapsed since last update

**Returns**: `void`

---

```javascript
sendMessage(message)
```
Sends a message.

**Parameters**:
- `message` (Object): Message to send

**Returns**: `Boolean` - Whether message was sent

---

```javascript
receiveMessage(message)
```
Receives a message.

**Parameters**:
- `message` (Object): Message to receive

**Returns**: `Boolean` - Whether message was received

---

```javascript
createMessage(type, data, target)
```
Creates a message.

**Parameters**:
- `type` (String): Message type
- `data` (Object): Message data
- `target` (String): Target bot ID (optional)

**Returns**: `Object` - Created message

---

```javascript
queueMessage(message)
```
Queues a message for sending.

**Parameters**:
- `message` (Object): Message to queue

**Returns**: `void`

#### Information Methods

```javascript
getTeamStatus()
```
Gets team status.

**Returns**: `Object` - Team status

---

```javascript
getCommunicationStats()
```
Gets communication statistics.

**Returns**: `Object` - Communication statistics

---

```javascript
getDebugInfo()
```
Gets communication debug information.

**Returns**: `Object` - Debug information

#### Control Methods

```javascript
reset()
```
Resets the communication system.

**Returns**: `void`

## Events

### Bot Events

The bot system emits various events that can be listened to:

```javascript
// Bot death event
bot.on('death', (killer) => {
    console.log(`Bot ${bot.id} died, killed by ${killer?.id}`);
});

// Bot respawn event
bot.on('respawn', () => {
    console.log(`Bot ${bot.id} respawned`);
});

// Bot damage event
bot.on('damage', (amount, source) => {
    console.log(`Bot ${bot.id} took ${amount} damage`);
});

// Bot heal event
bot.on('heal', (amount) => {
    console.log(`Bot ${bot.id} healed ${amount}`);
});
```

### Communication Events

```javascript
// Message sent event
bot.communication.on('messageSent', (message) => {
    console.log(`Bot ${bot.id} sent message: ${message.type}`);
});

// Message received event
bot.communication.on('messageReceived', (message) => {
    console.log(`Bot ${bot.id} received message: ${message.type}`);
});

// Team status change event
bot.communication.on('teamStatusChange', (oldStatus, newStatus) => {
    console.log(`Team status changed from ${oldStatus} to ${newStatus}`);
});
```

### Combat Events

```javascript
// Target acquired event
bot.combat.on('targetAcquired', (target) => {
    console.log(`Bot ${bot.id} acquired target: ${target.id}`);
});

// Weapon fired event
bot.combat.on('weaponFired', (target, hit) => {
    console.log(`Bot ${bot.id} fired at ${target.id}, hit: ${hit}`);
});

// Combat state change event
bot.combat.on('combatStateChange', (oldState, newState) => {
    console.log(`Combat state changed from ${oldState} to ${newState}`);
});
```

### Movement Events

```javascript
// Target reached event
bot.movement.on('targetReached', (target) => {
    console.log(`Bot ${bot.id} reached target`);
});

// Path found event
bot.movement.on('pathFound', (path) => {
    console.log(`Bot ${bot.id} found path with ${path.length} waypoints`);
});

// Obstacle avoided event
bot.movement.on('obstacleAvoided', (obstacle) => {
    console.log(`Bot ${bot.id} avoided obstacle`);
});
```

## Error Handling

### Common Errors

1. **Invalid Bot ID**: Ensure unique IDs for each bot
2. **Missing Game Reference**: Pass valid game instance to constructor
3. **Invalid Difficulty**: Use only 'easy', 'medium', 'hard', 'expert'
4. **Invalid Team**: Use only 'red' or 'blue'
5. **System Not Initialized**: Ensure all systems are properly initialized

### Error Recovery

```javascript
try {
    const bot = new Bot(game, 'bot_001', 'medium', 'red');
    bot.update(deltaTime);
} catch (error) {
    console.error('Bot error:', error);
    // Handle error appropriately
}
```

## Performance Tips

### Optimization Guidelines

1. **Update Frequency**: Adjust update intervals based on performance needs
2. **Memory Management**: Regularly clean up old data
3. **Spatial Partitioning**: Use efficient neighbor detection
4. **LOD System**: Implement level of detail for distant bots
5. **Batch Operations**: Group similar operations together

### Performance Monitoring

```javascript
// Monitor bot performance
const performance = {
    updateTime: 0,
    memoryUsage: 0,
    communicationOverhead: 0
};

// Measure update time
const startTime = performance.now();
bot.update(deltaTime);
performance.updateTime = performance.now() - startTime;

// Monitor memory usage
performance.memoryUsage = bot.memory.getMemoryUsage();

// Monitor communication overhead
performance.communicationOverhead = bot.communication.getOverhead();
```

## Best Practices

### Bot Creation

1. **Unique IDs**: Always use unique identifiers
2. **Proper Initialization**: Initialize all systems before use
3. **Resource Management**: Clean up resources when bots are removed
4. **Error Handling**: Implement proper error handling

### System Integration

1. **Modular Design**: Keep systems independent
2. **Clear Interfaces**: Use well-defined APIs
3. **Event-Driven**: Use events for loose coupling
4. **Performance Monitoring**: Monitor system performance

### Team Coordination

1. **Role Assignment**: Assign clear roles to team members
2. **Communication Protocols**: Use appropriate communication protocols
3. **Formation Management**: Maintain proper formations
4. **Objective Sharing**: Share objectives among team members

This API reference provides comprehensive documentation for all bot system components. For additional examples and advanced usage patterns, refer to the main Bot System Documentation.
