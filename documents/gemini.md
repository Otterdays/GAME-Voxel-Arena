**IMPORTANT NOTE FOR GEMINI:** When updating this document, or any other documentation file, never delete existing content. Only add new information or make corrections to existing content.

# Voxel Arena

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

### Keybind System Fixes
**Problem:** The keybind UI was not updating when a new key was pressed, and even when the settings were applied, the new keybinds were not being used in the game.
**Solution:**
*   **UI Update:** The `populateKeybinds` function in `src/ui.js` was updated to use `getTempAllKeybinds()` to ensure the UI reflects the temporary settings.
*   **Missing Import:** The `getTempAllKeybinds` function was imported into `src/ui.js` to fix a `ReferenceError`.
*   **Input Refresh:** The `refreshKeybinds` function from `src/input.js` is now called when the "Apply" button is clicked in the settings menu. This notifies the input system to reload the keybinds, making the changes effective in the game.

### Structure and Collision System
**Problem:** The game lacked a proper collision detection system, and the arena obstacles were not solid.
**Solution:**
*   **`src/structures.js`:** A `Structure` class was created to define the data representation for all world objects that can be collided with.
*   **`src/physics.js`:** A `checkCollision` function was created to detect collisions between the player and structures using Axis-Aligned Bounding Box (AABB) intersection tests.
*   **Arena Refactor:** The arena files (`src/arena1.js`, `src/arena2.js`) were refactored to define an array of `Structure` objects. The `src/arena.js` file now generates the visible Three.js meshes from this data, separating the data from the rendering.
*   **Player Collision:** The `src/player.js` file was updated to use the `checkCollision` function to detect and prevent movement into structures.
*   **Module Error Fix:** Fixed a `TypeError` by removing the `import * as THREE from 'three'` statement from `src/physics.js` and relying on the global `THREE` object.

### Gun Refactor
**Problem:** The generic `gun.js` file needed to be updated to support multiple gun types.
**Solution:**
*   **`src/glock.js`:** The `src/gun.js` file was renamed to `src/glock.js` to represent the first specific gun type.
*   **Class Rename:** The `Gun` class was renamed to `Glock` within `src/glock.js`.
*   **`src/main.js` Update:** The `src/main.js` file was updated to import and use the new `Glock` class as the default weapon.

### Avatar Editor
**Problem:** The user wanted a way to view the player's avatar.
**Solution:**
*   **Avatar Button:** An "Avatar" button was added to the main menu.
*   **Avatar Menu:** A new menu was created to display a 3D model of the player.
*   **`src/avatar.js`:** A new file was created to handle the logic for the avatar editor, including creating a new Three.js scene and rendering the player model.

### Player Model
**Problem:** The player model was a simple cylinder and not represented by its own file.
**Solution:**
*   **Documentation:** The `ARCHITECTURE.md` file was updated to be more specific about the procedural player model and its location in the code.
*   **Avatar Editor Fix:** The avatar editor was not showing the model because it was being initialized before the UI was visible. The initialization is now triggered when the avatar menu is opened.
*   **`src/character.js`:** A new file was created to define a procedural "bean" character model.
*   **Model Integration:** The `player.js` and `avatar.js` files were updated to use the new character model.
*   **CapsuleGeometry Fix:** The `CapsuleGeometry` was replaced with a combination of a `CylinderGeometry` and two `SphereGeometry` objects to support the older version of Three.js.