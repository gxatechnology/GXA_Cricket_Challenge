# Phase 3 code review — GXA Cricket Batting Challenge

## Verified from the supplied file
- 3,708-line React/Three.js single-file application, syntactically valid TSX.
- `CharacterAssetLoader` creates a named bone hierarchy with 19 `THREE.Bone` instances (described as "18 bone" in its comments).
- Batters, bowler and fielders use animation controller classes; the run-up uses the hand-attached `ballReleaseSocket` to initialize ball flight.
- Character models are still separately attached simple 3D meshes (cylinders/spheres/boxes), not imported high-fidelity rigged GLB/SkinnedMesh models.
- One `THREE.AnimationClip` is made for breathing; most motions are procedural bone rotations, not motion-capture clips or proven AnimationMixer crossfades.

## High priority before calling this a publishing build
1. **Realism still limited:** replace rigid primitive-mesh anatomy with licensed original skinned humanoid assets and authored cricket animation clips, then synchronize bat contact, release, foot planting and crossfade transitions.
2. **Repeated batting gather reset**: `triggerGather()` is called every frame for the latter part of the run-up, resetting its timer before progress. Fixed with one guard in packaged `src/App.jsx`.
3. **Fake advertising callbacks:** original `showRewardedAd` grants `onRewardGranted` after 450ms without showing/verifying an ad; simulated `showInterstitialAd` also fires synthetic callbacks. Packaged `src/App.jsx` disables simulated ad behavior; SDK still needs real platform integration.
4. **Batting animation restarts:** `triggerShot()` is called once on swing initiation and again on validated contact, resetting shot animation timing. Use an uninterrupted trigger and separate contact feedback.
5. **Running between wickets** currently uses a sinusoidal root-z displacement, causing oscillation rather than continuous traversals; synchronize body animation with grounded translations.
6. **Resource cleanup** only disposes the WebGLRenderer on scene unmount; dynamically created geometry/materials/textures and audio resources need lifecycle management.
7. **UI overclaims**: internal `PHASE 2 AUDIT` labels and `VERIFIED` entries are developer self-labels, not independently validated QA.
8. **Frame rate**: replay uses a fixed frame increment rather than elapsed time; playback speed can vary across refresh rates.

## Verifications and limits
- Valid TSX syntax: TypeScript parser reported 0 syntax errors for original source.
- Valid modified JSX syntax: TypeScript parser reported 0 syntax errors for packaged `src/App.jsx`.
- No full dependency installation, Vite build, or interactive browser testing was performed due to inaccessible npm registry.
- 60 FPS, real player appearance, mobile behavior, and Y8 approval have **not** been established.

## Go/no-go
**No-go for Y8 monetized submission** until a compiled game is built and tested, the major animation issues are resolved, and an approved Y8 monetization integration is in place. Studio profile setup can continue independently.
