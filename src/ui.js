import { getSetting, setSetting, getAllKeybinds, initTempSettings, applySettings, resetTempSettings, getTempSetting } from './settings.js';

const ui = {
    container: document.getElementById('ui-container'),
    startMenu: document.getElementById('start-menu'),
    settingsMenu: document.getElementById('settings-menu'),
    pauseMenu: document.getElementById('pause-menu'),
    mapSelectionMenu: document.getElementById('map-selection-menu'),
    mapDisplay: document.getElementById('map-display'), // New
    hud: document.getElementById('hud'),
    volumeSlider: document.getElementById('volume-slider'),
    musicVolumeSlider: document.getElementById('music-volume-slider'), // New
    keybindsContainer: document.getElementById('keybinds-container'),
    videoSettingsContainer: document.getElementById('video-settings-container'),
    customCursor: document.getElementById('custom-cursor'),
    applySettingsButton: document.getElementById('apply-settings-button'), // New
    cancelSettingsButton: document.getElementById('cancel-settings-button'), // New
    settingsMessage: document.getElementById('settings-message'), // New
};

let onStartSinglePlayerGame = () => {};
let onStartMap = (mapId) => {};
let onResumeGame = () => {};
let onQuitToMainMenu = () => {};

const availableMaps = [
    { id: 'arena1', name: 'Classic Arena' },
    { id: 'arena2', name: 'Big Arena' },
];

let selectedMapId = availableMaps[0].id; // Default selected map

function showCustomCursor() {
    ui.customCursor.style.display = 'block';
    ui.container.style.pointerEvents = 'auto'; // Allow clicks on UI elements
}

function hideCustomCursor() {
    ui.customCursor.style.display = 'none';
    ui.container.style.pointerEvents = 'none'; // Disallow clicks on UI elements
}

export function updateCustomCursorPosition(x, y) {
    ui.customCursor.style.left = `${x}px`;
    ui.customCursor.style.top = `${y}px`;
}

function showMenu(menuId) {
    [ui.startMenu, ui.settingsMenu, ui.pauseMenu, ui.mapSelectionMenu].forEach(menu => {
        if (menu.id === menuId) {
            menu.classList.add('active');
            if (menuId === 'settings-menu') {
                initTempSettings(); // Initialize temp settings when opening the menu
                populateKeybinds(); // Re-populate to reflect temp settings
                populateVideoSettings(); // Re-populate to reflect temp settings
                // populateAudioSettings(); // If we had a separate audio populate function
            }
        } else {
            menu.classList.remove('active');
        }
    });
    ui.hud.style.display = 'none';
    showCustomCursor();

    if (menuId === 'map-selection-menu') {
        populateMapSelection();
    }
}

function showHUD() {
    [ui.startMenu, ui.settingsMenu, ui.pauseMenu, ui.mapSelectionMenu].forEach(menu => menu.classList.remove('active'));
    ui.hud.style.display = 'block';
    hideCustomCursor();
}

function populateKeybinds() {
    const keybinds = getAllKeybinds();
    ui.keybindsContainer.innerHTML = '';

    let isRebinding = false;
    let currentRebindAction = null;
    let rebindListener = null;

    const startRebind = (button, action) => {
        if (isRebinding) return;

        isRebinding = true;
        currentRebindAction = action;
        button.textContent = '...';
        button.classList.add('rebinding');
        ui.container.style.pointerEvents = 'none'; // Disable other UI interactions

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

            setSetting('keybinds', currentRebindAction, newKey);
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
        ui.container.style.pointerEvents = 'auto'; // Re-enable UI interactions
        if (rebindListener) {
            window.removeEventListener('keydown', rebindListener, true);
            window.removeEventListener('mousedown', rebindListener, true);
            rebindListener = null;
        }
        populateKeybinds(); // Refresh all keybinds
    };

    for (const action in keybinds) {
        const div = document.createElement('div');
        div.classList.add('settings-item'); // Use the settings-item class for layout

        const label = document.createElement('span');
        label.textContent = action.charAt(0).toUpperCase() + action.slice(1);

        const buttonWrapper = document.createElement('div');
        buttonWrapper.classList.add('keybind-button-wrapper');

        const button = document.createElement('button');
        button.textContent = keybinds[action] === ' ' ? 'Space' : keybinds[action];
        button.classList.add('keybind-button');

        const tooltip = document.createElement('span');
        tooltip.textContent = 'Click to rebind';
        tooltip.classList.add('keybind-tooltip');

        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from propagating to other elements
            startRebind(button, action);
        });

        buttonWrapper.appendChild(button);
        buttonWrapper.appendChild(tooltip);

        div.appendChild(label);
        div.appendChild(buttonWrapper);
        ui.keybindsContainer.appendChild(div);
    }
}

function populateVideoSettings() {
    ui.videoSettingsContainer.innerHTML = '';

    const walkWobbleDiv = document.createElement('div');
    walkWobbleDiv.classList.add('settings-item'); // Add a class for general settings item styling
    const walkWobbleLabel = document.createElement('span');
    walkWobbleLabel.textContent = 'Walk Wobble';

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
        setSetting('video', 'walkWobble', true);
        updateToggleState(true);
    });

    offButton.addEventListener('click', () => {
        setSetting('video', 'walkWobble', false);
        updateToggleState(false);
    });

    // Set initial state
    updateToggleState(getTempSetting('video', 'walkWobble'));

    toggleSwitch.appendChild(onButton);
    toggleSwitch.appendChild(offButton);

    walkWobbleDiv.appendChild(walkWobbleLabel);
    walkWobbleDiv.appendChild(toggleSwitch);
    ui.videoSettingsContainer.appendChild(walkWobbleDiv);
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
            populateMapSelection(); // Re-populate to update active state
        });
        ui.mapDisplay.appendChild(mapButton);
    });
}

function populateAudioSettings() {
    ui.volumeSlider.value = getTempSetting('audio', 'volume');
    ui.volumeSlider.oninput = (e) => {
        setSetting('audio', 'volume', parseFloat(e.target.value));
    };

    ui.musicVolumeSlider.value = getTempSetting('audio', 'musicVolume');
    ui.musicVolumeSlider.oninput = (e) => {
        setSetting('audio', 'musicVolume', parseFloat(e.target.value));
    };
}

export function initUI(callbacks) {
    onStartSinglePlayerGame = callbacks.onStartSinglePlayerGame;
    onStartMap = callbacks.onStartMap;
    onResumeGame = callbacks.onResumeGame;
    onQuitToMainMenu = callbacks.onQuitToMainMenu;

    document.getElementById('single-player-button').addEventListener('click', () => UIManager.showMapSelectionMenu());
    document.getElementById('multiplayer-button').addEventListener('click', () => console.log('Multiplayer not implemented yet'));
    document.getElementById('settings-button').addEventListener('click', () => showMenu('settings-menu'));
    document.getElementById('quit-button').addEventListener('click', () => window.close()); // Simple quit

    document.getElementById('map-selection-back-button').addEventListener('click', () => showMenu('start-menu'));
    document.getElementById('start-map-button').addEventListener('click', () => onStartMap(selectedMapId));

    document.getElementById('back-button').addEventListener('click', () => showMenu('start-menu'));
    document.getElementById('resume-button').addEventListener('click', () => onResumeGame());
    document.getElementById('quit-to-main-menu-button').addEventListener('click', () => onQuitToMainMenu());

    ui.applySettingsButton.addEventListener('click', () => {
        applySettings();
        // Show confirmation message
        ui.settingsMessage.textContent = 'Settings Applied!';
        ui.settingsMessage.classList.add('show');
        setTimeout(() => {
            ui.settingsMessage.classList.remove('show');
            ui.settingsMessage.textContent = '';
        }, 3000);
    });

    ui.cancelSettingsButton.addEventListener('click', () => {
        resetTempSettings();
        populateAudioSettings(); // Refresh audio settings
        populateKeybinds(); // Re-populate to reflect reverted settings
        populateVideoSettings(); // Re-populate to reflect reverted settings
    });

    populateAudioSettings(); // Initial populate
    populateKeybinds();
    populateVideoSettings();
    populateMapSelection();
    showMenu('start-menu');
}

export const UIManager = {
    showMenu,
    showHUD,
    showPauseMenu: () => showMenu('pause-menu'),
    showStartMenu: () => showMenu('start-menu'),
    showMapSelectionMenu: () => showMenu('map-selection-menu'),
    showCustomCursor,
    hideCustomCursor,
};