# GXA Cricket Batting Challenge — Clean Gameplay Edition

Publisher: **GXA Games Studio**

This version is based on your uploaded `gxa_cricket_batting_challenge (3).tsx` and retains the existing gameplay, scoring, shot controls, 3D field, modes and saved player progression.

## Changes

- Removed all player-facing Phase 3 development badges, including the header, homepage and QA modal title.
- Removed the large central gameplay banner/overlay; replaces it with a compact, accessible outcome/replay status strip above the batting controls.
- Adds an **8-second** inter-ball break, **10 seconds** at an over boundary, and **8.5 seconds** before the final scorecard.
- The break countdown **pauses automatically during an action replay or Pause** and resumes afterwards. Replay can be watched repeatedly, and Next Ball / Space still lets users skip the gap.
- Lengthened opening delivery delay to 1 second and bowler run-up to 1.45 seconds. Bowling ball velocity/scoring/timing math is unchanged.
- Smoother fielder turn-to-ball yaw to reduce abrupt character snaps.
- Small non-blocking toast notifications; replay stops cleanly and restores the stadium camera on the next normal frame.

## Running

`npm install`
`npm run dev`
`npm run build`

For Y8/portal upload, use the **contents of the verified `dist/` output**, not the source ZIP.

## Important verification status

The source and TSX transpilation can be checked without installing dependencies; actual Vite production build, user interactions, mobile FPS and full ad/portal eligibility are **not guaranteed** until checked on a machine with npm dependencies and a browser.

This project contains procedural characters rather than motion-captured, licensed athlete GLB files. A real asset upgrade remains a separate development task.

### Source backup

Original uploaded TSX: `original/gxa_cricket_batting_challenge_user_uploaded_phase3.tsx`
Updated app: `src/App.jsx` (and source duplicate `src/App.phase3-updated.tsx`)
