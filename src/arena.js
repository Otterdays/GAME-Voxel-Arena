import { createArena1 } from './arena1.js';
import { createArena2 } from './arena2.js';

export function createArena(scene, mapId) {
    switch (mapId) {
        case 'arena1':
            return createArena1(scene);
        case 'arena2':
            return createArena2(scene);
        default:
            console.warn(`Unknown mapId: ${mapId}. Loading default arena1.`);
            return createArena1(scene);
    }
}