

export function createArena1(scene) {
    const arenaMeshes = [];

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    arenaMeshes.push(ground);

    // Walls
    const wallHeight = 10;
    const wallThickness = 2;
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });

    const wallPositions = [
        { x: 0, y: wallHeight / 2, z: -50, sx: 100 + wallThickness, sy: wallHeight, sz: wallThickness }, // Back
        { x: 0, y: wallHeight / 2, z: 50, sx: 100 + wallThickness, sy: wallHeight, sz: wallThickness },  // Front
        { x: -50, y: wallHeight / 2, z: 0, sx: wallThickness, sy: wallHeight, sz: 100 }, // Left
        { x: 50, y: wallHeight / 2, z: 0, sx: wallThickness, sy: wallHeight, sz: 100 },  // Right
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

    // Simple obstacles
    const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x0099ff });
    const box1 = new THREE.Mesh(boxGeometry, boxMaterial);
    box1.position.set(-20, 5, 0);
    box1.castShadow = true;
    scene.add(box1);
    arenaMeshes.push(box1);

    const box2 = new THREE.Mesh(boxGeometry, boxMaterial);
    box2.position.set(20, 5, -20);
    box2.castShadow = true;
    scene.add(box2);
    arenaMeshes.push(box2);

    return arenaMeshes;
}