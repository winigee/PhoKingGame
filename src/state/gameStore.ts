import { create } from 'zustand';
import { dishes, gameConfig, ingredients, ingredientsById } from '../content';
import {
  bowlQuality,
  bowlRevenue,
  customersForDay,
  emptyLedger,
  eveningNet,
  mistakeChance,
  reputationAfterDay,
  satisfaction,
} from '../engine/economy';
import { addLot, consumeServing, freshness, removeSpoiled } from '../engine/inventory';
import { generateMarket } from '../engine/market';
import { createRng, hashString, type Rng } from '../engine/rng';
import type { DayLedger, Grade, InventoryLot, MarketEntry, ServedBowl } from '../engine/types';
import { getPersistence } from './saveBridge';
import type { SaveGame } from './saveTypes';

export type GamePhase = 'TITLE' | 'MORNING' | 'SERVICE' | 'EVENING';

export interface ServeResult {
  satisfaction: number;
  revenue: number;
  mistake: boolean;
}

export interface GameState {
  phase: GamePhase;
  seed: number;
  day: number;
  tier: number;
  cash: number;
  reputation: number;
  stamina: number;
  lots: InventoryLot[];
  market: MarketEntry[];
  ledger: DayLedger;
  /** Ingredient ids binned this morning, for the market banner. */
  spoiledToday: string[];
  /** Customers expected today; fixed when service opens. */
  customersToday: number;
  /** Reputation delta of the last completed day, shown at evening. */
  lastRepDelta: number;

  newGame(seed?: number): Promise<void>;
  continueGame(): Promise<boolean>;
  buyBatch(ingredientId: string, grade: Grade): boolean;
  openForService(): void;
  serveBowl(picks: { ingredientId: string; grade: Grade }[], speed: number): ServeResult;
  customerWalked(): void;
  closeService(): void;
  sleep(): Promise<void>;
}

/** Day-scoped RNG, recreated whenever (seed, day) changes. Not serialised. */
let dayRng: Rng = createRng(0);

function startMorning(
  state: Pick<GameState, 'seed' | 'day' | 'lots'>
): Pick<GameState, 'market' | 'lots' | 'spoiledToday' | 'ledger' | 'customersToday'> {
  dayRng = createRng(state.seed ^ hashString(`day:${state.day}`));
  const { fresh, spoiled } = removeSpoiled(state.lots, state.day, ingredientsById);
  return {
    market: generateMarket(ingredients, state.day, state.seed, gameConfig),
    lots: fresh,
    spoiledToday: [...new Set(spoiled.map((l) => l.ingredientId))],
    ledger: emptyLedger(),
    customersToday: 0,
  };
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'TITLE',
  seed: 0,
  day: 1,
  tier: 1,
  cash: 0,
  reputation: 0,
  stamina: gameConfig.staminaMax,
  lots: [],
  market: [],
  ledger: emptyLedger(),
  spoiledToday: [],
  customersToday: 0,
  lastRepDelta: 0,

  async newGame(seed = Date.now() & 0xffffffff) {
    const base = {
      seed,
      day: 1,
      tier: 1,
      cash: gameConfig.startingCash,
      reputation: gameConfig.startingReputation,
      stamina: gameConfig.staminaMax,
      lots: [] as InventoryLot[],
      lastRepDelta: 0,
    };
    set({ ...base, phase: 'MORNING', ...startMorning(base) });
    await getPersistence().save(snapshot(get()));
  },

  async continueGame() {
    const save = await getPersistence().load();
    if (!save) return false;
    const base = {
      seed: save.seed,
      day: save.day,
      tier: save.tier,
      cash: save.cash,
      reputation: save.reputation,
      stamina: gameConfig.staminaMax,
      lots: save.lots,
      lastRepDelta: 0,
    };
    set({ ...base, phase: 'MORNING', ...startMorning(base) });
    return true;
  },

  buyBatch(ingredientId, grade) {
    const state = get();
    const entry = state.market.find((m) => m.ingredientId === ingredientId);
    if (!entry || state.phase !== 'MORNING') return false;
    const price = entry.prices[grade];
    if (state.cash < price) return false;
    set({
      cash: state.cash - price,
      ledger: { ...state.ledger, marketSpend: state.ledger.marketSpend + price },
      lots: addLot(state.lots, {
        ingredientId,
        grade,
        servings: gameConfig.servingsPerBatch,
        purchasedOnDay: state.day,
      }),
    });
    return true;
  },

  openForService() {
    const state = get();
    set({
      phase: 'SERVICE',
      customersToday: customersForDay(state.reputation, dayRng(), gameConfig),
    });
  },

  serveBowl(picks, speed) {
    const state = get();
    const mistake = dayRng() < mistakeChance(state.stamina, gameConfig);
    let lots = state.lots;
    const components: { grade: Grade; freshness: number }[] = [];
    for (const pick of picks) {
      const result = consumeServing(lots, pick.ingredientId, pick.grade);
      lots = result.lots;
      if (result.consumed) {
        components.push({
          grade: result.consumed.grade,
          freshness: freshness(result.consumed, state.day, ingredientsById[pick.ingredientId]),
        });
      }
    }
    const dish = dishes[0];
    const bowl: ServedBowl = {
      dishId: dish.id,
      quality: bowlQuality(components, gameConfig),
      speed,
      mistake,
    };
    const sat = satisfaction(bowl);
    const revenue = bowlRevenue(dish.basePrice, sat);
    set({
      lots,
      stamina: Math.max(0, state.stamina - gameConfig.staminaPerBowl),
      ledger: {
        ...state.ledger,
        served: state.ledger.served + 1,
        takings: state.ledger.takings + revenue,
        satisfactionTotal: state.ledger.satisfactionTotal + sat,
      },
    });
    return { satisfaction: sat, revenue, mistake };
  },

  customerWalked() {
    const ledger = get().ledger;
    set({ ledger: { ...ledger, walkedAway: ledger.walkedAway + 1 } });
  },

  closeService() {
    set({ phase: 'EVENING' });
  },

  async sleep() {
    const state = get();
    const newRep = reputationAfterDay(state.reputation, state.ledger, gameConfig);
    const base = {
      seed: state.seed,
      day: state.day + 1,
      tier: state.tier,
      cash: state.cash + eveningNet(state.ledger, state.tier, gameConfig),
      reputation: newRep,
      stamina: gameConfig.staminaMax,
      lots: state.lots,
      lastRepDelta: newRep - state.reputation,
    };
    set({ ...base, phase: 'MORNING', ...startMorning(base) });
    await getPersistence().save(snapshot(get()));
  },
}));

function snapshot(state: GameState): SaveGame {
  return {
    version: 1,
    seed: state.seed,
    day: state.day,
    tier: state.tier,
    cash: state.cash,
    reputation: state.reputation,
    lots: state.lots,
  };
}
