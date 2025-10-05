import { Structure } from './structures.js';

export function createArena2() {
    const structures = [];
    const arenaSize = 120;
    const wallHeight = 15;
    const wallThickness = 3;

    // Ground
    structures.push(new Structure({ x: 0, y: -1, z: 0 }, { x: arenaSize, y: 2, z: arenaSize }, 'box'));

    // Walls
    structures.push(new Structure({ x: 0, y: wallHeight / 2, z: -arenaSize / 2 }, { x: arenaSize + wallThickness, y: wallHeight, z: wallThickness }, 'box'));
    structures.push(new Structure({ x: 0, y: wallHeight / 2, z: arenaSize / 2 }, { x: arenaSize + wallThickness, y: wallHeight, z: wallThickness }, 'box'));
    structures.push(new Structure({ x: -arenaSize / 2, y: wallHeight / 2, z: 0 }, { x: wallThickness, y: wallHeight, z: arenaSize }, 'box'));
    structures.push(new Structure({ x: arenaSize / 2, y: wallHeight / 2, z: 0 }, { x: wallThickness, y: wallHeight, z: arenaSize }, 'box'));

    // More complex obstacles
    // Central pillar (represented as a box for collision)
    structures.push(new Structure({ x: 0, y: wallHeight / 2, z: 0 }, { x: 10, y: wallHeight, z: 10 }, 'box'));

    // Elevated platform
    structures.push(new Structure({ x: 30, y: 5, z: -30 }, { x: 20, y: 2, z: 20 }, 'box'));

    // Ramps (represented as boxes for collision)
    structures.push(new Structure({ x: 20, y: 2.5, z: -30 }, { x: 10, y: 1, z: 20 }, 'box'));
    structures.push(new Structure({ x: 40, y: 2.5, z: -30 }, { x: 10, y: 1, z: 20 }, 'box'));

    // Multiple spawn points for random spawning
    const spawnPoints = [
        { x: -40, y: 1, z: -40 }, // Top-left corner
        { x: 40, y: 1, z: -40 },  // Top-right corner
        { x: -40, y: 1, z: 40 },  // Bottom-left corner
        { x: 40, y: 1, z: 40 },   // Bottom-right corner
        { x: 0, y: 1, z: -40 },   // Top center
        { x: 0, y: 1, z: 40 },    // Bottom center
        { x: -40, y: 1, z: 0 },   // Left center
        { x: 40, y: 1, z: 0 },    // Right center
        { x: -20, y: 1, z: -20 }, // Additional corners
        { x: 20, y: 1, z: -20 },
        { x: -20, y: 1, z: 20 },
        { x: 20, y: 1, z: 20 }
    ];

    // Bot spawn areas (team-specific)
    const botSpawnAreas = {
        red: [
            { x: -45, y: 1, z: -45 }, // Red team spawn area
            { x: -35, y: 1, z: -45 },
            { x: -45, y: 1, z: -35 },
            { x: -35, y: 1, z: -35 }
        ],
        blue: [
            { x: 45, y: 1, z: 45 },   // Blue team spawn area
            { x: 35, y: 1, z: 45 },
            { x: 45, y: 1, z: 35 },
            { x: 35, y: 1, z: 35 }
        ]
    };

    return {
        structures: structures,
        spawnPoint: { x: 0, y: 1, z: 0 }, // Default spawn (fallback)
        spawnPoints: spawnPoints,
        botSpawnAreas: botSpawnAreas,
        metadata: {
            name: 'Big Arena',
            description: 'A large arena with complex obstacles and elevated platforms',
            size: { x: 120, y: 15, z: 120 },
            maxPlayers: 12,
            maxBots: 16,
            difficulty: 'hard',
            theme: 'industrial'
        }
    };
}