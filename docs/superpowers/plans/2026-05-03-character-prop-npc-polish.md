# Character, Prop, and NPC Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Bright Isle's player, fragments, sealed door, and sentry visuals while preserving all current gameplay rules.

**Architecture:** Keep all new art procedural and local to the existing Three.js object factories. `src/player.ts` owns player equipment details, `src/world.ts` owns collectible and ruin prop details, and `src/enemy.ts` owns sentry mesh details. Add one focused `src/world.test.ts` to protect fragment visibility and animation behavior after fragments become grouped objects.

**Tech Stack:** Vite, TypeScript, Three.js, Vitest.

---

## File Structure

- Modify `src/player.ts`: add small low-poly equipment meshes to the existing `PlayerController` constructor; do not change movement, attack, damage, radius, or state logic.
- Modify `src/world.ts`: change `fragmentMeshes` to store `THREE.Group`/`THREE.Object3D` entries, add fragment ring/base pieces, add door rune meshes, and animate fragment child rings.
- Create `src/world.test.ts`: instantiate `World` and assert collected fragments hide the whole group and `update()` rotates fragment groups.
- Modify `src/enemy.ts`: add sentry crest/spike/face geometry to the existing `Enemy` constructor; do not change patrol or combat logic.

---

### Task 1: Fragment Object Regression Tests

**Files:**
- Create: `src/world.test.ts`
- Modify: none

- [ ] **Step 1: Write the failing tests**

Create `src/world.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { World } from "./world";

describe("World fragments", () => {
  it("hides the complete fragment object when collected", () => {
    const world = new World();
    const fragmentObject = world.fragmentMeshes.get("forest");

    expect(fragmentObject).toBeDefined();

    world.setFragmentCollected("forest");

    expect(fragmentObject?.visible).toBe(false);
  });

  it("rotates fragment objects during world updates", () => {
    const world = new World();
    const fragmentObject = world.fragmentMeshes.get("forest");

    expect(fragmentObject).toBeDefined();

    const startY = fragmentObject?.rotation.y ?? 0;
    const startX = fragmentObject?.rotation.x ?? 0;

    world.update(0.5);

    expect(fragmentObject?.rotation.y).toBeGreaterThan(startY);
    expect(fragmentObject?.rotation.x).toBeGreaterThan(startX);
  });
});
```

- [ ] **Step 2: Run the new tests**

Run: `npm run test -- src/world.test.ts`

Expected: PASS against the current single-mesh implementation. These tests establish behavior before changing the fragment render object type.

- [ ] **Step 3: Commit the tests**

```bash
git add src/world.test.ts
git commit -m "test: cover world fragment visuals"
```

---

### Task 2: Polish Fragment and Door Props

**Files:**
- Modify: `src/world.ts`
- Test: `src/world.test.ts`

- [ ] **Step 1: Update fragment storage type**

In `src/world.ts`, change the fragment map declaration from:

```ts
readonly fragmentMeshes = new Map<string, THREE.Mesh>();
```

to:

```ts
readonly fragmentMeshes = new Map<string, THREE.Group>();
```

- [ ] **Step 2: Add a fragment factory**

In `src/world.ts`, add this helper near the other `make*` helpers:

```ts
function makeFragmentObject(position: THREE.Vector3): THREE.Group {
  const group = new THREE.Group();

  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.45, 0),
    new THREE.MeshStandardMaterial({
      color: 0xfff06a,
      emissive: 0xffc247,
      emissiveIntensity: 0.72,
      roughness: 0.32,
      metalness: 0.08,
      ...lowPoly
    })
  );
  core.castShadow = true;
  group.add(core);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.035, 5, 16),
    new THREE.MeshStandardMaterial({
      color: 0xfff7ad,
      emissive: 0xffd35c,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.82,
      ...lowPoly
    })
  );
  halo.name = "fragment-halo";
  halo.rotation.x = Math.PI / 2;
  group.add(halo);

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.54, 0.18, 6),
    new THREE.MeshStandardMaterial({ color: 0x9b927f, roughness: 0.7, ...lowPoly })
  );
  pedestal.position.y = -0.52;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  group.add(pedestal);

  const glint = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.34, 4),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfff7ad,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.78,
      ...lowPoly
    })
  );
  glint.position.set(0.18, 0.26, -0.08);
  glint.rotation.z = -0.35;
  group.add(glint);

  group.position.copy(position);
  return group;
}
```

- [ ] **Step 3: Replace `addFragments()` implementation**

Replace the current `addFragments()` body with:

```ts
  private addFragments(): void {
    for (const fragment of this.fragments) {
      const fragmentObject = makeFragmentObject(fragment.position);
      this.fragmentMeshes.set(fragment.id, fragmentObject);
      this.group.add(fragmentObject);
    }
  }
```

- [ ] **Step 4: Animate fragment halos**

In `update(delta: number)`, keep the existing group rotation and add child halo rotation:

```ts
  update(delta: number): void {
    for (const fragmentObject of this.fragmentMeshes.values()) {
      fragmentObject.rotation.y += delta * 1.8;
      fragmentObject.rotation.x += delta * 0.6;

      const halo = fragmentObject.getObjectByName("fragment-halo");
      if (halo) {
        halo.rotation.z -= delta * 1.15;
      }
    }
    this.doorGlow.rotation.z += delta * 0.65;
  }
```

- [ ] **Step 5: Add door rune meshes**

After `this.group.add(this.door);` in the `World` constructor, add non-interactive rune details:

```ts
    const runeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffdf7a,
      emissive: 0xffb33f,
      emissiveIntensity: 0.25,
      ...lowPoly
    });
    const runePositions: Array<[number, number, number, number]> = [
      [-0.55, 1.32, -0.2, 0.08],
      [0, 1.62, -0.2, -0.08],
      [0.55, 1.08, -0.2, 0.08],
      [-0.28, 0.62, -0.2, -0.08],
      [0.32, 0.48, -0.2, 0.08]
    ];
    for (const [x, y, z, rotation] of runePositions) {
      const rune = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.04), runeMaterial.clone());
      rune.position.set(x, y, z);
      rune.rotation.z = rotation;
      rune.castShadow = true;
      this.door.add(rune);
    }
```

- [ ] **Step 6: Run tests**

Run: `npm run test -- src/world.test.ts`

Expected: PASS. The fragment map now stores groups, and collected fragments still hide correctly.

- [ ] **Step 7: Commit prop polish**

```bash
git add src/world.ts src/world.test.ts
git commit -m "feat: polish fragment and door visuals"
```

---

### Task 3: Polish Player Model

**Files:**
- Modify: `src/player.ts`
- Test: existing suite

- [ ] **Step 1: Add chest, belt, shoulders, shield rim, and hilt meshes**

In the `PlayerController` constructor, after the current body mesh is added, add:

```ts
    const tunicAccent = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.52, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x74c9ff, flatShading: true })
    );
    tunicAccent.position.set(0, 0.54, -0.33);
    tunicAccent.rotation.x = -0.08;
    tunicAccent.castShadow = true;
    this.group.add(tunicAccent);

    const belt = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.12, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x5a331d, roughness: 0.72, flatShading: true })
    );
    belt.position.set(0, 0.22, -0.02);
    belt.castShadow = true;
    this.group.add(belt);

    const buckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.14, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xf1c64b, metalness: 0.12, roughness: 0.48, flatShading: true })
    );
    buckle.position.set(0, 0.23, -0.29);
    buckle.castShadow = true;
    this.group.add(buckle);
```

After the arm meshes are added, add:

```ts
    const shoulderMaterial = new THREE.MeshStandardMaterial({ color: 0x1f5fb5, flatShading: true });
    const leftShoulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), shoulderMaterial);
    leftShoulder.position.set(-0.36, 0.9, -0.02);
    leftShoulder.scale.set(1.15, 0.65, 0.85);
    leftShoulder.castShadow = true;
    this.group.add(leftShoulder);

    const rightShoulder = leftShoulder.clone();
    rightShoulder.position.x = 0.36;
    rightShoulder.castShadow = true;
    this.group.add(rightShoulder);
```

After the shield mesh is added, add:

```ts
    const shieldRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.33, 0.025, 5, 6),
      new THREE.MeshStandardMaterial({ color: 0xffe38b, metalness: 0.16, roughness: 0.48, flatShading: true })
    );
    shieldRim.position.copy(shield.position);
    shieldRim.rotation.copy(shield.rotation);
    shieldRim.castShadow = true;
    this.group.add(shieldRim);

    const shieldEmblem = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.2, 3),
      new THREE.MeshStandardMaterial({ color: 0x2f8fe8, flatShading: true })
    );
    shieldEmblem.position.set(-0.46, 0.56, 0.02);
    shieldEmblem.rotation.set(Math.PI / 2, 0, Math.PI);
    shieldEmblem.castShadow = true;
    this.group.add(shieldEmblem);
```

After `this.sword` is added, add a hilt mesh that uses the same visibility as the sword if needed:

```ts
    const swordGuard = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.1, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xf1c64b, metalness: 0.18, roughness: 0.45, flatShading: true })
    );
    swordGuard.position.set(0.52, 0.72, 0.05);
    swordGuard.rotation.y = -0.25;
    swordGuard.visible = false;
    this.sword.add(swordGuard);
```

- [ ] **Step 2: Run targeted tests**

Run: `npm run test -- src/game.test.ts src/enemy.test.ts`

Expected: PASS. Construction and existing game wiring still work.

- [ ] **Step 3: Commit player polish**

```bash
git add src/player.ts
git commit -m "feat: polish player visuals"
```

---

### Task 4: Polish Sentry NPC / Enemy Model

**Files:**
- Modify: `src/enemy.ts`
- Test: `src/enemy.test.ts`

- [ ] **Step 1: Add sentry silhouette details**

In the `Enemy` constructor, after the horn meshes are added and before the shadow mesh, add:

```ts
    const browMaterial = new THREE.MeshStandardMaterial({ color: 0x7f1f24, flatShading: true });
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.1), browMaterial);
    brow.position.set(0, 1.02, -0.52);
    brow.rotation.x = -0.08;
    brow.castShadow = true;
    this.group.add(brow);

    const crestMaterial = new THREE.MeshStandardMaterial({ color: 0x9f2528, flatShading: true });
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.48, 4), crestMaterial);
    crest.position.set(0, 1.18, 0.28);
    crest.rotation.x = -0.55;
    crest.castShadow = true;
    this.group.add(crest);

    const spikeMaterial = new THREE.MeshStandardMaterial({ color: 0xffd784, flatShading: true });
    const leftCheek = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 4), spikeMaterial);
    leftCheek.position.set(-0.34, 0.72, -0.34);
    leftCheek.rotation.set(Math.PI / 2, 0, -0.55);
    leftCheek.castShadow = true;
    this.group.add(leftCheek);

    const rightCheek = leftCheek.clone();
    rightCheek.position.x = 0.34;
    rightCheek.rotation.z = 0.55;
    rightCheek.castShadow = true;
    this.group.add(rightCheek);

    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.45, 5), crestMaterial);
    tail.position.set(0, 0.28, 0.48);
    tail.rotation.x = Math.PI / 2.4;
    tail.castShadow = true;
    this.group.add(tail);
```

- [ ] **Step 2: Run enemy tests**

Run: `npm run test -- src/enemy.test.ts`

Expected: PASS. Combat behavior remains unchanged after visual-only constructor edits.

- [ ] **Step 3: Commit enemy polish**

```bash
git add src/enemy.ts
git commit -m "feat: polish sentry visuals"
```

---

### Task 5: Full Verification and Browser Review

**Files:**
- Modify: none unless verification reveals a localized visual issue.

- [ ] **Step 1: Run full unit tests**

Run: `npm run test`

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 3: Start the dev server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite serves the game locally, usually at `http://127.0.0.1:5173/` or the next open port.

- [ ] **Step 4: Browser visual pass**

Open the served URL in the in-app browser and inspect:

- Spawn/player view: player equipment reads clearly and does not overlap awkwardly.
- Forest fragment: crystal, halo, and base are visible against the environment.
- Central door: dormant and activated door still read clearly; door opens vertically as before.
- Sentry encounter: enemy silhouette is more distinctive and contact/combat still works.

- [ ] **Step 5: Final status**

Run:

```bash
git status --short
```

Expected: clean working tree after commits, or only intentional uncommitted verification notes if the user asked not to commit.

---

## Self-Review

- Spec coverage: player, fragments, door, NPC/enemy, automated checks, build, and browser verification all map to tasks above.
- Placeholder scan: no unresolved markers or open-ended implementation steps remain.
- Type consistency: fragment storage changes consistently from `THREE.Mesh` to `THREE.Group`; `setFragmentCollected()` and `update()` operate on `THREE.Group` objects.
