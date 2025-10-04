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

    return structures;
}