/**
 * Tier 6 endgame: the playthrough converts into an empire dashboard with
 * light idle mechanics and a prestige loop. Pure maths only.
 */

export interface EmpireState {
  factories: number;
  markets: number;
  /** Brand value 0..∞, grows each quarter; drives profit and prestige. */
  brandValue: number;
}

export interface EmpireConfig {
  factoryBaseCost: number;
  factoryCostGrowth: number;
  marketBaseCost: number;
  marketCostGrowth: number;
  profitPerFactoryMarket: number;
}

export function emptyEmpire(): EmpireState {
  return { factories: 1, markets: 1, brandValue: 10 };
}

export function factoryCost(owned: number, config: EmpireConfig): number {
  return Math.round(config.factoryBaseCost * Math.pow(config.factoryCostGrowth, owned));
}

export function marketCost(owned: number, config: EmpireConfig): number {
  return Math.round(config.marketBaseCost * Math.pow(config.marketCostGrowth, owned));
}

/** Profit for one quarter of instant-noodle trade. */
export function quarterProfit(empire: EmpireState, config: EmpireConfig): number {
  return Math.round(
    empire.factories * empire.markets * config.profitPerFactoryMarket * (1 + empire.brandValue / 100)
  );
}

/** Brand value compounds with reach. */
export function brandGrowth(empire: EmpireState): number {
  return empire.factories + empire.markets;
}

/**
 * Prestige: permanent bonus percent for the next run. Equity given away to
 * investors during the playthrough drags the score down.
 */
export function prestigeBonusPercent(empire: EmpireState, equityGiven: number): number {
  const equityFactor = 1 - equityGiven / 100;
  return Math.max(1, Math.round((empire.brandValue / 10) * equityFactor));
}
