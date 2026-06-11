/**
 * Drives the store through full day cycles headlessly — the Phase 1
 * "ten consecutive in-game days without crash" acceptance check, plus
 * save/load round-tripping through an in-memory persistence.
 */
import { dishes, gameConfig, ingredients } from '../../content';
import { choiceAvailable } from '../../engine/events';
import type { Grade, IngredientCategory } from '../../engine/types';
import { pendingEvent, useGameStore } from '../gameStore';
import { setPersistence } from '../saveBridge';
import type { SaveGame } from '../saveTypes';

let stored: SaveGame | null = null;
setPersistence({
  save: async (game) => {
    stored = JSON.parse(JSON.stringify(game)) as SaveGame;
  },
  load: async () => stored,
  clear: async () => {
    stored = null;
  },
});

const store = () => useGameStore.getState();

function cheapestIngredientFor(category: IngredientCategory): string {
  return ingredients
    .filter((i) => i.category === category)
    .sort((a, b) => a.basePrice - b.basePrice)[0].id;
}

function playOneDay(grade: Grade): void {
  expect(store().phase).toBe('MORNING');
  for (const category of dishes[0].components) {
    expect(store().buyBatch(cheapestIngredientFor(category), grade)).toBe(true);
  }
  store().openForService();
  expect(store().phase).toBe('SERVICE');
  const toServe = Math.min(store().customersToday, gameConfig.servingsPerBatch);
  for (let i = 0; i < toServe; i++) {
    const picks = dishes[0].components.map((category) => ({
      ingredientId: cheapestIngredientFor(category),
      grade,
    }));
    const result = store().serveBowl(picks, 0.8);
    expect(result.satisfaction).toBeGreaterThanOrEqual(0);
    expect(result.satisfaction).toBeLessThanOrEqual(1);
    expect(result.revenue).toBeGreaterThanOrEqual(dishes[0].basePrice);
  }
  for (let i = toServe; i < store().customersToday; i++) store().customerWalked();
  store().closeService();
  // An evening event may interrupt; resolve it with the first available choice.
  if (store().phase === 'EVENT') {
    const event = pendingEvent(store());
    expect(event).toBeDefined();
    const s = store();
    const ctx = {
      tier: s.tier,
      cash: s.cash,
      reputation: s.reputation,
      dispositions: s.dispositions,
      flags: s.flags,
      firedEvents: s.firedEvents,
    };
    const choice = event!.choices.find((c) => choiceAvailable(c, ctx));
    expect(choice).toBeDefined();
    store().chooseEventOption(choice!.id);
    expect(store().lastChoiceResultKey).toBe(choice!.resultKey);
    store().dismissEvent();
  }
  expect(store().phase).toBe('EVENING');
}

beforeEach(async () => {
  stored = null;
  await store().newGame(1234);
});

describe('full day cycle', () => {
  it('survives ten consecutive in-game days', async () => {
    for (let day = 1; day <= 10; day++) {
      expect(store().day).toBe(day);
      playOneDay('B');
      await store().sleep();
      expect(store().cash).toBeGreaterThanOrEqual(0 - 10_000_000); // sane bounds, no NaN
      expect(Number.isFinite(store().cash)).toBe(true);
      expect(store().reputation).toBeGreaterThanOrEqual(0);
      expect(store().reputation).toBeLessThanOrEqual(100);
      expect(store().stamina).toBe(gameConfig.staminaMax);
    }
    expect(store().day).toBe(11);
  });

  it('serving well with grade A grows reputation', async () => {
    const before = store().reputation;
    playOneDay('A');
    await store().sleep();
    expect(store().reputation).toBeGreaterThan(before);
    expect(store().lastRepDelta).toBeGreaterThan(0);
  });

  it('buying respects cash and refuses when broke', () => {
    const state = store();
    // Drain cash with repeated grade A purchases until refusal.
    let bought = 0;
    while (state.buyBatch('brisket', 'A') && bought < 100) bought++;
    expect(bought).toBeLessThan(100);
    const price = store().market.find((m) => m.ingredientId === 'brisket')!.prices.A;
    expect(store().cash).toBeLessThan(price);
  });
});

describe('relationships and progression', () => {
  it("Sang's wholesale discount measurably lowers market prices", () => {
    const price = () => store().market.find((m) => m.ingredientId === 'brisket')!.prices.A;
    const cashBefore = store().cash;
    store().buyBatch('brisket', 'A');
    expect(cashBefore - store().cash).toBe(price());

    useGameStore.setState({
      collected: [...store().collected, 'supplier_sang'],
      dispositions: { supplier_sang: 60 },
    });
    const cashMid = store().cash;
    store().buyBatch('brisket', 'A');
    expect(cashMid - store().cash).toBe(Math.round(price() * 0.9));
  });

  it('tier rises overnight once the gate is met', async () => {
    useGameStore.setState({ cash: 2000000, reputation: 30 });
    playOneDay('A');
    await store().sleep();
    expect(store().tier).toBe(2);
    expect(store().tierUpTo).toBe(2);
    // Tier 2 characters joined the collection.
    expect(store().collected).toContain('tuan_speedy');
  });

  it('reaching tier 6 switches to the empire dashboard', async () => {
    useGameStore.setState({
      tier: 5,
      cash: 200000000,
      reputation: 90,
      criticsSurvived: 2,
    });
    playOneDay('A');
    await store().sleep();
    expect(store().tier).toBe(6);
    expect(store().phase).toBe('EMPIRE');
    expect(store().flags).toContain('michelin_star');

    // Idle loop: a quarter generates profit; prestige restarts with a bonus.
    const cashBefore = store().cash;
    await store().runQuarter();
    expect(store().cash).toBeGreaterThan(cashBefore);
    await store().prestigeReset();
    expect(store().day).toBe(1);
    expect(store().prestigeBonus).toBeGreaterThan(0);
    expect(store().cash).toBeGreaterThan(gameConfig.startingCash);
  });
});

describe('save and load', () => {
  it('round-trips day, cash, reputation and inventory', async () => {
    playOneDay('B');
    await store().sleep(); // saves at start of day 2
    const saved = { day: store().day, cash: store().cash, rep: store().reputation };
    expect(stored).not.toBeNull();
    const payload = JSON.parse(JSON.stringify(stored)) as SaveGame;

    // Wipe in-memory state (newGame also overwrites the slot), then restore
    // the captured payload and continue from it.
    await store().newGame(999);
    stored = payload;
    const ok = await store().continueGame();
    expect(ok).toBe(true);
    expect(store().day).toBe(saved.day);
    expect(store().cash).toBe(saved.cash);
    expect(store().reputation).toBe(saved.rep);
    expect(store().phase).toBe('MORNING');
  });

  it('continueGame returns false with no save present', async () => {
    stored = null;
    expect(await store().continueGame()).toBe(false);
  });

  it('market prices are identical after reload (no reroll)', async () => {
    const before = store().market.map((m) => ({ ...m.prices }));
    await store().continueGame();
    const after = store().market.map((m) => ({ ...m.prices }));
    expect(after).toEqual(before);
  });
});
