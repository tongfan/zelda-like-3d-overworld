import { describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { Enemy, EnemyManager } from "./enemy";
import type { PlayerController } from "./player";

describe("EnemyManager", () => {
  it("does not apply contact damage after an enemy is defeated by the current attack", () => {
    const enemy = new Enemy("test-sentry", [new THREE.Vector3(0, 0.65, 0), new THREE.Vector3(1, 0.65, 0)]);
    enemy.health = 1;

    const player = {
      group: {
        position: new THREE.Vector3(0, 0.65, 0),
        rotation: { y: 0 }
      },
      radius: 0.65,
      isAttacking: true,
      attackId: 1
    } as PlayerController;
    const onContact = vi.fn();
    const manager = new EnemyManager();
    manager.enemies.splice(0, manager.enemies.length, enemy);

    manager.update(0.016, player, onContact);

    expect(enemy.defeated).toBe(true);
    expect(onContact).not.toHaveBeenCalled();
  });
});
