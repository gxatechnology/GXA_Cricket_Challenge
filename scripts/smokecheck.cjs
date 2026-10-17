const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'App.jsx'), 'utf8');
test('Manual next ball removed from normal gameplay',()=>{
  assert.doesNotMatch(src, /Next Ball \(Space\)/);
  assert.doesNotMatch(src, /schedulePacedTransition\(overBanner \? 10000 : 8000/);
  assert.match(src, /triggerNextDelivery\(\)/);
});
test('Interball pause uses replay-aware timer and short natural waits',()=>{
  assert.match(src, /const transitionMs = isWicket \? 3200 : runs >= 4 \? 3000 : overBanner \? 3000 : 2800/);
  assert.match(src, /!isPausedRef\.current && !replaying && !wasReplaying/);
  assert.match(src, /transitionIdRef\.current/);
});
test('Compact mobile scoreboard and camera menu',()=>{
  assert.match(src,/Match scoreboard/);
  assert.match(src,/striker\?\.name/);
  assert.match(src,/runsNeeded/);
  assert.match(src,/cameraMenuOpen/);
});
test('Wallet and upgrade flow with user confirmation',()=>{
  assert.match(src,/activeModal === 'WALLET'/);
  assert.match(src,/activeModal === 'GARAGE'/);
  assert.match(src,/purchaseIntent/);
  assert.match(src,/getEffectiveBatStats\(activeBat, profileRef\.current\)/);
});
test('Core 3D engine and original game modes retained',()=>{
  for(const fragment of ['resolveSweptBatContact','BatsmanAnimationController','BowlerAnimationController','FielderAnimationController','GAME_MODES','BOWLING_VARIATIONS']) assert.ok(src.includes(fragment),fragment);
});
