/**
 * Commerce layer: interface only. No payments, ordering or fulfilment are
 * implemented — a real provider must slot in behind CommerceProvider
 * without UI changes. See MockCommerceProvider.
 */

export interface Product {
  id: string;
  nameKey: string;
  descriptionKey: string;
  /** Merch category for grouping in the shop. */
  category: 'NOODLES' | 'MERCH' | 'CARDS';
  artworkSlot: string;
  /** Display-only XP price tag for the preview; no real money anywhere. */
  xpTag: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface DiscountQuote {
  xp: number;
  discountPercent: number;
  /** XP needed for the next discount step, if any. */
  nextStepXp?: number;
}

export interface RedemptionToken {
  token: string;
  discountPercent: number;
  expiresAt: string;
}

export type OrderStatus = 'PREVIEW_ONLY' | 'ACCEPTED' | 'REJECTED';

export interface OrderResult {
  status: OrderStatus;
  orderId?: string;
  messageKey: string;
}

export interface CommerceProvider {
  getCatalogue(): Promise<Product[]>;
  getDiscountForXP(xp: number): Promise<DiscountQuote>;
  redeemXP(xp: number): Promise<RedemptionToken>;
  placeOrder(items: CartItem[], token?: RedemptionToken): Promise<OrderResult>;
}
