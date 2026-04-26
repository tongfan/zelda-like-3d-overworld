# Gameplay Hints HUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an always-visible compact controls panel to the in-game HUD.

**Architecture:** Keep this as a HUD-only UI change. `HUD` owns the controls DOM nodes and uses `textContent`; CSS owns layout and responsive behavior; tests verify the rendered instructions.

**Tech Stack:** TypeScript, Vitest, DOM APIs, CSS.

---

## File Structure

- Modify `src/hud.ts`: create a top-right controls panel with stable DOM nodes and clean it up in `dispose()`.
- Modify `src/styles.css`: style the controls panel to match existing HUD pills and stay readable on narrow screens.
- Create `src/hud.test.ts`: verify controls instructions, status text, prompt text, win message, and disposal behavior.

## Task 1: Always-Visible Controls Panel

**Files:**
- Modify: `src/hud.ts`
- Modify: `src/styles.css`
- Create: `src/hud.test.ts`

- [ ] **Step 1: Write the failing HUD test**

Create `src/hud.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { HUD } from "./hud";
import type { GameState } from "./types";

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/hud.test.ts`

Expected: FAIL because `.hud-controls` does not exist yet.

- [ ] **Step 3: Update `src/hud.ts`**

Replace `src/hud.ts` with:

```ts
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
    this.controls.append(this.createControlsTitle(), ...CONTROL_HINTS.map(([key, action]) => this.createControlRow(key, action)));

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

  private createControlsTitle(): HTMLDivElement {
    const title = document.createElement("div");
    title.className = "hud-controls-title";
    title.textContent = "Controls";
    return title;
  }

  private createControlRow(key: string, action: string): HTMLDivElement {
    const row = document.createElement("div");
    row.className = "hud-control-row";

    const keyNode = document.createElement("span");
    keyNode.className = "hud-control-key";
    keyNode.textContent = key;

    const actionNode = document.createElement("span");
    actionNode.className = "hud-control-action";
    actionNode.textContent = action;

    row.append(keyNode, actionNode);
    return row;
  }
}
```

- [ ] **Step 4: Update `src/styles.css`**

Append these styles:

```css
.hud-controls {
  position: fixed;
  top: 16px;
  right: 16px;
  width: min(220px, calc(100vw - 32px));
  padding: 12px;
  border: 2px solid rgb(255 255 255 / 60%);
  border-radius: 8px;
  background: rgb(20 45 36 / 68%);
  backdrop-filter: blur(8px);
}

.hud-controls-title {
  margin-bottom: 8px;
  font-size: 13px;
  text-transform: uppercase;
}

.hud-control-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  line-height: 1.45;
}

.hud-control-key {
  color: #fff7b8;
}

.hud-control-action {
  text-align: right;
}

@media (max-width: 560px) {
  .hud-top {
    right: 16px;
    flex-wrap: wrap;
  }

  .hud-controls {
    top: 78px;
    left: 16px;
    right: auto;
    width: min(220px, calc(100vw - 32px));
  }

  .hud-bottom {
    font-size: 16px;
  }
}
```

- [ ] **Step 5: Run focused tests**

Run: `npm test -- src/hud.test.ts`

Expected: PASS with 3 HUD tests.

- [ ] **Step 6: Run full verification**

Run: `npm test && npm run build`

Expected: all tests pass and production build succeeds.

- [ ] **Step 7: Commit if repository is initialized**

Run:

```bash
git add src/hud.ts src/hud.test.ts src/styles.css
git commit -m "feat: show gameplay controls in HUD"
```

Expected if git is available: commit succeeds. If unrelated staged files exist, use a path-limited commit for only these three files.

## Self-Review

- Spec coverage: the plan adds the top-right controls panel, preserves top-left status and bottom prompt, keeps `textContent`, cleans up in dispose, adds responsive CSS, and verifies tests/build.
- Red-flag scan: no unresolved markers or vague implementation steps are present.
- Type consistency: `HUD` public methods remain `setPrompt`, `render`, and `dispose`; tests use the existing `GameState` shape.
