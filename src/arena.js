import { createArena1 } from './arena1.js';
import { createArena2 } from './arena2.js';

function createMeshesFromStructures(scene, structures) {
    const arenaMeshes = [];
    const material = new THREE.MeshStandardMaterial({ color: 0x808080 });

    for (const structure of structures) {
        let geometry;
        if (structure.type === 'box') {
            geometry = new THREE.BoxGeometry(structure.size.x, structure.size.y, structure.size.z);
        } else {
            // Default to a box for unknown types
            geometry = new THREE.BoxGeometry(structure.size.x, structure.size.y, structure.size.z);
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(structure.position.x, structure.position.y, structure.position.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        arenaMeshes.push(mesh);
    }

    return arenaMeshes;
}

export function createArena(scene, mapId) {
    let structures;
    switch (mapId) {
        case 'arena1':
            structures = createArena1();
            break;
        case 'arena2':
            structures = createArena2();
            break;
        default:
            console.warn(`Unknown mapId: ${mapId}. Loading default arena1.`);
            structures = createArena1();
            break;
    }

    return {
        structures: structures,
        meshes: createMeshesFromStructures(scene, structures)
    };
}