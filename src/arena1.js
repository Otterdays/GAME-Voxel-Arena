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

    return structures;
}