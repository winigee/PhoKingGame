import { create } from 'zustand';
import {
  characters,
  dishes,
  empireConfig,
  eventChancePerDay,
  gameConfig,
  gameEvents,
  ingredients,
  ingredientsById,
  tierGates,
} from '../content';
import { marketPriceMultiplier, qualityMultiplier } from '../engine/abilities';
import { unlockedByTier } from '../engine/characters';
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
import {
  brandGrowth,
  emptyEmpire,
  factoryCost,
  marketCost,
  prestigeBonusPercent,
  quarterProfit,
  type EmpireState,
} from '../engine/empire';
import {
  applyEffects,
  choiceAvailable,
  selectEvent,
  type EventContext,
  type GameEventDef,
} from '../engine/events';
import { addLot, consumeServing, freshness, removeSpoiled } from '../engine/inventory';
import { generateMarket } from '../engine/market';
import { createRng, hashString, type Rng } from '../engine/rng';
import { earnedMichelin, MICHELIN_FLAG, nextTierGate } from '../engine/progression';
import type { DayLedger, Grade, InventoryLot, MarketEntry, ServedBowl } from '../engine/types';
import { getPersistence } from './saveBridge';
import type { SaveGame } from './saveTypes';

export type GamePhase = 'TITLE' | 'MORNING' | 'SERVICE' | 'EVENT' | 'EVENING' | 'EMPIRE';

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
  spoiledToday: string[];
  customersToday: number;
  lastRepDelta: number;
  collected: string[];
  cardViewerOpen: boolean;

  /** Relationships: disposition 0..100 by character id (default 50). */
  dispositions: Record<string, number>;
  flags: string[];
  firedEvents: string[];
  criticsSurvived: number;
  equityGiven: number;
  /** Tonight's event, when phase is EVENT. */
  pendingEventId: string | null;
  /** Result text key after a choice; UI shows it before moving on. */
  lastChoiceResultKey: string | null;
  /** Set when a tier-up happened overnight, for the morning banner. */
  tierUpTo: number | null;
  empire: EmpireState;
  prestigeBonus: number;
  lastQuarterProfit: number;

  setCardViewerOpen(open: boolean): void;
  newGame(seed?: number, prestigeBonus?: number): Promise<void>;
  continueGame(): Promise<boolean>;
  buyBatch(ingredientId: string, grade: Grade): boolean;
  openForService(): void;
  serveBowl(picks: { ingredientId: string; grade: Grade }[], speed: number): ServeResult;
  customerWalked(): void;
  closeService(): void;
  chooseEventOption(choiceId: string): void;
  dismissEvent(): void;
  sleep(): Promise<void>;
  buildFactory(): void;
  enterMarket(): void;
  runQuarter(): Promise<void>;
  prestigeReset(): Promise<void>;
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

const FRESH_RUN = {
  dispositions: {} as Record<string, number>,
  flags: [] as string[],
  firedEvents: [] as string[],
  criticsSurvived: 0,
  equityGiven: 0,
  pendingEventId: null,
  lastChoiceResultKey: null,
  tierUpTo: null,
  empire: emptyEmpire(),
  lastQuarterProfit: 0,
};

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
  collected: [],
  cardViewerOpen: false,
  prestigeBonus: 0,
  ...FRESH_RUN,

  setCardViewerOpen(open) {
    set({ cardViewerOpen: open });
  },

  async newGame(seed = Date.now() & 0xffffffff, prestigeBonus = 0) {
    const base = {
      seed,
      day: 1,
      tier: 1,
      cash: Math.round(gameConfig.startingCash * (1 + prestigeBonus / 100)),
      reputation: Math.min(100, gameConfig.startingReputation + Math.floor(prestigeBonus / 2)),
      stamina: gameConfig.staminaMax,
      lots: [] as InventoryLot[],
      lastRepDelta: 0,
      collected: collectForTier([], 1),
      prestigeBonus,
      ...FRESH_RUN,
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
      collected: collectForTier(save.collected ?? [], save.tier),
      ...FRESH_RUN,
      dispositions: save.dispositions ?? {},
      flags: save.flags ?? [],
      firedEvents: save.firedEvents ?? [],
      criticsSurvived: save.criticsSurvived ?? 0,
      equityGiven: save.equityGiven ?? 0,
      empire: save.empire ?? emptyEmpire(),
      prestigeBonus: save.prestigeBonus ?? 0,
    };
    set({ ...base, phase: save.tier >= 6 ? 'EMPIRE' : 'MORNING', ...startMorning(base) });
    return true;
  },

  buyBatch(ingredientId, grade) {
    const state = get();
    const entry = state.market.find((m) => m.ingredientId === ingredientId);
    if (!entry || state.phase !== 'MORNING') return false;
    const price = Math.round(
      entry.prices[grade] * marketPriceMultiplier(state.dispositions, state.collected)
    );
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
      tierUpTo: null,
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
    const quality = Math.min(
      1,
      bowlQuality(components, gameConfig) *
        qualityMultiplier(state.flags, state.dispositions, state.collected)
    );
    const bowl: ServedBowl = { dishId: dish.id, quality, speed, mistake };
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
    const state = get();
    if (dayRng() < eventChancePerDay) {
      const event = selectEvent(gameEvents, eventContext(state), dayRng());
      if (event) {
        set({ phase: 'EVENT', pendingEventId: event.id, lastChoiceResultKey: null });
        return;
      }
    }
    set({ phase: 'EVENING' });
  },

  chooseEventOption(choiceId) {
    const state = get();
    const event = gameEvents.find((e) => e.id === state.pendingEventId);
    const choice = event?.choices.find((c) => c.id === choiceId);
    if (!event || !choice || !choiceAvailable(choice, eventContext(state))) return;
    const applied = applyEffects(
      {
        cash: state.cash,
        reputation: state.reputation,
        stamina: state.stamina,
        dispositions: state.dispositions,
        collected: state.collected,
        flags: state.flags,
        criticsSurvived: state.criticsSurvived,
        equityGiven: state.equityGiven,
      },
      choice.effects
    );
    set({
      ...applied,
      firedEvents: state.firedEvents.includes(event.id)
        ? state.firedEvents
        : [...state.firedEvents, event.id],
      lastChoiceResultKey: choice.resultKey,
    });
  },

  dismissEvent() {
    set({ phase: 'EVENING', pendingEventId: null, lastChoiceResultKey: null });
  },

  async sleep() {
    const state = get();
    const newRep = reputationAfterDay(state.reputation, state.ledger, gameConfig);
    let tier = state.tier;
    let flags = state.flags;
    let cash = state.cash + eveningNet(state.ledger, state.tier, gameConfig);

    const progression = {
      tier,
      cash,
      reputation: newRep,
      dispositions: state.dispositions,
      collected: state.collected,
      criticsSurvived: state.criticsSurvived,
      flags,
    };
    if (earnedMichelin(progression)) flags = [...flags, MICHELIN_FLAG];
    const gate = nextTierGate({ ...progression, flags }, tierGates, characters);
    if (gate) tier = gate.tier;

    const base = {
      seed: state.seed,
      day: state.day + 1,
      tier,
      cash,
      reputation: newRep,
      stamina: gameConfig.staminaMax,
      lots: state.lots,
      lastRepDelta: newRep - state.reputation,
      collected: collectForTier(state.collected, tier),
      flags,
      tierUpTo: tier > state.tier ? tier : null,
      pendingEventId: null,
      lastChoiceResultKey: null,
    };
    set({ ...base, phase: tier >= 6 ? 'EMPIRE' : 'MORNING', ...startMorning(base) });
    await getPersistence().save(snapshot(get()));
  },

  buildFactory() {
    const { cash, empire } = get();
    const cost = factoryCost(empire.factories, empireConfig);
    if (cash < cost) return;
    set({ cash: cash - cost, empire: { ...empire, factories: empire.factories + 1 } });
  },

  enterMarket() {
    const { cash, empire } = get();
    const cost = marketCost(empire.markets, empireConfig);
    if (cash < cost) return;
    set({ cash: cash - cost, empire: { ...empire, markets: empire.markets + 1 } });
  },

  async runQuarter() {
    const state = get();
    const profit = quarterProfit(state.empire, empireConfig);
    set({
      cash: state.cash + profit,
      day: state.day + 90,
      lastQuarterProfit: profit,
      empire: { ...state.empire, brandValue: state.empire.brandValue + brandGrowth(state.empire) },
    });
    await getPersistence().save(snapshot(get()));
  },

  async prestigeReset() {
    const state = get();
    const bonus = state.prestigeBonus + prestigeBonusPercent(state.empire, state.equityGiven);
    await get().newGame(Date.now() & 0xffffffff, bonus);
  },
}));

function eventContext(state: GameState): EventContext {
  return {
    tier: state.tier,
    cash: state.cash,
    reputation: state.reputation,
    dispositions: state.dispositions,
    flags: state.flags,
    firedEvents: state.firedEvents,
  };
}

export function pendingEvent(state: GameState): GameEventDef | undefined {
  return gameEvents.find((e) => e.id === state.pendingEventId);
}

/** Tier-gated characters join the collection automatically; event unlocks come from event effects. */
function collectForTier(collected: string[], tier: number): string[] {
  const ids = new Set(collected);
  for (const c of unlockedByTier(characters, tier)) ids.add(c.id);
  return [...ids];
}

function snapshot(state: GameState): SaveGame {
  return {
    version: 1,
    seed: state.seed,
    day: state.day,
    tier: state.tier,
    cash: state.cash,
    reputation: state.reputation,
    lots: state.lots,
    collected: state.collected,
    dispositions: state.dispositions,
    flags: state.flags,
    firedEvents: state.firedEvents,
    criticsSurvived: state.criticsSurvived,
    equityGiven: state.equityGiven,
    empire: state.empire,
    prestigeBonus: state.prestigeBonus,
  };
}
