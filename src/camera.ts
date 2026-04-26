import * as THREE from "three";
import { clamp } from "./math";
import type { InputController } from "./input";

const LOOK_HEIGHT = 1.15;
const FOLLOW_DISTANCE = 8;
const POINTER_SENSITIVITY = 0.004;
const FULL_TURN = Math.PI * 2;

export class CameraController {
  public yaw = 0;
  private pitch = -0.35;

  constructor(private readonly camera: THREE.PerspectiveCamera) {}

  update(input: InputController, target: THREE.Vector3): void {
    this.yaw -= input.pointerDeltaX * POINTER_SENSITIVITY;
    this.yaw = ((this.yaw % FULL_TURN) + FULL_TURN) % FULL_TURN;
    this.pitch = clamp(this.pitch - input.pointerDeltaY * POINTER_SENSITIVITY, -0.95, -0.12);

    const lookAt = target.clone();
    lookAt.y += LOOK_HEIGHT;

    const horizontalDistance = Math.cos(this.pitch) * FOLLOW_DISTANCE;
    const height = Math.sin(-this.pitch) * FOLLOW_DISTANCE + 2.2;

    this.camera.position.set(
      lookAt.x + Math.sin(this.yaw) * horizontalDistance,
      lookAt.y + height,
      lookAt.z + Math.cos(this.yaw) * horizontalDistance
    );
    this.camera.lookAt(lookAt);
  }
}
