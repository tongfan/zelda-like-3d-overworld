import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { CameraController } from "./camera";
import type { InputController } from "./input";

describe("CameraController", () => {
  it("starts behind the southern spawn so the island is framed ahead of the player", () => {
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 120);
    const controller = new CameraController(camera);
    const input = { pointerDeltaX: 0, pointerDeltaY: 0 } as InputController;
    const spawn = new THREE.Vector3(0, 0.6, 12);

    controller.update(input, spawn);

    expect(camera.position.z).toBeGreaterThan(spawn.z);
  });
});
