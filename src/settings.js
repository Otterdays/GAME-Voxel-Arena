
const SETTINGS_KEY = 'arena-fps-settings';

const defaultSettings = {
    audio: {
        volume: 0.5,
        musicVolume: 0.5,
        weaponVolume: 0.7,
        masterVolume: 1.0,
    },
    keybinds: {
        forward: 'w',
        backward: 's',
        left: 'a',
        right: 'd',
        jump: ' ', // Space
        fire: 'mouse0', // Left mouse button
        reload: 'r',
        sprint: 'shift',
        crouch: 'ctrl',
        interact: 'e',
        map: 'm',
        menu: 'escape',
    },
    video: {
        walkWobble: true,
        fogEnabled: true,
        fogDensity: 0.75,
        fogColor: '#87ceeb',
        renderDistance: 100,
        shadowQuality: 'medium',
        particleEffects: true,
        motionBlur: false,
        antiAliasing: true,
        textureQuality: 'medium',
        // UI Scaling and Performance Settings
        uiScale: 1.0,
        resolution: 'auto',
        performanceProfile: 'auto',
        adaptiveScaling: true,
        fpsTarget: 60,
    },
    gameplay: {
        mouseSensitivity: 0.002,
        fov: 75,
        crosshairStyle: 'classic',
        hitMarkers: true,
        damageNumbers: true,
        autoReload: true,
        sprintToggle: false,
        crouchToggle: false,
    },
    accessibility: {
        colorBlindMode: 'none',
        highContrast: false,
        largeText: false,
        screenShake: true,
        flashEffects: true,
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
                video: { ...defaultSettings.video, ...settings.video },
                gameplay: { ...defaultSettings.gameplay, ...settings.gameplay },
                accessibility: { ...defaultSettings.accessibility, ...settings.accessibility },
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

// Performance profiles for automatic settings
export const performanceProfiles = {
    low: { 
        uiScale: 1.1, 
        renderDistance: 75, 
        textureQuality: 'low', 
        shadowQuality: 'low',
        particleEffects: false,
        antiAliasing: false,
        fogDensity: 0.5
    },
    medium: { 
        uiScale: 1.0, 
        renderDistance: 100, 
        textureQuality: 'medium', 
        shadowQuality: 'medium',
        particleEffects: true,
        antiAliasing: true,
        fogDensity: 0.75
    },
    high: { 
        uiScale: 0.9, 
        renderDistance: 125, 
        textureQuality: 'high', 
        shadowQuality: 'high',
        particleEffects: true,
        antiAliasing: true,
        fogDensity: 0.8
    },
    ultra: { 
        uiScale: 0.8, 
        renderDistance: 150, 
        textureQuality: 'ultra', 
        shadowQuality: 'ultra',
        particleEffects: true,
        antiAliasing: true,
        fogDensity: 1.0
    },
    auto: { 
        uiScale: 'auto', 
        renderDistance: 'auto', 
        textureQuality: 'auto', 
        shadowQuality: 'auto',
        particleEffects: 'auto',
        antiAliasing: 'auto',
        fogDensity: 'auto'
    }
};

// Helper function to apply performance profile
export function applyPerformanceProfile(profile) {
    if (profile === 'auto') return;
    
    const settings = performanceProfiles[profile];
    if (!settings) return;
    
    Object.keys(settings).forEach(key => {
        if (settings[key] !== 'auto') {
            setSetting('video', key, settings[key]);
        }
    });
}

// Helper function to detect recommended profile
export function detectRecommendedProfile() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return 'medium';
    
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'low';
    
    // Detect WebGL capabilities
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
    
    // Determine recommended settings based on renderer
    if (renderer.includes('Intel') || renderer.includes('Integrated') || renderer.includes('HD Graphics')) {
        return 'low';
    } else if (renderer.includes('RTX') || renderer.includes('RX 6') || renderer.includes('RTX 4')) {
        return 'ultra';
    } else if (renderer.includes('GTX 1') || renderer.includes('RX 5') || renderer.includes('RTX 3')) {
        return 'high';
    } else if (renderer.includes('GTX') || renderer.includes('RX') || renderer.includes('Radeon')) {
        return 'medium';
    }
    
    return 'medium'; // Default fallback
}

// Export default settings for reset functionality
export { defaultSettings };

// Initial load
loadSettings();
initTempSettings(); // Initialize temp settings on load
