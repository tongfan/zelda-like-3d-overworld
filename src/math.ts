import type { GroundPoint } from "./types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function distance2D(a: GroundPoint, b: GroundPoint): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

/** Checks X/Z ground-plane overlap only; vertical height is ignored. */
export function sphereHit(a: GroundPoint, radiusA: number, b: GroundPoint, radiusB: number): boolean {
  return distance2D(a, b) <= radiusA + radiusB;
}

export function moveToward(current: GroundPoint, target: GroundPoint, maxDistance: number): GroundPoint {
  if (maxDistance <= 0) {
    return { x: current.x, z: current.z };
  }

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
