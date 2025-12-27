# Analysis: Bot Visibility Issue - Deep Dive

**Date**: December 2, 2024
**Issue**: Red bot teammates disappear when viewed from behind/certain angles
**Status**: Multiple fix attempts failed, needs different approach

## Confirmed Behavior
Testing confirmed that bots disappear when viewed from behind or at certain angles. The bots still "move around on camera" (meaning their physics and AI work), but they become invisible visually.

## Fix Attempts (ALL FAILED)

### Attempt 1: Disable Frustum Culling
- Set `frustumCulled = false` on all meshes and groups
- Set bounding sphere radius to `Infinity`
- **Result**: FAILED - Bots still disappear

### Attempt 2: Aggressive Rendering Fixes
- Added `onBeforeRender` callback forcing `visible = true` every frame
- Set high `renderOrder = 999`  
- Enabled `matrixAutoUpdate` and `matrixWorldAutoUpdate`
- Set all materials to `THREE.DoubleSide`
- Forced bounding box min/max to `±Infinity`
- **Result**: FAILED - Bots still disappear

## NEW HYPOTHESIS: Depth Buffer or Z-Fighting Issues

Since NONE of the frustum culling or visibility fixes worked, the issue is NOT about Three.js deciding to cull the objects. Instead, it's likely:

## Possible Root Causes (Revised)

### 1.  **Camera-Relative Geometry Clipping** (MOST LIKELY)
When you walk behind a bot, the bot is BETWEEN you and the bot's origin point. Three.js might be clipping the geometry because parts of it extend BEHIND the camera's near plane (0.1 units). This would cause the bot to vanish when you get too close or at certain angles.

### 2. **Depth Buffer Z-Fighting**
The bot model has many overlapping or near-overlapping geometries (body parts, joints, head, etc.). When viewed from certain angles, depth buffer precision issues could cause parts to flicker or disappear entirely.

### 3. **Normals Pointing Wrong Direction**
Even with `DoubleSide` enabled, if the geometry's vertex normals are inverted or incorrect for some meshes, they might not receive proper lighting from certain angles, making them appear black/invisible against the scene background.

### 4. **Group Pivot Point Issues**
The bot is a nested Group hierarchy. The pivot point of the main bot group is at (0, 0, 0) relative to the bot, but the body parts extend in all directions. When the camera is behind the bot, the camera might be inside the group's bounding volume, causing rendering issues.

### 5. **Order-Independent Transparency Issues**
If any bot materials have transparency or the health bar uses transparency, render order issues could cause parts of the bot to not render when viewed from behind.

### 6. **THREE.js Version Bug**
The game uses Three.js r128. There might be a known bug in this version related to nested groups and frustum culling that was fixed in later versions.

## Investigation Plan

1. **Add Real-Time Debugging**: Add console logging to track when meshes become invisible
2. **Check Material Settings**: Verify all materials have `side: THREE.DoubleSide` and it's not being overridden
3. **Force Render**: Set `alwaysUpdate = true` on all matrices
4. **Check Camera Settings**: Verify camera near/far planes
5. **Add Render Layer Override**: Force all bot objects to render on all layers
6. **Monitor Visibility**: Add runtime checks to re-enable visibility if it gets disabled

## Next Steps for Debugging

1. **Test Camera Near Plane**: Increase camera near plane from 0.1 to 0.5 or 1.0
2. **Check Console for Errors**: Look for Three.js warnings about geometry or rendering
3. **Simplify Bot Model**: Create a SIMPLE cube bot to test if the issue persists
4. **Test Without Groups**: Flatten the bot hierarchy - make all meshes direct children of scene
5. **Check Normals**: Use THREE.VertexNormalsHelper to visualize geometry normals
6. **Disable Depth Test**: Temporarily disable depth testing on bot materials
7. **Update Three.js**: Consider upgrading to a newer Three.js version
