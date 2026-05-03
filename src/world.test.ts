import { describe, expect, it } from "vitest";
import * as THREE from "three";
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

  it("builds each fragment as a layered visual group", () => {
    const world = new World();
    const fragmentObject = world.fragmentMeshes.get("forest");

    expect(fragmentObject).toBeInstanceOf(THREE.Group);
    expect(fragmentObject?.children).toHaveLength(4);
    expect(fragmentObject?.getObjectByName("fragment-halo")).toBeInstanceOf(THREE.Mesh);
  });

  it("counter-rotates the fragment halo during world updates", () => {
    const world = new World();
    const fragmentObject = world.fragmentMeshes.get("forest");
    const halo = fragmentObject?.getObjectByName("fragment-halo");

    expect(halo).toBeInstanceOf(THREE.Mesh);

    const startZ = halo?.rotation.z ?? 0;

    world.update(0.5);

    expect(halo?.rotation.z).toBeLessThan(startZ);
  });
});

describe("World door visuals", () => {
  it("adds non-interactive rune details to the door mesh", () => {
    const world = new World();

    const runes = world.door.children.filter((child) => child.name.startsWith("door-rune"));

    expect(runes).toHaveLength(5);
    expect(world.door.position.equals(world.doorPosition)).toBe(true);
  });
});
