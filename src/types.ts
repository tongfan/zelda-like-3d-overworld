import * as THREE from "three";

export type GameStatus = "playing" | "respawning" | "won";

export interface GroundPoint {
  x: number;
  z: number;
}

export interface FragmentDefinition {
  id: string;
  label: string;
  position: THREE.Vector3;
  radius: number;
}

export interface DoorState {
  activated: boolean;
  open: boolean;
}

export interface PlayerState {
  health: number;
  maxHealth: number;
  isAttacking: boolean;
  damageCooldown: number;
}

export interface EnemyState {
  id: string;
  health: number;
  defeated: boolean;
}

export interface GameState {
  status: GameStatus;
  collectedFragments: Set<string>;
  door: DoorState;
  player: PlayerState;
}
