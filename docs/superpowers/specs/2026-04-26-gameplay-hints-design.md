# Gameplay Hints HUD Design

Date: 2026-04-26

## Summary

Add always-visible gameplay instructions to the existing HUD so first-time players can understand the controls and objective without leaving the game screen.

The chosen direction is a compact controls panel in the top-right corner. The existing health and fragment counter remain top-left, and the existing dynamic objective prompt remains bottom-center.

## UI Behavior

The HUD should show three areas:

- Top-left status: player health and `Fragments x/3`.
- Top-right controls panel:
  - `Controls`
  - `WASD` Move
  - `Space` Jump
  - `Mouse Drag` Look
  - `J / Click` Attack
  - `E` Interact
- Bottom-center dynamic prompt:
  - Default: `Find 3 fragments across the island`
  - Near door without all fragments: `Collect all fragments to wake the door`
  - Near door after all fragments: `Press E to open the central ruin`
  - Won: `Ruin opened. You restored the Bright Isle.`

The controls panel should stay visible during normal play and after the win state. It should not block pointer input because the HUD root already uses `pointer-events: none`.

## Implementation Approach

Keep the change scoped to HUD rendering and styling:

- Extend `HUD` so its constructor creates a controls panel with stable DOM nodes.
- Use `textContent` for all text. Do not introduce `innerHTML`.
- Keep existing `HUD.setPrompt()` and `HUD.render()` public behavior.
- Update `HUD.dispose()` so the controls panel is cleaned up with the rest of the HUD.
- Add CSS for a fixed top-right panel that matches existing HUD pills.
- Add responsive CSS so the panel remains readable at narrow widths.
- Add a focused HUD test to verify the controls panel renders expected text.

## Out of Scope

- Pause screens
- Toggleable help menus
- Tutorial steps or onboarding overlays
- Mobile/touch controls
- Changing controls or gameplay behavior
- Reworking existing game state or interaction logic

## Acceptance Criteria

- The game screen shows health/fragments in the top-left.
- The game screen shows a compact controls panel in the top-right.
- The controls panel includes movement, jump, camera, attack, and interact instructions.
- The existing bottom dynamic prompt still updates based on game state.
- HUD rendering continues to use text-safe DOM updates.
- `npm test` passes.
- `npm run build` passes.
