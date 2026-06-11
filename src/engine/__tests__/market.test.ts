import { gameConfig, ingredients } from '../../content';
import { dailyPrice, generateMarket } from '../market';

const bones = ingredients.find((i) => i.id === 'beef_bones')!;

describe('market prices', () => {
  it('is deterministic for the same seed and day', () => {
    const a = dailyPrice(bones, 'A', 5, 42, gameConfig);
    const b = dailyPrice(bones, 'A', 5, 42, gameConfig);
    expect(a).toBe(b);
  });

  it('fluctuates across days within the configured swing', () => {
    const prices = new Set<number>();
    for (let day = 1; day <= 30; day++) {
      const p = dailyPrice(bones, 'B', day, 42, gameConfig);
      prices.add(p);
      const base = bones.basePrice * gameConfig.gradeMultiplier.B;
      expect(p).toBeGreaterThanOrEqual(base * (1 - gameConfig.marketSwing) - 500);
      expect(p).toBeLessThanOrEqual(base * (1 + gameConfig.marketSwing) + 500);
    }
    expect(prices.size).toBeGreaterThan(5);
  });

  it('prices grade A above grade C on the same day', () => {
    for (let day = 1; day <= 10; day++) {
      const a = dailyPrice(bones, 'A', day, 7, gameConfig);
      const c = dailyPrice(bones, 'C', day, 7, gameConfig);
      expect(a).toBeGreaterThan(c);
    }
  });

  it('rounds to 500 dong and covers every ingredient', () => {
    const market = generateMarket(ingredients, 3, 99, gameConfig);
    expect(market).toHaveLength(ingredients.length);
    for (const entry of market) {
      for (const grade of ['A', 'B', 'C'] as const) {
        expect(entry.prices[grade] % 500).toBe(0);
        expect(entry.prices[grade]).toBeGreaterThan(0);
      }
    }
  });
});
