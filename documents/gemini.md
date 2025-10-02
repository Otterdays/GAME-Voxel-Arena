# ArenaFPS

A fast-paced, browser-based first-person shooter game.

## Getting Started

To run the game, simply open the `index.html` file in a modern web browser.

## Project Structure

*   `index.html`: The main entry point for the game.
*   `style.css`: Contains the styles for the game's UI and elements.
*   `src/`: Contains the core game logic, broken down into modules.
    *   `main.js`: The main game loop and initialization.
    *   `player.js`: Player movement and controls.
    *   `gun.js`: Weapon mechanics.
    *   `bullet.js`: Bullet logic.
    *   `arena.js`: The game world and environment.
    *   `input.js`: Handles user input.
    *   `ui.js`: Manages the user interface.
    *   `settings.js`: Game settings and constants.
*   `documents/`: Contains project documentation.

## Development Log

### Soft Pause Menu Implementation
**Problem:** The original pause/resume mechanism suffered from `SecurityError` due to browser restrictions on `requestPointerLock()` when triggered by the Escape key. This led to the mouse not locking or the game instantly re-pausing.
**Solution:** Implemented a "soft pause" menu:
*   The pointer lock remains active once the game starts. `document.exitPointerLock()` is only called when truly quitting to the main menu.
*   When paused, a custom in-game cursor (`#custom-cursor` in `index.html` and `style.css`) appears.
*   Mouse movement controls this custom cursor (handled in `src/input.js`), not the camera.
*   UI interactions (clicks on buttons) are simulated by detecting the element under the custom cursor's position (`document.elementFromPoint`) and programmatically triggering a click event (handled in `src/input.js`).
*   The system cursor is forced to remain hidden (`cursor: none !important;` in `style.css`) even when hovering over interactive UI elements.
*   The custom cursor now snaps correctly to the system cursor's position when activated and continuously tracks it.

### Three.js Import Management
**Problem:** Persistent `WARNING: Multiple instances of Three.js being imported.` and intermittent `WrongDocumentError` related to pointer lock.
**Solution:** The initial refactoring attempt to centralize Three.js imports was reverted due to introducing more critical errors. For stability, each module (`player.js`, `gun.js`, `bullet.js`, `arena.js`) now imports Three.js directly. The `WrongDocumentError` was resolved by removing a conflicting global Three.js script tag from `index.html`. The "Multiple instances" warning persists but is currently deemed non-critical for functionality.

### Constants Management
**Problem:** `ReferenceError` for gameplay constants (e.g., `MOUSE_SENSITIVITY`, `BULLET_LIFETIME`).
**Solution:** Constants were re-introduced and defined directly within their respective module files (`src/player.js`, `src/bullet.js`) after being inadvertently removed during earlier refactoring attempts.
