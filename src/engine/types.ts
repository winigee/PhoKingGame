/** Shared engine types. Pure data, no React Native imports. */

export type Grade = 'A' | 'B' | 'C';

export type IngredientCategory = 'BROTH' | 'NOODLES' | 'PROTEIN' | 'GARNISH';

export interface IngredientDef {
  id: string;
  nameKey: string;
  category: IngredientCategory;
  /** Base market price in VND for one batch (enough for ~10 bowls). */
  basePrice: number;
  /** Shelf life in days by grade. A lot bought on day D is usable through day D + shelfLife - 1. */
  shelfLife: Record<Grade, number>;
}

/** A purchased batch of one ingredient at one grade. */
export interface InventoryLot {
  ingredientId: string;
  grade: Grade;
  /** Servings remaining in the lot. */
  servings: number;
  purchasedOnDay: number;
}

/** One day's market price for one ingredient, per grade. */
export interface MarketEntry {
  ingredientId: string;
  prices: Record<Grade, number>;
}

export interface DishDef {
  id: string;
  nameKey: string;
  /** Categories a bowl must contain, in assembly order. */
  components: IngredientCategory[];
  /** Sticker price in VND at quality 1.0; satisfaction scales tips. */
  basePrice: number;
}

/** A served bowl: which lot fed each component slot. */
export interface ServedBowl {
  dishId: string;
  /** Quality score 0..1 from ingredient grades and freshness. */
  quality: number;
  /** Fraction of the customer's patience left when served, 0..1. */
  speed: number;
  /** True if a stamina-driven mistake occurred during assembly. */
  mistake: boolean;
}

export interface DayLedger {
  served: number;
  walkedAway: number;
  takings: number;
  marketSpend: number;
  /** Sum of per-bowl satisfaction (0..1 each), for averaging. */
  satisfactionTotal: number;
}

export interface EconomyConfig {
  startingCash: number;
  staminaMax: number;
  /** Stamina cost of assembling one bowl. */
  staminaPerBowl: number;
  /** Below this stamina, mistake chance ramps up. */
  staminaMistakeThreshold: number;
  /** Mistake chance at zero stamina (linear ramp from threshold). */
  mistakeChanceAtZero: number;
  /** Market price multipliers per grade. */
  gradeMultiplier: Record<Grade, number>;
  /** Quality contribution per grade, 0..1. */
  gradeQuality: Record<Grade, number>;
  /** Daily market fluctuation: price *= 1 +/- up to this fraction. */
  marketSwing: number;
  /** Customers/day at reputation 0 and at reputation 100. */
  customersAtRep0: number;
  customersAtRep100: number;
  /** Customer patience window in seconds. */
  patienceSeconds: number;
  /** Reputation gained for a perfect day, lost for a dire one. */
  reputationSwing: number;
  /** Satisfaction below which a bowl counts against reputation. */
  satisfactionFloor: number;
  /** Fixed daily operating cost (fuel, water, fees) by tier. */
  dailyCostByTier: number[];
}
