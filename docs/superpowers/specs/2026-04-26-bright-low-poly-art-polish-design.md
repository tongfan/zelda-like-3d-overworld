# Bright Low-Poly Art Polish Design

## Goal

Improve the game map and characters while preserving the current bright low-poly identity. The work should make the island feel more layered and readable, and make the player and enemies easier to distinguish in motion.

## Chosen Direction

Use medium-scope procedural art polish. Do not introduce external textures, GLB models, audio, or a new asset pipeline. The implementation should continue to build visuals from Three.js geometry, materials, lights, shadows, and small animation updates.

## Map Polish

Keep the current island layout, fragment positions, central ruin, ridge height logic, lake area, enemy routes, and collection/open-door gameplay. Add visual richness around the existing landmarks without changing collision or progression rules.

The forest area should gain varied trees, grass clumps, small flower patches, and scattered rocks so it reads as a distinct region. The lake area should gain a lighter shoreline ring, shore stones, and simple water highlights. The ridge area should gain rock clusters, clearer plateau edges, and visual hints for the ramp. The central ruin should gain a stronger base, broken stones, column caps, and a clearer activated-door glow.

## Character Polish

The player remains a procedural low-poly adventurer with the current blue body color as the main identity. Add stronger silhouette details such as a hat or hair block, short cape, boots, arms, and a small shield or back equipment. The sword attack should read more clearly by adding a short-lived light-colored sword arc or glow trail.

Enemies should keep their red warning color but gain better silhouette details, such as eyes, small horns or fins, and a subtle ground shadow. They must remain clearly distinct from the player and fragments.

## Technical Scope

Primary implementation files are:

- `src/world.ts` for terrain, props, landmarks, fragments, and door visuals.
- `src/player.ts` for player geometry and attack presentation.
- `src/enemy.ts` for enemy geometry and visual feedback.
- `src/game.ts` for scene lighting, sky, fog, renderer tone, and shadow setup.

Small local helper functions are acceptable when they reduce duplication in a file. Avoid a broad asset-system refactor for this pass.

## Behavior Constraints

Do not change the player controls, camera behavior, world bounds, fragment collection rules, enemy damage rules, or door progression. Decorative objects should not block movement unless an existing gameplay object already did.

## Verification

Run:

- `npm test`
- `npm run build`

Visual QA should run the Vite app in a browser and check that the scene renders, the map is not visually empty, the player and enemies remain readable, fragments and the central door still stand out, and movement/attack interactions are not obscured by decorative geometry.
