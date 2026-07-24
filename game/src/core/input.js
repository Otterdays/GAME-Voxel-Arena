import { getAllKeybinds } from './settings.js';

// [TRACE: SCRATCHPAD.md] — laptop touchpad + keyboard hardening

const state = {
    move: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
    },
    fire: false,
    reload: false,
    look: {
        dx: 0,
        dy: 0,
    },
    escape: false,
    cursorActive: false,
};

// Precision touchpads spit huge movementX/Y on finger lift/land / palm hits
const LOOK_SPIKE_CAP = 64;
// Drop look deltas right after pointer lock (OS often injects a jump)
const LOOK_IGNORE_MS = 80;

let keyMap = {};
let keybinds = {};
let _updateCustomCursorPosition = null;
let ignoreLookUntil = 0;

function updateKeyMap() {
    keybinds = getAllKeybinds();
    keyMap = {};
    for (const action in keybinds) {
        keyMap[keybinds[action]] = action;
    }
}

function normalizeKey(e) {
    const key = e.key.toLowerCase();
    if (key === 'control') return 'ctrl';
    if (key === 'meta') return 'meta';
    return key;
}

function clearMoveKeys() {
    state.move.forward = false;
    state.move.backward = false;
    state.move.left = false;
    state.move.right = false;
    state.move.jump = false;
}

export function resetGameplayInput() {
    clearMoveKeys();
    state.look.dx = 0;
    state.look.dy = 0;
    state.fire = false;
    state.reload = false;
}

/** Call when pointer lock is gained/lost — clears stuck keys + look spikes. */
export function onPointerLockChanged(locked) {
    clearLookInput();
    if (locked) {
        ignoreLookUntil = performance.now() + LOOK_IGNORE_MS;
    } else {
        // Alt-tab / Esc / Win key often miss keyup → WASD sticks with touchpad look
        resetGameplayInput();
    }
}

function handleKeyDown(e) {
    const key = normalizeKey(e);
    const action = keyMap[key];

    if (action && state.move[action] !== undefined) {
        if (document.pointerLockElement) {
            e.preventDefault();
        }
        state.move[action] = true;
    }
    if (action === 'reload') {
        if (document.pointerLockElement) {
            e.preventDefault();
        }
        state.reload = true;
    }
    if (e.key === 'Escape' || key === 'escape') {
        state.escape = true;
    }
}

function handleKeyUp(e) {
    const key = normalizeKey(e);
    const action = keyMap[key];
    if (action && state.move[action] !== undefined) {
        state.move[action] = false;
    }
    if (action === 'reload') {
        state.reload = false;
    }
    if (e.key === 'Escape' || key === 'escape') {
        state.escape = false;
    }
}

function handleMouseDown(e) {
    if (state.cursorActive) {
        const element = document.elementFromPoint(cursorX, cursorY);
        if (element) {
            element.click();
        }
    } else {
        const button = 'mouse' + e.button;
        const action = keyMap[button];
        if (action === 'fire') {
            state.fire = true;
        }
    }
}

function handleMouseUp(e) {
    const button = 'mouse' + e.button;
    const action = keyMap[button];
    if (action === 'fire') {
        state.fire = false;
    }
}

let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;

function clampLookDelta(v) {
    if (!Number.isFinite(v)) return 0;
    return Math.max(-LOOK_SPIKE_CAP, Math.min(LOOK_SPIKE_CAP, v));
}

function handleMouseMove(e) {
    if (state.cursorActive) {
        cursorX = e.clientX;
        cursorY = e.clientY;

        cursorX = Math.max(0, Math.min(window.innerWidth, cursorX));
        cursorY = Math.max(0, Math.min(window.innerHeight, cursorY));

        if (_updateCustomCursorPosition) {
            _updateCustomCursorPosition(cursorX, cursorY);
        } else {
            console.error('handleMouseMove: _updateCustomCursorPosition is null');
        }
        return;
    }

    // Ignore stray deltas when not locked (menus / focus fights)
    if (!document.pointerLockElement) return;
    if (performance.now() < ignoreLookUntil) return;

    state.look.dx += clampLookDelta(e.movementX);
    state.look.dy += clampLookDelta(e.movementY);
}

// Two-finger scroll on touchpads fights FPS look; kill it while locked
function handleWheel(e) {
    if (document.pointerLockElement) {
        e.preventDefault();
    }
}

function handleContextMenu(e) {
    if (document.pointerLockElement) {
        e.preventDefault();
    }
}

function handleBlur() {
    resetGameplayInput();
}

function handleVisibilityChange() {
    if (document.hidden) {
        resetGameplayInput();
    }
}

export function initInput(updateCustomCursorPositionCallback) {
    _updateCustomCursorPosition = updateCustomCursorPositionCallback;
    updateKeyMap();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

export function getInputState() {
    return state;
}

export function clearLookInput() {
    state.look.dx = 0;
    state.look.dy = 0;
}

export function clearFireInput() {
    state.fire = false;
}

export function clearReloadInput() {
    state.reload = false;
}

export function clearEscapeInput() {
    state.escape = false;
}

export function setCursorActive(active) {
    console.log(`setCursorActive: ${active}, _updateCustomCursorPosition exists: ${!!_updateCustomCursorPosition}`);
    state.cursorActive = active;
    if (active) {
        cursorX = window.innerWidth / 2;
        cursorY = window.innerHeight / 2;
        if (_updateCustomCursorPosition) {
            _updateCustomCursorPosition(cursorX, cursorY);
        }
        if (window.showCustomCursor) {
            window.showCustomCursor();
        } else {
            console.error('setCursorActive: window.showCustomCursor is not available');
        }
    } else {
        if (window.hideCustomCursor) {
            window.hideCustomCursor();
        } else {
            console.error('setCursorActive: window.hideCustomCursor is not available');
        }
    }
}

export function refreshKeybinds() {
    updateKeyMap();
}
