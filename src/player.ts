import * as THREE from "three";
import { clamp } from "./math";
import type { InputController } from "./input";
import type { GameState } from "./types";
import type { World } from "./world";

const MOVE_SPEED = 6;
const JUMP_SPEED = 8.5;
const GRAVITY = 24;
const ATTACK_DURATION = 0.28;
const DAMAGE_COOLDOWN = 0.75;
const RESPAWN_COOLDOWN = 1.4;

export class PlayerController {
  readonly group = new THREE.Group();
  readonly radius = 0.65;

  private readonly sword: THREE.Mesh;
  private velocityY = 0;
  private grounded = false;
  private attackTimer = 0;
  private currentAttackId = 0;

  constructor(
    private readonly state: GameState,
    spawn: THREE.Vector3
  ) {
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2f8fe8, flatShading: true });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.75, 3, 6), bodyMaterial);
    body.position.y = 0.45;
    body.castShadow = true;
    this.group.add(body);

    const head = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.32, 0),
      new THREE.MeshStandardMaterial({ color: 0xffd29a, flatShading: true })
    );
    head.position.y = 1.18;
    head.castShadow = true;
    this.group.add(head);

    this.sword = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.12, 1.25),
      new THREE.MeshStandardMaterial({ color: 0xe8edf0, metalness: 0.25, roughness: 0.5 })
    );
    this.sword.position.set(0.52, 0.72, -0.45);
    this.sword.rotation.y = -0.25;
    this.sword.visible = false;
    this.group.add(this.sword);

    this.group.position.copy(spawn);
  }

  get isAttacking(): boolean {
    return this.attackTimer > 0;
  }

  get attackId(): number {
    return this.currentAttackId;
  }

  update(delta: number, input: InputController, world: World, cameraYaw: number): void {
    if (this.state.status === "won") {
      this.attackTimer = 0;
      this.state.player.isAttacking = false;
      this.updateSwordPose();
      return;
    }

    this.state.player.damageCooldown = Math.max(0, this.state.player.damageCooldown - delta);

    if (input.consumeAttack() && this.attackTimer <= 0) {
      this.attackTimer = ATTACK_DURATION;
      this.currentAttackId += 1;
    }

    this.attackTimer = Math.max(0, this.attackTimer - delta);
    this.state.player.isAttacking = this.isAttacking;
    this.updateSwordPose();

    const moveX = input.moveX;
    const moveZ = input.moveZ;
    const moveLength = Math.hypot(moveX, moveZ);

    if (moveLength > 0) {
      const normalizedX = moveX / moveLength;
      const normalizedZ = moveZ / moveLength;
      const sin = Math.sin(cameraYaw);
      const cos = Math.cos(cameraYaw);
      const worldX = normalizedX * cos - normalizedZ * sin;
      const worldZ = normalizedX * sin + normalizedZ * cos;

      this.group.position.x += worldX * MOVE_SPEED * delta;
      this.group.position.z += worldZ * MOVE_SPEED * delta;
      this.group.rotation.y = Math.atan2(worldX, worldZ);
    }

    if (input.jumpHeld && this.grounded) {
      this.velocityY = JUMP_SPEED;
      this.grounded = false;
    }

    this.velocityY -= GRAVITY * delta;
    this.group.position.y += this.velocityY * delta;

    this.group.position.x = clamp(this.group.position.x, -16, 16);
    this.group.position.z = clamp(this.group.position.z, -16, 16);

    const groundY = world.heightAt(this.group.position.x, this.group.position.z) + 0.6;
    if (this.group.position.y <= groundY) {
      this.group.position.y = groundY;
      this.velocityY = 0;
      this.grounded = true;
    }
  }

  damage(amount: number, spawn: THREE.Vector3): void {
    if (this.state.status !== "playing" || this.state.player.damageCooldown > 0) {
      return;
    }

    this.state.player.health = Math.max(0, this.state.player.health - amount);
    this.state.player.damageCooldown = DAMAGE_COOLDOWN;

    if (this.state.player.health === 0) {
      this.group.position.copy(spawn);
      this.velocityY = 0;
      this.grounded = true;
      this.state.player.health = this.state.player.maxHealth;
      this.state.player.damageCooldown = RESPAWN_COOLDOWN;
    }
  }

  private updateSwordPose(): void {
    this.sword.visible = this.isAttacking;
    this.sword.rotation.x = this.isAttacking ? -0.9 : 0;
    this.sword.rotation.y = this.isAttacking ? -0.75 : -0.25;
  }
}
