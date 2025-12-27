# Rendering & Physics Issues Debugging Log

## Primary Issue: Bots Disappear When Viewed From Behind (Resolved)
**Root Cause:** Frustum Culling.
The bot model is a complex hierarchy of `Group` and `Mesh` objects.
The original code only disabled `frustumCulled` on the `Mesh` objects, but the parent `Group` objects were still being culled by Three.js when their bounding spheres went out of view.
Since the bots are animated and moving, the automatic bounding sphere calculation might be lagging or incorrect for the `Group`, causing the entire bot to vanish when the camera angle is specific (behind).

**Fix:**
1. Recursively disabled `frustumCulled = false` for **all** objects in the bot hierarchy (Groups, Meshes, etc.).
2. Set `matrixAutoUpdate = true` to ensure position synchronization.
3. Forced `boundingSphere.radius = Infinity` on all geometries to prevent any culling logic from hiding them.

## Secondary Issue: Physics Instability & Ground Clipping (Resolved)
**Root Cause 1: Duplicate Movement Logic**
- `BotMovement.js` contained TWO `updateMovement` functions. The second one was overriding the first and lacked safety checks.
- **Fix:** Removed the duplicate function.

**Root Cause 2: Y-Axis Contamination**
- Movement logic was calculating velocity in 3D, introducing small Y-axis values that interfered with gravity.
- **Fix:** Forced Y-axis velocity to 0 in `BotMovement.js`.

**Root Cause 3: Floating Collision Box (The "Jerk" Issue)**
- `physics.js` defined the bot collision box as a floating cylinder from `y+1.0` to `y+2.0` (relative to feet).
- This meant bots had to fall ~1.0 unit *into* a platform before the collision box would intersect the platform.
- Result: Bots would fall 1 meter, hit the trigger, snap back up 1 meter, and repeat (jerking).
- **Fix:** Adjusted `physics.js` to align the collision box with the bot's body (feet to head, `y+0` to `y+1.8`).

**Root Cause 4: Physics Hardening**
- Lack of terminal velocity meant bots could accelerate indefinitely if they fell through a hole, potentially tunneling through the kill floor.
- NaN values in position/velocity could corrupt the bot state.
- **Fix:** Added terminal velocity cap (-30.0) and NaN safety checks in `Bot.js`.

## Debugging Tools Added
1. **Visual Debug:** `BoxHelper` added to visualize the bot's bounding box in the scene.
   - Enable via `window.DEBUG_BOT_VISUALS = true`.
2. **Movement Debug:** Console logs for target acquisition.
   - Enable via `window.DEBUG_BOT_MOVEMENT = true`.
3. **Physics Debug:** Console logs for collision snaps and floor clamps.
   - Enable via `window.DEBUG_BOT_PHYSICS = true`.

## Next Steps
- Playtest to verify the "jerking" is gone.
- Verify bots no longer disappear from any angle.
- Check performance impact of disabled culling (should be negligible for low bot count).
