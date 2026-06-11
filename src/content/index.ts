/**
 * Typed accessors over the JSON content files. All game content lives in
 * /src/content as data; nothing here is hard-coded into components.
 */
import type { CharacterDef } from '../engine/characters';
import type { EmpireConfig } from '../engine/empire';
import type { GameEventDef } from '../engine/events';
import type { TierGate } from '../engine/progression';
import type { DishDef, EconomyConfig, IngredientDef } from '../engine/types';
import gameConfigJson from './gameConfig.json';
import ingredientsJson from './ingredients.json';
import dishesJson from './dishes.json';
import charactersJson from './characters.json';
import eventsJson from './events.json';
import tiersJson from './tiers.json';

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

export const characters: CharacterDef[] = charactersJson.characters as CharacterDef[];

export const charactersById: Record<string, CharacterDef> = Object.fromEntries(
  characters.map((c) => [c.id, c])
);

export const gameEvents: GameEventDef[] = eventsJson.events as GameEventDef[];

export const tierGates: TierGate[] = tiersJson.gates as TierGate[];

export const eventChancePerDay: number = tiersJson.eventChancePerDay;

export const empireConfig: EmpireConfig = tiersJson.empire as EmpireConfig;
