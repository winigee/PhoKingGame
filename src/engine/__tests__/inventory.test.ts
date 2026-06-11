import { ingredientsById } from '../../content';
import { addLot, consumeServing, freshness, removeSpoiled, totalServings } from '../inventory';
import type { InventoryLot } from '../types';

const lot = (over: Partial<InventoryLot>): InventoryLot => ({
  ingredientId: 'beef_bones',
  grade: 'B',
  servings: 10,
  purchasedOnDay: 1,
  ...over,
});

describe('spoilage', () => {
  it('keeps lots within shelf life and bins the rest', () => {
    // beef_bones: A=3 days, B=2, C=1
    const lots = [
      lot({ grade: 'A', purchasedOnDay: 1 }),
      lot({ grade: 'B', purchasedOnDay: 1 }),
      lot({ grade: 'C', purchasedOnDay: 1 }),
    ];
    const day3 = removeSpoiled(lots, 3, ingredientsById);
    expect(day3.fresh.map((l) => l.grade)).toEqual(['A']);
    expect(day3.spoiled).toHaveLength(2);
    const day4 = removeSpoiled(lots, 4, ingredientsById);
    expect(day4.fresh).toHaveLength(0);
  });

  it('drops empty and unknown-ingredient lots', () => {
    const lots = [lot({ servings: 0 }), lot({ ingredientId: 'mystery_meat' })];
    expect(removeSpoiled(lots, 1, ingredientsById).fresh).toHaveLength(0);
  });
});

describe('freshness', () => {
  it('decays from 1 toward 0 over shelf life', () => {
    const a = lot({ grade: 'A', purchasedOnDay: 1 }); // 3-day life
    const def = ingredientsById.beef_bones;
    expect(freshness(a, 1, def)).toBe(1);
    expect(freshness(a, 2, def)).toBeCloseTo(2 / 3);
    expect(freshness(a, 3, def)).toBeCloseTo(1 / 3);
  });
});

describe('lot stacking and consumption', () => {
  it('merges same-day same-grade purchases', () => {
    const lots = addLot([lot({})], lot({}));
    expect(lots).toHaveLength(1);
    expect(lots[0].servings).toBe(20);
  });

  it('consumes oldest lot first and removes empties', () => {
    let lots = [lot({ purchasedOnDay: 2, servings: 1 }), lot({ purchasedOnDay: 1, servings: 1 })];
    const first = consumeServing(lots, 'beef_bones', 'B');
    expect(first.consumed?.purchasedOnDay).toBe(1);
    lots = first.lots;
    expect(totalServings(lots, 'beef_bones')).toBe(1);
    const second = consumeServing(lots, 'beef_bones', 'B');
    expect(second.consumed?.purchasedOnDay).toBe(2);
    expect(second.lots).toHaveLength(0);
    expect(consumeServing(second.lots, 'beef_bones', 'B').consumed).toBeUndefined();
  });
});
