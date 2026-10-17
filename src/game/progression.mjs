// Pure, separately testable match statistics, wallet and bat progression.
export const MAX_BAT_LEVEL = 4;
export const BAT_UPGRADE_BASE_COST = 80;
export const getBatUpgradeCost = (level) => level >= MAX_BAT_LEVEL ? null : BAT_UPGRADE_BASE_COST * (level + 1);
export const getEffectiveBatStats = (bat, profile) => {
  const level = Math.max(0, Math.min(MAX_BAT_LEVEL, profile?.batUpgrades?.[bat.id] || 0));
  return {
    level,
    powerBoost: bat.powerBoost * (1 + 0.015 * level),
    timingWindowBonus: bat.timingWindowBonus * (1 + 0.0125 * level),
    control: Math.min(100, 60 + level * 5)
  };
};
export function addWalletTransaction(profile, amount, reason, id) {
  if (!Number.isFinite(amount) || amount <= 0 || !id) return profile;
  const ledger = profile.coinLedger || [];
  if (ledger.some((x) => x.id === id)) return profile;
  return {
    ...profile,
    coins: Math.max(0, Number(profile.coins) || 0) + amount,
    coinLedger: [{ id, amount, reason, at: Date.now() }, ...ledger].slice(0, 60)
  };
}
export function purchaseBat(profile, bat) {
  const unlocked = profile.unlockedBats || [];
  if (unlocked.includes(bat.id)) return { ...profile, selectedBat: bat.id };
  if (profile.coins < bat.cost) return profile;
  return {
    ...profile,
    coins: profile.coins - bat.cost,
    selectedBat: bat.id,
    unlockedBats: [...unlocked, bat.id],
    coinLedger: [{ id: `unlock-${bat.id}`, amount: -bat.cost, reason: `Unlock ${bat.name}`, at: Date.now() }, ...(profile.coinLedger || [])].slice(0, 60)
  };
}
export function upgradeBat(profile, bat) {
  if (!(profile.unlockedBats || []).includes(bat.id)) return profile;
  const level = profile.batUpgrades?.[bat.id] || 0;
  const cost = getBatUpgradeCost(level);
  if (cost === null || profile.coins < cost) return profile;
  return {
    ...profile,
    coins: profile.coins - cost,
    batUpgrades: { ...(profile.batUpgrades || {}), [bat.id]: level + 1 },
    coinLedger: [{ id: `upgrade-${bat.id}-${level + 1}`, amount: -cost, reason: `${bat.name} level ${level + 1}`, at: Date.now() }, ...(profile.coinLedger || [])].slice(0, 60)
  };
}
const ROSTER = ['GXA Batter 1', 'GXA Batter 2', 'GXA Batter 3', 'GXA Batter 4', 'GXA Batter 5', 'GXA Batter 6', 'GXA Batter 7', 'GXA Batter 8', 'GXA Batter 9', 'GXA Batter 10', 'GXA Batter 11'];
export function createMatchScorecard() {
  return { players: ROSTER.map((name) => ({ name, runs: 0, balls: 0, out: false })), striker: 0, nonStriker: 1, nextBatter: 2, lastBowler: 'GXA AI Bowler' };
}
export function recordBallInScorecard(card, runs, wicket, newBalls, maxWickets) {
  const players = card.players.map((p) => ({ ...p }));
  const striker = card.striker;
  const nonStriker = card.nonStriker;
  players[striker].runs += runs;
  players[striker].balls += 1;
  let nextStriker = striker;
  let nextNonStriker = nonStriker;
  let nextBatter = card.nextBatter;
  if (wicket) {
    players[striker].out = true;
    if (nextBatter < players.length && nextBatter < maxWickets + 2) {
      nextStriker = nextBatter;
      nextBatter += 1;
    }
  }
  if (runs % 2 === 1) [nextStriker, nextNonStriker] = [nextNonStriker, nextStriker];
  if (newBalls % 6 === 0) [nextStriker, nextNonStriker] = [nextNonStriker, nextStriker];
  return { ...card, players, striker: nextStriker, nonStriker: nextNonStriker, nextBatter };
}
