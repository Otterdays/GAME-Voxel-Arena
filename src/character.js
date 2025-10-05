export function createCharacterModel(teamColor = 0x00ff00) {
    const character = new THREE.Group();

    // Body
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: teamColor });
    const cylinderGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.0, 8);
    const topSphereGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    const bottomSphereGeometry = new THREE.SphereGeometry(0.4, 8, 8);

    const cylinder = new THREE.Mesh(cylinderGeometry, bodyMaterial);
    const topSphere = new THREE.Mesh(topSphereGeometry, bodyMaterial);
    const bottomSphere = new THREE.Mesh(bottomSphereGeometry, bodyMaterial);

    topSphere.position.y = 0.5;
    bottomSphere.position.y = -0.5;

    const body = new THREE.Group();
    body.add(cylinder);
    body.add(topSphere);
    body.add(bottomSphere);

    body.position.y = 0.0; // Body at ground level
    character.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: teamColor });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.2; // Head above body
    character.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 1.3, 0.25);
    character.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 1.3, 0.25);
    character.add(rightEye);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
    const armMaterial = new THREE.MeshStandardMaterial({ color: teamColor });
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.6, 0.8, 0); // Arms at body level
    leftArm.rotation.z = Math.PI / 6; // Reduced angle for more natural look
    character.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.6, 0.8, 0); // Arms at body level
    rightArm.rotation.z = -Math.PI / 6; // Reduced angle for more natural look
    character.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.1, 1.0, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ color: teamColor });
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.2, -0.5, 0); // Legs below body
    character.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.2, -0.5, 0); // Legs below body
    character.add(rightLeg);

    return character;
}
