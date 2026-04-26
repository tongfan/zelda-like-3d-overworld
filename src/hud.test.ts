import { describe, expect, it } from "vitest";
import { HUD } from "./hud";
import type { GameState } from "./types";

class TestElement {
  className = "";
  private ownText = "";
  private children: TestElement[] = [];

  get childElementCount(): number {
    return this.children.length;
  }

  get textContent(): string {
    return `${this.ownText}${this.children.map((child) => child.textContent).join("")}`;
  }

  set textContent(value: string | null) {
    this.ownText = value ?? "";
    this.children = [];
  }

  append(...children: TestElement[]): void {
    this.children.push(...children);
  }

  replaceChildren(...children: TestElement[]): void {
    this.ownText = "";
    this.children = children;
  }

  querySelector(selector: string): TestElement | null {
    const className = selector.startsWith(".") ? selector.slice(1) : selector;

    for (const child of this.children) {
      if (child.className.split(" ").includes(className)) {
        return child;
      }

      const match = child.querySelector(selector);
      if (match) {
        return match;
      }
    }

    return null;
  }
}

globalThis.document = {
  createElement: () => new TestElement()
} as unknown as Document;

function state(status: GameState["status"] = "playing"): GameState {
  return {
    status,
    collectedFragments: new Set(["forest"]),
    door: { activated: false, open: false },
    player: { health: 2, maxHealth: 3, isAttacking: false, damageCooldown: 0 }
  };
}

describe("HUD", () => {
  it("renders status, objective prompt, and always-visible controls", () => {
    const root = document.createElement("div");
    const hud = new HUD(root);

    hud.setPrompt("Find 3 fragments across the island");
    hud.render(state(), 3);

    expect(root.querySelector(".hud-top")?.textContent).toContain("♥♥♡");
    expect(root.querySelector(".hud-top")?.textContent).toContain("Fragments 1/3");

    const controls = root.querySelector(".hud-controls");
    expect(controls?.textContent).toContain("Controls");
    expect(controls?.textContent).toContain("WASD Move");
    expect(controls?.textContent).toContain("Space Jump");
    expect(controls?.textContent).toContain("Mouse Drag Look");
    expect(controls?.textContent).toContain("J / Click Attack");
    expect(controls?.textContent).toContain("E Interact");

    expect(root.querySelector(".hud-bottom")?.textContent).toBe("Find 3 fragments across the island");
  });

  it("keeps controls visible while showing the win message", () => {
    const root = document.createElement("div");
    const hud = new HUD(root);

    hud.setPrompt("Press E to open the central ruin");
    hud.render(state("won"), 3);

    expect(root.querySelector(".hud-controls")?.textContent).toContain("Controls");
    expect(root.querySelector(".hud-bottom")?.textContent).toBe("Ruin opened. You restored the Bright Isle.");
  });

  it("cleans up controls and HUD content on dispose", () => {
    const root = document.createElement("div");
    const hud = new HUD(root);

    hud.render(state(), 3);
    hud.dispose();

    expect(root.className).toBe("");
    expect(root.childElementCount).toBe(0);
  });
});
