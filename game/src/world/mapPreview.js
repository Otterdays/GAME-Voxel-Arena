// THREE.js is already loaded globally via CDN in index.html
import { createArena1 } from './arena1.js';
import { createArena2 } from './arena2.js';

/**
 * Map Preview System
 * Creates 3D previews of maps for the map selection screen
 */
export class MapPreview {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentMapId = null;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.camera.position.set(0, 50, 50);
        this.camera.lookAt(0, 0, 0);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Size renderer to container
        this.resizeRenderer();
        
        // Add renderer to container
        this.container.appendChild(this.renderer.domElement);
        
        // Handle container resize
        this.resizeObserver = new ResizeObserver(() => {
            this.resizeRenderer();
        });
        this.resizeObserver.observe(this.container);
        
        // Add lighting
        this.setupLighting();
        
        // Start animation loop
        this.animate();
    }
    
    resizeRenderer() {
        const rect = this.container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        // Force reasonable size limits
        const maxWidth = 300;
        const maxHeight = 200;
        const finalWidth = Math.min(width, maxWidth);
        const finalHeight = Math.min(height, maxHeight);
        
        this.renderer.setSize(finalWidth, finalHeight);
        this.camera.aspect = finalWidth / finalHeight;
        this.camera.updateProjectionMatrix();
        
        // Debug: Log sizing occasionally
        if (Math.random() < 0.01) {
            console.log(`MapPreview resize: container=${width}x${height}, renderer=${finalWidth}x${finalHeight}`);
        }
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
    }
    
    loadMap(mapId) {
        if (this.currentMapId === mapId) return;
        
        // Clear existing map
        this.clearMap();
        
        // Load new map
        let arenaData;
        switch (mapId) {
            case 'arena1':
                arenaData = createArena1();
                break;
            case 'arena2':
                arenaData = createArena2();
                break;
            default:
                console.warn(`Unknown mapId: ${mapId}`);
                return;
        }
        
        this.currentMapId = mapId;
        
        // Create map meshes
        this.createMapMeshes(arenaData);
        
        // Create spawn point indicators
        this.createSpawnIndicators(arenaData);
        
        // Create bot spawn area indicators
        this.createBotSpawnIndicators(arenaData);
        
        // Position camera based on map size
        this.positionCamera(arenaData.metadata);
    }
    
    createMapMeshes(arenaData) {
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            metalness: 0.3,
            roughness: 0.7
        });
        
        for (const structure of arenaData.structures) {
            let geometry;
            if (structure.type === 'box') {
                geometry = new THREE.BoxGeometry(structure.size.x, structure.size.y, structure.size.z);
            } else {
                geometry = new THREE.BoxGeometry(structure.size.x, structure.size.y, structure.size.z);
            }
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(structure.position.x, structure.position.y, structure.position.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        }
    }
    
    createSpawnIndicators(arenaData) {
        const spawnGeometry = new THREE.SphereGeometry(1, 8, 8);
        const spawnMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x00ff00,
            emissive: 0x003300,
            emissiveIntensity: 0.3
        });
        
        arenaData.spawnPoints.forEach(spawnPoint => {
            const spawnIndicator = new THREE.Mesh(spawnGeometry, spawnMaterial);
            spawnIndicator.position.set(spawnPoint.x, spawnPoint.y + 1, spawnPoint.z);
            spawnIndicator.userData = { type: 'spawn', position: spawnPoint };
            this.scene.add(spawnIndicator);
        });
    }
    
    createBotSpawnIndicators(arenaData) {
        const botSpawnGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 8);
        
        // Red team spawns
        const redMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0000,
            emissive: 0x330000,
            emissiveIntensity: 0.3
        });
        
        arenaData.botSpawnAreas.red.forEach(spawnPoint => {
            const botSpawnIndicator = new THREE.Mesh(botSpawnGeometry, redMaterial);
            botSpawnIndicator.position.set(spawnPoint.x, spawnPoint.y + 0.25, spawnPoint.z);
            botSpawnIndicator.userData = { type: 'botSpawn', team: 'red', position: spawnPoint };
            this.scene.add(botSpawnIndicator);
        });
        
        // Blue team spawns
        const blueMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x0000ff,
            emissive: 0x000033,
            emissiveIntensity: 0.3
        });
        
        arenaData.botSpawnAreas.blue.forEach(spawnPoint => {
            const botSpawnIndicator = new THREE.Mesh(botSpawnGeometry, blueMaterial);
            botSpawnIndicator.position.set(spawnPoint.x, spawnPoint.y + 0.25, spawnPoint.z);
            botSpawnIndicator.userData = { type: 'botSpawn', team: 'blue', position: spawnPoint };
            this.scene.add(botSpawnIndicator);
        });
    }
    
    positionCamera(metadata) {
        if (!metadata || !metadata.size) return;
        
        const size = metadata.size;
        const maxDimension = Math.max(size.x, size.z);
        const distance = maxDimension * 0.8;
        
        this.camera.position.set(distance, distance * 0.6, distance);
        this.camera.lookAt(0, 0, 0);
    }
    
    clearMap() {
        // Remove all objects except lights
        const objectsToRemove = [];
        this.scene.traverse((child) => {
            if (child.isMesh && !child.userData.isLight) {
                objectsToRemove.push(child);
            }
        });
        
        objectsToRemove.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Rotate camera around the map
        if (this.currentMapId) {
            const time = Date.now() * 0.0005;
            const radius = 60;
            this.camera.position.x = Math.cos(time) * radius;
            this.camera.position.z = Math.sin(time) * radius;
            this.camera.lookAt(0, 0, 0);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        this.clearMap();
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.container && this.renderer) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
    
    resize(width, height) {
        if (this.renderer && this.camera) {
            this.renderer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }
}
