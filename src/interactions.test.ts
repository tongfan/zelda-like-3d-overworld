import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { collectNearbyFragments, openDoorIfReady } from "./interactions";
import type { FragmentDefinition, GameState } from "./types";

function state(): GameState {
  return {
    status: "playing",
    collectedFragments: new Set(),
    door: { activated: false, open: false },
    player: { health: 3, maxHealth: 3, isAttacking: false, damageCooldown: 0 }
  };
}

const fragments: FragmentDefinition[] = [
  { id: "forest", label: "Forest Fragment", position: new THREE.Vector3(0, 0, 0), radius: 1 },
  { id: "ridge", label: "Ridge Fragment", position: new THREE.Vector3(8, 0, 0), radius: 1 },
  { id: "lake", label: "Lake Fragment", position: new THREE.Vector3(0, 0, 8), radius: 1 }
];

describe("interactions", () => {
  it("collects only fragments near the player", () => {
    const gameState = state();
    const collected = collectNearbyFragments(gameState, fragments, new THREE.Vector3(0.5, 0, 0));

    expect(collected).toEqual(["forest"]);
    expect(gameState.collectedFragments.has("forest")).toBe(true);
    expect(gameState.collectedFragments.has("ridge")).toBe(false);
  });

  it("activates and opens the door after all fragments are collected", () => {
    const gameState = state();
    gameState.collectedFragments = new Set(["forest", "ridge", "lake"]);

    const opened = openDoorIfReady(gameState, fragments, true);

    expect(opened).toBe(true);
    expect(gameState.door.activated).toBe(true);
    expect(gameState.door.open).toBe(true);
    expect(gameState.status).toBe("won");
  });

  it("does not open the door early", () => {
    const gameState = state();
    gameState.collectedFragments = new Set(["forest"]);

    const opened = openDoorIfReady(gameState, fragments, true);

    expect(opened).toBe(false);
    expect(gameState.door.open).toBe(false);
    expect(gameState.status).toBe("playing");
  });

  it("does not activate or open the door for unrelated collected ids", () => {
    const gameState = state();
    gameState.collectedFragments = new Set(["forest", "ridge", "unknown"]);

    const opened = openDoorIfReady(gameState, fragments, true);

    expect(opened).toBe(false);
    expect(gameState.door.activated).toBe(false);
    expect(gameState.door.open).toBe(false);
    expect(gameState.status).toBe("playing");
  });
});
