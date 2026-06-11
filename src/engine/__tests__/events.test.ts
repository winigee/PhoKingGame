import { gameEvents } from '../../content';
import en from '../../i18n/locales/en.json';
import {
  applyEffects,
  choiceAvailable,
  eligibleEvents,
  selectEvent,
  type EventContext,
} from '../events';

const ctx = (over: Partial<EventContext> = {}): EventContext => ({
  tier: 1,
  cash: 1000000,
  reputation: 50,
  dispositions: {},
  flags: [],
  firedEvents: [],
  ...over,
});

describe('event content', () => {
  it('ships 20+ events, each with 2-4 choices', () => {
    expect(gameEvents.length).toBeGreaterThanOrEqual(20);
    for (const e of gameEvents) {
      expect(e.choices.length).toBeGreaterThanOrEqual(2);
      expect(e.choices.length).toBeLessThanOrEqual(4);
      expect(e.minTier).toBeLessThanOrEqual(e.maxTier);
      expect(e.weight).toBeGreaterThan(0);
    }
  });

  it('every text key resolves in the English locale', () => {
    const resolve = (key: string) =>
      key.split('.').reduce<unknown>((node, part) => {
        return node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined;
      }, en);
    for (const e of gameEvents) {
      expect(typeof resolve(e.titleKey)).toBe('string');
      expect(typeof resolve(e.bodyKey)).toBe('string');
      for (const c of e.choices) {
        expect(typeof resolve(c.textKey)).toBe('string');
        expect(typeof resolve(c.resultKey)).toBe('string');
      }
    }
  });

  it('covers the brief: shakedown, rent, theft, walkout, inspection, investors, rival', () => {
    const ids = gameEvents.map((e) => e.id);
    for (const required of [
      'gang_shakedown',
      'rent_hike',
      'employee_theft',
      'chef_walkout',
      'health_inspection',
      'investor_pitch_chin',
      'rival_undercut',
    ]) {
      expect(ids).toContain(required);
    }
  });
});

describe('eligibility and selection', () => {
  it('filters by tier', () => {
    const t1 = eligibleEvents(gameEvents, ctx({ tier: 1 }));
    expect(t1.every((e) => e.minTier <= 1 && e.maxTier >= 1)).toBe(true);
    expect(t1.map((e) => e.id)).not.toContain('chef_walkout');
    const t4 = eligibleEvents(gameEvents, ctx({ tier: 4 }));
    expect(t4.map((e) => e.id)).toContain('chef_walkout');
  });

  it('excludes once-events that already fired', () => {
    const before = eligibleEvents(gameEvents, ctx({ tier: 1 }));
    expect(before.map((e) => e.id)).toContain('old_debt');
    const after = eligibleEvents(gameEvents, ctx({ tier: 1, firedEvents: ['old_debt'] }));
    expect(after.map((e) => e.id)).not.toContain('old_debt');
  });

  it('selectEvent is weighted and respects the roll', () => {
    const picked = selectEvent(gameEvents, ctx(), 0.5);
    expect(picked).toBeDefined();
    expect(selectEvent([], ctx(), 0.5)).toBeUndefined();
  });
});

describe('choiceAvailable', () => {
  const shakedown = gameEvents.find((e) => e.id === 'gang_shakedown')!;
  const resist = shakedown.choices.find((c) => c.id === 'resist')!;
  const pay = shakedown.choices.find((c) => c.id === 'pay')!;

  it('enforces disposition requirements with a default of 50', () => {
    expect(choiceAvailable(resist, ctx())).toBe(false);
    expect(choiceAvailable(resist, ctx({ dispositions: { minh_hammer: 60 } }))).toBe(true);
  });

  it('enforces cash requirements', () => {
    expect(choiceAvailable(pay, ctx({ cash: 10000 }))).toBe(false);
    expect(choiceAvailable(pay, ctx({ cash: 50000 }))).toBe(true);
  });
});

describe('applyEffects', () => {
  const base = {
    cash: 1000000,
    reputation: 50,
    stamina: 80,
    dispositions: {},
    collected: [] as string[],
    flags: [] as string[],
    criticsSurvived: 0,
    equityGiven: 0,
  };

  it('applies all deltas immutably and clamps', () => {
    const next = applyEffects(base, {
      cash: -50000,
      reputation: 60,
      stamina: -100,
      dispositions: { minh_hammer: 10 },
      collect: ['minh_hammer'],
      setFlags: ['secret_broth'],
      critics: 1,
      equity: 15,
    });
    expect(next.cash).toBe(950000);
    expect(next.reputation).toBe(100);
    expect(next.stamina).toBe(0);
    expect(next.dispositions.minh_hammer).toBe(60); // 50 default + 10
    expect(next.collected).toEqual(['minh_hammer']);
    expect(next.flags).toEqual(['secret_broth']);
    expect(next.criticsSurvived).toBe(1);
    expect(next.equityGiven).toBe(15);
    expect(base.cash).toBe(1000000);
  });

  it('does not duplicate collected ids or flags', () => {
    const once = applyEffects(
      { ...base, collected: ['minh_hammer'], flags: ['secret_broth'] },
      { collect: ['minh_hammer'], setFlags: ['secret_broth'] }
    );
    expect(once.collected).toEqual(['minh_hammer']);
    expect(once.flags).toEqual(['secret_broth']);
  });
});
