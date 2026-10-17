import test from 'node:test';
import assert from 'node:assert/strict';
import { createMatchScorecard, recordBallInScorecard, addWalletTransaction, purchaseBat, upgradeBat, getEffectiveBatStats, getBatUpgradeCost } from '../src/game/progression.mjs';
const bat = {id:'strike_pro', name:'Viper', cost:150, powerBoost:1.08, timingWindowBonus:1.06};
test('first batter records legal balls and rotates strike after a single', () => {
  const card = recordBallInScorecard(createMatchScorecard(),1,false,1,3);
  assert.equal(card.players[0].runs,1); assert.equal(card.players[0].balls,1); assert.equal(card.striker,1);
});
test('double does not switch strike', () => {
  const card = recordBallInScorecard(createMatchScorecard(),2,false,1,3);
  assert.equal(card.striker,0);
});
test('over changes strike; odd run at last ball changes it twice', () => {
  assert.equal(recordBallInScorecard(createMatchScorecard(),0,false,6,3).striker,1);
  assert.equal(recordBallInScorecard(createMatchScorecard(),1,false,6,3).striker,0);
});
test('wicket replaces striker and marks batter out', () => {
  const card=recordBallInScorecard(createMatchScorecard(),0,true,3,3);
  assert.equal(card.players[0].out,true); assert.equal(card.striker,2); assert.equal(card.nonStriker,1);
});
test('coin credits idempotent across duplicate completion calls',()=>{
  const p={coins:120,coinLedger:[]};const credited=addWalletTransaction(p,15,'Six','ball-1');
  assert.equal(credited.coins,135);assert.strictEqual(addWalletTransaction(credited,15,'Six','ball-1'),credited);
});
test('wallet rejects invalid amounts and retains existing balance',()=>{
  const p={coins:120};assert.strictEqual(addWalletTransaction(p,-5,'bad','a'),p);
  assert.strictEqual(addWalletTransaction(p,Infinity,'bad','a'),p);
});
test('bat unlock requires sufficient coins and cannot charge twice',()=>{
  const p={coins:200,unlockedBats:['classic_willow'],coinLedger:[],selectedBat:'classic_willow'};
  const once=purchaseBat(p,bat); assert.equal(once.coins,50); assert.equal(once.selectedBat,'strike_pro');
  const twice=purchaseBat(once,bat);assert.equal(twice.coins,50);
  assert.equal(purchaseBat({...p,coins:99},bat).selectedBat,'classic_willow');
});
test('upgrade costs grow, never exceed level cap and affect stats',()=>{
  let p={coins:1600,unlockedBats:['strike_pro'],batUpgrades:{},coinLedger:[]};
  assert.equal(getBatUpgradeCost(0),80);
  for(let i=0;i<4;i++)p=upgradeBat(p,bat);
  assert.equal(p.batUpgrades.strike_pro,4); assert.equal(getBatUpgradeCost(4),null);
  assert.equal(upgradeBat(p,bat),p);
  assert.ok(getEffectiveBatStats(bat,p).powerBoost>bat.powerBoost);
});
test('existing saved profile fields survive wallet transactions',()=>{
  const p={coins:120,highScores:{quick_2:50},unlockedBats:['classic_willow'],achievements:['first_six']};
  const next=addWalletTransaction(p,3,'Run','xyz');
  assert.deepEqual(next.highScores,p.highScores);
  assert.deepEqual(next.achievements,p.achievements);
});
