import { createCharacterModel } from './character.js';
import { Glock } from './glock.js';

let scene, camera, renderer, playerModel, initialized = false;
let currentShowcaseItems = new Map(); // Track showcased items
let avatarControls = null; // Controls for avatar items
let animationId = null; // Track animation loop

function init() {
    if (initialized) return;
    initialized = true;
    const display = document.getElementById('avatar-display');

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    // Camera
    const maxWidth = 200;
    const maxHeight = 250;
    const width = Math.min(display.clientWidth, maxWidth);
    const height = Math.min(display.clientHeight, maxHeight);
    
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.y = 1.5;
    camera.position.z = 3;

    // Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    display.appendChild(renderer.domElement);
    
    // Debug: Log sizing occasionally
    if (Math.random() < 0.01) {
        console.log(`Avatar display: container=${display.clientWidth}x${display.clientHeight}, renderer=${width}x${height}`);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Player Model
    playerModel = createCharacterModel();
    playerModel.position.y = -0.15;
    scene.add(playerModel);

    // Initialize avatar controls
    initAvatarControls();

    animate();
}

function initAvatarControls() {
    // Check if controls already exist in DOM
    let controlsContainer = document.getElementById('avatar-controls');
    if (controlsContainer) {
        console.log('Avatar controls already exist, skipping creation');
        return;
    }
    
    // Create controls container
    controlsContainer = document.createElement('div');
    controlsContainer.id = 'avatar-controls';
    controlsContainer.className = 'avatar-controls';
    
    const avatarMenu = document.getElementById('avatar-menu');
    avatarMenu.appendChild(controlsContainer);

    // Create gun showcase controls
    createGunShowcaseControls(controlsContainer);
    console.log('Avatar controls created successfully');
}

function createGunShowcaseControls(container) {
    // Check if gun controls already exist
    if (document.getElementById('toggle-gun')) {
        console.log('Gun controls already exist, skipping creation');
        return;
    }
    
    // Gun showcase section
    const gunSection = document.createElement('div');
    gunSection.className = 'avatar-item-section';
    gunSection.innerHTML = `
        <h3>Weapon Showcase</h3>
        <div class="avatar-item-controls">
            <button id="toggle-gun" class="avatar-toggle-btn">Show Gun</button>
            <div id="gun-styling" class="avatar-styling-controls" style="display: none;">
                <label>Gun Color:</label>
                <input type="color" id="gun-color" value="#333333">
                <label>Gun Scale:</label>
                <input type="range" id="gun-scale" min="0.5" max="2" step="0.1" value="1">
                <label>Gun Position X:</label>
                <input type="range" id="gun-pos-x" min="-1" max="1" step="0.1" value="0.2">
                <label>Gun Position Y:</label>
                <input type="range" id="gun-pos-y" min="-1" max="1" step="0.1" value="-0.2">
                <label>Gun Position Z:</label>
                <input type="range" id="gun-pos-z" min="-1" max="1" step="0.1" value="-0.4">
            </div>
        </div>
    `;
    
    container.appendChild(gunSection);

    // Add event listeners
    const toggleBtn = document.getElementById('toggle-gun');
    const stylingControls = document.getElementById('gun-styling');
    
    toggleBtn.addEventListener('click', () => {
        const isShowing = currentShowcaseItems.has('gun');
        if (isShowing) {
            removeShowcaseItem('gun');
            toggleBtn.textContent = 'Show Gun';
            stylingControls.style.display = 'none';
        } else {
            addShowcaseItem('gun');
            toggleBtn.textContent = 'Hide Gun';
            stylingControls.style.display = 'block';
        }
    });

    // Add styling controls
    addStylingControls('gun');
    console.log('Gun controls created successfully');
}

function addStylingControls(itemType) {
    const colorInput = document.getElementById(`${itemType}-color`);
    const scaleInput = document.getElementById(`${itemType}-scale`);
    const posXInput = document.getElementById(`${itemType}-pos-x`);
    const posYInput = document.getElementById(`${itemType}-pos-y`);
    const posZInput = document.getElementById(`${itemType}-pos-z`);

    if (colorInput) {
        colorInput.addEventListener('input', (e) => {
            updateShowcaseItemStyle(itemType, 'color', e.target.value);
        });
    }

    if (scaleInput) {
        scaleInput.addEventListener('input', (e) => {
            updateShowcaseItemStyle(itemType, 'scale', parseFloat(e.target.value));
        });
    }

    if (posXInput) {
        posXInput.addEventListener('input', (e) => {
            updateShowcaseItemStyle(itemType, 'position', { x: parseFloat(e.target.value) });
        });
    }

    if (posYInput) {
        posYInput.addEventListener('input', (e) => {
            updateShowcaseItemStyle(itemType, 'position', { y: parseFloat(e.target.value) });
        });
    }

    if (posZInput) {
        posZInput.addEventListener('input', (e) => {
            updateShowcaseItemStyle(itemType, 'position', { z: parseFloat(e.target.value) });
        });
    }
}

function addShowcaseItem(itemType) {
    if (currentShowcaseItems.has(itemType)) {
        console.log(`${itemType} already showcased, skipping`);
        return;
    }

    let item = null;
    let itemData = null;

    switch (itemType) {
        case 'gun':
            item = createShowcaseGun();
            itemData = {
                type: 'gun',
                mesh: item,
                originalPosition: { x: 0.2, y: -0.2, z: -0.4 },
                originalScale: { x: 1, y: 1, z: 1 },
                originalColor: '#333333'
            };
            break;
        // Add more item types here in the future
    }

    if (item && itemData) {
        playerModel.add(item);
        currentShowcaseItems.set(itemType, itemData);
        console.log(`Added ${itemType} to avatar showcase`);
    } else {
        console.error(`Failed to create ${itemType} for showcase`);
    }
}

function removeShowcaseItem(itemType) {
    const itemData = currentShowcaseItems.get(itemType);
    if (itemData) {
        playerModel.remove(itemData.mesh);
        currentShowcaseItems.delete(itemType);
    }
}

function createShowcaseGun() {
    // Create a gun model similar to the Glock class but for showcase
    const gunGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
    const gunMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const gunMesh = new THREE.Mesh(gunGeometry, gunMaterial);
    
    // Position the gun in the character's hand area
    gunMesh.position.set(0.2, -0.2, -0.4);
    
    // Add gun details for better showcase
    const barrelGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
    const barrelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.position.set(0, 0, -0.4);
    barrel.rotation.x = Math.PI / 2;
    gunMesh.add(barrel);

    // Add trigger guard
    const triggerGuardGeometry = new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI);
    const triggerGuardMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const triggerGuard = new THREE.Mesh(triggerGuardGeometry, triggerGuardMaterial);
    triggerGuard.position.set(0, -0.05, -0.1);
    triggerGuard.rotation.x = Math.PI / 2;
    gunMesh.add(triggerGuard);

    // Add grip texture
    const gripGeometry = new THREE.BoxGeometry(0.08, 0.15, 0.3);
    const gripMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const grip = new THREE.Mesh(gripGeometry, gripMaterial);
    grip.position.set(0, -0.1, 0.1);
    gunMesh.add(grip);

    // Make sure the gun is visible
    gunMesh.visible = true;
    
    return gunMesh;
}

function updateShowcaseItemStyle(itemType, property, value) {
    const itemData = currentShowcaseItems.get(itemType);
    if (!itemData) return;

    switch (property) {
        case 'color':
            itemData.mesh.material.color.setHex(value.replace('#', '0x'));
            itemData.originalColor = value;
            break;
        case 'scale':
            itemData.mesh.scale.setScalar(value);
            itemData.originalScale = { x: value, y: value, z: value };
            break;
        case 'position':
            if (value.x !== undefined) itemData.mesh.position.x = value.x;
            if (value.y !== undefined) itemData.mesh.position.y = value.y;
            if (value.z !== undefined) itemData.mesh.position.z = value.z;
            break;
    }
}

function animate() {
    animationId = requestAnimationFrame(animate);
    if (playerModel) {
        playerModel.rotation.y += 0.01;
    }
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

export function initAvatarEditor() {
    init();
}

export function destroyAvatarEditor() {
    // Stop animation loop
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Clean up renderer
    if (renderer && renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    
    // Clean up showcase items
    currentShowcaseItems.clear();
    
    // Reset state (but keep controls in DOM)
    initialized = false;
    
    // Clear scene references
    scene = null;
    camera = null;
    renderer = null;
    playerModel = null;
    
    console.log('Avatar editor destroyed, controls preserved');
}
