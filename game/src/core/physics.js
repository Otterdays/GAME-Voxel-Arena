

export function checkCollision(player, structures) {
    // Use a tighter collision box for bots - just the body cylinder
    // Bot body is a cylinder with radius 0.4 and height 1.0, positioned at y=1.0
    const botRadius = 0.4;
    const botHeight = 1.0;
    const botCenterY = 1.5; // Body center is at y=1.5 (above ground level)
    
    const playerBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(
            player.mesh.position.x, 
            player.mesh.position.y + botCenterY, 
            player.mesh.position.z
        ),
        new THREE.Vector3(botRadius * 2, botHeight, botRadius * 2)
    );
    

    for (const structure of structures) {
        const structureBox = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(structure.position.x, structure.position.y, structure.position.z),
            new THREE.Vector3(structure.size.x, structure.size.y, structure.size.z)
        );

        if (playerBox.intersectsBox(structureBox)) {
            return true;
        }
    }

    return false;
}
