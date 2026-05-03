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
