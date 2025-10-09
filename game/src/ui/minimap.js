export class Minimap {
    constructor() {
        this.canvas = document.getElementById('minimap-canvas');
        this.arrow = document.getElementById('minimap-player-arrow'); // The arrow always points up
        this.ctx = this.canvas.getContext('2d');

        // Ensure canvas has a default size if clientWidth/clientHeight are 0
        this.canvas.width = this.canvas.clientWidth || 200;
        this.canvas.height = this.canvas.clientHeight || 200;

        this.scale = 2.0;
        this.mapColor = '#00ff00';
    }

    update(player, structures, bots) {
        if (!player || !structures) return;

        const playerRotation = player.euler.y;
        // The arrow itself doesn't rotate via CSS. It always points up on the screen.

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();

        // Draw minimap background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Center the canvas on the player's location (the middle of the minimap)
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

        // Rotate the entire map opposite to the player's direction.
        // This makes it so "forward" for the player is always "up" on the minimap.
        this.ctx.rotate(playerRotation);

        // Now, draw everything relative to the player's position, which is now (0,0) on the rotated canvas.
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

        structures.forEach(structure => {
            // Don't draw the ground on the minimap
            if (structure.position.y < 0) return;

            // Calculate structure position relative to the player in the world
            const relX = structure.position.x - player.mesh.position.x;
            const relZ = structure.position.z - player.mesh.position.z;

            // Scale for the minimap
            const mapX = relX * this.scale;
            const mapZ = relZ * this.scale;
            const mapWidth = structure.size.x * this.scale;
            const mapDepth = structure.size.z * this.scale;

            // Draw the structure, adjusting for its center origin
            this.ctx.fillRect(mapX - mapWidth / 2, mapZ - mapDepth / 2, mapWidth, mapDepth);
        });

        // Draw bots
        if (bots) {
            bots.forEach(bot => {
                const relX = bot.position.x - player.mesh.position.x;
                const relZ = bot.position.z - player.mesh.position.z;

                const mapX = relX * this.scale;
                const mapZ = relZ * this.scale;

                this.ctx.fillStyle = bot.team === 'red' ? 'red' : 'blue';
                this.ctx.beginPath();
                this.ctx.arc(mapX, mapZ, 3, 0, 2 * Math.PI);
                this.ctx.fill();
            });
        }

        // Draw player indicator (always at the center, pointing up)
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 4, 0, 2 * Math.PI);
        this.ctx.fill();

        // Draw North indicator
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('N', 0, -this.canvas.height / 2 + 12);

        this.ctx.restore();
    }

    destroy() {
        const minimapElement = document.getElementById('game-minimap');
        if (minimapElement) {
            minimapElement.remove();
        }
    }
}