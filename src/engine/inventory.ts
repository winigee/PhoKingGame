import type { Grade, IngredientDef, InventoryLot } from './types';

/** Lots whose shelf life has lapsed by `day` are spoiled and binned. */
export function removeSpoiled(
  lots: InventoryLot[],
  day: number,
  ingredientsById: Record<string, IngredientDef>
): { fresh: InventoryLot[]; spoiled: InventoryLot[] } {
  const fresh: InventoryLot[] = [];
  const spoiled: InventoryLot[] = [];
  for (const lot of lots) {
    const def = ingredientsById[lot.ingredientId];
    const life = def ? def.shelfLife[lot.grade] : 0;
    if (def && day < lot.purchasedOnDay + life && lot.servings > 0) {
      fresh.push(lot);
    } else {
      spoiled.push(lot);
    }
  }
  return { fresh, spoiled };
}

/** Days of shelf life remaining for a lot on `day` (0 = spoils tonight). */
export function daysLeft(lot: InventoryLot, day: number, def: IngredientDef): number {
  return lot.purchasedOnDay + def.shelfLife[lot.grade] - 1 - day;
}

/** Freshness 0..1: 1 on purchase day, decaying linearly to a floor on its last usable day. */
export function freshness(lot: InventoryLot, day: number, def: IngredientDef): number {
  const life = def.shelfLife[lot.grade];
  if (life <= 1) return day === lot.purchasedOnDay ? 1 : 0;
  const age = day - lot.purchasedOnDay;
  return Math.max(0, Math.min(1, 1 - age / life));
}

export function addLot(lots: InventoryLot[], lot: InventoryLot): InventoryLot[] {
  const existing = lots.find(
    (l) =>
      l.ingredientId === lot.ingredientId &&
      l.grade === lot.grade &&
      l.purchasedOnDay === lot.purchasedOnDay
  );
  if (existing) {
    return lots.map((l) => (l === existing ? { ...l, servings: l.servings + lot.servings } : l));
  }
  return [...lots, lot];
}

/**
 * Consume one serving of a category-matching ingredient, oldest lot first
 * (a street cook clears yesterday's stock before today's).
 */
export function consumeServing(
  lots: InventoryLot[],
  ingredientId: string,
  grade: Grade
): { lots: InventoryLot[]; consumed: InventoryLot | undefined } {
  const candidates = lots
    .filter((l) => l.ingredientId === ingredientId && l.grade === grade && l.servings > 0)
    .sort((a, b) => a.purchasedOnDay - b.purchasedOnDay);
  const target = candidates[0];
  if (!target) return { lots, consumed: undefined };
  const next = lots
    .map((l) => (l === target ? { ...l, servings: l.servings - 1 } : l))
    .filter((l) => l.servings > 0);
  return { lots: next, consumed: target };
}

export function totalServings(lots: InventoryLot[], ingredientId: string): number {
  return lots
    .filter((l) => l.ingredientId === ingredientId)
    .reduce((sum, l) => sum + l.servings, 0);
}
