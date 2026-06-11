import type { DayLedger, EconomyConfig, Grade, ServedBowl } from './types';

/** Quality of one bowl from the grades and freshness of its components, 0..1. */
export function bowlQuality(
  components: { grade: Grade; freshness: number }[],
  config: EconomyConfig
): number {
  if (components.length === 0) return 0;
  const total = components.reduce(
    (sum, c) => sum + config.gradeQuality[c.grade] * (0.6 + 0.4 * c.freshness),
    0
  );
  return clamp01(total / components.length);
}

/** Satisfaction 0..1: quality carries most weight, speed the rest; mistakes hurt flat. */
export function satisfaction(bowl: ServedBowl): number {
  const base = bowl.quality * 0.7 + bowl.speed * 0.3;
  return clamp01(bowl.mistake ? base - 0.25 : base);
}

/** What the customer pays: sticker price, with a tip up to 30% for a delighted customer. */
export function bowlRevenue(dishBasePrice: number, sat: number): number {
  const tipFactor = sat >= 0.6 ? ((sat - 0.6) / 0.4) * 0.3 : 0;
  return Math.round(dishBasePrice * (1 + tipFactor));
}

/** Mistake chance given current stamina (before this bowl is made). */
export function mistakeChance(stamina: number, config: EconomyConfig): number {
  if (stamina >= config.staminaMistakeThreshold) return 0;
  const depth = 1 - stamina / config.staminaMistakeThreshold;
  return clamp01(config.mistakeChanceAtZero * depth);
}

/** Customers queueing today, scaled by reputation with a small random wobble. */
export function customersForDay(reputation: number, roll: number, config: EconomyConfig): number {
  const base =
    config.customersAtRep0 +
    (config.customersAtRep100 - config.customersAtRep0) * clamp01(reputation / 100);
  const wobble = 1 + (roll * 2 - 1) * 0.15;
  return Math.max(1, Math.round(base * wobble));
}

/**
 * End-of-day reputation delta. Good average satisfaction and few walk-aways
 * earn reputation; the reverse bleeds it. Result clamps the new value to 0..100.
 */
export function reputationAfterDay(
  reputation: number,
  ledger: DayLedger,
  config: EconomyConfig
): number {
  const visits = ledger.served + ledger.walkedAway;
  if (visits === 0) return reputation;
  const avgSat = ledger.served > 0 ? ledger.satisfactionTotal / ledger.served : 0;
  const walkPenalty = ledger.walkedAway / visits;
  // Score in -1..1: full marks for avg satisfaction 1 and no walk-aways.
  const score = (avgSat - config.satisfactionFloor) / (1 - config.satisfactionFloor) - walkPenalty;
  const delta = Math.round(config.reputationSwing * Math.max(-1, Math.min(1, score)));
  return Math.max(0, Math.min(100, reputation + delta));
}

/** Net cash change at evening settlement: takings minus the tier's fixed daily costs. */
export function eveningNet(ledger: DayLedger, tier: number, config: EconomyConfig): number {
  const idx = Math.max(0, Math.min(config.dailyCostByTier.length - 1, tier - 1));
  return ledger.takings - config.dailyCostByTier[idx];
}

export function emptyLedger(): DayLedger {
  return { served: 0, walkedAway: 0, takings: 0, marketSpend: 0, satisfactionTotal: 0 };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
