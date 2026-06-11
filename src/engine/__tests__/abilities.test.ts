import { marketPriceMultiplier, patienceMultiplier, qualityMultiplier } from '../abilities';

describe('character ability hooks', () => {
  it('Sang discounts the market at disposition 60+ once met', () => {
    expect(marketPriceMultiplier({}, [])).toBe(1);
    expect(marketPriceMultiplier({ supplier_sang: 60 }, [])).toBe(1);
    expect(marketPriceMultiplier({ supplier_sang: 59 }, ['supplier_sang'])).toBe(1);
    expect(marketPriceMultiplier({ supplier_sang: 60 }, ['supplier_sang'])).toBe(0.9);
  });

  it('Tuấn extends customer patience once hired', () => {
    expect(patienceMultiplier([])).toBe(1);
    expect(patienceMultiplier(['tuan_speedy'])).toBe(1.2);
  });

  it('secret broth and a happy Chef Bảo stack on quality', () => {
    expect(qualityMultiplier([], {}, [])).toBe(1);
    expect(qualityMultiplier(['secret_broth'], {}, [])).toBeCloseTo(1.1);
    expect(qualityMultiplier([], { chef_bao: 60 }, ['chef_bao'])).toBeCloseTo(1.2);
    expect(qualityMultiplier(['secret_broth'], { chef_bao: 60 }, ['chef_bao'])).toBeCloseTo(1.32);
    expect(qualityMultiplier([], { chef_bao: 30 }, ['chef_bao'])).toBe(1);
  });
});
