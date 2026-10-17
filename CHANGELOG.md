# Change Log — Mobile UX and Delivery Pacing

**Based on:** User-provided `GXA_Cricket_Challenge_CLEAN_GAMEPLAY_UPDATE(1).zip` and game UX master requirements.

## Changed / Added

- `src/App.jsx`: Preserved main React + WebGL engine. Replaced normal manual next-ball prompt and 8s/10s timeout with auto-paced 2.8s–3.2s transitions. Replay and pause suspend the timer. The replay control is optional and non-blocking. Replaced top score telemetry with compact match scoreboard and detailed ball-by-ball striker stats, simplified camera control, and streamlined mobile control labels. Integrated Wallet and Bat Garage views with purchased upgrades, confirmation and saved preferred controls. Per-ball rewards and match completion rewards have idempotency identifiers.
- `src/game/progression.mjs`: New pure modules: scorecard, rotating strike, coin ledger, bat unlock, upgrade prices and actual upgrade effects.
- `tests/progression.test.mjs`: Unit tests for scorecard, coin ledger, unlock and upgrades.
- `scripts/smokecheck.cjs`: Replaced legacy source tests (which enforced 8-second delays) with checks matching the requested flow.
- `package.json`: Added `npm test` script.
- `README.md`, `CODE_AUDIT.md`: Updated handoff documentation.
- `docs/USER_REQUIREMENTS.md`: Original supplied master prompt archived for reference.

## Preserved

Original `src/App.jsx` 3D physics, SkinnedMesh actors, shot controls, rendering, game mode definitions, audio, match progression, saved high scores, existing bat skins, and original source backup.

## Not included

No Y8 live submission, GitHub push, Netlify deployment or guaranteed production build. No external 3D animation/model assets were introduced.
