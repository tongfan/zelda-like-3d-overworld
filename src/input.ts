export class InputController {
  private keys = new Set<string>();
  private activePointerId: number | null = null;
  private attackQueued = false;
  private interactQueued = false;
  pointerDeltaX = 0;
  pointerDeltaY = 0;

  constructor(private readonly target: HTMLElement = document.body) {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    this.target.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
    window.addEventListener("pointermove", this.onPointerMove);
  }

  get moveX(): number {
    return Number(this.keys.has("KeyD")) - Number(this.keys.has("KeyA"));
  }

  get moveZ(): number {
    return Number(this.keys.has("KeyS")) - Number(this.keys.has("KeyW"));
  }

  get jumpHeld(): boolean {
    return this.keys.has("Space");
  }

  consumeAttack(): boolean {
    const value = this.attackQueued;
    this.attackQueued = false;
    return value;
  }

  consumeInteract(): boolean {
    const value = this.interactQueued;
    this.interactQueued = false;
    return value;
  }

  endFrame(): void {
    this.pointerDeltaX = 0;
    this.pointerDeltaY = 0;
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.target.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
    window.removeEventListener("pointermove", this.onPointerMove);
    this.keys.clear();
    this.attackQueued = false;
    this.interactQueued = false;
    this.pointerDeltaX = 0;
    this.pointerDeltaY = 0;
    this.activePointerId = null;
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);
    if (event.repeat) return;
    if (event.code === "KeyJ") this.attackQueued = true;
    if (event.code === "KeyE") this.interactQueued = true;
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };

  private onPointerDown = (event: PointerEvent): void => {
    if (this.activePointerId === null) {
      this.activePointerId = event.pointerId;
    }
    if (event.button === 0) this.attackQueued = true;
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (event.pointerId === this.activePointerId) {
      this.activePointerId = null;
    }
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) return;
    this.pointerDeltaX += event.movementX;
    this.pointerDeltaY += event.movementY;
  };
}
