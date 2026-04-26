# Agent Guide

## Project Overview

This is a browser-based 3D adventure prototype built with Vite, TypeScript, and Three.js. The player explores Bright Isle, collects 3 fragments, returns to the central ruin, and opens a sealed door. Enemies patrol the island, damage the player on contact, and can be attacked with `J` or left click. When health is depleted, the player respawns at the start while collected fragments persist.

Keep the scope lightweight. The project favors simple in-memory gameplay state, procedural low-poly primitives, and focused systems over engine-scale abstractions.

## Commands

- `npm install`: Install dependencies when `node_modules` is missing or package files changed.
- `npm run dev`: Start the Vite development server for browser testing.
- `npm run test`: Run the Vitest suite once. Run this after behavior changes and before handing off changes when dependencies are installed.
- `npm run test:watch`: Run tests in watch mode during active development.
- `npm run build`: Type-check and create a production build. Run this when TypeScript, browser entry points, rendering, Vite config, or build-facing code changes.

## Code Ownership Map

- `src/main.ts`: Browser entry point.
- `src/game.ts`: Three.js scene setup, renderer, main loop, and top-level game state.
- `src/player.ts`: Player movement, jumping, attacks, damage, and respawn behavior.
- `src/camera.ts`: Third-person camera follow and mouse-drag orbit behavior.
- `src/world.ts`: Island terrain, fragments, door, landmarks, water, and props.
- `src/enemy.ts`: Enemy patrol, health, contact damage, and knockback behavior.
- `src/interactions.ts`: Fragment collection and door-opening rules.
- `src/hud.ts`: Health, fragment count, controls, prompts, and win message.
- `src/types.ts`: Shared gameplay and scene types.
- `src/math.ts`: Small reusable math helpers.
- `src/input.ts`: Keyboard and pointer input state.
- `src/*.test.ts`: Focused unit tests for gameplay systems.

## Development Guidelines

- Keep gameplay rules in gameplay modules such as `player.ts`, `enemy.ts`, and `interactions.ts`; keep rendering setup, scene wiring, and frame orchestration in `game.ts` and `world.ts`.
- Prefer plain TypeScript data, simple distance checks, shape checks, and direct state transitions before adding abstractions.
- Use clear types for gameplay state, scene objects, and interaction results.
- Preserve the desktop browser control scheme unless the task explicitly changes it.
- Keep changes small and aligned with the prototype. Avoid unrelated refactors while fixing gameplay or render issues.
- Do not introduce external 3D assets unless requested.

## Testing Expectations

- Add focused tests for gameplay rules, math, state transitions, and regressions when behavior changes.
- Run `npm run test` before handoff when dependencies are installed.
- Run `npm run build` when changes affect TypeScript types, browser/runtime wiring, rendering, Vite config, or production build behavior.
- For visual or interaction changes, also use `npm run dev` and verify the game in a browser when practical.

## Worktree and Branch Hygiene

- Do not revert user or teammate edits. If unrelated files are dirty, leave them alone.
- Own only the files required for the current task, and keep commits focused.
- Do not include generated or dependency folders in source changes, including `dist`, `node_modules`, `.worktrees`, and `.superpowers`.
- Review `git status` before committing so only intentional files are staged.

## Art and Asset Constraints

- Use procedural Three.js geometry and low-poly primitives by default.
- Prefer simple materials, colors, and geometry that match Bright Isle's existing style.
- Avoid external images, models, audio, or other assets unless the user asks for them.
