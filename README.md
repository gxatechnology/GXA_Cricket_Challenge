# GXA Cricket Challenge — Compact Match UI & Auto-Delivery Upgrade

A modified **existing** React/Three.js cricket browser game. The original gameplay and animation source from the supplied ZIP has been preserved, not rewritten as a new game.

## Start locally

```bash
npm install
npm run dev
npm test
npm run build
```

`dist/` will be created by `npm run build` if dependencies can be installed and bundling succeeds. **The ZIP in this handoff is source, not the Y8 production-upload ZIP.** Verify the build and game on real devices before uploading.

## What changed

- Removed the required `Next Ball` action and normal 8–10-second delays. Auto advances after roughly 2.8 seconds, 3 seconds for boundaries/over changes and 3.2 seconds for wickets, **measured after play resolution**. End-of-innings result appears after 2.1 seconds.
- Transition clock pauses for Pause and an explicitly selected Replay; a one-second recovery window is allowed after a replay.
- Compact mode-aware scoreboard uses the game's actual runs, wickets, overs, targets, balls remaining, and rate, with local fictional batsman scorecards and AI opponent labeling (no fake online multiplayer or invented enemy innings).
- Shot direction, type, and camera choice persisted with existing player profile.
- Separate Wallet and Bat Garage; tracked wallet transaction history, unlocked bats, 4 upgrades per bat with small actual gameplay effects and spending confirmations. Existing coin totals, unlocked bats, and achievements are retained.
- Compact camera menu, mobile-friendly button labels, shorter feedback panel with optional replay, no center-of-pitch result overlay.
- Source tests for credits/strike/wickets/upgrades and static regression checks.

## Key files

- `src/App.jsx`: updated existing game source and UI
- `src/game/progression.mjs`: pure progression, wallet, and batting stats helpers
- `tests/progression.test.mjs`: 9 unit tests
- `scripts/smokecheck.cjs`: 5 source regression checks
- `CHANGELOG.md`: changed file descriptions
- `CODE_AUDIT.md`: verification and remaining limitations
- `original/`: reference originals from user's ZIP; not part of production build

## Limits and responsibilities

**No browser/real mobile QA or production build was completed in this environment.** npm could not resolve registry.npmjs.org. Source JSX syntax was checked via TypeScript transpileModule and 14 Node tests ran. Before publication, build and test the game thoroughly. This upgrade is not an advertisement SDK implementation and does not enable monetization by itself.

Browser play requires WebGL. GXA coins are virtual game currency; they are not real-world earnings.
