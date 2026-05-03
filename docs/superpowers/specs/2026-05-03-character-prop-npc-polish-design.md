# Character, Prop, and NPC Polish Design

## Goal

Improve the visual appeal and readability of the player, collectible props, sealed door, and sentry NPC/enemies in Bright Isle while preserving the existing lightweight Three.js prototype style.

The chosen direction is a mix of:

- Readability polish as the baseline.
- Heroic fantasy accents for the player, fragments, door, and sentries.
- Light ambient magic for collectibles and activated ruin elements.

## Scope

In scope:

- Player model polish in `src/player.ts`.
- Fragment and door visual polish in `src/world.ts`.
- Sentry enemy visual polish in `src/enemy.ts`.
- Existing attack and collectible effects may be visually enhanced without changing gameplay values.
- Browser visual verification after implementation.

Out of scope:

- External 3D models, textures, images, audio, or new asset loading.
- Gameplay rule changes, new quests, new enemies, dialogue, or inventory.
- Large rendering architecture changes.

## Visual Direction

All new visuals should use procedural low-poly Three.js primitives, flat-shaded materials, and small mesh groups. The scene should still read as a toy-like adventure prototype rather than a realistic game.

The polish should prioritize silhouettes and recognition:

- The player should be recognizable at a distance through stronger equipment shapes and color blocking.
- Fragments should read as magical collectibles through crystal cores, outer rings, and glow materials.
- The sealed door should visibly change from dormant to activated through runes and glow accents.
- Sentries should feel like island guards or monsters rather than generic cones.

## Player Changes

The player keeps the current capsule body, head, hat, cape, boots, sword, and shield structure. Add small, cheap decorative meshes:

- A tunic or chest accent that breaks up the blue body.
- A belt or waist band for scale and fantasy detail.
- Shoulder or glove accents to improve arm readability.
- A clearer shield face, such as a small inset emblem or rim.
- Slightly more distinct sword blade and hilt geometry while keeping the same attack timing and hit logic.

These additions must not change player radius, movement, attack timing, damage, respawn, or input behavior.

## Prop Changes

Fragments become a small magical pickup group rather than a single octahedron:

- Crystal core remains the main collectible mesh.
- Add an outer low-poly ring or halo.
- Add a tiny pedestal or base marker so the fragment is easier to spot against grass.
- Keep the existing rotation animation, optionally rotating the ring at a complementary speed.

The sealed door should gain simple ruin details:

- Add non-interactive rune strips or small inset stones around the door.
- Activated state should brighten the existing door and show a readable glow/rune effect.
- Open state remains the current vertical lift behavior.

## NPC / Enemy Changes

The current sentries remain enemies mechanically, but their visual role becomes clearer:

- Add stronger horns, brow/eye shapes, or cheek plates for personality.
- Add a small back crest, spikes, or tail-like accent that reads in silhouette.
- Improve color separation between body, belly, eyes, horns, and shadow.
- Optional tiny hit feedback material tint is acceptable if it does not change tests or combat rules.

Patrol routes, health, hit range, knockback, defeat behavior, and contact damage remain unchanged.

## Testing And Verification

Run the existing automated checks after code changes:

- `npm run test`
- `npm run build`

For visual verification:

- Start the Vite dev server.
- Inspect the game in the browser.
- Capture or review screenshots from the spawn area, a fragment location, the sealed door, and a sentry encounter.
- Check that added geometry does not obscure the playfield, break silhouettes, or create obvious overlap.

## Implementation Notes

Prefer small helper functions only where they reduce repeated geometry setup. Avoid new systems. Keep modifications localized to `src/player.ts`, `src/world.ts`, and `src/enemy.ts` unless verification reveals a tightly related issue.
