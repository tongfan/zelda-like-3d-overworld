# Bright Low-Poly Art Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the existing Three.js island map, player, and enemies with medium-scope procedural low-poly art polish.

**Architecture:** Keep gameplay state and rules unchanged. Treat Three.js meshes as the render layer: add geometry, material helpers, and visual animation without changing controls, collection, enemy damage, or door progression.

**Tech Stack:** TypeScript, Vite, Three.js, Vitest.

---

## File Structure

- Modify `src/world.ts`: add reusable procedural prop helpers, richer terrain landmarks, lake/ridge/ruin details, and better fragment/door visuals.
- Modify `src/player.ts`: add player silhouette details and sword arc presentation.
- Modify `src/enemy.ts`: add enemy silhouette details and ground shadow.
- Modify `src/game.ts`: tune sky, fog, tone mapping, and shadow settings for bright low-poly readability.
- Modify tests only if behavior-facing assertions need updating. Existing behavior tests should remain valid because gameplay rules do not change.

### Task 1: Map Procedural Props and Region Polish

**Files:**
- Modify: `src/world.ts`

- [ ] **Step 1: Add reusable visual helpers**

Add helper functions near the existing material helpers:

```ts
function makeCylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  radialSegments: number,
  position: [number, number, number],
  color: THREE.ColorRepresentation
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments), standardMaterial(color));
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeTree(x: number, z: number, scale = 1): THREE.Group {
  const tree = new THREE.Group();
  tree.add(makeBox([0.28 * scale, 1.05 * scale, 0.28 * scale], [x, 0.46 * scale, z], 0x7b4b2a));
  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.82 * scale, 1.65 * scale, 6), standardMaterial(0x23884f));
  crown.position.set(x, 1.35 * scale, z);
  crown.castShadow = true;
  tree.add(crown);
  return tree;
}
```

- [ ] **Step 2: Replace and expand forest props**

Replace the current repeated tree creation in `addForestProps()` with varied trees, grass clumps, flower patches, and rocks. Keep all props decorative and do not add collision logic.

- [ ] **Step 3: Polish lake, ridge, and ruin**

Update `addLakeProps()`, `makeRidge()`, and `addRuinProps()` to add shoreline rings, water highlights, rocks, plateau edge markers, ruin caps, a stronger base, and broken stones.

- [ ] **Step 4: Run existing behavior tests**

Run: `npm test`

Expected: all existing tests pass; no gameplay behavior should change.

### Task 2: Player Adventurer Silhouette and Attack Readability

**Files:**
- Modify: `src/player.ts`

- [ ] **Step 1: Add player details**

Add low-poly details in the constructor after the existing body/head meshes: hat or hair block, cape, arms, boots, and shield/back equipment. These are child meshes of `this.group` and do not affect `radius` or movement.

- [ ] **Step 2: Add sword arc mesh**

Add a second private mesh, for example `private readonly swordArc: THREE.Mesh;`, using a thin torus or ring segment approximation. Show it only during attack and animate scale/rotation in `updateSwordPose()`.

- [ ] **Step 3: Run player-related tests**

Run: `npm test -- src/game.test.ts src/interactions.test.ts`

Expected: tests pass because visual child meshes do not change controls or interaction rules.

### Task 3: Enemy Visual Distinction and Scene Lighting

**Files:**
- Modify: `src/enemy.ts`
- Modify: `src/game.ts`

- [ ] **Step 1: Add enemy details**

In `Enemy` constructor, add horns/fins, clearer eyes, and a subtle circular ground shadow mesh. Keep health, radius, patrol speed, hit range, and contact damage unchanged.

- [ ] **Step 2: Tune scene lighting**

In `Game.setupScene()` and renderer construction, tune sky/fog colors, hemisphere and directional light intensity, renderer output color space, tone mapping, and shadow camera settings for brighter low-poly readability.

- [ ] **Step 3: Run enemy and camera tests**

Run: `npm test -- src/enemy.test.ts src/camera.test.ts`

Expected: tests pass; enemy patrol, hit, defeat, and camera behavior remain unchanged.

### Task 4: Build and Browser Visual QA

**Files:**
- No additional source files expected.

- [ ] **Step 1: Run full test suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 3: Start local dev server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite serves the app on a local URL.

- [ ] **Step 4: Inspect in browser**

Open the local URL and verify:

- The scene is nonblank.
- The island reads as bright low-poly.
- Forest, lake, ridge, and ruin regions are visually distinct.
- The player silhouette is clearly readable.
- Enemies remain visually distinct from player and fragments.
- Movement, fragment collection, door prompt, and sword attack remain usable.
