
/**
 * Create a detailed bot model with 2-piece limbs and a mouth
 * @param {number} teamColor - The color of the bot's team
 * @returns {THREE.Group} The bot model group
 */
export function createBotModel(teamColor) {
    const botGroup = new THREE.Group();

    // Materials
    // Ensure DoubleSide is strictly enforced on all materials
    const mainMaterial = new THREE.MeshStandardMaterial({ 
        color: teamColor,
        roughness: 0.7,
        metalness: 0.3,
        side: THREE.DoubleSide,
        shadowSide: THREE.DoubleSide
    });
    const jointMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.9,
        side: THREE.DoubleSide,
        shadowSide: THREE.DoubleSide
    });
    const skinMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffccaa, // Simple skin tone placeholder
        roughness: 0.8,
        side: THREE.DoubleSide,
        shadowSide: THREE.DoubleSide
    });

    // Torso
    const torsoGeometry = new THREE.BoxGeometry(0.6, 0.9, 0.4);
    const torso = new THREE.Mesh(torsoGeometry, mainMaterial);
    torso.position.y = 0.45; // Center of torso
    botGroup.add(torso);

    // Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.0, 0); // On top of torso
    botGroup.add(headGroup);

    // Head Mesh
    const headGeometry = new THREE.BoxGeometry(0.4, 0.45, 0.4);
    const head = new THREE.Mesh(headGeometry, mainMaterial);
    headGroup.add(head);

    // Eyes
    const eyeGeometry = new THREE.BoxGeometry(0.08, 0.05, 0.05);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00aaaa });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.1, 0.05, 0.2);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.1, 0.05, 0.2);
    headGroup.add(rightEye);

    // Mouth (Simple)
    const mouthGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.05);
    const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.1, 0.2);
    headGroup.add(mouth);

    // Arms function
    function createLimb(x, y, z, isLeft) {
        const limbGroup = new THREE.Group();
        limbGroup.position.set(x, y, z);

        // Shoulder/Joint
        const jointGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const joint = new THREE.Mesh(jointGeo, jointMaterial);
        limbGroup.add(joint);

        // Upper Arm
        const upperGeo = new THREE.BoxGeometry(0.15, 0.4, 0.15);
        const upper = new THREE.Mesh(upperGeo, mainMaterial);
        upper.position.y = -0.25;
        limbGroup.add(upper);

        // Elbow
        const elbow = new THREE.Mesh(jointGeo, jointMaterial);
        elbow.position.y = -0.5;
        limbGroup.add(elbow);

        // Lower Arm
        const lowerGeo = new THREE.BoxGeometry(0.12, 0.4, 0.12);
        const lower = new THREE.Mesh(lowerGeo, mainMaterial);
        lower.position.y = -0.75;
        limbGroup.add(lower);

        // Hand
        const handGeo = new THREE.BoxGeometry(0.1, 0.15, 0.1);
        const hand = new THREE.Mesh(handGeo, jointMaterial);
        hand.position.y = -1.0;
        limbGroup.add(hand);

        return limbGroup;
    }

    // Create Arms
    const leftArm = createLimb(-0.45, 0.8, 0, true);
    leftArm.rotation.z = 0.2; // Relaxed pose
    botGroup.add(leftArm);

    const rightArm = createLimb(0.45, 0.8, 0, false);
    rightArm.rotation.z = -0.2; // Relaxed pose
    botGroup.add(rightArm);

    // Legs function
    function createLeg(x, y, z) {
        const legGroup = new THREE.Group();
        legGroup.position.set(x, y, z);

        // Hip Joint
        const jointGeo = new THREE.SphereGeometry(0.13, 8, 8);
        const joint = new THREE.Mesh(jointGeo, jointMaterial);
        legGroup.add(joint);

        // Upper Leg
        const upperGeo = new THREE.BoxGeometry(0.18, 0.45, 0.18);
        const upper = new THREE.Mesh(upperGeo, mainMaterial);
        upper.position.y = -0.25;
        legGroup.add(upper);

        // Knee
        const knee = new THREE.Mesh(jointGeo, jointMaterial);
        knee.position.y = -0.5;
        legGroup.add(knee);

        // Lower Leg
        const lowerGeo = new THREE.BoxGeometry(0.15, 0.45, 0.15);
        const lower = new THREE.Mesh(lowerGeo, mainMaterial);
        lower.position.y = -0.75;
        legGroup.add(lower);

        // Foot
        const footGeo = new THREE.BoxGeometry(0.16, 0.1, 0.25);
        const foot = new THREE.Mesh(footGeo, jointMaterial);
        foot.position.set(0, -1.0, 0.05); // Slight forward offset for foot
        legGroup.add(foot);

        return legGroup;
    }

    // Create Legs
    const leftLeg = createLeg(-0.2, 0.0, 0);
    botGroup.add(leftLeg);

    const rightLeg = createLeg(0.2, 0.0, 0);
    botGroup.add(rightLeg);

    // HP Bar Group
    const hpBarGroup = new THREE.Group();
    hpBarGroup.position.y = 1.8; // Above head
    botGroup.add(hpBarGroup);

    // HP Bar Background
    const hpBgGeo = new THREE.PlaneGeometry(1, 0.15);
    const hpBgMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    const hpBg = new THREE.Mesh(hpBgGeo, hpBgMat);
    hpBarGroup.add(hpBg);

    // HP Bar Foreground
    const hpFgGeo = new THREE.PlaneGeometry(0.96, 0.11);
    // Center pivot hack: move geometry so scaling x works from left
    hpFgGeo.translate(0.48, 0, 0); 
    const hpFgMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const hpFg = new THREE.Mesh(hpFgGeo, hpFgMat);
    hpFg.position.x = -0.48; // Start at left
    hpFg.position.z = 0.01; // Slightly in front
    hpBarGroup.add(hpFg);

    // Add update method to botGroup userData
    botGroup.userData.updateHealth = (current, max) => {
        const ratio = Math.max(0, Math.min(1, current / max));
        hpFg.scale.x = ratio;
        
        // Color change based on health
        if (ratio > 0.5) hpFg.material.color.setHex(0x00ff00);
        else if (ratio > 0.25) hpFg.material.color.setHex(0xffff00);
        else hpFg.material.color.setHex(0xff0000);

        // Billboarding (face camera)
        // This needs to be called in update loop if camera rotates
        // For now, simple billboard lookAt camera is handled in Bot.js updateModel usually
    };

    botGroup.userData.hpBar = hpBarGroup; // Reference for billboarding

    return botGroup;
}
