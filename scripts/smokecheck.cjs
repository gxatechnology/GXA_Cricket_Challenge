const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'App.jsx'), 'utf8');
test('No giant center-of-pitch gameplay announcement', () => {
  assert.doesNotMatch(src, /CENTER OUTCOME BANNER|my-auto px-2|bg-slate-950\/75 backdrop-blur-md border border-white\/15 px-5 py-2\.5/);
  assert.match(src, /COMPACT MATCH FEEDBACK/);
});
test('All public Phase 3/4 marketing strings removed', () => {
  assert.doesNotMatch(src, /PHASE\s+[34]/);
});
test('Replay and pause freeze inter-delivery clock', () => {
  assert.match(src, /!isPausedRef\.current\s*&&\s*!engineRef\.current\.isReplaying/);
  assert.match(src, /if \(eng\.phase !== 'RESETTING' \|\| eng\.isReplaying/);
});
test('Paced delivery and scorecard intervals exist', () => {
  assert.match(src, /schedulePacedTransition\(overBanner \? 10000 : 8000/);
  assert.match(src, /schedulePacedTransition\(8500/);
});
test('Player can control replay and choose next delivery', () => {
  assert.match(src, /Watch Replay/);
  assert.match(src, /Next Ball \(Space\)/);
  assert.match(src, /disabled=\{replayPlaying\}/);
});
test('Existing gameplay and score code is preserved', () => {
  assert.match(src, /resolveSweptBatContact/);
  assert.match(src, /BOWLING_VARIATIONS/);
  assert.match(src, /GAME_MODES/);
  assert.match(src, /completeDeliveryOutcome/);
});
test('Character controls still present and fielders turn smoothly', () => {
  assert.match(src, /class BatsmanAnimationController/);
  assert.match(src, /class BowlerAnimationController/);
  assert.match(src, /class FielderAnimationController/);
  assert.match(src, /const smoothlyFace/);
});
