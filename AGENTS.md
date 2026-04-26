# Agent Guide

## Project Overview

This is a browser-based 3D adventure prototype built with Vite, TypeScript, and Three.js. The game uses original low-poly primitives and keeps gameplay state in memory.

## Common Commands

- `npm install`: Install dependencies.
- `npm run dev`: Start the Vite development server.
- `npm run build`: Type-check the project and create a production build.
- `npm run test`: Run the Vitest test suite once.
- `npm run test:watch`: Run tests in watch mode.

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

## Development Guidelines

- Keep changes lightweight and aligned with the prototype scope.
- Prefer simple distance, shape, and state checks over heavier abstractions.
- Use clear TypeScript types for gameplay state and scene objects.
- Add focused tests for gameplay rules, math, and state transitions when behavior changes.
- Preserve the desktop browser control scheme unless a task explicitly changes it.
- Avoid adding external 3D assets unless requested.

