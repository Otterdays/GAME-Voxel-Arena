

export function checkCollision(player, structures) {
    const playerBox = new THREE.Box3().setFromObject(player.mesh);

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
