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

  it("detects sphere overlap at the tangent boundary", () => {
    expect(sphereHit({ x: 0, z: 0 }, 1, { x: 2, z: 0 }, 1)).toBe(true);
  });

  it("moves toward a target without overshooting", () => {
    expect(moveToward({ x: 0, z: 0 }, { x: 10, z: 0 }, 3)).toEqual({ x: 3, z: 0 });
    expect(moveToward({ x: 0, z: 0 }, { x: 2, z: 0 }, 3)).toEqual({ x: 2, z: 0 });
  });

  it("stays put when already at the target", () => {
    expect(moveToward({ x: 4, z: -2 }, { x: 4, z: -2 }, 3)).toEqual({ x: 4, z: -2 });
  });

  it("moves diagonally toward a target", () => {
    expect(moveToward({ x: 0, z: 0 }, { x: 3, z: 4 }, 2.5)).toEqual({ x: 1.5, z: 2 });
  });

  it("treats negative max distance as zero movement", () => {
    expect(moveToward({ x: 0, z: 0 }, { x: 10, z: 0 }, -3)).toEqual({ x: 0, z: 0 });
  });
});
