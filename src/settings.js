
const SETTINGS_KEY = 'arena-fps-settings';

const defaultSettings = {
    audio: {
        volume: 0.5,
        musicVolume: 0.5, // New music volume setting
    },
    keybinds: {
        forward: 'w',
        backward: 's',
        left: 'a',
        right: 'd',
        jump: ' ', // Space
        fire: 'mouse0', // Left mouse button
    },
    video: {
        walkWobble: true,
    },
};

let settings = { ...defaultSettings };
let tempSettings = {}; // Temporary settings for changes before applying

function saveSettings() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Couldn't save settings to localStorage.", e);
    }
}

function loadSettings() {
    try {
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
            settings = JSON.parse(storedSettings);
            // Ensure all keys are present, in case we added new settings
            settings = {
                ...defaultSettings,
                ...settings,
                audio: { ...defaultSettings.audio, ...settings.audio },
                keybinds: { ...defaultSettings.keybinds, ...settings.keybinds },
                video: { ...defaultSettings.video, ...settings.video }, // Merge new video settings
            };
        }
    } catch (e) {
        console.error("Couldn't load settings from localStorage.", e);
        settings = { ...defaultSettings };
    }
}

// Initialize tempSettings from current settings
export function initTempSettings() {
    tempSettings = JSON.parse(JSON.stringify(settings)); // Deep copy
}

export function getSetting(category, key) {
    // Read from main settings object for game logic
    return settings[category]?.[key];
}

export function getTempSetting(category, key) {
    // Read from tempSettings for UI display
    return tempSettings[category]?.[key];
}

export function setSetting(category, key, value) {
    if (tempSettings[category] && tempSettings[category][key] !== undefined) {
        tempSettings[category][key] = value;
    }
}

export function applySettings() {
    settings = JSON.parse(JSON.stringify(tempSettings)); // Deep copy temp to main
    saveSettings();
}

export function resetTempSettings() {
    initTempSettings(); // Revert tempSettings to current saved settings
}

export function getAllKeybinds() {
    return { ...settings.keybinds }; // Return keybinds from main settings for game logic
}

export function getTempAllKeybinds() {
    return { ...tempSettings.keybinds }; // Return keybinds from tempSettings for UI
}

// Initial load
loadSettings();
initTempSettings(); // Initialize temp settings on load
