# Bright Isle 3D Adventure Prototype

Bright Isle is a browser-based 3D adventure prototype built with Vite,
TypeScript, and Three.js. The current scope is a small playable loop: explore a
low-poly island, collect fragments, survive enemy patrols, and unlock the
central ruin door.

This is a prototype, not a shipped game. Gameplay state is kept in memory, the
map is procedural, and the desktop browser control scheme is the supported
target.

## Gameplay

Explore the Bright Isle, collect 3 ancient fragments, return to the central ruin, and open the sealed door to win.

Enemies patrol parts of the island and damage the player on contact. The player can attack to knock enemies back or defeat them. If health reaches zero, the player respawns at the starting point while collected fragments remain collected.

## Controls

- `WASD`: Move
- `Space`: Jump
- Mouse drag: Rotate the camera
- `J` or left click: Attack
- `E`: Interact

## Getting Started

Prerequisites:

- Node.js 18 or newer.
- npm.

Install dependencies from the project root:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local URL printed by Vite in a desktop browser.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check the project and create a production build. |
| `npm run test` | Run the Vitest test suite once. |
| `npm run test:watch` | Run tests in watch mode. |

## Project Structure

- `src/main.ts`: Browser entry point.
- `src/game.ts`: Three.js scene setup, renderer, main loop, and top-level game state.
- `src/player.ts`: Player movement, jumping, attacks, damage, and respawn behavior.
- `src/camera.ts`: Third-person camera follow and mouse-drag orbit behavior.
- `src/world.ts`: Island terrain, fragments, door, landmarks, water, and props.
- `src/enemy.ts`: Enemy patrol, health, contact damage, and knockback behavior.
- `src/interactions.ts`: Fragment collection and door-opening rules.
- `src/hud.ts`: Health, fragment count, controls, prompts, and win message.
- `src/*.test.ts`: Focused unit tests for gameplay systems.

## Development Notes

The prototype intentionally keeps the implementation lightweight:

- Visuals are built from procedural low-poly Three.js primitives.
- No external 3D models are required by default.
- Collision and interaction checks use simple distance and shape tests.
- Gameplay state is kept in memory and resets when the page reloads.
- The current scope targets desktop browser controls only.

## Development Workflow

- Keep gameplay and rendering changes small and aligned with the prototype
  scope.
- Add focused unit tests for changed gameplay rules, math, or state transitions.
- Run `npm run test` before handing off gameplay or documentation changes when
  dependencies are installed.
- Run `npm run build` before shipping changes that affect TypeScript, bundling,
  or browser behavior.
