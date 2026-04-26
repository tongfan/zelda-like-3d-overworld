# Zelda-Like 3D Overworld Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an original browser-based 3D low-poly island adventure where the player collects 3 fragments, survives light patrol enemies, opens a central ruin door, and reaches a win state.

**Architecture:** Use a Vite + TypeScript + Three.js app with focused game modules. Keep game state explicit and small, use primitive meshes instead of imported assets, and use simple sphere/box collision rather than a physics engine.

**Tech Stack:** Vite, TypeScript, Three.js, Vitest, native DOM HUD, CSS.

---

## File Structure

- Create `package.json`: scripts and dependencies.
- Create `index.html`: app mount point and static HUD containers.
- Create `tsconfig.json`: strict TypeScript configuration.
- Create `vite.config.ts`: Vite and Vitest configuration.
- Create `src/main.ts`: bootstrap the game.
- Create `src/styles.css`: page, canvas, and HUD styling.
- Create `src/types.ts`: shared vector, state, and entity interfaces.
- Create `src/math.ts`: collision and numeric helpers with unit tests.
- Create `src/input.ts`: keyboard and pointer input tracking.
- Create `src/world.ts`: island terrain, props, fragments, door, and interaction volumes.
- Create `src/player.ts`: player movement, jump, attack, damage, and respawn.
- Create `src/enemy.ts`: patrol enemies, contact damage, knockback, and defeat behavior.
- Create `src/camera.ts`: third-person follow camera.
- Create `src/interactions.ts`: fragment collection, door opening, and win-state rules.
- Create `src/hud.ts`: DOM HUD rendering.
- Create `src/game.ts`: Three.js setup, game loop, state orchestration, and rendering.
- Create `src/math.test.ts`: unit tests for pure helpers.
- Create `src/interactions.test.ts`: unit tests for collection and door rules.

## Task 1: Project Scaffold and Test Harness

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/main.ts`
- Create: `src/styles.css`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "zelda-like-3d-overworld",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "three": "^0.164.1"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "vite": "^5.2.11",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "node",
    globals: true
  }
});
```

- [ ] **Step 4: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fragments of the Bright Isle</title>
  </head>
  <body>
    <div id="game-root"></div>
    <div id="hud"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 5: Create temporary bootstrap files**

`src/main.ts`:

```ts
import "./styles.css";

document.querySelector<HTMLDivElement>("#game-root")!.textContent = "Fragments of the Bright Isle";
```

`src/styles.css`:

```css
html,
body {
  margin: 0;
  min-width: 320px;
  min-height: 100%;
  overflow: hidden;
  background: #7fc8f4;
  color: #172033;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

#game-root {
  width: 100vw;
  height: 100vh;
}

#hud {
  position: fixed;
  inset: 0;
  pointer-events: none;
}
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and dependencies install successfully.

- [ ] **Step 7: Verify scaffold**

Run: `npm run build`

Expected: TypeScript and Vite complete successfully and create `dist/`.

- [ ] **Step 8: Commit if repository is initialized**

Run: `git rev-parse --is-inside-work-tree`

Expected if git exists: `true`, then run:

```bash
git add package.json package-lock.json index.html tsconfig.json vite.config.ts src/main.ts src/styles.css
git commit -m "chore: scaffold 3d adventure prototype"
```

Expected if git does not exist: command fails with `fatal: not a git repository`; skip commit.

## Task 2: Shared Types and Pure Math

**Files:**
- Create: `src/types.ts`
- Create: `src/math.ts`
- Create: `src/math.test.ts`

- [ ] **Step 1: Write failing math tests**

Create `src/math.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { clamp, distance2D, sphereHit, moveToward } from "./math";

describe("math helpers", () => {
  it("clamps numbers into a range", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(4, 0, 10)).toBe(4);
    expect(clamp(14, 0, 10)).toBe(10);
  });

  it("measures distance on the ground plane", () => {
    expect(distance2D({ x: 0, z: 0 }, { x: 3, z: 4 })).toBe(5);
  });

  it("detects simple sphere overlap", () => {
    expect(sphereHit({ x: 0, z: 0 }, 1, { x: 1.5, z: 0 }, 0.6)).toBe(true);
    expect(sphereHit({ x: 0, z: 0 }, 1, { x: 2.2, z: 0 }, 0.6)).toBe(false);
  });

  it("moves toward a target without overshooting", () => {
    expect(moveToward({ x: 0, z: 0 }, { x: 10, z: 0 }, 3)).toEqual({ x: 3, z: 0 });
    expect(moveToward({ x: 0, z: 0 }, { x: 2, z: 0 }, 3)).toEqual({ x: 2, z: 0 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/math.test.ts`

Expected: FAIL because `src/math.ts` does not exist.

- [ ] **Step 3: Add shared types and math helpers**

Create `src/types.ts`:

```ts
import * as THREE from "three";

export type GameStatus = "playing" | "respawning" | "won";

export interface GroundPoint {
  x: number;
  z: number;
}

export interface FragmentDefinition {
  id: string;
  label: string;
  position: THREE.Vector3;
  radius: number;
}

export interface DoorState {
  activated: boolean;
  open: boolean;
}

export interface PlayerState {
  health: number;
  maxHealth: number;
  isAttacking: boolean;
  damageCooldown: number;
}

export interface EnemyState {
  id: string;
  health: number;
  defeated: boolean;
}

export interface GameState {
  status: GameStatus;
  collectedFragments: Set<string>;
  door: DoorState;
  player: PlayerState;
}
```

Create `src/math.ts`:

```ts
import type { GroundPoint } from "./types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function distance2D(a: GroundPoint, b: GroundPoint): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function sphereHit(a: GroundPoint, radiusA: number, b: GroundPoint, radiusB: number): boolean {
  return distance2D(a, b) <= radiusA + radiusB;
}

export function moveToward(current: GroundPoint, target: GroundPoint, maxDistance: number): GroundPoint {
  const dx = target.x - current.x;
  const dz = target.z - current.z;
  const distance = Math.hypot(dx, dz);

  if (distance <= maxDistance || distance === 0) {
    return { x: target.x, z: target.z };
  }

  const scale = maxDistance / distance;
  return {
    x: current.x + dx * scale,
    z: current.z + dz * scale
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/math.test.ts`

Expected: PASS for all 4 tests.

- [ ] **Step 5: Commit if repository is initialized**

```bash
git add src/types.ts src/math.ts src/math.test.ts
git commit -m "test: add collision math helpers"
```

Skip if `git rev-parse --is-inside-work-tree` fails.

## Task 3: Input, HUD, and Interaction Rules

**Files:**
- Create: `src/input.ts`
- Create: `src/hud.ts`
- Create: `src/interactions.ts`
- Create: `src/interactions.test.ts`

- [ ] **Step 1: Write failing interaction tests**

Create `src/interactions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { collectNearbyFragments, openDoorIfReady } from "./interactions";
import type { FragmentDefinition, GameState } from "./types";

function state(): GameState {
  return {
    status: "playing",
    collectedFragments: new Set(),
    door: { activated: false, open: false },
    player: { health: 3, maxHealth: 3, isAttacking: false, damageCooldown: 0 }
  };
}

const fragments: FragmentDefinition[] = [
  { id: "forest", label: "Forest Fragment", position: new THREE.Vector3(0, 0, 0), radius: 1 },
  { id: "ridge", label: "Ridge Fragment", position: new THREE.Vector3(8, 0, 0), radius: 1 },
  { id: "lake", label: "Lake Fragment", position: new THREE.Vector3(0, 0, 8), radius: 1 }
];

describe("interactions", () => {
  it("collects only fragments near the player", () => {
    const gameState = state();
    const collected = collectNearbyFragments(gameState, fragments, new THREE.Vector3(0.5, 0, 0));

    expect(collected).toEqual(["forest"]);
    expect(gameState.collectedFragments.has("forest")).toBe(true);
    expect(gameState.collectedFragments.has("ridge")).toBe(false);
  });

  it("activates and opens the door after all fragments are collected", () => {
    const gameState = state();
    gameState.collectedFragments = new Set(["forest", "ridge", "lake"]);

    const opened = openDoorIfReady(gameState, 3, true);

    expect(opened).toBe(true);
    expect(gameState.door.activated).toBe(true);
    expect(gameState.door.open).toBe(true);
    expect(gameState.status).toBe("won");
  });

  it("does not open the door early", () => {
    const gameState = state();
    gameState.collectedFragments = new Set(["forest"]);

    const opened = openDoorIfReady(gameState, 3, true);

    expect(opened).toBe(false);
    expect(gameState.door.open).toBe(false);
    expect(gameState.status).toBe("playing");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/interactions.test.ts`

Expected: FAIL because `src/interactions.ts` does not exist.

- [ ] **Step 3: Implement input, HUD, and interaction helpers**

Create `src/input.ts`:

```ts
export class InputController {
  private keys = new Set<string>();
  private pointerDown = false;
  private attackQueued = false;
  private interactQueued = false;
  pointerDeltaX = 0;
  pointerDeltaY = 0;

  constructor(private readonly target: HTMLElement = document.body) {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    this.target.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointermove", this.onPointerMove);
  }

  get moveX(): number {
    return Number(this.keys.has("KeyD")) - Number(this.keys.has("KeyA"));
  }

  get moveZ(): number {
    return Number(this.keys.has("KeyS")) - Number(this.keys.has("KeyW"));
  }

  get jumpHeld(): boolean {
    return this.keys.has("Space");
  }

  consumeAttack(): boolean {
    const value = this.attackQueued;
    this.attackQueued = false;
    return value;
  }

  consumeInteract(): boolean {
    const value = this.interactQueued;
    this.interactQueued = false;
    return value;
  }

  endFrame(): void {
    this.pointerDeltaX = 0;
    this.pointerDeltaY = 0;
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.target.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointermove", this.onPointerMove);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);
    if (event.code === "KeyJ") this.attackQueued = true;
    if (event.code === "KeyE") this.interactQueued = true;
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };

  private onPointerDown = (event: PointerEvent): void => {
    this.pointerDown = true;
    if (event.button === 0) this.attackQueued = true;
  };

  private onPointerUp = (): void => {
    this.pointerDown = false;
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.pointerDown) return;
    this.pointerDeltaX += event.movementX;
    this.pointerDeltaY += event.movementY;
  };
}
```

Create `src/hud.ts`:

```ts
import type { GameState } from "./types";

export class HUD {
  private prompt = "";

  constructor(private readonly root: HTMLElement) {
    this.root.className = "hud";
  }

  setPrompt(prompt: string): void {
    this.prompt = prompt;
  }

  render(state: GameState, totalFragments: number): void {
    const hearts = "♥".repeat(state.player.health).padEnd(state.player.maxHealth, "♡");
    const message = state.status === "won" ? "Ruin opened. You restored the Bright Isle." : this.prompt;

    this.root.innerHTML = `
      <div class="hud-top">
        <div class="hud-pill">${hearts}</div>
        <div class="hud-pill">Fragments ${state.collectedFragments.size}/${totalFragments}</div>
      </div>
      <div class="hud-bottom">${message}</div>
    `;
  }
}
```

Create `src/interactions.ts`:

```ts
import * as THREE from "three";
import { sphereHit } from "./math";
import type { FragmentDefinition, GameState } from "./types";

export function collectNearbyFragments(
  state: GameState,
  fragments: FragmentDefinition[],
  playerPosition: THREE.Vector3
): string[] {
  const collected: string[] = [];

  for (const fragment of fragments) {
    if (state.collectedFragments.has(fragment.id)) continue;
    if (sphereHit(playerPosition, 0.7, fragment.position, fragment.radius)) {
      state.collectedFragments.add(fragment.id);
      collected.push(fragment.id);
    }
  }

  state.door.activated = state.collectedFragments.size >= fragments.length;
  return collected;
}

export function openDoorIfReady(state: GameState, totalFragments: number, isNearDoor: boolean): boolean {
  state.door.activated = state.collectedFragments.size >= totalFragments;

  if (!state.door.activated || !isNearDoor) {
    return false;
  }

  state.door.open = true;
  state.status = "won";
  return true;
}
```

- [ ] **Step 4: Extend `src/styles.css` with HUD styles**

Append:

```css
.hud {
  color: #f8fff6;
  font-weight: 800;
  letter-spacing: 0;
  text-shadow: 0 2px 6px rgb(0 0 0 / 35%);
}

.hud-top {
  position: fixed;
  top: 16px;
  left: 16px;
  display: flex;
  gap: 10px;
}

.hud-pill {
  min-width: 104px;
  padding: 9px 12px;
  border: 2px solid rgb(255 255 255 / 60%);
  border-radius: 8px;
  background: rgb(20 45 36 / 62%);
  backdrop-filter: blur(8px);
}

.hud-bottom {
  position: fixed;
  left: 50%;
  bottom: 24px;
  max-width: min(620px, calc(100vw - 32px));
  transform: translateX(-50%);
  text-align: center;
  font-size: 18px;
}
```

- [ ] **Step 5: Run tests**

Run: `npm test -- src/interactions.test.ts src/math.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit if repository is initialized**

```bash
git add src/input.ts src/hud.ts src/interactions.ts src/interactions.test.ts src/styles.css
git commit -m "feat: add input hud and interaction rules"
```

Skip if `git rev-parse --is-inside-work-tree` fails.

## Task 4: World, Player, Enemy, Camera Modules

**Files:**
- Create: `src/world.ts`
- Create: `src/player.ts`
- Create: `src/enemy.ts`
- Create: `src/camera.ts`

- [ ] **Step 1: Create `src/world.ts`**

```ts
import * as THREE from "three";
import type { FragmentDefinition } from "./types";

export class World {
  readonly group = new THREE.Group();
  readonly spawn = new THREE.Vector3(0, 0.6, 12);
  readonly doorPosition = new THREE.Vector3(0, 0.8, 0);
  readonly fragments: FragmentDefinition[] = [
    { id: "forest", label: "Forest Fragment", position: new THREE.Vector3(-9, 0.9, -5), radius: 1 },
    { id: "ridge", label: "Ridge Fragment", position: new THREE.Vector3(8, 3.2, -7), radius: 1 },
    { id: "lake", label: "Lake Fragment", position: new THREE.Vector3(8, 0.9, 7), radius: 1 }
  ];

  readonly fragmentMeshes = new Map<string, THREE.Mesh>();
  readonly door: THREE.Mesh;

  constructor() {
    this.group.add(this.createGround());
    this.group.add(this.createWater());
    this.group.add(this.createRidge());
    this.group.add(this.createDoorFrame());
    this.door = this.createDoor();
    this.group.add(this.door);
    this.addProps();
    this.addFragments();
  }

  heightAt(x: number, z: number): number {
    if (x > 4 && x < 11 && z > -10 && z < -4) return 2.5;
    return 0;
  }

  updateDoor(activated: boolean, open: boolean): void {
    const material = this.door.material as THREE.MeshStandardMaterial;
    material.color.set(open ? "#f7f2a1" : activated ? "#83f7d2" : "#755b45");
    this.door.position.y = open ? 2.2 : 0.8;
  }

  setFragmentCollected(id: string): void {
    const mesh = this.fragmentMeshes.get(id);
    if (mesh) mesh.visible = false;
  }

  update(delta: number): void {
    for (const mesh of this.fragmentMeshes.values()) {
      mesh.rotation.y += delta * 1.8;
    }
  }

  private createGround(): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(18, 20, 1, 9);
    const material = new THREE.MeshStandardMaterial({ color: "#69b96b", roughness: 0.9 });
    const ground = new THREE.Mesh(geometry, material);
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    return ground;
  }

  private createWater(): THREE.Mesh {
    const geometry = new THREE.CircleGeometry(5, 24);
    const material = new THREE.MeshStandardMaterial({ color: "#58bde8", roughness: 0.35, transparent: true, opacity: 0.78 });
    const water = new THREE.Mesh(geometry, material);
    water.rotation.x = -Math.PI / 2;
    water.position.set(9, 0.03, 9);
    return water;
  }

  private createRidge(): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(7, 2.5, 6);
    const material = new THREE.MeshStandardMaterial({ color: "#88ad62", roughness: 0.8 });
    const ridge = new THREE.Mesh(geometry, material);
    ridge.position.set(7.5, 1.25, -7);
    ridge.castShadow = true;
    ridge.receiveShadow = true;
    return ridge;
  }

  private createDoorFrame(): THREE.Group {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: "#8f826a", roughness: 0.8 });
    const pillarGeometry = new THREE.BoxGeometry(0.7, 3.2, 0.7);
    const lintelGeometry = new THREE.BoxGeometry(3.6, 0.7, 0.7);
    const left = new THREE.Mesh(pillarGeometry, material);
    const right = new THREE.Mesh(pillarGeometry, material);
    const top = new THREE.Mesh(lintelGeometry, material);
    left.position.set(-1.5, 1.6, 0);
    right.position.set(1.5, 1.6, 0);
    top.position.set(0, 3, 0);
    group.add(left, right, top);
    return group;
  }

  private createDoor(): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(2.2, 2.4, 0.35);
    const material = new THREE.MeshStandardMaterial({ color: "#755b45", emissive: "#000000", roughness: 0.7 });
    const door = new THREE.Mesh(geometry, material);
    door.position.copy(this.doorPosition);
    door.castShadow = true;
    return door;
  }

  private addProps(): void {
    const treeMaterial = new THREE.MeshStandardMaterial({ color: "#3f8b4a", roughness: 0.8 });
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: "#7a5737", roughness: 0.9 });
    for (const [x, z] of [[-11, -3], [-12, -6], [-8, -8], [-6, -4], [5, 9], [11, 5]]) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.2, 6), trunkMaterial);
      const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 7), treeMaterial);
      trunk.position.set(x, 0.6, z);
      leaves.position.set(x, 1.9, z);
      trunk.castShadow = true;
      leaves.castShadow = true;
      this.group.add(trunk, leaves);
    }
  }

  private addFragments(): void {
    for (const fragment of this.fragments) {
      const geometry = new THREE.OctahedronGeometry(0.45);
      const material = new THREE.MeshStandardMaterial({ color: "#ffd45c", emissive: "#8a5b00", emissiveIntensity: 0.25 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(fragment.position);
      mesh.castShadow = true;
      this.fragmentMeshes.set(fragment.id, mesh);
      this.group.add(mesh);
    }
  }
}
```

- [ ] **Step 2: Create `src/player.ts`**

```ts
import * as THREE from "three";
import { clamp } from "./math";
import type { GameState } from "./types";
import type { InputController } from "./input";
import type { World } from "./world";

export class PlayerController {
  readonly group = new THREE.Group();
  readonly radius = 0.65;
  private velocityY = 0;
  private grounded = true;
  private attackTimer = 0;

  get isAttacking(): boolean {
    return this.state.player.isAttacking;
  }

  constructor(private readonly state: GameState, spawn: THREE.Vector3) {
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.35, 0.8, 4, 8),
      new THREE.MeshStandardMaterial({ color: "#2f8f6c", roughness: 0.7 })
    );
    const sword = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.12, 1.1),
      new THREE.MeshStandardMaterial({ color: "#d9e8ef", metalness: 0.3, roughness: 0.4 })
    );
    sword.name = "sword";
    sword.position.set(0.55, 0.1, -0.45);
    sword.rotation.y = 0.5;
    this.group.add(body, sword);
    this.group.position.copy(spawn);
  }

  update(delta: number, input: InputController, world: World, cameraYaw: number): void {
    if (this.state.status === "won") return;

    const move = new THREE.Vector3(input.moveX, 0, input.moveZ);
    if (move.lengthSq() > 0) {
      move.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);
      this.group.position.x += move.x * delta * 6;
      this.group.position.z += move.z * delta * 6;
      this.group.rotation.y = Math.atan2(move.x, move.z);
    }

    const groundY = world.heightAt(this.group.position.x, this.group.position.z) + 0.6;
    if (input.jumpHeld && this.grounded) {
      this.velocityY = 7;
      this.grounded = false;
    }

    this.velocityY -= 18 * delta;
    this.group.position.y += this.velocityY * delta;
    if (this.group.position.y <= groundY) {
      this.group.position.y = groundY;
      this.velocityY = 0;
      this.grounded = true;
    }

    this.group.position.x = clamp(this.group.position.x, -16, 16);
    this.group.position.z = clamp(this.group.position.z, -16, 16);

    if (input.consumeAttack()) {
      this.attackTimer = 0.28;
    }
    this.attackTimer = Math.max(0, this.attackTimer - delta);
    this.state.player.isAttacking = this.attackTimer > 0;
    this.state.player.damageCooldown = Math.max(0, this.state.player.damageCooldown - delta);
  }

  damage(amount: number, spawn: THREE.Vector3): void {
    if (this.state.player.damageCooldown > 0 || this.state.status !== "playing") return;
    this.state.player.health = Math.max(0, this.state.player.health - amount);
    this.state.player.damageCooldown = 1;

    if (this.state.player.health === 0) {
      this.group.position.copy(spawn);
      this.state.player.health = this.state.player.maxHealth;
      this.state.player.damageCooldown = 1.5;
    }
  }
}
```

- [ ] **Step 3: Create `src/enemy.ts`**

```ts
import * as THREE from "three";
import { distance2D, moveToward, sphereHit } from "./math";
import type { PlayerController } from "./player";

export class Enemy {
  readonly group = new THREE.Group();
  readonly radius = 0.65;
  health = 2;
  defeated = false;
  private targetIndex = 0;
  private knockback = new THREE.Vector3();

  constructor(readonly id: string, private readonly patrol: THREE.Vector3[]) {
    const body = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.65),
      new THREE.MeshStandardMaterial({ color: "#b84c4c", roughness: 0.85 })
    );
    body.castShadow = true;
    this.group.add(body);
    this.group.position.copy(patrol[0]);
  }

  update(delta: number, player: PlayerController, onContact: () => void): void {
    if (this.defeated) return;

    if (this.knockback.lengthSq() > 0.01) {
      this.group.position.addScaledVector(this.knockback, delta);
      this.knockback.multiplyScalar(0.82);
    } else {
      const target = this.patrol[this.targetIndex];
      const next = moveToward(this.group.position, target, delta * 2.2);
      this.group.position.x = next.x;
      this.group.position.z = next.z;
      if (distance2D(this.group.position, target) < 0.2) {
        this.targetIndex = (this.targetIndex + 1) % this.patrol.length;
      }
    }

    if (sphereHit(this.group.position, this.radius, player.group.position, player.radius)) {
      onContact();
    }
  }

  tryHit(player: PlayerController): boolean {
    if (!player.isAttacking || this.defeated) return false;
    if (!sphereHit(this.group.position, this.radius, player.group.position, 1.5)) return false;

    this.health -= 1;
    const away = this.group.position.clone().sub(player.group.position).setY(0).normalize();
    this.knockback.copy(away.multiplyScalar(7));
    if (this.health <= 0) {
      this.defeated = true;
      this.group.visible = false;
    }
    return true;
  }
}

export class EnemyManager {
  readonly enemies: Enemy[] = [
    new Enemy("forest-sentry", [new THREE.Vector3(-10, 0.65, -6), new THREE.Vector3(-6, 0.65, -6)]),
    new Enemy("lake-sentry", [new THREE.Vector3(7, 0.65, 5), new THREE.Vector3(11, 0.65, 8)])
  ];

  addTo(scene: THREE.Scene): void {
    for (const enemy of this.enemies) {
      scene.add(enemy.group);
    }
  }

  update(delta: number, player: PlayerController, onContact: () => void): void {
    for (const enemy of this.enemies) {
      enemy.update(delta, player, onContact);
      enemy.tryHit(player);
    }
  }
}
```

- [ ] **Step 4: Create `src/camera.ts`**

```ts
import * as THREE from "three";
import { clamp } from "./math";
import type { InputController } from "./input";

export class CameraController {
  yaw = Math.PI;
  private pitch = -0.35;
  private readonly offset = new THREE.Vector3();

  constructor(private readonly camera: THREE.PerspectiveCamera) {}

  update(input: InputController, target: THREE.Vector3): void {
    this.yaw -= input.pointerDeltaX * 0.005;
    this.pitch = clamp(this.pitch - input.pointerDeltaY * 0.003, -0.95, -0.12);

    const distance = 8;
    this.offset.set(
      Math.sin(this.yaw) * Math.cos(this.pitch) * distance,
      3.2 + Math.sin(-this.pitch) * 2,
      Math.cos(this.yaw) * Math.cos(this.pitch) * distance
    );

    this.camera.position.copy(target).add(this.offset);
    this.camera.lookAt(target.x, target.y + 0.8, target.z);
  }
}
```

- [ ] **Step 5: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 6: Commit if repository is initialized**

```bash
git add src/world.ts src/player.ts src/enemy.ts src/camera.ts
git commit -m "feat: add world player enemy and camera systems"
```

Skip if `git rev-parse --is-inside-work-tree` fails.

## Task 5: Main Game Loop and Playable Scene

**Files:**
- Create: `src/game.ts`
- Modify: `src/main.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Create `src/game.ts`**

```ts
import * as THREE from "three";
import { CameraController } from "./camera";
import { EnemyManager } from "./enemy";
import { HUD } from "./hud";
import { InputController } from "./input";
import { collectNearbyFragments, openDoorIfReady } from "./interactions";
import { sphereHit } from "./math";
import { PlayerController } from "./player";
import type { GameState } from "./types";
import { World } from "./world";

export class Game {
  private readonly renderer = new THREE.WebGLRenderer({ antialias: true });
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 120);
  private readonly clock = new THREE.Clock();
  private readonly input: InputController;
  private readonly hud: HUD;
  private readonly world = new World();
  private readonly enemies = new EnemyManager();
  private readonly state: GameState = {
    status: "playing",
    collectedFragments: new Set(),
    door: { activated: false, open: false },
    player: { health: 3, maxHealth: 3, isAttacking: false, damageCooldown: 0 }
  };
  private readonly player = new PlayerController(this.state, this.world.spawn);
  private readonly cameraController = new CameraController(this.camera);
  private animationId = 0;

  constructor(private readonly root: HTMLElement, hudRoot: HTMLElement) {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.root.appendChild(this.renderer.domElement);
    this.input = new InputController(this.renderer.domElement);
    this.hud = new HUD(hudRoot);
    this.setupScene();
    window.addEventListener("resize", this.onResize);
  }

  start(): void {
    this.loop();
  }

  dispose(): void {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener("resize", this.onResize);
    this.input.dispose();
    this.renderer.dispose();
  }

  private setupScene(): void {
    this.scene.background = new THREE.Color("#9bd8ff");
    this.scene.fog = new THREE.Fog("#9bd8ff", 35, 80);
    const hemi = new THREE.HemisphereLight("#dff7ff", "#5d7a45", 2.2);
    const sun = new THREE.DirectionalLight("#fff1c6", 2.3);
    sun.position.set(8, 14, 6);
    sun.castShadow = true;
    this.scene.add(hemi, sun, this.world.group, this.player.group);
    this.enemies.addTo(this.scene);
  }

  private loop = (): void => {
    const delta = Math.min(this.clock.getDelta(), 0.033);
    this.update(delta);
    this.renderer.render(this.scene, this.camera);
    this.input.endFrame();
    this.animationId = requestAnimationFrame(this.loop);
  };

  private update(delta: number): void {
    this.world.update(delta);
    this.player.update(delta, this.input, this.world, this.cameraController.yaw);
    this.cameraController.update(this.input, this.player.group.position);

    this.enemies.update(delta, this.player, () => this.player.damage(1, this.world.spawn));

    for (const id of collectNearbyFragments(this.state, this.world.fragments, this.player.group.position)) {
      this.world.setFragmentCollected(id);
    }

    const nearDoor = sphereHit(this.player.group.position, this.player.radius, this.world.doorPosition, 2);
    const canOpenDoor = this.state.collectedFragments.size >= this.world.fragments.length && nearDoor;
    if (this.input.consumeInteract()) {
      openDoorIfReady(this.state, this.world.fragments.length, nearDoor);
    }

    this.world.updateDoor(this.state.door.activated, this.state.door.open);
    this.hud.setPrompt(
      this.state.status === "won"
        ? ""
        : canOpenDoor
          ? "Press E to open the central ruin"
          : nearDoor
            ? "Collect all fragments to wake the door"
            : "Find 3 fragments across the island"
    );
    this.hud.render(this.state, this.world.fragments.length);
  }

  private onResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
}
```

- [ ] **Step 2: Replace `src/main.ts`**

```ts
import { Game } from "./game";
import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#game-root");
const hud = document.querySelector<HTMLDivElement>("#hud");

if (!root || !hud) {
  throw new Error("Missing game root or HUD element");
}

const game = new Game(root, hud);
game.start();

window.addEventListener("beforeunload", () => game.dispose());
```

- [ ] **Step 3: Extend canvas styles**

Append to `src/styles.css`:

```css
canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
```

- [ ] **Step 4: Run tests and build**

Run: `npm test && npm run build`

Expected: PASS.

- [ ] **Step 5: Start dev server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite prints a localhost URL. Open it in the browser and verify the scene renders.

- [ ] **Step 6: Commit if repository is initialized**

```bash
git add src/game.ts src/main.ts src/styles.css
git commit -m "feat: wire playable 3d island loop"
```

Skip if `git rev-parse --is-inside-work-tree` fails.

## Task 6: Manual Playtest Fixes and Polish

**Files:**
- Modify as needed: `src/world.ts`
- Modify as needed: `src/player.ts`
- Modify as needed: `src/enemy.ts`
- Modify as needed: `src/camera.ts`
- Modify as needed: `src/game.ts`
- Modify as needed: `src/styles.css`

- [ ] **Step 1: Browser smoke test**

Open the Vite URL and verify:

- The canvas is not blank.
- The player is visible at spawn.
- The camera frames the island.
- HUD shows 3 health and `Fragments 0/3`.

- [ ] **Step 2: Movement test**

Use `WASD`, mouse drag, and `Space`.

Expected:

- Player moves relative to camera yaw.
- Player remains within island bounds.
- Player jumps and lands.
- Camera rotates smoothly without flipping.

- [ ] **Step 3: Collection and door test**

Collect forest, ridge, and lake fragments, then go to the central door and press `E`.

Expected:

- Each fragment disappears when collected.
- HUD increments to `Fragments 3/3`.
- Door changes color after the third fragment.
- Pressing `E` near the door opens it and HUD shows the win message.

- [ ] **Step 4: Enemy danger test**

Touch an enemy and attack an enemy with left click or `J`.

Expected:

- Contact reduces health by 1 with cooldown.
- Attacks knock enemies back.
- Two hits defeat an enemy and hide it.
- If health reaches zero, player respawns and fragments remain collected.

- [ ] **Step 5: Make targeted fixes**

Only change code needed to satisfy the failed manual check. Keep fixes in the module that owns the behavior:

- Camera framing issues: `src/camera.ts`
- Movement or respawn issues: `src/player.ts`
- Fragment, door, or terrain issues: `src/world.ts` and `src/interactions.ts`
- Enemy behavior issues: `src/enemy.ts`
- HUD readability issues: `src/hud.ts` and `src/styles.css`

- [ ] **Step 6: Final verification**

Run: `npm test && npm run build`

Expected: PASS.

- [ ] **Step 7: Commit if repository is initialized**

```bash
git add src
git commit -m "fix: polish playable adventure prototype"
```

Skip if `git rev-parse --is-inside-work-tree` fails.

## Self-Review

- Spec coverage: scaffold, Three.js architecture, bright low-poly world, third-person camera, movement, jump, attack, light enemies, 3 fragments, central door, win state, HUD, simple collision, and build/test verification are covered.
- Red-flag scan: no unresolved markers or vague implementation instructions are present.
- Type consistency: shared `GameState`, `FragmentDefinition`, and `World` APIs are introduced before game-loop use, and `PlayerController.isAttacking` is the public API consumed by enemies.
