/**
 * Canned-data commerce provider for the shop preview. Returns content from
 * /src/content/catalogue.json, never touches the network, collects nothing.
 */
import catalogueJson from '../content/catalogue.json';
import type {
  CartItem,
  CommerceProvider,
  DiscountQuote,
  OrderResult,
  Product,
  RedemptionToken,
} from './types';

interface DiscountStep {
  xp: number;
  discountPercent: number;
}

const products = catalogueJson.products as Product[];
const steps = catalogueJson.discountSteps as DiscountStep[];

export function quoteForXP(xp: number): DiscountQuote {
  let discountPercent = 0;
  let nextStepXp: number | undefined;
  for (const step of steps) {
    if (xp >= step.xp) {
      discountPercent = step.discountPercent;
    } else {
      nextStepXp = step.xp;
      break;
    }
  }
  return { xp, discountPercent, nextStepXp };
}

export class MockCommerceProvider implements CommerceProvider {
  async getCatalogue(): Promise<Product[]> {
    return products;
  }

  async getDiscountForXP(xp: number): Promise<DiscountQuote> {
    return quoteForXP(xp);
  }

  async redeemXP(xp: number): Promise<RedemptionToken> {
    const { discountPercent } = quoteForXP(xp);
    return {
      token: `mock-${xp}-${discountPercent}`,
      discountPercent,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async placeOrder(_items: CartItem[], _token?: RedemptionToken): Promise<OrderResult> {
    // Preview build: orders never leave the device.
    return { status: 'PREVIEW_ONLY', messageKey: 'shop.previewOrder' };
  }
}

export const commerceProvider: CommerceProvider = new MockCommerceProvider();
