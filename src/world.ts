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
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeCylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  radialSegments: number,
  position: [number, number, number],
  color: THREE.ColorRepresentation
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments), standardMaterial(color));
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeTree(x: number, z: number, scale = 1): THREE.Group {
  const tree = new THREE.Group();
  tree.add(makeBox([0.28 * scale, 1.05 * scale, 0.28 * scale], [x, 0.46 * scale, z], 0x7b4b2a));

  const lowerCrown = new THREE.Mesh(new THREE.ConeGeometry(0.84 * scale, 1.35 * scale, 6), standardMaterial(0x23884f));
  lowerCrown.position.set(x, 1.14 * scale, z);
  lowerCrown.castShadow = true;
  tree.add(lowerCrown);

  const upperCrown = new THREE.Mesh(new THREE.ConeGeometry(0.62 * scale, 1.1 * scale, 6), standardMaterial(0x2fa65a));
  upperCrown.position.set(x, 1.78 * scale, z);
  upperCrown.castShadow = true;
  tree.add(upperCrown);

  return tree;
}

function makeRock(x: number, z: number, scale = 1, y = 0.18): THREE.Mesh {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38 * scale, 0), standardMaterial(0x9c927e));
  rock.position.set(x, y, z);
  rock.rotation.set(0.2 * scale, 0.7 * scale, -0.15 * scale);
  rock.scale.y = 0.55;
  rock.castShadow = true;
  rock.receiveShadow = true;
  return rock;
}

function makeGrassClump(x: number, z: number, scale = 1): THREE.Group {
  const clump = new THREE.Group();
  const blades: Array<[number, number, number]> = [
    [-0.16, 0, -0.04],
    [0, 0.03, 0.05],
    [0.15, -0.02, -0.02]
  ];

  for (const [offsetX, rotation, offsetZ] of blades) {
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.08 * scale, 0.5 * scale, 4), standardMaterial(0x58b85d));
    blade.position.set(x + offsetX * scale, 0.26 * scale, z + offsetZ * scale);
    blade.rotation.z = rotation;
    blade.castShadow = true;
    clump.add(blade);
  }

  return clump;
}

function makeFlowerPatch(x: number, z: number, color: THREE.ColorRepresentation): THREE.Group {
  const patch = new THREE.Group();
  patch.add(makeGrassClump(x, z, 0.72));

  const flower = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), standardMaterial(color));
  flower.position.set(x + 0.08, 0.34, z - 0.06);
  flower.castShadow = true;
  patch.add(flower);

  return patch;
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
  private readonly doorGlow: THREE.Mesh;

  constructor() {
    this.group.add(this.makeGround());
    this.group.add(this.makeWater());
    this.group.add(this.makeRidge());
    this.group.add(this.makeDoorFrame());

    this.door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 0.35), this.doorMaterial);
    this.door.position.copy(this.doorPosition);
    this.door.castShadow = true;
    this.group.add(this.door);

    this.doorGlow = new THREE.Mesh(
      new THREE.TorusGeometry(1.35, 0.045, 6, 18),
      new THREE.MeshStandardMaterial({
        color: 0xffdd73,
        emissive: 0xffc247,
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0,
        ...lowPoly
      })
    );
    this.doorGlow.position.set(this.doorPosition.x, 1.1, this.doorPosition.z - 0.22);
    this.doorGlow.rotation.x = Math.PI / 2;
    this.group.add(this.doorGlow);

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
    const glowMaterial = this.doorGlow.material as THREE.MeshStandardMaterial;
    glowMaterial.opacity = activated ? 0.72 : 0;
    this.doorGlow.visible = activated;
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
    this.doorGlow.rotation.z += delta * 0.65;
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

    ridge.add(makeBox([6.9, 0.18, 0.28], [7.5, 2.9, -4.05], 0x789c51));
    ridge.add(makeBox([6.9, 0.18, 0.28], [7.5, 2.9, -9.95], 0x789c51));
    ridge.add(makeBox([0.28, 0.18, 5.4], [10.9, 2.9, -7], 0x789c51));
    ridge.add(makeRock(6.1, -9.0, 0.95, 2.95));
    ridge.add(makeRock(9.2, -5.1, 0.75, 2.95));
    ridge.add(makeRock(4.7, -8.8, 0.55, 1.45));
    ridge.add(makeGrassClump(6.6, -5.1, 0.85));
    ridge.add(makeGrassClump(9.8, -8.4, 0.7));

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
    const treePositions: Array<[number, number, number]> = [
      [-12, -7, 1.08],
      [-10, -3, 0.95],
      [-7, -8, 1.18],
      [-13, 1, 0.9],
      [-5, -4, 1.02],
      [-14, -4, 0.78],
      [-8, -1, 0.72],
      [-11, 3, 0.84],
      [-6, -6, 0.68]
    ];

    for (const [x, z, scale] of treePositions) {
      this.group.add(makeTree(x, z, scale));
    }

    const grassPositions: Array<[number, number, number]> = [
      [-11.4, -5.3, 0.9],
      [-9.6, -6.8, 0.75],
      [-7.2, -3.2, 0.82],
      [-13.8, -1.5, 0.7],
      [-5.7, -7.3, 0.68],
      [-8.4, 1.3, 0.74]
    ];
    for (const [x, z, scale] of grassPositions) {
      this.group.add(makeGrassClump(x, z, scale));
    }

    this.group.add(makeFlowerPatch(-10.8, -4.3, 0xfff06a));
    this.group.add(makeFlowerPatch(-7.9, -6.4, 0xff8fb3));
    this.group.add(makeFlowerPatch(-12.4, 0.2, 0xffffff));
    this.group.add(makeRock(-9.1, -8.7, 0.65));
    this.group.add(makeRock(-14.2, -6.2, 0.55));
  }

  private addLakeProps(): void {
    const shore = new THREE.Mesh(new THREE.CylinderGeometry(3.55, 3.95, 0.08, 14), standardMaterial(0xb8dc8f));
    shore.position.set(8.7, 0.01, 7.4);
    shore.scale.z = 0.72;
    shore.receiveShadow = true;
    this.group.add(shore);

    const lake = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.5, 0.12, 12), standardMaterial(0x40a7d8));
    lake.position.set(8.7, 0.07, 7.4);
    lake.scale.z = 0.7;
    this.group.add(lake);

    const highlight = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.035, 5, 18),
      new THREE.MeshStandardMaterial({ color: 0xbaf3ff, emissive: 0x74d8f2, emissiveIntensity: 0.2, ...lowPoly })
    );
    highlight.position.set(8.1, 0.16, 6.9);
    highlight.scale.set(1.2, 0.42, 1);
    highlight.rotation.x = Math.PI / 2;
    this.group.add(highlight);

    this.group.add(makeBox([1.2, 0.45, 0.9], [5.2, 0.2, 9.5], 0x9c8a65));
    this.group.add(makeBox([0.9, 0.35, 1.1], [11.7, 0.18, 5.4], 0xb09a73));
    this.group.add(makeRock(6.2, 5.4, 0.52));
    this.group.add(makeRock(10.9, 8.9, 0.62));
    this.group.add(makeRock(11.7, 6.8, 0.45));
    this.group.add(makeGrassClump(5.7, 7.6, 0.75));
    this.group.add(makeFlowerPatch(10.9, 4.9, 0xfff06a));
  }

  private addRuinProps(): void {
    const columns: Array<[number, number]> = [
      [-3.5, -1.7],
      [3.5, -1.7],
      [-3.1, 2.4],
      [3.1, 2.4]
    ];

    for (const [x, z] of columns) {
      const column = makeCylinder(0.35, 0.45, 1.5, 6, [x, 0.75, z], 0xafa58f);
      this.group.add(column);
      this.group.add(makeBox([0.9, 0.18, 0.9], [x, 1.58, z], 0xc4b89b));
      this.group.add(makeBox([0.75, 0.16, 0.75], [x, -0.02, z], 0x8f8676));
    }

    this.group.add(makeBox([5.2, 0.18, 5.2], [0, -0.02, 0.35], 0x8c8374));
    this.group.add(makeBox([2.6, 0.12, 0.42], [0, 0.1, -1.2], 0xb9ad93));
    this.group.add(makeRock(-2.4, 0.8, 0.5));
    this.group.add(makeRock(2.2, 1.4, 0.42));
    this.group.add(makeRock(-1.6, -2.5, 0.38));
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
