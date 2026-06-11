import { createRng, hashString } from './rng';
import type { EconomyConfig, Grade, IngredientDef, MarketEntry } from './types';

const GRADES: Grade[] = ['A', 'B', 'C'];

/**
 * Price of one ingredient at one grade on a given day.
 * Deterministic for (seed, day, ingredient): the market doesn't reroll on reload.
 */
export function dailyPrice(
  ingredient: IngredientDef,
  grade: Grade,
  day: number,
  seed: number,
  config: EconomyConfig
): number {
  const roll = createRng(seed ^ hashString(`${ingredient.id}:${day}`))();
  const swing = 1 + (roll * 2 - 1) * config.marketSwing;
  const raw = ingredient.basePrice * config.gradeMultiplier[grade] * swing;
  // Round to the nearest 500 dong like a real market stall would.
  return Math.max(500, Math.round(raw / 500) * 500);
}

export function generateMarket(
  ingredients: IngredientDef[],
  day: number,
  seed: number,
  config: EconomyConfig
): MarketEntry[] {
  return ingredients.map((ingredient) => {
    const prices = {} as Record<Grade, number>;
    for (const grade of GRADES) {
      prices[grade] = dailyPrice(ingredient, grade, day, seed, config);
    }
    return { ingredientId: ingredient.id, prices };
  });
}
