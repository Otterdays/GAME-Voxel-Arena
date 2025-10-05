
import { getAllKeybinds } from './settings.js';

// Removed: import { updateCustomCursorPosition } from './ui.js';

const state = {
    move: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
    },
    fire: false,
    look: {
        dx: 0,
        dy: 0,
    },
    escape: false,
    cursorActive: false, // New state for custom cursor
};

let keyMap = {};
let keybinds = {};
let _updateCustomCursorPosition = null; // Store the passed function

function updateKeyMap() {
    keybinds = getAllKeybinds();
    keyMap = {};
    for (const action in keybinds) {
        keyMap[keybinds[action]] = action;
    }
}

function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    const action = keyMap[key];
    if (action && state.move[action] !== undefined) {
        state.move[action] = true;
    }
    if (key === 'escape') {
        state.escape = true;
    }
}

function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    const action = keyMap[key];
    if (action && state.move[action] !== undefined) {
        state.move[action] = false;
    }
    if (key === 'escape') {
        state.escape = false;
    }
}

function handleMouseDown(e) {
    if (state.cursorActive) {
        const element = document.elementFromPoint(cursorX, cursorY);
        if (element) {
            element.click(); // Simulate a click on the element
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

function handleMouseMove(e) {
    if (state.cursorActive) {
        cursorX = e.clientX;
        cursorY = e.clientY;

        // Clamp cursor to window bounds
        cursorX = Math.max(0, Math.min(window.innerWidth, cursorX));
        cursorY = Math.max(0, Math.min(window.innerHeight, cursorY));

        if (_updateCustomCursorPosition) {
            _updateCustomCursorPosition(cursorX, cursorY);
        } else {
            console.error('handleMouseMove: _updateCustomCursorPosition is null');
        }
    } else {
        state.look.dx += e.movementX;
        state.look.dy += e.movementY;
    }
}

export function initInput(updateCustomCursorPositionCallback) {
    _updateCustomCursorPosition = updateCustomCursorPositionCallback; // Store the callback
    updateKeyMap();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.addEventListener('mousemove', handleMouseMove);
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

export function clearEscapeInput() {
    state.escape = false;
}

export function setCursorActive(active) {
    console.log(`setCursorActive: ${active}, _updateCustomCursorPosition exists: ${!!_updateCustomCursorPosition}`);
    state.cursorActive = active;
    if (active) {
        // Initialize cursor position to center of screen when activated
        cursorX = window.innerWidth / 2;
        cursorY = window.innerHeight / 2;
        if (_updateCustomCursorPosition) {
            _updateCustomCursorPosition(cursorX, cursorY);
        }
        // Show the custom cursor
        if (window.showCustomCursor) {
            window.showCustomCursor();
        } else {
            console.error('setCursorActive: window.showCustomCursor is not available');
        }
    } else {
        // Hide the custom cursor
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
