# Architecture

## Overview

Voxel Arena is a 3D FPS game built with HTML, CSS, and JavaScript. Three.js is used for 3D rendering, loaded globally via a `<script>` tag in `index.html`. The application runs entirely in the browser.

## Components

-   **`game/index.html`**: The main entry point of the application. It contains the canvas for the game, the HTML structure for the UI menus, and loads the global Three.js library.
-   **`game/style.css`**: Provides styling for all UI elements, including menus and the in-game HUD.
-   **`game/src/core/main.js`**: The core of the game. It initializes the Three.js scene (relying on the global `THREE` object), manages the main game loop, controls the overall game state, and manages the lifecycle of bullets.
-   **`game/src/world/arena.js`**: Acts as a dispatcher for arena creation. It imports specific arena definitions and, based on a `mapId`, calls the appropriate arena creation function.
-   **`game/src/world/arena1.js`**: Defines the first arena, including its geometry, materials, and obstacles (relying on the global `THREE` object).
-   **`game/src/world/arena2.js`**: Defines the second, larger, and more complex arena with varied obstacles and colors (relying on the global `THREE` object).
-   **`game/src/player/player.js`**: Handles player creation, movement, and first-person camera controls. It uses the character model from `game/src/player/character.js`. To prevent the camera from clipping into the player's own model, the model is assigned to a separate rendering layer, making it invisible to the main camera.
-   **`game/src/player/glock.js`**: Manages the player's weapon, including its model, iron sights, firing mechanism, and sound effects. It creates bullets when fired (relying on the global `THREE` object).
-   **`game/src/player/bullet.js`**: Defines the `Bullet` class, including its appearance (dark orange sphere), movement logic, and lifetime (relying on the global `THREE` object).
-   **`game/src/ui/ui.js`**: Controls the visibility and interaction of all UI components (start menu, settings, pause menu, HUD), including dynamic population of map selection buttons and custom toggle switches for settings.
-   **`game/src/ui/minimap.js`**: **Completely rebuilt minimap system (v0.21)** - Renders a top-down minimap on the HUD with dynamic element creation. Displays player position (green dot), direction indicator, structures (gray rectangles), and bots (red/blue dots by team). Features 4x zoom level, proper coordinate system, and self-contained DOM creation with no HTML dependencies.
-   **`game/src/core/input.js`**: Captures and processes all keyboard and mouse input, managed by a customizable keybinding system.
-   **`game/src/core/settings.js`**: Manages persistent game settings like audio volume and keybindings, potentially using browser `localStorage`.
-   **`game/src/world/structures.js`**: Defines the `Structure` class, a data representation for all world objects that can be collided with.
-   **`game/src/core/physics.js`**: Handles collision detection between the player and structures.
-   **`game/src/player/character.js`**: Defines the procedural "bean" character model, created by combining a `CylinderGeometry` and two `SphereGeometry` objects.
-   **`game/src/player/avatar.js`**: Handles the logic for the avatar editor, including creating a new Three.js scene and rendering the player model.
-   **`game/src/ui/customComponents.js`**: Custom UI components (CustomDropdown, CustomSlider) that match the game's aesthetic and work properly with the custom cursor system.

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
*   **Player Collision:** The `src/player.js` file now uses the `checkCollision` function to detect and prevent movement into structures.

## Enhanced Map System and Spawn Mechanics

### Arena Data Structure
Each arena now includes comprehensive metadata and spawn information:

```javascript
{
    structures: [...],           // Collision structures
    spawnPoint: {...},          // Default spawn point
    spawnPoints: [...],         // Multiple spawn points for random spawning
    botSpawnAreas: {            // Team-specific spawn areas
        red: [...],
        blue: [...]
    },
    metadata: {                 // Map information
        name: 'Arena Name',
        description: 'Description',
        size: { x, y, z },
        maxPlayers: 8,
        maxBots: 12,
        difficulty: 'medium',
        theme: 'classic'
    }
}
```

### Random Spawn System
- **Player Spawning**: Random selection from available spawn points
- **Bot Spawning**: Team-specific spawn areas with random selection
- **Fallback**: Uses default spawn point if random spawning is disabled

### Map Preview System (`src/mapPreview.js`)
- **3D Preview**: Real-time 3D visualization of map layout
- **Spawn Indicators**: Visual markers for player and bot spawn points
- **Team Colors**: Red/blue indicators for team spawn areas
- **Interactive**: Rotating camera view with lighting and shadows

### Map Selection UI
- **Preview Display**: Shows 3D map preview with spawn locations
- **Map Information**: Displays name, description, size, and difficulty
- **Bot Settings**: Configure bot count, difficulty, and team balance
- **Game Settings**: Toggle random spawn and other options

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

## AI Bot System Architecture

The AI bot system provides fully functional computer-controlled opponents with physics integration, intelligent behavior, and combat capabilities. The system consists of 9 modular components working together to create realistic bot behaviors.

**Core Components:**
*   **Bot.js**: Main bot class integrating all AI systems with physics
*   **BotBrain.js**: Central AI decision-making with state machines
*   **BotSenses.js**: Perception system for enemy detection and environmental awareness
*   **BotMemory.js**: Learning system with experience storage and pattern recognition
*   **BotPersonality.js**: Behavioral traits affecting decision-making and emotional responses
*   **BotCombat.js**: Tactical combat system with weapon handling and target prioritization
*   **BotMovement.js**: Advanced pathfinding with physics-based movement
*   **BotCommunication.js**: Team coordination and information sharing
*   **BotManager.js**: Game integration and bot lifecycle management

**Key Features:**
*   **Physics Integration**: Bots use identical physics system as player (gravity, collision, movement)
*   **Two-State AI**: Simple but effective patrol/combat behavior system
*   **Team Combat**: Red vs Blue team battles with proper team awareness
*   **Enemy Detection**: Vision-based targeting with 25-unit detection range
*   **Weapon Systems**: Realistic weapon firing with fire rate limiting
*   **Patrol Behavior**: Circular patrol patterns around spawn areas

**Technical Implementation:**
*   **Physics Constants**: RADIUS: 0.5, HEIGHT: 1.8, SPEED: 3.0, GRAVITY: 20.0
*   **AI Parameters**: Vision range: 25 units, Combat range: 15 units, Fire rate: 500ms
*   **Performance**: Optimized update intervals and efficient memory management
*   **Integration**: Seamless integration with existing game systems and physics

## Custom GUI and Mouse System (Soft Pause Menu)

To address issues with the browser's Pointer Lock API and provide a smoother user experience, a "soft pause" menu system has been implemented. This system avoids repeatedly requesting and exiting pointer lock, which previously caused `SecurityError` and inconsistent mouse behavior.

**Key Design Principles:**
*   **Persistent Pointer Lock:** Once the game starts, the browser's pointer lock remains active until the game is fully quit (e.g., returning to the main menu). This ensures the system mouse cannot leave the game window while in-game.
*   **In-Game Custom Cursor:** When the game is paused or in a menu state, a custom visual cursor is rendered directly within the game canvas.
*   **Simulated UI Interaction:** Mouse movements control the position of this custom cursor. Clicks are simulated on underlying UI elements based on the custom cursor's position.

**Implementation Details:**
*   **`index.html` & `style.css`:** A dedicated `div` (`#custom-cursor`) is used for the custom cursor, positioned outside the `ui-container` to avoid stacking context issues. CSS ensures the system cursor remains hidden (`cursor: none !important;`) over interactive UI elements. Custom CSS classes (`.toggle-switch`, `.toggle-switch button`, `.toggle-switch button.active`) are defined to style the new ON/OFF toggle buttons in the settings menu, providing visual feedback for their state.
*   **`src/ui.js`:** Manages the visibility (`showCustomCursor()`, `hideCustomCursor()`) and visual position (`updateCustomCursorPosition()`) of the custom cursor. It also controls the `pointer-events` on the main UI container to allow/disallow clicks based on cursor activity. The `populateVideoSettings()` function now dynamically creates the custom toggle buttons for settings like "Walk Wobble", handling their state and interaction with the `settings.js` module.
*   **`src/input.js`:** Contains logic to switch between camera control (when playing) and custom cursor movement (when paused). The `mousemove` listener is attached to `document.body` to ensure robust tracking of the system mouse across the entire window. When the custom cursor is active, `handleMouseMove` updates the custom cursor's absolute position (`e.clientX`, `e.clientY`), ensuring it always tracks and snaps to the system mouse. `handleMouseDown` uses `document.elementFromPoint()` to identify and trigger click events on UI elements beneath the custom cursor.
*   **`src/main.js`:** Orchestrates the game state transitions. `pauseGame()` and `resumeGame()` now primarily manage the game's `gameState` and call `setCursorActive(true/false)` (from `input.js`) and `UIManager.showPauseMenu()/showHUD()` (from `ui.js`). Pointer lock is automatically requested by `startGame()` and when clicking the `Resume` button (as these are direct user gestures). The `onPointerlockChange` listener is crucial: if the pointer lock is lost while the game is in the 'playing' state (e.g., user presses 'Escape' or browser-initiated release), it automatically calls `pauseGame()`, ensuring the mouse cannot escape the game without the pause menu appearing. If resuming via the 'Escape' key, a manual click on the canvas is required to re-acquire pointer lock.

## Custom UI Components System (December 2024)

To address custom cursor issues with native HTML elements and improve visual consistency, a custom UI components system has been implemented.

### Custom Dropdown Component
- **Purpose**: Replaces native HTML `<select>` elements that caused custom cursor positioning issues
- **Features**: 
  - Smooth hover effects with color transitions
  - Animated arrow rotation when opening/closing
  - Selected option highlighting
  - Keyboard navigation support
  - Custom cursor compatibility
- **Styling**: Matches game's green neon aesthetic with gradients, glows, and animations
- **Integration**: Used in settings menu for dropdown selections

### Custom Slider Component
- **Purpose**: Replaces native HTML `<input type="range">` elements
- **Features**:
  - Visual track with custom styling
  - Interactive thumb with hover effects
  - Real-time value display
  - Smooth animations and transitions
  - Custom cursor compatibility
- **Styling**: Consistent with game's visual theme
- **Integration**: Used for volume controls and other slider settings

### Technical Implementation
- **File**: `src/customComponents.js` - Contains CustomDropdown and CustomSlider classes
- **CSS Integration**: Custom styles in `style.css` with `.custom-dropdown` and `.custom-slider` classes
- **Event Handling**: Proper mouse event management for custom cursor compatibility
- **Accessibility**: Maintains keyboard navigation and screen reader support

## Custom Scrollbar System

A custom scrollbar system has been implemented to maintain visual consistency with the game's green-on-black aesthetic throughout the user interface.

**Design Features:**
*   **Track Styling:** Dark background (`rgba(0, 0, 0, 0.8)`) with green border (`rgba(0, 255, 0, 0.3)`) and rounded corners
*   **Thumb Styling:** Green gradient (`#00ff00` → `#00cc00`) with glow effects and interactive states
*   **Interactive States:** Hover and active states with enhanced glow effects
*   **Cross-Browser Support:** WebKit (Chrome, Safari, Edge) and Firefox compatibility

**Implementation Details:**
*   **CSS Pseudo-elements:** Uses `::-webkit-scrollbar`, `::-webkit-scrollbar-track`, and `::-webkit-scrollbar-thumb` for WebKit browsers
*   **Firefox Support:** Uses `scrollbar-width` and `scrollbar-color` properties for Firefox compatibility
*   **Consistent Theming:** Matches existing UI design language with green accents and dark backgrounds
*   **Enhanced UX:** Provides visual feedback through hover and active states

## Canvas Viewport and UI Scaling Fixes (December 2024)

### Canvas Viewport Issues
**Problem:** Canvas wasn't filling the viewport properly on initial load, causing white background cutoff and requiring F12/devtools to fix layout issues.

**Root Causes:**
*   Canvas sizing not synchronized between CSS and Three.js renderer
*   Missing resize triggers on DOM load events
*   Complex UI scaling system causing layout conflicts

**Solutions Implemented:**

### Canvas Sizing Enforcement (`src/main.js`)
*   **Force Canvas Sizing:** Added explicit canvas sizing in `init()` and `onWindowResize()`:
    ```javascript
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    ```
*   **Multiple Resize Triggers:** Added event listeners for `DOMContentLoaded`, `window.load`, and `setTimeout` delay to ensure proper sizing without requiring devtools.

### CSS Canvas Fixes (`style.css`)
*   **Canvas Positioning:** Changed canvas to `position: fixed !important` with `z-index: -1` to ensure it fills viewport
*   **Viewport Units:** Used `100vw` and `100vh` with `!important` to override any conflicting styles
*   **HTML/Body Reset:** Added `margin: 0; padding: 0; overflow: hidden` to eliminate browser defaults

### UI Scaling System Refinement
*   **Element-Level Scaling:** Moved scaling from container-level to individual UI elements to prevent layout disruption
*   **Simplified Media Queries:** Reduced aggressive scaling breakpoints to prevent conflicts
*   **Map Preview Scaling:** Fixed oversized map preview by implementing responsive sizing with ResizeObserver

### Map Preview System (`src/mapPreview.js`)
*   **Responsive Sizing:** Replaced fixed 400x300 renderer size with dynamic container-based sizing
*   **ResizeObserver:** Added automatic resize handling when container dimensions change
*   **Proper Cleanup:** Added ResizeObserver disconnection in `destroy()` method

**Result:** Canvas now fills viewport immediately on load, no white background cutoff, no F12 dependency, and properly scaled UI elements across all screen sizes.

## UI Scaling System Simplification (December 2024)

### Scaling Issues Identified
**Problem:** Complex UI scaling system was causing menus to be oversized and map preview to be massive, requiring browser zoom out to view properly.

**Root Causes:**
*   Multiple scaling mechanisms conflicting (CSS transforms, CSS variables, JavaScript scaling)
*   Oversized container dimensions (settings container 1400px, map preview 400x300px)
*   Complex adaptive scaling logic causing unpredictable behavior
*   Transform scaling on menu elements causing layout issues

**Solutions Implemented:**

### CSS Simplification (`style.css`)
*   **Removed Complex Variables**: Eliminated `--scaled-*` CSS variables and media query scaling
*   **Fixed Container Sizes**: 
    - Settings container: `max-width: 1000px` (was 1400px)
    - Map preview: `300x200px` (was 400x300px)
    - Map selection: `max-width: 800px` (was 1000px)
*   **Removed Transform Scaling**: Eliminated `transform: scale()` from menu elements
*   **Added Responsive Widths**: Added `width: 90%` to containers for better responsiveness

### JavaScript Simplification (`src/main.js`)
*   **Simplified updateUIScaling()**: Removed adaptive scaling and performance profile logic
*   **Removed Performance Monitoring**: Eliminated FPS history and uiScaleTarget calculations
*   **Direct Setting Application**: Now directly applies `uiScale` setting without complex calculations

### Menu System Fixes
*   **Fixed Menu Dimensions**: Added `max-width: 600px` and `width: 90%` to `.menu` class
*   **Consistent Padding**: Replaced scaled padding with fixed `20px` padding
*   **Proper Border Radius**: Fixed `10px` border radius instead of scaled values

**Result:** UI elements now display at proper sizes without requiring browser zoom adjustments, with consistent scaling across different screen sizes.

## UI Sizing Standards and Guidelines (December 2024)

### Established Standards

#### **Menu Container Standards**
- **Max-width**: 900px (reasonable maximum, not overwhelming)
- **Width**: 90% (responsive but contained)
- **Padding**: 20px (consistent spacing)
- **Purpose**: Provides consistent sizing across all menu types

#### **Map Selection Container Standards**
- **Max-width**: 800px (fits within menu container)
- **Width**: 100% (full width of parent)
- **Min-height**: 400px (reasonable height, not excessive)
- **Gap**: 20px (moderate spacing between sections)
- **Margin**: 20px 0 (consistent vertical spacing)

#### **Settings Section Standards**
- **Min-width**: 400px (adequate space for controls)
- **Max-width**: 600px (prevents excessive width)
- **Padding**: 20px (comfortable internal spacing)
- **Gap**: 25px (good spacing between setting groups)

### Known UI Issues and Fixes

#### **1. Preview Canvas Positioning**
**Problem**: Global canvas CSS rules affect preview canvases, causing them to render outside containers.
**Solution**: Use specific CSS selectors with `position: absolute` within containers.
**Implementation**: Override global canvas rules with `!important` declarations for preview elements.

#### **2. Container Overflow Prevention**
**Problem**: Settings boxes overflow parent containers.
**Solution**: Use `max-width: 100%`, `box-sizing: border-box`, and `overflow: hidden`.
**Implementation**: Ensure all containers respect parent boundaries.

#### **3. Menu Sizing Guidelines**
**Standards**:
- Menu max-width should not exceed 900px
- Use 90% width for responsiveness
- Maintain consistent 20px padding
- Avoid excessive min-height values (>500px)

#### **4. Button Styling Consistency**
**Standards**:
- Use gradient backgrounds for visual appeal
- Include hover animations (translateY, shimmer effects)
- Consistent padding and font sizing
- Text shadows for glow effects

#### **5. Setting Group Layout**
**Standards**:
- Use flexbox with proper gap spacing
- Include `min-width: 0` and `flex-wrap: nowrap` for overflow prevention
- Consistent padding (20px) and margins (15px)

### Container Hierarchy
1. **Menu Container**: 900px max-width, 90% width
2. **Map Selection Container**: 800px max-width, 100% width
3. **Settings Section**: 400-600px width range
4. **Setting Groups**: 100% width of parent

## Keybinds Layout System (December 2024)

### Design Philosophy
- **Horizontal Efficiency**: 3-column layout maximizes space usage
- **Compact Design**: 60% reduction in vertical space compared to vertical stacking
- **Logical Grouping**: Movement, Actions, UI categories for intuitive organization
- **Scalable Structure**: Easy to add more keybinds in future

### Layout Architecture

#### **Main Grid Structure**
```css
.keybinds-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;  /* Movement | Actions | UI */
    gap: 8px;
}
```

#### **Sub-Grid Within Groups**
```css
.keybind-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);  /* 2x2 layout per group */
    gap: 3px;
}
```

#### **Button Optimization**
- **Dynamic Width**: `width: 100%` uses full grid cell space
- **Compact Height**: 14px for space efficiency
- **Text Accommodation**: Min-width 50px handles longest text ("escape")
- **Vertical Centering**: Line-height 4px for perfect text positioning

### Technical Implementation

#### **Grid System Benefits**
- **Space Efficiency**: Horizontal layout vs vertical stacking
- **Responsive**: Maintains structure across screen sizes
- **Flexible**: Easy to modify column counts or add groups

#### **Button Sizing Strategy**
- **No Max-Width**: Prevents text overflow issues
- **Full Width**: Utilizes available space in grid cells
- **Consistent Height**: Uniform appearance across all buttons
- **Proper Padding**: 1px 8px for adequate text space

#### **Text Overflow Prevention**
- **Problem Solved**: "Space", "mouse0", "shift", "escape" now fit properly
- **Dynamic Sizing**: Buttons expand to accommodate text length
- **Centered Alignment**: Both horizontal and vertical text centering

### Layout Comparison

#### **Before (Vertical Stack)**
- Height: ~200px+
- Layout: 3 stacked rows
- Space Usage: Inefficient vertical stacking

#### **After (Horizontal Grid)**
- Height: ~80px
- Layout: 3 side-by-side columns
- Space Usage: Efficient horizontal distribution

### Integration with Settings Menu
- **Back Button**: Positioned to the right with proper spacing
- **Action Buttons**: Apply/Cancel/Reset centered, Back separated
- **Overall Flow**: Keybinds no longer dominate the settings interface

### CSS Best Practices
- Use `box-sizing: border-box` for all containers
- Include `overflow: hidden` for containers with fixed content
- Use `!important` sparingly, only for overriding global rules
- Maintain consistent spacing using CSS custom properties

### Responsive Design Principles
- Use percentage widths for flexibility
- Set reasonable maximum widths to prevent oversizing
- Use flexbox for adaptive layouts
- Maintain consistent gaps and padding

## Recent UI System Fixes (December 2024)

### Custom Cursor Positioning Fix
- **Issue**: Custom cursor disappeared after HTML structure changes to settings menu
- **Root Cause**: Custom cursor was positioned inside `ui-container` which has `pointer-events: none`
- **Solution**: Moved custom cursor element outside `ui-container` to document level
- **Result**: Custom cursor now visible and functional in all menus

### Settings Toggle Switch Bug Fix
- **Issue**: All toggle switches showing "ON" highlighted regardless of actual setting value
- **Root Cause**: Bug in `updateToggleState()` function calling wrong class methods
- **Solution**: Fixed toggle state logic to properly remove/add active classes
- **Result**: Toggle switches now correctly show ON/OFF states

### Button Interaction Fixes
- **Issue**: Double-click button issues with bot count +/- buttons and Start Map button
- **Root Cause**: Event listener conflicts between mousedown/mouseup events
- **Solution**: Changed event listeners from 'click' to 'mousedown' for action buttons
- **Result**: Buttons now trigger exactly once per press

### Enhanced Error Handling
- **Issue**: `TypeError: Cannot read properties of null` when accessing non-existent UI elements
- **Root Cause**: Missing null checks for UI elements in `getMapSettings()` function
- **Solution**: Added comprehensive null checks with fallback values
- **Result**: Game handles missing UI elements gracefully without crashes

## Arena Builder Desktop Application (December 2024)

A sleek Windows desktop application for visually designing custom arena maps with an integrated asset library has been added to the project.

### Architecture

The Arena Builder is an Electron desktop application located in the `tools/arena-builder-desktop/` directory that runs independently from the main game.

**Desktop Application Files:**
- **`main.js`**: Electron main process with IPC handlers and native dialogs
- **`preload.js`**: Security bridge between main and renderer processes
- **`index.html`**: Modern UI layout with toolbar, panels, and asset library
- **`style.css`**: VSCode-inspired modern dark theme
- **`package.json`**: Dependencies and electron-builder configuration
- **`launch.bat`**: Simple Windows launcher

**Source Modules (src/):**
- **`editor.js`**: Main controller with drag-drop and asset integration
- **`assetLibrary.js`**: Asset management with 12 built-in presets
- **`canvas2d.js`**: 2D grid editor with drop zones and pan/zoom
- **`preview3d.js`**: 3D preview with mouse controls (drag to rotate, scroll to zoom)
- **`structures.js`**: Structure class (compatible with game)
- **`tools.js`**: Editor tools (place, move, resize, delete, duplicate)
- **`ui.js`**: UI management and property panels
- **`exporter.js`**: JavaScript code generator

**Note**: The Arena Builder's `structures.js` is compatible with `game/src/world/structures.js` to ensure seamless integration.

### Features

**Modern Desktop UI:**
- VSCode-inspired dark theme (sleek, professional)
- Native Windows integration
- Smooth animations and transitions
- Toolbar with tool selection
- Three-panel layout: Asset Library, 2D Editor, 3D Preview, Properties

**Asset Library System:**
- 12 built-in assets ready to use
  - Structures: Large Ground (100x2x100), Medium Ground (50x2x50)
  - Walls: Standard (2x10x20), Corner (10x10x2), Tall (2x15x20)
  - Platforms: Small (15x2x15), Large (25x2x25), Elevated (20x2x20)
  - Obstacles: Cube (10x10x10), Tall (5x10x5), Wide (20x6x8), Low Cover (15x5x3)
- Category filtering (All, Structures, Walls, Platforms, Obstacles)
- Search functionality
- Thumbnail previews
- Import custom JSON assets
- Persistent storage in app data folder

**Drag-and-Drop Workflow:**
- Drag assets from library
- Drop onto 2D canvas at mouse position
- Visual drop indicator with crosshair
- Instant placement with preview updates
- Grid-snapped coordinates

**Interactive 3D Preview:**
- Click + Drag: Rotate camera around scene
- Drag Up/Down: Adjust camera height
- Mouse Wheel: Zoom in/out (30-200 units)
- Toggle Button: Enable/disable auto-rotation
- Rotating icon when auto-rotate active
- Default: Manual control (no spinning)

**Structure Tools:**
- Place: Click to add structures with configurable properties
- Move: Drag structures to reposition
- Resize: Adjust dimensions via properties panel
- Delete: Remove structures with click
- Duplicate: Create copies with automatic offset
- Presets: Ground, Wall, Platform, Obstacle templates

**Spawn Point Editor:**
- Player spawn points (teal markers)
- Red team bot spawn areas (red markers)
- Blue team bot spawn areas (blue markers)
- Visual indicators in both 2D and 3D views

**Native File Operations:**
- Save Project (Ctrl+S): Windows save dialog
- Load Project (Ctrl+O): Windows open dialog
- Export Arena (Ctrl+E): Native file picker for .js export
- Import Assets: Multi-file selection dialog
- New Project (Ctrl+N): Clear with confirmation

**Export System:**
- Generates JavaScript code matching game's arena format exactly
- Copy to clipboard functionality
- Save to file with native Windows dialog
- Code preview before export
- Configurable arena number

### Technical Implementation

**2D Grid Editor:**
- HTML5 Canvas 2D rendering
- Grid-based placement system (10-unit cells)
- Pan with right-click drag
- Zoom with mouse wheel (0.1x to 5.0x)
- Coordinate system matching game (X/Z plane)
- Structure selection and manipulation

**3D Preview:**
- Three.js r128 (same version as game)
- Real-time structure rendering
- Auto-rotating camera for visualization
- Lighting and shadows matching game
- Spawn point markers with team colors
- Grid and axis helpers for orientation

**Export Format:**
```javascript
import { Structure } from './structures.js';

export function createArenaX() {
    const structures = [];
    // ... structure definitions ...
    return {
        structures: structures,
        spawnPoint: {...},
        spawnPoints: [...],
        botSpawnAreas: { red: [...], blue: [...] },
        metadata: {...}
    };
}
```

### Integration Workflow

1. Launch desktop app (`npm start` or built .exe)
2. Browse asset library (12 built-in assets)
3. Drag assets from library onto 2D canvas
4. Use mouse to interact with 3D preview (drag to rotate)
5. Fine-tune with structure tools (move, resize, etc.)
6. Add spawn points for players and bots
7. Configure arena metadata (name, description, size, etc.)
8. Click Export button (Ctrl+E)
9. Save to file using native Windows dialog
10. Copy exported file to `Voxel-Arena/src/arenaX.js`
11. Import in `Voxel-Arena/src/arena.js`
12. Test new arena in game

### System Requirements

- **OS**: Windows 10 or 11 (64-bit)
- **Node.js**: 16+ for development/building
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 500MB for app + dependencies
- **GPU**: Any GPU with OpenGL 2.0+ for 3D preview

### Built Application

- Electron 28 (includes Chromium)
- WebGL 2.0 for 3D rendering
- Native Windows dialogs
- File system access for projects
- App data storage for asset library

### Design Philosophy

- **Modern Dark Theme**: VSCode-inspired professional aesthetic
- **Color Scheme**: 
  - Background: #1e1e1e, #252526 (dark grays)
  - Text: #cccccc (light gray)
  - Accent: #007acc (blue)
  - Danger: #f48771 (red)
  - Success: #89d185 (green)
  - Player: #4ec9b0 (teal)
- **Typography**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- **UI Elements**: Smooth transitions, subtle shadows, native-feel buttons
- **Distinct from Game**: Intentionally different aesthetic for professional tool feel

### Performance

- 60fps target for both 2D and 3D rendering
- Efficient structure management (100+ structures supported)
- Real-time preview updates without lag
- Optimized Three.js rendering
- Minimal memory footprint

### Installation & Building

**Development:**
```bash
cd arena-builder-desktop
npm install
npm start
```

**Build Windows Executable:**
```bash
npm run build          # Creates installer in dist/
npm run build:portable # Creates portable .exe
```

**Distribution:**
- Installer: ~150MB (installs to Program Files)
- Portable: ~200MB (runs from anywhere)
- No installation required for portable version

### Future Enhancements

- 3D model import (GLTF, OBJ) for custom assets
- Texture/material system for structures
- Terrain height map support
- Additional structure types (spheres, cylinders, ramps)
- Asset marketplace/sharing
- Arena validation and testing tools
- Multi-monitor support
- Custom camera positions/bookmarks