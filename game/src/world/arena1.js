import { Structure } from './structures.js';

export function createArena1() {
    const structures = [];

    // Ground
    structures.push(new Structure({ x: 0, y: -1, z: 0 }, { x: 100, y: 2, z: 100 }, 'box'));

    // Walls
    const wallHeight = 10;
    const wallThickness = 2;
    structures.push(new Structure({ x: 0, y: wallHeight / 2, z: -50 }, { x: 100 + wallThickness, y: wallHeight, z: wallThickness }, 'box'));
    structures.push(new Structure({ x: 0, y: wallHeight / 2, z: 50 }, { x: 100 + wallThickness, y: wallHeight, z: wallThickness }, 'box'));
    structures.push(new Structure({ x: -50, y: wallHeight / 2, z: 0 }, { x: wallThickness, y: wallHeight, z: 100 }, 'box'));
    structures.push(new Structure({ x: 50, y: wallHeight / 2, z: 0 }, { x: wallThickness, y: wallHeight, z: 100 }, 'box'));

    // Simple obstacles
    structures.push(new Structure({ x: -20, y: 5, z: 0 }, { x: 10, y: 10, z: 10 }, 'box'));
    structures.push(new Structure({ x: 20, y: 5, z: -20 }, { x: 10, y: 10, z: 10 }, 'box'));

    // Multiple spawn points for random spawning
    const spawnPoints = [
        { x: -30, y: 1, z: -30 }, // Top-left corner
        { x: 30, y: 1, z: -30 },  // Top-right corner
        { x: -30, y: 1, z: 30 },  // Bottom-left corner
        { x: 30, y: 1, z: 30 },   // Bottom-right corner
        { x: 0, y: 1, z: -30 },   // Top center
        { x: 0, y: 1, z: 30 },    // Bottom center
        { x: -30, y: 1, z: 0 },   // Left center
        { x: 30, y: 1, z: 0 }     // Right center
    ];

    // Bot spawn areas (team-specific)
    const botSpawnAreas = {
        red: [
            { x: -35, y: 1, z: -35 }, // Red team spawn area
            { x: -25, y: 1, z: -35 },
            { x: -35, y: 1, z: -25 }
        ],
        blue: [
            { x: 35, y: 1, z: 35 },   // Blue team spawn area
            { x: 25, y: 1, z: 35 },
            { x: 35, y: 1, z: 25 }
        ]
    };

    return {
        structures: structures,
        spawnPoint: { x: 0, y: 1, z: 0 }, // Default spawn (fallback)
        spawnPoints: spawnPoints,
        botSpawnAreas: botSpawnAreas,
        metadata: {
            name: 'Classic Arena',
            description: 'A classic arena with simple obstacles and open spaces',
            size: { x: 100, y: 10, z: 100 },
            maxPlayers: 8,
            maxBots: 12,
            difficulty: 'medium',
            theme: 'classic'
        }
    };
}