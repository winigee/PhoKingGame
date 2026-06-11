import { empireConfig } from '../../content';
import {
  brandGrowth,
  emptyEmpire,
  factoryCost,
  marketCost,
  prestigeBonusPercent,
  quarterProfit,
} from '../empire';

describe('empire economy', () => {
  it('costs escalate geometrically', () => {
    expect(factoryCost(1, empireConfig)).toBeLessThan(factoryCost(2, empireConfig));
    expect(marketCost(1, empireConfig)).toBeLessThan(marketCost(2, empireConfig));
  });

  it('profit scales with factories, markets and brand', () => {
    const base = emptyEmpire();
    const bigger = { factories: 3, markets: 2, brandValue: 50 };
    expect(quarterProfit(bigger, empireConfig)).toBeGreaterThan(quarterProfit(base, empireConfig));
    expect(quarterProfit(base, empireConfig)).toBeGreaterThan(0);
  });

  it('brand grows with reach', () => {
    expect(brandGrowth({ factories: 3, markets: 2, brandValue: 0 })).toBe(5);
  });

  it('prestige bonus rewards brand and punishes equity given away', () => {
    const empire = { factories: 5, markets: 4, brandValue: 200 };
    const clean = prestigeBonusPercent(empire, 0);
    const diluted = prestigeBonusPercent(empire, 40);
    expect(clean).toBe(20);
    expect(diluted).toBe(12);
    expect(prestigeBonusPercent(emptyEmpire(), 99)).toBeGreaterThanOrEqual(1);
  });
});
