/**
 * Typed accessors over the JSON content files. All game content lives in
 * /src/content as data; nothing here is hard-coded into components.
 */
import type { DishDef, EconomyConfig, IngredientDef } from '../engine/types';
import gameConfigJson from './gameConfig.json';
import ingredientsJson from './ingredients.json';
import dishesJson from './dishes.json';

export interface GameConfig extends EconomyConfig {
  startingReputation: number;
  servingsPerBatch: number;
}

export const gameConfig: GameConfig = gameConfigJson as GameConfig;

export const ingredients: IngredientDef[] = ingredientsJson.ingredients as IngredientDef[];

export const ingredientsById: Record<string, IngredientDef> = Object.fromEntries(
  ingredients.map((i) => [i.id, i])
);

export const dishes: DishDef[] = dishesJson.dishes as DishDef[];
