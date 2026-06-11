import { gameConfig } from '../../content';
import {
  bowlQuality,
  bowlRevenue,
  customersForDay,
  emptyLedger,
  eveningNet,
  mistakeChance,
  reputationAfterDay,
  satisfaction,
} from '../economy';

describe('bowlQuality', () => {
  it('rewards grade A fresh ingredients', () => {
    const fresh = [
      { grade: 'A' as const, freshness: 1 },
      { grade: 'A' as const, freshness: 1 },
    ];
    expect(bowlQuality(fresh, gameConfig)).toBe(1);
  });

  it('punishes grade C and staleness, never below 0', () => {
    const stale = [{ grade: 'C' as const, freshness: 0 }];
    const q = bowlQuality(stale, gameConfig);
    expect(q).toBeCloseTo(gameConfig.gradeQuality.C * 0.6);
    expect(bowlQuality([], gameConfig)).toBe(0);
  });
});

describe('satisfaction and revenue', () => {
  it('weights quality over speed and caps at 1', () => {
    const slowGood = satisfaction({ dishId: 'd', quality: 1, speed: 0, mistake: false });
    const fastBad = satisfaction({ dishId: 'd', quality: 0, speed: 1, mistake: false });
    expect(slowGood).toBeGreaterThan(fastBad);
    expect(satisfaction({ dishId: 'd', quality: 1, speed: 1, mistake: false })).toBe(1);
  });

  it('mistakes cost a flat penalty, floored at 0', () => {
    const clean = satisfaction({ dishId: 'd', quality: 0.8, speed: 0.5, mistake: false });
    const fumbled = satisfaction({ dishId: 'd', quality: 0.8, speed: 0.5, mistake: true });
    expect(clean - fumbled).toBeCloseTo(0.25);
    expect(satisfaction({ dishId: 'd', quality: 0, speed: 0, mistake: true })).toBe(0);
  });

  it('tips only above the 0.6 satisfaction line, up to 30%', () => {
    expect(bowlRevenue(35000, 0.5)).toBe(35000);
    expect(bowlRevenue(35000, 0.6)).toBe(35000);
    expect(bowlRevenue(35000, 1)).toBe(45500);
  });
});

describe('mistakeChance', () => {
  it('is zero above the threshold and ramps to the configured max', () => {
    expect(mistakeChance(gameConfig.staminaMistakeThreshold, gameConfig)).toBe(0);
    expect(mistakeChance(100, gameConfig)).toBe(0);
    expect(mistakeChance(0, gameConfig)).toBe(gameConfig.mistakeChanceAtZero);
    const mid = mistakeChance(gameConfig.staminaMistakeThreshold / 2, gameConfig);
    expect(mid).toBeCloseTo(gameConfig.mistakeChanceAtZero / 2);
  });
});

describe('customersForDay', () => {
  it('scales with reputation', () => {
    const low = customersForDay(0, 0.5, gameConfig);
    const high = customersForDay(100, 0.5, gameConfig);
    expect(low).toBe(gameConfig.customersAtRep0);
    expect(high).toBe(gameConfig.customersAtRep100);
    expect(customersForDay(0, 0, gameConfig)).toBeGreaterThanOrEqual(1);
  });
});

describe('reputationAfterDay', () => {
  it('gains on a great day, bleeds on a dire one, clamps to 0..100', () => {
    const great = { ...emptyLedger(), served: 10, satisfactionTotal: 9.5 };
    expect(reputationAfterDay(50, great, gameConfig)).toBeGreaterThan(50);
    const dire = { ...emptyLedger(), served: 5, satisfactionTotal: 0.5, walkedAway: 5 };
    expect(reputationAfterDay(50, dire, gameConfig)).toBeLessThan(50);
    expect(reputationAfterDay(0, dire, gameConfig)).toBe(0);
    expect(reputationAfterDay(100, great, gameConfig)).toBe(100);
  });

  it('is unchanged when nobody came', () => {
    expect(reputationAfterDay(40, emptyLedger(), gameConfig)).toBe(40);
  });
});

describe('eveningNet', () => {
  it('subtracts the tier daily cost from takings', () => {
    const ledger = { ...emptyLedger(), takings: 300000 };
    expect(eveningNet(ledger, 1, gameConfig)).toBe(300000 - gameConfig.dailyCostByTier[0]);
    expect(eveningNet(ledger, 99, gameConfig)).toBe(
      300000 - gameConfig.dailyCostByTier[gameConfig.dailyCostByTier.length - 1]
    );
  });
});
