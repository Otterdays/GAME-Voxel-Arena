import { createArena1 } from './arena1.js';
import { createArena2 } from './arena2.js';

function createMeshesFromStructures(scene, structures) {
    const arenaMeshes = [];
    const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

    // Create meshes first with default material
    const groundMeshes = [];
    const loadingPromises = [];

    for (const structure of structures) {
        let geometry;
        if (structure.type === 'box') {
            geometry = new THREE.BoxGeometry(structure.size.x, structure.size.y, structure.size.z);
        } else {
            // Default to a box for unknown types
            geometry = new THREE.BoxGeometry(structure.size.x, structure.size.y, structure.size.z);
        }

        const mesh = new THREE.Mesh(geometry, defaultMaterial);
        mesh.position.set(structure.position.x, structure.position.y, structure.position.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        arenaMeshes.push(mesh);

        // Track ground meshes for texture application after loading
        if (structure.position.y === -1 && structure.size.y === 2) {
            groundMeshes.push({
                mesh: mesh,
                sizeX: structure.size.x,
                sizeZ: structure.size.z
            });
        }
    }

    // Load ground texture and apply it after loading completes
    if (groundMeshes.length > 0) {
        const textureLoader = new THREE.TextureLoader();

        const texturePromise = new Promise((resolve) => {
            textureLoader.load(
                'assets/ground_texture.png',
                function (texture) {
                    console.log('Ground texture loaded successfully');
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;

                    // Apply texture to all ground meshes
                    groundMeshes.forEach(groundInfo => {
                        const groundMaterial = new THREE.MeshStandardMaterial({
                            map: texture.clone(),
                            roughness: 0.8,
                            metalness: 0.2
                        });
                        groundMaterial.map.wrapS = THREE.RepeatWrapping;
                        groundMaterial.map.wrapT = THREE.RepeatWrapping;
                        groundMaterial.map.repeat.set(groundInfo.sizeX / 10, groundInfo.sizeZ / 10);
                        groundMaterial.map.needsUpdate = true;

                        groundInfo.mesh.material = groundMaterial;
                    });
                    resolve();
                },
                undefined,
                function (error) {
                    console.error('Error loading ground texture:', error);
                    resolve(); // Resolve even on error
                }
            );
        });
        loadingPromises.push(texturePromise);
    }

    return {
        meshes: arenaMeshes,
        loadingPromise: Promise.all(loadingPromises)
    };
}

export function createArena(scene, mapId) {
    let arenaData;
    switch (mapId) {
        case 'arena1':
            arenaData = createArena1();
            break;
        case 'arena2':
            arenaData = createArena2();
            break;
        default:
            console.warn(`Unknown mapId: ${mapId}. Loading default arena1.`);
            arenaData = createArena1();
            break;
    }

    const { meshes, loadingPromise } = createMeshesFromStructures(scene, arenaData.structures);

    return {
        structures: arenaData.structures,
        spawnPoint: arenaData.spawnPoint,
        spawnPoints: arenaData.spawnPoints || [arenaData.spawnPoint],
        botSpawnAreas: arenaData.botSpawnAreas || { red: [], blue: [] },
        metadata: arenaData.metadata || {},
        meshes: meshes,
        loadingPromise: loadingPromise
    };
}