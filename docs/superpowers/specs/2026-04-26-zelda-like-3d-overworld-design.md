# Zelda-Like 3D Overworld Prototype Design

Date: 2026-04-26

## Summary

Build an original, browser-based 3D overworld exploration prototype inspired by classic adventure games without using Nintendo characters, maps, music, names, or assets. The game is a bright low-poly island adventure built with Three.js and TypeScript.

The first playable version must be a complete small loop: explore an island, collect 3 ancient fragments, open the central ruin door, and reach a win state. It includes light danger through simple patrol enemies that damage the player on contact and can be knocked back or defeated by the player.

## Technical Approach

Use a Vite frontend project with Three.js and native TypeScript. Avoid React and React Three Fiber for the prototype so movement, camera, collision, and game-loop code stay direct and easy to debug.

The first version will not import external 3D models. It will use Three.js primitives, low-poly materials, lighting, and simple geometry to create terrain, props, enemies, fragments, and the player. This keeps the scope focused on playability while leaving room to replace primitives with GLTF models later.

## Architecture

The code should be split by game responsibility:

- `Game`: initializes the Three.js renderer, scene, clock, main loop, global game state, and top-level systems.
- `PlayerController`: handles WASD movement, jumping, attack timing, damage cooldown, respawn, and player mesh updates.
- `CameraController`: follows the player in third person and supports mouse-drag orbiting.
- `World`: creates the island terrain, central ruin door, trees, rocks, landmarks, platforms, slopes, water, and fragment spawn points.
- `Enemy` and `EnemyManager`: manage patrol paths, enemy health, contact damage, knockback, and removal when defeated.
- `InteractionSystem`: handles fragment collection, door interaction, contextual prompts, and win-state transitions.
- `HUD`: renders health, fragment count, interaction prompts, and win/respawn messages.

## Gameplay

The player starts on the south side of a bright low-poly island. A sealed ruin door sits at the center. The HUD displays player health and `Fragments 0/3`.

The player must collect 3 ancient fragments:

1. Forest fragment: placed beyond a small tree cluster with 1 patrol enemy.
2. High platform fragment: reached by climbing a slope or stone steps and making a simple jump.
3. Lakeside fragment: placed near shallow water and rocks with 1 patrol enemy nearby.

After all 3 fragments are collected, the central ruin door changes to an activated visual state. Pressing `E` near the door opens it and triggers the win state.

Enemies provide light danger only. They patrol simple routes, damage the player on contact, and can be knocked back or defeated by attacks. If the player health reaches zero, the player respawns at the start position. Collected fragments remain collected after respawn so the prototype does not become overly punitive.

## Controls

- `WASD`: move
- `Space`: jump
- Mouse drag: rotate third-person camera
- `E`: interact
- Left mouse button or `J`: attack

## State Flow

The state model should remain small:

- Player health, position, velocity, attack state, and damage cooldown
- Collected fragment IDs
- Enemy health, position, patrol state, and knockback state
- Door activation/open state
- Game status: playing, respawning, won

Each frame should update in this order:

1. Read input
2. Update player movement and gravity
3. Update camera
4. Update enemy patrol and contact damage
5. Resolve player attacks against enemies
6. Resolve fragment collection and door interaction
7. Render HUD and scene

## Collision and Physics

Use simple sphere and box approximations for the first version. Player, enemies, fragments, and the door can use distance checks or bounding boxes. Terrain can be built from a main ground plane plus explicit ramps, platforms, steps, and blocked prop areas.

Do not add a full physics engine in the first version. The goal is stable movement and clear interactions, not realistic simulation.

## Visual Direction

Use a bright adventure style:

- Colorful grass, sky, water, and landmarks
- Clear low-poly shapes
- Readable silhouettes for the player, enemies, fragments, and door
- A friendly outdoor island or valley tone

Avoid direct Zelda branding or recognizable protected assets. The game should feel like an original adventure prototype.

## Testing and Acceptance Criteria

Verification commands and manual checks:

- `npm run build` succeeds.
- The local development server opens the game in a desktop browser.
- The player can move, jump, attack, and rotate the camera.
- All 3 fragments can be collected and the HUD count updates correctly.
- The central door cannot be opened before all fragments are collected.
- The central door can be opened after all fragments are collected and then triggers a win state.
- Enemies damage the player on contact.
- Player attacks knock back or defeat enemies.
- When player health reaches zero, the player respawns at the starting point while collected fragments remain collected.

## Out of Scope for First Version

- Nintendo-owned characters, names, music, maps, symbols, or assets
- Imported 3D character models
- Save files
- Mobile/touch controls
- Quest dialogue
- Inventory beyond the 3 collected fragments
- Complex combat systems such as lock-on, dodge timing, combos, or enemy drops
- Full physics engine integration
