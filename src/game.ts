import * as THREE from "three";
import { CameraController } from "./camera";
import { EnemyManager } from "./enemy";
import { HUD } from "./hud";
import { InputController } from "./input";
import { collectNearbyFragments, openDoorIfReady } from "./interactions";
import { sphereHit } from "./math";
import { PlayerController } from "./player";
import type { GameState } from "./types";
import { World } from "./world";

const MAX_DELTA = 0.033;

export class Game {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(60, 1, 0.1, 120);
  readonly clock = new THREE.Clock();

  readonly state: GameState = {
    status: "playing",
    collectedFragments: new Set(),
    door: { activated: false, open: false },
    player: { health: 3, maxHealth: 3, isAttacking: false, damageCooldown: 0 }
  };

  readonly input: InputController;
  readonly hud: HUD;
  readonly world = new World();
  readonly enemies = new EnemyManager();
  readonly player: PlayerController;
  readonly cameraController: CameraController;

  private animationId: number | null = null;
  private started = false;
  private disposed = false;

  constructor(
    private readonly root: HTMLElement,
    hudRoot: HTMLElement
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.root.appendChild(this.renderer.domElement);

    this.input = new InputController(this.renderer.domElement);
    this.hud = new HUD(hudRoot);
    this.player = new PlayerController(this.state, this.world.spawn);
    this.cameraController = new CameraController(this.camera);

    this.setupScene();
    this.resize();
    window.addEventListener("resize", this.resize);
  }

  start(): void {
    if (this.started || this.disposed) return;
    this.started = true;
    this.clock.start();
    this.animationId = window.requestAnimationFrame(this.loop);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.started = false;

    if (this.animationId !== null) {
      window.cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    window.removeEventListener("resize", this.resize);
    this.input.dispose();
    this.hud.dispose();
    if (this.renderer.domElement.parentElement === this.root) {
      this.root.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }

  setupScene(): void {
    this.scene.background = new THREE.Color(0x9cdbff);
    this.scene.fog = new THREE.Fog(0x9cdbff, 28, 72);

    const hemisphere = new THREE.HemisphereLight(0xf1fbff, 0x5a7146, 2.35);
    this.scene.add(hemisphere);

    const sun = new THREE.DirectionalLight(0xfff4d6, 2.35);
    sun.position.set(8, 14, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 42;
    sun.shadow.camera.left = -22;
    sun.shadow.camera.right = 22;
    sun.shadow.camera.top = 22;
    sun.shadow.camera.bottom = -22;
    sun.shadow.bias = -0.0008;
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0xbdeeff, 0.45);
    fill.position.set(-8, 7, -6);
    this.scene.add(fill);

    this.scene.add(this.world.group);
    this.scene.add(this.player.group);
    this.enemies.addTo(this.scene);
  }

  update(delta: number): void {
    this.world.update(delta);
    this.player.update(delta, this.input, this.world, this.cameraController.yaw);
    this.cameraController.update(this.input, this.player.group.position);
    this.enemies.update(delta, this.player, () => this.player.damage(1, this.world.spawn));

    const collected = collectNearbyFragments(this.state, this.world.fragments, this.player.group.position);
    for (const id of collected) {
      this.world.setFragmentCollected(id);
    }

    const nearDoor = sphereHit(this.player.group.position, this.player.radius, this.world.doorPosition, 2);
    const hasRequiredFragments = this.world.fragments.every((fragment) => this.state.collectedFragments.has(fragment.id));
    const canOpenDoor = hasRequiredFragments && nearDoor;

    if (this.input.consumeInteract()) {
      openDoorIfReady(this.state, this.world.fragments, nearDoor);
    }

    this.world.updateDoor(this.state.door.activated, this.state.door.open);

    if (this.state.status === "won") {
      this.hud.setPrompt("");
    } else if (canOpenDoor) {
      this.hud.setPrompt("Press E to open the central ruin");
    } else if (nearDoor) {
      this.hud.setPrompt("Collect all fragments to wake the door");
    } else {
      this.hud.setPrompt("Find 3 fragments across the island");
    }

    this.hud.render(this.state, this.world.fragments.length);
  }

  private loop = (): void => {
    if (this.disposed) return;

    const delta = Math.min(this.clock.getDelta(), MAX_DELTA);

    this.update(delta);
    this.renderer.render(this.scene, this.camera);
    this.input.endFrame();

    this.animationId = window.requestAnimationFrame(this.loop);
  };

  private resize = (): void => {
    const width = Math.max(1, this.root.clientWidth || window.innerWidth || 1);
    const height = Math.max(1, this.root.clientHeight || window.innerHeight || 1);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };
}
