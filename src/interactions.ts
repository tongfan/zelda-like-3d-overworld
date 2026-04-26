import * as THREE from "three";
import { sphereHit } from "./math";
import type { FragmentDefinition, GameState } from "./types";

function hasCollectedRequiredFragments(state: GameState, fragments: FragmentDefinition[]): boolean {
  return fragments.every((fragment) => state.collectedFragments.has(fragment.id));
}

export function collectNearbyFragments(
  state: GameState,
  fragments: FragmentDefinition[],
  playerPosition: THREE.Vector3
): string[] {
  const collected: string[] = [];

  for (const fragment of fragments) {
    if (state.collectedFragments.has(fragment.id)) continue;
    if (sphereHit(playerPosition, 0.7, fragment.position, fragment.radius)) {
      state.collectedFragments.add(fragment.id);
      collected.push(fragment.id);
    }
  }

  state.door.activated = hasCollectedRequiredFragments(state, fragments);
  return collected;
}

export function openDoorIfReady(state: GameState, fragments: FragmentDefinition[], isNearDoor: boolean): boolean {
  state.door.activated = hasCollectedRequiredFragments(state, fragments);

  if (!state.door.activated || !isNearDoor) {
    return false;
  }

  state.door.open = true;
  state.status = "won";
  return true;
}
