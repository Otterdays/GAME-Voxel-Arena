import { initAvatarEditor, destroyAvatarEditor } from '../player/avatar.js';
import { refreshKeybinds } from '../core/input.js';
import { getSetting, setSetting, getAllKeybinds, initTempSettings, applySettings, resetTempSettings, getTempSetting, getTempAllKeybinds, defaultSettings, performanceProfiles, applyPerformanceProfile, detectRecommendedProfile } from '../core/settings.js';
import { MapPreview } from '../world/mapPreview.js';
import { createArena1 } from '../world/arena1.js';
import { createArena2 } from '../world/arena2.js';
import { CustomDropdown, CustomSlider, createValueFormatter } from './customComponents.js';

const ui = {
    container: document.getElementById('ui-container'),
    startMenu: document.getElementById('start-menu'),
    settingsMenu: document.getElementById('settings-menu'),
    pauseMenu: document.getElementById('pause-menu'),
    mapSelectionMenu: document.getElementById('map-selection-menu'),
    mapDisplay: document.getElementById('map-display'), // New
    hud: document.getElementById('hud'),
    // Audio settings
    masterVolumeSlider: document.getElementById('master-volume-slider'),
    masterVolumeValue: document.getElementById('master-volume-value'),
    volumeSlider: document.getElementById('volume-slider'),
    volumeValue: document.getElementById('volume-value'),
    musicVolumeSlider: document.getElementById('music-volume-slider'),
    musicVolumeValue: document.getElementById('music-volume-value'),
    weaponVolumeSlider: document.getElementById('weapon-volume-slider'),
    weaponVolumeValue: document.getElementById('weapon-volume-value'),
    // Settings containers
    keybindsContainer: document.getElementById('keybinds-container'),
    videoSettingsContainer: document.getElementById('video-settings-container'),
    gameplaySettingsContainer: document.getElementById('gameplay-settings-container'),
    accessibilitySettingsContainer: document.getElementById('accessibility-settings-container'),
    // Settings controls
    customCursor: document.getElementById('custom-cursor'),
    applySettingsButton: document.getElementById('apply-settings-button'),
    cancelSettingsButton: document.getElementById('cancel-settings-button'),
    resetSettingsButton: document.getElementById('reset-settings-button'),
    settingsMessage: document.getElementById('settings-message'),
    avatarMenu: document.getElementById('avatar-menu'),
    // Map preview elements
    mapPreviewContainer: document.getElementById('map-preview-container'),
    mapName: document.getElementById('map-name'),
    mapDescription: document.getElementById('map-description'),
    mapSize: document.getElementById('map-size'),
    mapMaxPlayers: document.getElementById('map-max-players'),
    mapDifficulty: document.getElementById('map-difficulty'),
    botCountSlider: document.getElementById('bot-count-slider'),
    botCountValue: document.getElementById('bot-count-value'),
    botDifficultySelect: document.getElementById('bot-difficulty-select'),
    teamBalanceSelect: document.getElementById('team-balance-select'),
    randomSpawnOn: document.getElementById('random-spawn-on'),
    randomSpawnOff: document.getElementById('random-spawn-off'),
    // New team selection elements
    playerTeamSelect: document.getElementById('player-team-select'),
    redBotsCount: document.getElementById('red-bots-count'),
    blueBotsCount: document.getElementById('blue-bots-count'),
    totalBotsCount: document.getElementById('total-bots-count'),
    redBotsMinus: document.getElementById('red-bots-minus'),
    redBotsPlus: document.getElementById('red-bots-plus'),
    blueBotsMinus: document.getElementById('blue-bots-minus'),
    blueBotsPlus: document.getElementById('blue-bots-plus'),
};

let onStartSinglePlayerGame = () => {};
let onStartMap = (mapId, mapSettings) => {};
let onResumeGame = () => {};
let onQuitToMainMenu = () => {};

let mapPreview = null;

const availableMaps = [
    { id: 'arena1', name: 'Classic Arena' },
    { id: 'arena2', name: 'Big Arena' },
];

let selectedMapId = availableMaps[0].id; // Default selected map

// Team and bot count state
let redTeamBotCount = 2;
let blueTeamBotCount = 2;
let maxBotsPerTeam = 8;
let minBotsPerTeam = 0;

function showCustomCursor() {
    if (ui.customCursor) {
        // Force cursor visibility and positioning
        ui.customCursor.style.setProperty('display', 'block', 'important');
        ui.customCursor.style.setProperty('position', 'fixed', 'important');
        ui.customCursor.style.setProperty('z-index', '999999', 'important');
        ui.customCursor.style.setProperty('background-color', 'rgba(255, 255, 255, 0.9)', 'important');
        ui.customCursor.style.setProperty('border', '2px solid #00ff00', 'important');
        ui.customCursor.style.setProperty('width', '20px', 'important');
        ui.customCursor.style.setProperty('height', '20px', 'important');
        ui.customCursor.style.setProperty('border-radius', '50%', 'important');
        ui.customCursor.style.setProperty('box-shadow', '0 0 10px rgba(0, 255, 0, 0.5)', 'important');
    } else {
        console.error('showCustomCursor: ui.customCursor is null or undefined');
    }
    
    ui.container.style.pointerEvents = 'auto'; // Allow clicks on UI elements
}

function hideCustomCursor() {
    ui.customCursor.style.display = 'none';
    ui.container.style.pointerEvents = 'none'; // Disallow clicks on UI elements
}

export function updateCustomCursorPosition(x, y) {
    if (ui.customCursor) {
        ui.customCursor.style.left = `${x}px`;
        ui.customCursor.style.top = `${y}px`;
        
        // Cursor position updated
    } else {
        console.error('updateCustomCursorPosition: ui.customCursor is null');
    }
}

function showMenu(menuId) {
    [ui.startMenu, ui.settingsMenu, ui.pauseMenu, ui.mapSelectionMenu, ui.avatarMenu].forEach(menu => {
        if (menu && menu.id === menuId) {
            menu.classList.add('active');
            if (menuId === 'settings-menu') {
                initTempSettings(); // Initialize temp settings when opening the menu
                populateKeybinds(); // Re-populate to reflect temp settings
                populateVideoSettings(); // Re-populate to reflect temp settings
                // populateAudioSettings(); // If we had a separate audio populate function
            } else if (menuId === 'avatar-menu') {
                initAvatarEditor();
            }
        } else if (menu) {
            menu.classList.remove('active');
            // Cleanup avatar editor when leaving avatar menu
            if (menu.id === 'avatar-menu') {
                destroyAvatarEditor();
            }
        }
    });
    ui.hud.style.display = 'none';
    if (ui.gameMinimap) {
        ui.gameMinimap.classList.remove('active'); // Hide minimap when menu is active
    }
    // Ensure UI container allows pointer events when menu is shown
    ui.container.style.pointerEvents = 'auto';
    showCustomCursor();

    if (menuId === 'map-selection-menu') {
        populateMapSelection();
    }
}

function showHUD() {
    [ui.startMenu, ui.settingsMenu, ui.pauseMenu, ui.mapSelectionMenu, ui.avatarMenu].forEach(menu => menu.classList.remove('active'));
    ui.hud.style.display = 'flex';
    if (ui.gameMinimap) {
        ui.gameMinimap.classList.add('active'); // Show minimap when HUD is active
    }
    // Disable pointer events on UI container when showing HUD
    ui.container.style.pointerEvents = 'none';
    hideCustomCursor();
}

function populateKeybinds() {
    const keybinds = getTempAllKeybinds();

    let isRebinding = false;
    let currentRebindAction = null;
    let rebindListener = null;

    const startRebind = (button, action) => {
        if (isRebinding) return;

        isRebinding = true;
        currentRebindAction = action;
        button.textContent = 'Press any key...';
        button.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
        button.style.borderColor = '#ffff00';

        rebindListener = (e) => {
            e.preventDefault();
            e.stopPropagation();

            let newKey = e.key.toLowerCase();
            if (e.code.startsWith('Mouse')) {
                newKey = e.code.toLowerCase(); // e.g., mouse0, mouse1
            } else if (e.key === ' ') {
                newKey = ' '; // Spacebar
            } else if (e.key === 'Escape') {
                // Allow escape to cancel rebind without setting a key
                endRebind();
                return;
            }

            setSetting('keybinds', action, newKey);
            endRebind();
        };

        // Listen for keydown on the entire window to capture any key
        window.addEventListener('keydown', rebindListener, true);
        // Also listen for mousedown for mouse buttons
        window.addEventListener('mousedown', rebindListener, true);
    };

    const endRebind = () => {
        isRebinding = false;
        currentRebindAction = null;
        if (rebindListener) {
            window.removeEventListener('keydown', rebindListener, true);
            window.removeEventListener('mousedown', rebindListener, true);
            rebindListener = null;
        }
        populateKeybinds(); // Refresh all keybinds
    };

    // Update existing buttons with current keybind values and add event listeners
    const buttons = document.querySelectorAll('.keybind-button');
    buttons.forEach(button => {
        const action = button.getAttribute('data-action');
        if (action) {
            // Update button text with current keybind value
            if (keybinds[action]) {
                button.textContent = keybinds[action] === ' ' ? 'Space' : keybinds[action];
            }
            
            // Reset button styling
            button.style.backgroundColor = '';
            button.style.borderColor = '';
            
            // Remove any existing event listeners by cloning the button
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add click event listener to the new button
            newButton.addEventListener('click', (e) => {
                e.stopPropagation();
                startRebind(newButton, action);
            });
        }
    });
}

function populateVideoSettings() {
    ui.videoSettingsContainer.innerHTML = '';

    // Walk Wobble
    addToggleSetting('Walk Wobble', 'video', 'walkWobble');
    
    // Fog Settings
    addToggleSetting('Fog Enabled', 'video', 'fogEnabled');
    addSliderSetting('Fog Density', 'video', 'fogDensity', 0, 1, 0.05, 'percentage');
    addColorSetting('Fog Color', 'video', 'fogColor');
    
    // Render Settings
    addSliderSetting('Render Distance', 'video', 'renderDistance', 50, 200, 10, 'units');
    addSelectSetting('Shadow Quality', 'video', 'shadowQuality', [
        { value: 'low', text: 'Low' },
        { value: 'medium', text: 'Medium' },
        { value: 'high', text: 'High' },
        { value: 'ultra', text: 'Ultra' }
    ]);
    addSelectSetting('Texture Quality', 'video', 'textureQuality', [
        { value: 'low', text: 'Low' },
        { value: 'medium', text: 'Medium' },
        { value: 'high', text: 'High' },
        { value: 'ultra', text: 'Ultra' }
    ]);
    
    // Effects
    addToggleSetting('Particle Effects', 'video', 'particleEffects');
    addToggleSetting('Motion Blur', 'video', 'motionBlur');
    addToggleSetting('Anti-Aliasing', 'video', 'antiAliasing');
    
    // UI Scaling and Performance
    addSelectSetting('Performance Profile', 'video', 'performanceProfile', [
        { value: 'auto', text: 'Auto (Recommended)' },
        { value: 'low', text: 'Low (Better Performance)' },
        { value: 'medium', text: 'Medium (Balanced)' },
        { value: 'high', text: 'High (Better Quality)' },
        { value: 'ultra', text: 'Ultra (Maximum Quality)' }
    ]);
    
    addSliderSetting('UI Scale', 'video', 'uiScale', 0.6, 1.4, 0.1, 'decimal');
    addSelectSetting('Resolution', 'video', 'resolution', [
        { value: 'auto', text: 'Auto (Recommended)' },
        { value: '1920x1080', text: '1920x1080 (Full HD)' },
        { value: '1600x900', text: '1600x900' },
        { value: '1366x768', text: '1366x768' },
        { value: '1280x720', text: '1280x720 (HD)' },
        { value: '1024x768', text: '1024x768' }
    ]);
    
    addToggleSetting('Adaptive UI Scaling', 'video', 'adaptiveScaling');
    addSliderSetting('FPS Target', 'video', 'fpsTarget', 30, 120, 10, 'fps');
    
    // Add performance profile button
    addPerformanceProfileButton();
}

function populateGameplaySettings() {
    ui.gameplaySettingsContainer.innerHTML = '';

    // Mouse and Camera
    addSliderSetting('Mouse Sensitivity', 'gameplay', 'mouseSensitivity', 0.001, 0.01, 0.001, 'decimal');
    addSliderSetting('Field of View', 'gameplay', 'fov', 60, 120, 5, 'integer');
    
    // Crosshair
    addSelectSetting('Crosshair Style', 'gameplay', 'crosshairStyle', [
        { value: 'classic', text: 'Classic' },
        { value: 'dot', text: 'Dot' },
        { value: 'cross', text: 'Cross' },
        { value: 'circle', text: 'Circle' }
    ]);
    
    // Combat Feedback
    addToggleSetting('Hit Markers', 'gameplay', 'hitMarkers');
    addToggleSetting('Damage Numbers', 'gameplay', 'damageNumbers');
    
    // Controls
    addToggleSetting('Auto Reload', 'gameplay', 'autoReload');
    addToggleSetting('Sprint Toggle', 'gameplay', 'sprintToggle');
    addToggleSetting('Crouch Toggle', 'gameplay', 'crouchToggle');
}

function populateAccessibilitySettings() {
    ui.accessibilitySettingsContainer.innerHTML = '';

    // Visual Accessibility
    addSelectSetting('Color Blind Mode', 'accessibility', 'colorBlindMode', [
        { value: 'none', text: 'None' },
        { value: 'protanopia', text: 'Protanopia' },
        { value: 'deuteranopia', text: 'Deuteranopia' },
        { value: 'tritanopia', text: 'Tritanopia' }
    ]);
    
    addToggleSetting('High Contrast', 'accessibility', 'highContrast');
    addToggleSetting('Large Text', 'accessibility', 'largeText');
    
    // Effects
    addToggleSetting('Screen Shake', 'accessibility', 'screenShake');
    addToggleSetting('Flash Effects', 'accessibility', 'flashEffects');
}

// Helper functions for creating settings
function addToggleSetting(label, category, key) {
    const div = document.createElement('div');
    div.classList.add('settings-item');
    
    const labelElement = document.createElement('span');
    labelElement.textContent = label;
    
    const toggleSwitch = document.createElement('div');
    toggleSwitch.classList.add('toggle-switch');
    
    const onButton = document.createElement('button');
    onButton.textContent = 'ON';
    const offButton = document.createElement('button');
    offButton.textContent = 'OFF';
    
    const updateToggleState = (isOn) => {
        if (isOn) {
            onButton.classList.add('active');
            offButton.classList.remove('active');
        } else {
            offButton.classList.add('active');
            onButton.classList.remove('active');
        }
    };
    
    onButton.addEventListener('click', () => {
        setSetting(category, key, true);
        updateToggleState(true);
    });
    
    offButton.addEventListener('click', () => {
        setSetting(category, key, false);
        updateToggleState(false);
    });
    
    updateToggleState(getTempSetting(category, key));
    
    toggleSwitch.appendChild(onButton);
    toggleSwitch.appendChild(offButton);
    
    div.appendChild(labelElement);
    div.appendChild(toggleSwitch);
    
    const container = getContainerForCategory(category);
    container.appendChild(div);
}

function addSliderSetting(label, category, key, min, max, step, displayFormat = 'percentage') {
    const div = document.createElement('div');
    div.classList.add('settings-item');
    
    const labelElement = document.createElement('span');
    labelElement.textContent = label;
    
    const sliderContainer = document.createElement('div');
    sliderContainer.classList.add('slider-container');
    
    const formatValue = createValueFormatter(displayFormat);
    const currentValue = getTempSetting(category, key);
    
    const customSlider = new CustomSlider(
        sliderContainer,
        min,
        max,
        step,
        currentValue,
        (value) => {
            setSetting(category, key, value);
        },
        formatValue
    );
    
    div.appendChild(labelElement);
    div.appendChild(sliderContainer);
    
    const container = getContainerForCategory(category);
    container.appendChild(div);
}

function addSelectSetting(label, category, key, options) {
    const div = document.createElement('div');
    div.classList.add('settings-item');
    
    const labelElement = document.createElement('span');
    labelElement.textContent = label;
    
    const dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add('dropdown-container');
    
    const currentValue = getTempSetting(category, key);
    
    const customDropdown = new CustomDropdown(
        dropdownContainer,
        options,
        currentValue,
        (value) => {
            setSetting(category, key, value);
        }
    );
    
    div.appendChild(labelElement);
    div.appendChild(dropdownContainer);
    
    const container = getContainerForCategory(category);
    container.appendChild(div);
}

function addColorSetting(label, category, key) {
    const div = document.createElement('div');
    div.classList.add('settings-item');
    
    const labelElement = document.createElement('span');
    labelElement.textContent = label;
    
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = getTempSetting(category, key);
    
    colorInput.addEventListener('change', (e) => {
        setSetting(category, key, e.target.value);
    });
    
    div.appendChild(labelElement);
    div.appendChild(colorInput);
    
    const container = getContainerForCategory(category);
    container.appendChild(div);
}

function getContainerForCategory(category) {
    switch (category) {
        case 'video': return ui.videoSettingsContainer;
        case 'gameplay': return ui.gameplaySettingsContainer;
        case 'accessibility': return ui.accessibilitySettingsContainer;
        default: return ui.videoSettingsContainer;
    }
}

function populateMapSelection() {
    ui.mapDisplay.innerHTML = ''; // Clear previous map selection

    availableMaps.forEach(map => {
        const mapButton = document.createElement('button');
        mapButton.textContent = map.name;
        mapButton.classList.add('map-select-button');
        if (map.id === selectedMapId) {
            mapButton.classList.add('active');
        }
        mapButton.addEventListener('click', () => {
            selectedMapId = map.id;
            updateMapPreview(map.id);
            populateMapSelection(); // Re-populate to update active state
        });
        ui.mapDisplay.appendChild(mapButton);
    });
    
    // Initialize map preview with first map
    if (selectedMapId) {
        updateMapPreview(selectedMapId);
    }
    
    // Setup team selection event handlers
    setupTeamSelectionHandlers();
}

// Flag to prevent multiple event listener registration
let teamHandlersSetup = false;

function setupTeamSelectionHandlers() {
    // Prevent multiple event listener registration
    if (teamHandlersSetup) {
        updateBotCountDisplays();
        return;
    }
    
    // Update bot count displays
    updateBotCountDisplays();
    
    // Red team bot controls
    if (ui.redBotsMinus) {
        ui.redBotsMinus.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (redTeamBotCount > minBotsPerTeam) {
                redTeamBotCount--;
                updateBotCountDisplays();
            }
        });
    }
    
    if (ui.redBotsPlus) {
        ui.redBotsPlus.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (redTeamBotCount < maxBotsPerTeam) {
                redTeamBotCount++;
                updateBotCountDisplays();
            }
        });
    }
    
    // Blue team bot controls
    if (ui.blueBotsMinus) {
        ui.blueBotsMinus.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (blueTeamBotCount > minBotsPerTeam) {
                blueTeamBotCount--;
                updateBotCountDisplays();
            }
        });
    }
    
    if (ui.blueBotsPlus) {
        ui.blueBotsPlus.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (blueTeamBotCount < maxBotsPerTeam) {
                blueTeamBotCount++;
                updateBotCountDisplays();
            }
        });
    }
    
    teamHandlersSetup = true;
}

function updateBotCountDisplays() {
    if (ui.redBotsCount) {
        ui.redBotsCount.textContent = redTeamBotCount;
    }
    if (ui.blueBotsCount) {
        ui.blueBotsCount.textContent = blueTeamBotCount;
    }
    if (ui.totalBotsCount) {
        ui.totalBotsCount.textContent = redTeamBotCount + blueTeamBotCount;
    }
    
    // Update button states
    if (ui.redBotsMinus) {
        ui.redBotsMinus.disabled = redTeamBotCount <= minBotsPerTeam;
    }
    if (ui.redBotsPlus) {
        ui.redBotsPlus.disabled = redTeamBotCount >= maxBotsPerTeam;
    }
    if (ui.blueBotsMinus) {
        ui.blueBotsMinus.disabled = blueTeamBotCount <= minBotsPerTeam;
    }
    if (ui.blueBotsPlus) {
        ui.blueBotsPlus.disabled = blueTeamBotCount >= maxBotsPerTeam;
    }
}

function updateMapPreview(mapId) {
    if (!mapPreview) {
        mapPreview = new MapPreview('map-preview-container');
    }
    
    // Load map preview
    mapPreview.loadMap(mapId);
    
    // Get map data
    let arenaData;
    switch (mapId) {
        case 'arena1':
            arenaData = createArena1();
            break;
        case 'arena2':
            arenaData = createArena2();
            break;
        default:
            return;
    }
    
    // Update map info
    const metadata = arenaData.metadata;
    ui.mapName.textContent = metadata.name;
    ui.mapDescription.textContent = metadata.description;
    ui.mapSize.textContent = `${metadata.size.x}x${metadata.size.z}`;
    ui.mapMaxPlayers.textContent = metadata.maxPlayers;
    ui.mapDifficulty.textContent = metadata.difficulty.charAt(0).toUpperCase() + metadata.difficulty.slice(1);
    
    // Bot count slider removed - using team-specific controls instead
}

function getMapSettings() {
    return {
        botCount: redTeamBotCount + blueTeamBotCount,
        redTeamBotCount: redTeamBotCount,
        blueTeamBotCount: blueTeamBotCount,
        playerTeam: ui.playerTeamSelect ? ui.playerTeamSelect.value : 'red',
        botDifficulty: ui.botDifficultySelect ? ui.botDifficultySelect.value : 'medium',
        teamBalance: ui.teamBalanceSelect ? ui.teamBalanceSelect.value : 'balanced',
        randomSpawn: ui.randomSpawnOn ? ui.randomSpawnOn.classList.contains('active') : true
    };
}

function populateAudioSettings() {
    // Master Volume
    ui.masterVolumeSlider.value = getTempSetting('audio', 'masterVolume');
    ui.masterVolumeSlider.oninput = (e) => {
        setSetting('audio', 'masterVolume', parseFloat(e.target.value));
        ui.masterVolumeValue.textContent = Math.round(e.target.value * 100) + '%';
    };
    ui.masterVolumeValue.textContent = Math.round(getTempSetting('audio', 'masterVolume') * 100) + '%';

    // SFX Volume
    ui.volumeSlider.value = getTempSetting('audio', 'volume');
    ui.volumeSlider.oninput = (e) => {
        setSetting('audio', 'volume', parseFloat(e.target.value));
        ui.volumeValue.textContent = Math.round(e.target.value * 100) + '%';
    };
    ui.volumeValue.textContent = Math.round(getTempSetting('audio', 'volume') * 100) + '%';

    // Music Volume
    ui.musicVolumeSlider.value = getTempSetting('audio', 'musicVolume');
    ui.musicVolumeSlider.oninput = (e) => {
        setSetting('audio', 'musicVolume', parseFloat(e.target.value));
        ui.musicVolumeValue.textContent = Math.round(e.target.value * 100) + '%';
    };
    ui.musicVolumeValue.textContent = Math.round(getTempSetting('audio', 'musicVolume') * 100) + '%';

    // Weapon Volume
    ui.weaponVolumeSlider.value = getTempSetting('audio', 'weaponVolume');
    ui.weaponVolumeSlider.oninput = (e) => {
        setSetting('audio', 'weaponVolume', parseFloat(e.target.value));
        ui.weaponVolumeValue.textContent = Math.round(e.target.value * 100) + '%';
    };
    ui.weaponVolumeValue.textContent = Math.round(getTempSetting('audio', 'weaponVolume') * 100) + '%';
}

export function initUI(callbacks) {
    onStartSinglePlayerGame = callbacks.onStartSinglePlayerGame;
    onStartMap = callbacks.onStartMap;
    onResumeGame = callbacks.onResumeGame;
    onQuitToMainMenu = callbacks.onQuitToMainMenu;

    // Initialize gameMinimap here, after DOM is loaded
    ui.gameMinimap = document.getElementById('game-minimap');
    console.log('Minimap element found:', ui.gameMinimap);

    const singlePlayerBtn = document.getElementById('single-player-button');
    if (singlePlayerBtn) {
        singlePlayerBtn.addEventListener('click', () => UIManager.showMapSelectionMenu());
    }
    
    const multiplayerBtn = document.getElementById('multiplayer-button');
    if (multiplayerBtn) {
        multiplayerBtn.addEventListener('click', () => console.log('Multiplayer not implemented yet'));
    }
    
    const settingsBtn = document.getElementById('settings-button');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => showMenu('settings-menu'));
    }
    
    const avatarBtn = document.getElementById('avatar-button');
    if (avatarBtn) {
        avatarBtn.addEventListener('click', () => UIManager.showAvatarMenu());
    }
    
    const quitBtn = document.getElementById('quit-button');
    if (quitBtn) {
        quitBtn.addEventListener('click', () => window.location.href = 'home.html');
    }

    const avatarBackBtn = document.getElementById('avatar-back-button');
    if (avatarBackBtn) {
        avatarBackBtn.addEventListener('click', () => showMenu('start-menu'));
    }

    const mapSelectionBackBtn = document.getElementById('map-selection-back-button');
    if (mapSelectionBackBtn) {
        mapSelectionBackBtn.addEventListener('click', () => showMenu('start-menu'));
    }
    
    const startMapBtn = document.getElementById('start-map-button');
    if (startMapBtn) {
        startMapBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const mapSettings = getMapSettings();
            onStartMap(selectedMapId, mapSettings);
        });
    }

    const backBtn = document.getElementById('back-button');
    if (backBtn) {
        backBtn.addEventListener('click', () => showMenu('start-menu'));
    }
    
    const resumeBtn = document.getElementById('resume-button');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => onResumeGame());
    }
    
    const quitToMainBtn = document.getElementById('quit-to-main-menu-button');
    if (quitToMainBtn) {
        quitToMainBtn.addEventListener('click', () => onQuitToMainMenu());
    }

    if (ui.applySettingsButton) {
        ui.applySettingsButton.addEventListener('click', () => {
            applySettings();
            refreshKeybinds(); // Refresh the keybinds in the input system
            
            // Notify game to update settings
            if (window.game && window.game.updateFogSettings) {
                window.game.updateFogSettings();
            }
            
            // Show confirmation message
            if (ui.settingsMessage) {
                ui.settingsMessage.textContent = 'Settings Applied!';
                ui.settingsMessage.classList.add('show');
                setTimeout(() => {
                    ui.settingsMessage.classList.remove('show');
                    ui.settingsMessage.textContent = '';
                }, 3000);
            }
        });
    }

    if (ui.cancelSettingsButton) {
        ui.cancelSettingsButton.addEventListener('click', () => {
            resetTempSettings();
            populateAudioSettings(); // Refresh audio settings
            populateKeybinds(); // Re-populate to reflect reverted settings
            populateVideoSettings(); // Re-populate to reflect reverted settings
            populateGameplaySettings(); // Re-populate gameplay settings
            populateAccessibilitySettings(); // Re-populate accessibility settings
        });
    }

    if (ui.resetSettingsButton) {
        ui.resetSettingsButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
                // Reset to default settings
                settings = JSON.parse(JSON.stringify(defaultSettings));
                saveSettings();
                initTempSettings();
                
                // Refresh all settings displays
                populateAudioSettings();
                populateKeybinds();
                populateVideoSettings();
                populateGameplaySettings();
                populateAccessibilitySettings();
                
                // Show confirmation message
                if (ui.settingsMessage) {
                    ui.settingsMessage.textContent = 'Settings Reset to Defaults!';
                    ui.settingsMessage.classList.add('show');
                    setTimeout(() => {
                        ui.settingsMessage.classList.remove('show');
                        ui.settingsMessage.textContent = '';
                    }, 3000);
                }
            }
        });
    }

    // Map selection controls - removed old bot count slider references
    
    if (ui.randomSpawnOn) {
        ui.randomSpawnOn.addEventListener('click', () => {
            ui.randomSpawnOn.classList.add('active');
            if (ui.randomSpawnOff) ui.randomSpawnOff.classList.remove('active');
        });
    }
    
    if (ui.randomSpawnOff) {
        ui.randomSpawnOff.addEventListener('click', () => {
            ui.randomSpawnOff.classList.add('active');
            if (ui.randomSpawnOn) ui.randomSpawnOn.classList.remove('active');
        });
    }

    populateAudioSettings(); // Initial populate
    populateKeybinds();
    populateVideoSettings();
    populateGameplaySettings();
    populateAccessibilitySettings();
    populateMapSelection();
    showMenu('start-menu');
}

function addPerformanceProfileButton() {
    const div = document.createElement('div');
    div.classList.add('settings-item');
    
    const button = document.createElement('button');
    button.textContent = 'Apply Recommended Settings';
    button.classList.add('performance-button');
    button.addEventListener('click', applyRecommendedSettings);
    
    div.appendChild(button);
    ui.videoSettingsContainer.appendChild(div);
}

function applyRecommendedSettings() {
    const recommendedProfile = detectRecommendedProfile();
    applyPerformanceProfile(recommendedProfile);
    
    // Refresh all settings displays
    populateVideoSettings();
    populateGameplaySettings();
    populateAccessibilitySettings();
    
    // Show confirmation message
    ui.settingsMessage.textContent = `Applied ${recommendedProfile} performance profile`;
    ui.settingsMessage.classList.add('show');
    setTimeout(() => {
        ui.settingsMessage.classList.remove('show');
        ui.settingsMessage.textContent = '';
    }, 3000);
}

// Make cursor functions globally available
window.showCustomCursor = showCustomCursor;
window.hideCustomCursor = hideCustomCursor;

function ensurePauseMenuInCorrectLocation() {
    const pauseMenu = document.getElementById('pause-menu');
    const uiContainer = document.getElementById('ui-container');
    
    if (pauseMenu && pauseMenu.parentElement !== uiContainer) {
        uiContainer.appendChild(pauseMenu);
        console.log('Fixed: Moved pause menu to ui-container');
    }
}

export const UIManager = {
    showMenu,
    showHUD,
    showPauseMenu: () => {
        ensurePauseMenuInCorrectLocation(); // Fix DOM structure before showing
        showMenu('pause-menu');
    },
    showStartMenu: () => showMenu('start-menu'),
    showMapSelectionMenu: () => showMenu('map-selection-menu'),
    showAvatarMenu: () => showMenu('avatar-menu'),
    showCustomCursor,
    hideCustomCursor,
};