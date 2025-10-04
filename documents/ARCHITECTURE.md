# Architecture

## Overview

This project is a 3D Arena FPS game built with HTML, CSS, and JavaScript. Three.js is used for 3D rendering, loaded globally via a `<script>` tag in `index.html`. The application runs entirely in the browser.

## Components

-   **`index.html`**: The main entry point of the application. It contains the canvas for the game, the HTML structure for the UI menus, and loads the global Three.js library.
-   **`style.css`**: Provides styling for all UI elements, including menus and the in-game HUD.
-   **`src/main.js`**: The core of the game. It initializes the Three.js scene (relying on the global `THREE` object), manages the main game loop, controls the overall game state, and manages the lifecycle of bullets.
-   **`src/arena.js`**: Acts as a dispatcher for arena creation. It imports specific arena definitions and, based on a `mapId`, calls the appropriate arena creation function.
-   **`src/arena1.js`**: Defines the first arena, including its geometry, materials, and obstacles (relying on the global `THREE` object).
-   **`src/arena2.js`**: Defines the second, larger, and more complex arena with varied obstacles and colors (relying on the global `THREE` object).
-   **`src/player.js`**: Handles player creation, movement, and first-person camera controls. It uses the character model from `src/character.js`.
-   **`src/glock.js`**: Manages the player's weapon, including its model, iron sights, firing mechanism, and sound effects. It creates bullets when fired (relying on the global `THREE` object).
-   **`src/bullet.js`**: Defines the `Bullet` class, including its appearance (dark orange sphere), movement logic, and lifetime (relying on the global `THREE` object).
-   **`src/ui.js`**: Controls the visibility and interaction of all UI components (start menu, settings, pause menu, HUD), including dynamic population of map selection buttons and custom toggle switches for settings.
-   **`src/input.js`**: Captures and processes all keyboard and mouse input, managed by a customizable keybinding system.
-   **`src/settings.js`**: Manages persistent game settings like audio volume and keybindings, potentially using browser `localStorage`.
-   **`src/structures.js`**: Defines the `Structure` class, a data representation for all world objects that can be collided with.
-   **`src/physics.js`**: Handles collision detection between the player and structures.
-   **`src/character.js`**: Defines the procedural "bean" character model, created by combining a `CylinderGeometry` and two `SphereGeometry` objects.
-   **`src/avatar.js`**: Handles the logic for the avatar editor, including creating a new Three.js scene and rendering the player model.

## Game Flow and Menu Navigation

The game flow has been updated to provide more structured navigation from the main menu:
*   **Start Menu:** Now features 'Single Player' and 'Multiplayer' options. The 'Multiplayer' option is currently a placeholder.
*   **Single Player Flow:** Selecting 'Single Player' transitions to a new 'Map Selection' menu.
*   **Map Selection Menu:** Allows the player to choose a map before starting the game. It dynamically displays available maps (e.g., 'Classic Arena', 'Big Arena') as visually distinct buttons with glowing highlights for selection. A 'Start Map' button initiates the game with the selected map, and a 'Back' button returns to the main menu.

## Settings Management

To provide a robust and user-friendly settings experience, a temporary settings system has been implemented:
*   **Temporary Settings (`tempSettings`):** All changes made in the settings UI (volume, keybinds, video options) are applied to a temporary copy of the settings (`tempSettings`) first.
*   **Apply/Cancel:** Changes only take effect in the game and are saved to `localStorage` when the 'Apply' button is clicked. The 'Cancel' button discards all pending changes and reverts the UI to the last applied settings.
*   **Confirmation Prompt:** A temporary "Settings Applied!" message is displayed after successful application.
*   **Keybind Rebinding:** Keybinds can be rebound by clicking their respective buttons. A tooltip instructs the player, and the button displays "..." during the rebinding process. The system captures the next key or mouse click to set the new bind. When the settings are applied, the input system is notified to refresh the keybindings.

## Structure and Collision System

To prepare for a future map editor and to implement proper collision, a new structure and collision system has been added:
*   **`src/structures.js`:** A `Structure` class defines the data representation for all world objects that can be collided with. This separates the object's data (position, size, type) from its visual representation.
*   **`src/physics.js`:** A `checkCollision` function uses Axis-Aligned Bounding Box (AABB) intersection tests to detect collisions between the player and structures.
*   **Arena Generation:** The arena files (`src/arena1.js`, `src/arena2.js`) now define an array of `Structure` objects. The `src/arena.js` file then uses this array to generate the visible Three.js meshes, keeping the data and rendering separate.
## Player Collision:** The `src/player.js` file now uses the `checkCollision` function to detect and prevent movement into structures.

## Avatar Editor

A new avatar editor feature has been added to allow players to view their character model.
*   **Avatar Button:** An "Avatar" button has been added to the main menu.
*   **Avatar Menu:** Clicking the "Avatar" button opens a new menu that displays a 3D model of the player.
*   **`src/avatar.js`:** This new file contains the logic for the avatar editor. It creates a separate Three.js scene to render the player model, which is then displayed in a `div` in the avatar menu.

## Audio System

*   **Main Menu Music:** A background music track (`audio/main.wav`) plays and loops when the game is in a menu state.
*   **Fade-in Effect:** The music fades in smoothly from a low volume (quarter of target volume) to the full set volume over 1 second when it starts playing.
*   **Volume Control:** A "Music Volume" slider in the audio settings allows players to adjust the music's volume.
*   **Autoplay Policy:** Due to browser autoplay policies, music playback is initiated (AudioContext resumed) on the first user gesture on the page.

## Custom GUI and Mouse System (Soft Pause Menu)

To address issues with the browser's Pointer Lock API and provide a smoother user experience, a "soft pause" menu system has been implemented. This system avoids repeatedly requesting and exiting pointer lock, which previously caused `SecurityError` and inconsistent mouse behavior.

**Key Design Principles:**
*   **Persistent Pointer Lock:** Once the game starts, the browser's pointer lock remains active until the game is fully quit (e.g., returning to the main menu). This ensures the system mouse cannot leave the game window while in-game.
*   **In-Game Custom Cursor:** When the game is paused or in a menu state, a custom visual cursor is rendered directly within the game canvas.
*   **Simulated UI Interaction:** Mouse movements control the position of this custom cursor. Clicks are simulated on underlying UI elements based on the custom cursor's position.

**Implementation Details:**
*   **`index.html` & `style.css`:** A dedicated `div` (`#custom-cursor`) is used for the custom cursor, styled to be hidden by default and appear when needed. CSS ensures the system cursor remains hidden (`cursor: none !important;`) over interactive UI elements. Custom CSS classes (`.toggle-switch`, `.toggle-switch button`, `.toggle-switch button.active`) are defined to style the new ON/OFF toggle buttons in the settings menu, providing visual feedback for their state.
*   **`src/ui.js`:** Manages the visibility (`showCustomCursor()`, `hideCustomCursor()`) and visual position (`updateCustomCursorPosition()`) of the custom cursor. It also controls the `pointer-events` on the main UI container to allow/disallow clicks based on cursor activity. The `populateVideoSettings()` function now dynamically creates the custom toggle buttons for settings like "Walk Wobble", handling their state and interaction with the `settings.js` module.
*   **`src/input.js`:** Contains logic to switch between camera control (when playing) and custom cursor movement (when paused). The `mousemove` listener is attached to `document.body` to ensure robust tracking of the system mouse across the entire window. When the custom cursor is active, `handleMouseMove` updates the custom cursor's absolute position (`e.clientX`, `e.clientY`), ensuring it always tracks and snaps to the system mouse. `handleMouseDown` uses `document.elementFromPoint()` to identify and trigger click events on UI elements beneath the custom cursor.
*   **`src/main.js`:** Orchestrates the game state transitions. `pauseGame()` and `resumeGame()` now primarily manage the game's `gameState` and call `setCursorActive(true/false)` (from `input.js`) and `UIManager.showPauseMenu()/showHUD()` (from `ui.js`). Pointer lock is automatically requested by `startGame()` and when clicking the `Resume` button (as these are direct user gestures). The `onPointerlockChange` listener is crucial: if the pointer lock is lost while the game is in the 'playing' state (e.g., user presses 'Escape' or browser-initiated release), it automatically calls `pauseGame()`, ensuring the mouse cannot escape the game without the pause menu appearing. If resuming via the 'Escape' key, a manual click on the canvas is required to re-acquire pointer lock.