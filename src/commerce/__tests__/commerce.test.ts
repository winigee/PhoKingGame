import { COMMERCE_ENABLED } from '../../config/flags';
import { MockCommerceProvider, quoteForXP } from '../mockProvider';
import { xpForProgress } from '../xp';

const provider = new MockCommerceProvider();

describe('feature flag', () => {
  it('commerce ships disabled', () => {
    expect(COMMERCE_ENABLED).toBe(false);
  });
});

describe('MockCommerceProvider', () => {
  it('returns the canned catalogue with required fields', async () => {
    const products = await provider.getCatalogue();
    expect(products.length).toBeGreaterThan(0);
    for (const p of products) {
      expect(p.id).toBeTruthy();
      expect(p.nameKey).toMatch(/^shop\.products\./);
      expect(p.xpTag).toBeGreaterThan(0);
    }
  });

  it('quotes discounts in steps and reports the next step', async () => {
    expect((await provider.getDiscountForXP(0)).discountPercent).toBe(0);
    expect((await provider.getDiscountForXP(0)).nextStepXp).toBe(500);
    expect((await provider.getDiscountForXP(500)).discountPercent).toBe(5);
    expect((await provider.getDiscountForXP(9999)).discountPercent).toBe(20);
    const max = await provider.getDiscountForXP(10000);
    expect(max.discountPercent).toBe(30);
    expect(max.nextStepXp).toBeUndefined();
  });

  it('redeems XP into a token matching the quote', async () => {
    const token = await provider.redeemXP(1500);
    expect(token.discountPercent).toBe(quoteForXP(1500).discountPercent);
    expect(token.token).toContain('mock');
    expect(new Date(token.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('orders never leave the device in the preview build', async () => {
    const result = await provider.placeOrder([{ productId: 'instant_original', quantity: 2 }]);
    expect(result.status).toBe('PREVIEW_ONLY');
    expect(result.orderId).toBeUndefined();
    expect(result.messageKey).toBe('shop.previewOrder');
  });
});

describe('xpForProgress', () => {
  it('rewards bowls served and reputation', () => {
    expect(xpForProgress(0, 0)).toBe(0);
    expect(xpForProgress(100, 50)).toBe(2000);
    expect(xpForProgress(101, 50)).toBeGreaterThan(xpForProgress(100, 50));
  });
});
