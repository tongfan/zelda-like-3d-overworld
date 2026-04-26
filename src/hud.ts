import type { GameState } from "./types";

const CONTROL_HINTS = [
  ["WASD", "Move"],
  ["Space", "Jump"],
  ["Mouse Drag", "Look"],
  ["J / Click", "Attack"],
  ["E", "Interact"]
] as const;

export class HUD {
  private readonly top: HTMLDivElement;
  private readonly hearts: HTMLDivElement;
  private readonly fragments: HTMLDivElement;
  private readonly controls: HTMLDivElement;
  private readonly bottom: HTMLDivElement;
  private prompt = "";

  constructor(private readonly root: HTMLElement) {
    this.root.className = "hud";

    this.top = document.createElement("div");
    this.top.className = "hud-top";

    this.hearts = document.createElement("div");
    this.hearts.className = "hud-pill";

    this.fragments = document.createElement("div");
    this.fragments.className = "hud-pill";

    this.controls = document.createElement("div");
    this.controls.className = "hud-controls";

    const controlsTitle = document.createElement("div");
    controlsTitle.className = "hud-controls-title";
    controlsTitle.textContent = "Controls";
    this.controls.append(controlsTitle);

    for (const [key, action] of CONTROL_HINTS) {
      const row = document.createElement("div");
      row.className = "hud-control-row";

      const keyElement = document.createElement("span");
      keyElement.className = "hud-control-key";
      keyElement.textContent = `${key} `;

      const actionElement = document.createElement("span");
      actionElement.className = "hud-control-action";
      actionElement.textContent = action;

      row.append(keyElement, actionElement);
      this.controls.append(row);
    }

    this.bottom = document.createElement("div");
    this.bottom.className = "hud-bottom";

    this.top.append(this.hearts, this.fragments);
    this.root.replaceChildren(this.top, this.controls, this.bottom);
  }

  setPrompt(prompt: string): void {
    this.prompt = prompt;
  }

  dispose(): void {
    this.prompt = "";
    this.root.replaceChildren();
    this.root.className = "";
  }

  render(state: GameState, totalFragments: number): void {
    const maxHealth = Math.max(0, Math.floor(state.player.maxHealth));
    const health = Math.min(maxHealth, Math.max(0, Math.floor(state.player.health)));
    const hearts = "♥".repeat(health).padEnd(maxHealth, "♡");
    const message = state.status === "won" ? "Ruin opened. You restored the Bright Isle." : this.prompt;

    this.hearts.textContent = hearts;
    this.fragments.textContent = `Fragments ${state.collectedFragments.size}/${totalFragments}`;
    this.bottom.textContent = message;
  }
}
