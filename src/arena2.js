

export function createArena2(scene) {
    const arenaMeshes = [];
    const arenaSize = 120;
    const wallHeight = 15;
    const wallThickness = 3;

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(arenaSize, arenaSize);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    arenaMeshes.push(ground);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

    const wallPositions = [
        { x: 0, y: wallHeight / 2, z: -arenaSize / 2, sx: arenaSize + wallThickness, sy: wallHeight, sz: wallThickness }, // Back
        { x: 0, y: wallHeight / 2, z: arenaSize / 2, sx: arenaSize + wallThickness, sy: wallHeight, sz: wallThickness },  // Front
        { x: -arenaSize / 2, y: wallHeight / 2, z: 0, sx: wallThickness, sy: wallHeight, sz: arenaSize }, // Left
        { x: arenaSize / 2, y: wallHeight / 2, z: 0, sx: wallThickness, sy: wallHeight, sz: arenaSize },  // Right
    ];

    wallPositions.forEach(pos => {
        const wallGeometry = new THREE.BoxGeometry(pos.sx, pos.sy, pos.sz);
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(pos.x, pos.y, pos.z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);
        arenaMeshes.push(wall);
    });

    // More complex obstacles
    const obstacleMaterial1 = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const obstacleMaterial2 = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const obstacleMaterial3 = new THREE.MeshStandardMaterial({ color: 0x0000ff });

    // Central pillar
    const pillarGeometry = new THREE.CylinderGeometry(5, 5, wallHeight, 32);
    const pillar = new THREE.Mesh(pillarGeometry, obstacleMaterial1);
    pillar.position.set(0, wallHeight / 2, 0);
    pillar.castShadow = true;
    scene.add(pillar);
    arenaMeshes.push(pillar);

    // Elevated platform
    const platformGeometry = new THREE.BoxGeometry(20, 2, 20);
    const platform = new THREE.Mesh(platformGeometry, obstacleMaterial2);
    platform.position.set(30, 5, -30);
    platform.castShadow = true;
    scene.add(platform);
    arenaMeshes.push(platform);

    // Ramps
    const rampGeometry = new THREE.BoxGeometry(10, 1, 20);
    const ramp1 = new THREE.Mesh(rampGeometry, obstacleMaterial3);
    ramp1.position.set(20, 2.5, -30);
    ramp1.rotation.z = Math.PI / 8;
    ramp1.castShadow = true;
    scene.add(ramp1);
    arenaMeshes.push(ramp1);

    const ramp2 = new THREE.Mesh(rampGeometry, obstacleMaterial3);
    ramp2.position.set(40, 2.5, -30);
    ramp2.rotation.z = -Math.PI / 8;
    ramp2.castShadow = true;
    scene.add(ramp2);
    arenaMeshes.push(ramp2);

    return arenaMeshes;
}