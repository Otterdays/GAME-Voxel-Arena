import { createCharacterModel } from './character.js';

let scene, camera, renderer, playerModel, initialized = false;

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

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    if (playerModel) {
        playerModel.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
}

export function initAvatarEditor() {
    init();
}
