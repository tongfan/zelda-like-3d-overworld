import * as THREE from "three";
import { clamp, distance2D, moveToward, sphereHit } from "./math";
import type { PlayerController } from "./player";
import type { GroundPoint } from "./types";

const PATROL_SPEED = 2.1;
const KNOCKBACK_DECAY = 7.5;
const HIT_RANGE = 1.5;
const HIT_ARC_DOT = -0.15;
const ISLAND_LIMIT = 16;

export class Enemy {
  readonly group = new THREE.Group();
  readonly radius = 0.65;
  health = 2;
  defeated = false;

  private targetIndex = 1;
  private knockback = new THREE.Vector3();
  private lastHitAttackId = 0;
  private readonly baseY: number;

  constructor(
    readonly id: string,
    private readonly patrolRoute: THREE.Vector3[]
  ) {
    this.baseY = this.patrolRoute[0]?.y ?? 0.65;

    const body = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 1.25, 5),
      new THREE.MeshStandardMaterial({ color: 0xd64032, flatShading: true })
    );
    body.position.y = 0.6;
    body.castShadow = true;
    this.group.add(body);

    const eye = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.12, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x3b1010, flatShading: true })
    );
    eye.position.set(0, 0.9, -0.5);
    this.group.add(eye);

    this.group.position.copy(this.patrolRoute[0]);
  }

  update(delta: number, player: PlayerController, onContact: () => void): void {
    if (this.defeated) {
      return;
    }

    if (this.knockback.lengthSq() > 0.0001) {
      this.group.position.addScaledVector(this.knockback, delta);
      this.knockback.multiplyScalar(Math.max(0, 1 - KNOCKBACK_DECAY * delta));
      this.group.position.x = clamp(this.group.position.x, -ISLAND_LIMIT, ISLAND_LIMIT);
      this.group.position.z = clamp(this.group.position.z, -ISLAND_LIMIT, ISLAND_LIMIT);
      this.group.position.y = this.baseY;
    } else {
      this.patrol(delta);
    }

    if (sphereHit(this.group.position, this.radius, player.group.position, player.radius)) {
      onContact();
    }
  }

  tryHit(player: PlayerController): boolean {
    if (this.defeated || !player.isAttacking || player.attackId === this.lastHitAttackId) {
      return false;
    }

    if (distance2D(this.group.position, player.group.position) > HIT_RANGE) {
      return false;
    }

    const playerFacing = new THREE.Vector3(Math.sin(player.group.rotation.y), 0, Math.cos(player.group.rotation.y));
    const toEnemy = new THREE.Vector3().subVectors(this.group.position, player.group.position);
    toEnemy.y = 0;
    if (toEnemy.lengthSq() > 0 && playerFacing.dot(toEnemy.normalize()) < HIT_ARC_DOT) {
      return false;
    }

    this.lastHitAttackId = player.attackId;
    this.health -= 1;
    const away = new THREE.Vector3().subVectors(this.group.position, player.group.position);
    away.y = 0;
    if (away.lengthSq() === 0) {
      away.set(0, 0, 1);
    }
    away.normalize();
    this.knockback.copy(away.multiplyScalar(5.5));

    if (this.health <= 0) {
      this.defeated = true;
      this.group.visible = false;
    }

    return true;
  }

  private patrol(delta: number): void {
    if (this.patrolRoute.length < 2) {
      return;
    }

    const target = this.patrolRoute[this.targetIndex];
    const next = moveToward(this.group.position, target, PATROL_SPEED * delta);
    const dx = next.x - this.group.position.x;
    const dz = next.z - this.group.position.z;

    this.group.position.x = next.x;
    this.group.position.z = next.z;
    this.group.position.y = target.y;

    if (Math.hypot(dx, dz) > 0.0001) {
      this.group.rotation.y = Math.atan2(dx, dz);
    }

    if (distance2D(this.group.position as GroundPoint, target) < 0.05) {
      this.targetIndex = (this.targetIndex + 1) % this.patrolRoute.length;
    }
  }
}

export class EnemyManager {
  readonly enemies = [
    new Enemy("forest-sentry", [new THREE.Vector3(-10, 0.65, -6), new THREE.Vector3(-6, 0.65, -6)]),
    new Enemy("lake-sentry", [new THREE.Vector3(7, 0.65, 5), new THREE.Vector3(11, 0.65, 8)])
  ];

  addTo(scene: THREE.Object3D): void {
    for (const enemy of this.enemies) {
      scene.add(enemy.group);
    }
  }

  update(delta: number, player: PlayerController, onContact: () => void): void {
    for (const enemy of this.enemies) {
      enemy.tryHit(player);
      enemy.update(delta, player, onContact);
    }
  }
}
