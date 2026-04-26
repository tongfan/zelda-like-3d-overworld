import * as THREE from "three";
import type { FragmentDefinition } from "./types";

const lowPoly = { flatShading: true };

function standardMaterial(color: THREE.ColorRepresentation): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, ...lowPoly });
}

function makeBox(
  size: [number, number, number],
  position: [number, number, number],
  color: THREE.ColorRepresentation
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), standardMaterial(color));
  mesh.position.set(...position);
  return mesh;
}

export class World {
  readonly group = new THREE.Group();
  readonly spawn = new THREE.Vector3(0, 0.6, 12);
  readonly doorPosition = new THREE.Vector3(0, 0.8, 0);
  readonly fragments: FragmentDefinition[] = [
    { id: "forest", label: "Forest Fragment", position: new THREE.Vector3(-9, 0.9, -5), radius: 1 },
    { id: "ridge", label: "Ridge Fragment", position: new THREE.Vector3(8, 3.2, -7), radius: 1 },
    { id: "lake", label: "Lake Fragment", position: new THREE.Vector3(8, 0.9, 7), radius: 1 }
  ];
  readonly fragmentMeshes = new Map<string, THREE.Mesh>();
  readonly door: THREE.Mesh;

  private readonly doorMaterial = standardMaterial(0x3b2a1f);

  constructor() {
    this.group.add(this.makeGround());
    this.group.add(this.makeWater());
    this.group.add(this.makeRidge());
    this.group.add(this.makeDoorFrame());

    this.door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 0.35), this.doorMaterial);
    this.door.position.copy(this.doorPosition);
    this.group.add(this.door);

    this.addForestProps();
    this.addLakeProps();
    this.addRuinProps();
    this.addFragments();
  }

  heightAt(x: number, z: number): number {
    if (x > 4 && x < 11 && z > -10 && z < -4) {
      return 2.5;
    }
    if (x > 2 && x <= 4 && z > -10 && z < -4) {
      return ((x - 2) / 2) * 2.5;
    }
    return 0;
  }

  updateDoor(activated: boolean, open: boolean): void {
    this.doorMaterial.color.set(activated ? 0xf5c84b : 0x3b2a1f);
    this.door.position.y = open ? this.doorPosition.y + 2.4 : this.doorPosition.y;
  }

  setFragmentCollected(id: string): void {
    const mesh = this.fragmentMeshes.get(id);
    if (mesh) {
      mesh.visible = false;
    }
  }

  update(delta: number): void {
    for (const mesh of this.fragmentMeshes.values()) {
      mesh.rotation.y += delta * 1.8;
      mesh.rotation.x += delta * 0.6;
    }
  }

  private makeGround(): THREE.Mesh {
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(17, 18, 0.7, 10), standardMaterial(0x74c365));
    ground.position.y = -0.38;
    ground.scale.z = 0.95;
    ground.receiveShadow = true;
    return ground;
  }

  private makeWater(): THREE.Mesh {
    const water = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 0.2, 18), standardMaterial(0x47b9e8));
    water.position.y = -0.55;
    water.scale.z = 0.92;
    return water;
  }

  private makeRidge(): THREE.Group {
    const ridge = new THREE.Group();
    ridge.add(makeBox([7, 2.5, 6], [7.5, 1.25, -7], 0x94aa5f));
    ridge.add(makeBox([6.4, 0.35, 5.4], [7.5, 2.65, -7], 0xa8d179));
    ridge.add(makeBox([2, 0.35, 4.5], [4.1, 1.2, -7], 0x9db766));

    const ramp = makeBox([2.6, 0.3, 5.2], [3, 1.2, -7], 0x9db766);
    ramp.rotation.z = -Math.atan2(2.5, 2);
    ridge.add(ramp);

    return ridge;
  }

  private makeDoorFrame(): THREE.Group {
    const frame = new THREE.Group();
    frame.add(makeBox([0.55, 2.9, 0.65], [-1.35, 1.15, 0], 0x8a8272));
    frame.add(makeBox([0.55, 2.9, 0.65], [1.35, 1.15, 0], 0x8a8272));
    frame.add(makeBox([3.3, 0.55, 0.75], [0, 2.75, 0], 0x9b927f));
    frame.add(makeBox([4.2, 0.3, 1.4], [0, 0.08, 0], 0x7d7668));
    return frame;
  }

  private addForestProps(): void {
    const treePositions: Array<[number, number]> = [
      [-12, -7],
      [-10, -3],
      [-7, -8],
      [-13, 1],
      [-5, -4]
    ];

    for (const [x, z] of treePositions) {
      const tree = new THREE.Group();
      tree.add(makeBox([0.35, 1.2, 0.35], [x, 0.55, z], 0x7b4b2a));
      const crown = new THREE.Mesh(new THREE.ConeGeometry(1, 2.2, 6), standardMaterial(0x20844a));
      crown.position.set(x, 1.8, z);
      tree.add(crown);
      this.group.add(tree);
    }
  }

  private addLakeProps(): void {
    const lake = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.5, 0.12, 12), standardMaterial(0x40a7d8));
    lake.position.set(8.7, 0.03, 7.4);
    lake.scale.z = 0.7;
    this.group.add(lake);

    this.group.add(makeBox([1.2, 0.45, 0.9], [5.2, 0.2, 9.5], 0x9c8a65));
    this.group.add(makeBox([0.9, 0.35, 1.1], [11.7, 0.18, 5.4], 0xb09a73));
  }

  private addRuinProps(): void {
    const columns: Array<[number, number]> = [
      [-3.5, -1.7],
      [3.5, -1.7],
      [-3.1, 2.4],
      [3.1, 2.4]
    ];

    for (const [x, z] of columns) {
      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.5, 6), standardMaterial(0xafa58f));
      column.position.set(x, 0.75, z);
      this.group.add(column);
    }
  }

  private addFragments(): void {
    const material = new THREE.MeshStandardMaterial({
      color: 0xfff06a,
      emissive: 0xffc247,
      emissiveIntensity: 0.55,
      roughness: 0.35,
      metalness: 0.05,
      ...lowPoly
    });

    for (const fragment of this.fragments) {
      const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), material.clone());
      mesh.position.copy(fragment.position);
      mesh.castShadow = true;
      this.fragmentMeshes.set(fragment.id, mesh);
      this.group.add(mesh);
    }
  }
}
