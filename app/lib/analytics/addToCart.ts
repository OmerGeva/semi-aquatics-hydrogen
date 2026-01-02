/**
 * Clean, reusable, SSR-safe AddToCart tracking module.
 * Compatible with Shopify storefronts and Meta Pixel events.
 */

import { metaPixel } from './metaPixel';
import { gidToNumericId } from '../shopify/gid';

export type MetaContent = { id: string; quantity: number; item_price?: number };

export type TrackAddToCartInput = {
  variantGids: string[];            // one or more variant GIDs
  quantities: number[];             // parallel to variantGids
  prices: number[];                 // per-variant unit price
  currency: string;                 // e.g., 'USD'
  contentName?: string;
  contentCategory?: string;
  contentType?: 'product' | 'product_group';
  eventId?: string;
};

/**
 * Track AddToCart event with Meta Pixel.
 * SSR-safe; no-op if fbq is missing or not on client.
 */
export function trackAddToCart(input: TrackAddToCartInput): void {
  if (typeof window === 'undefined') return;

  const ids = input.variantGids.map(gidToNumericId);
  const contents: MetaContent[] = ids.map((id, i) => ({
    id,
    quantity: input.quantities[i] ?? 1,
    item_price: input.prices[i],
  }));

  const value = contents.reduce((sum, c, i) => {
    const price = input.prices[i] ?? 0;
    const qty = c.quantity ?? 1;
    return sum + price * qty;
  }, 0);

  metaPixel.addToCart({
    content_ids: ids,
    contents,
    value: Number(value.toFixed(2)),
    currency: input.currency,
    content_name: input.contentName,
    content_category: input.contentCategory,
    content_type: input.contentType ?? (ids.length > 1 ? 'product_group' : 'product'),
    ...(input.eventId ? { event_id: input.eventId } : {}),
  });

  // Shopify analytics are now handled by Hydrogen's Analytics.Provider
  // via the publish() function in useCartActions hook
}

/**
 * Higher-order function: wraps an async add-to-cart function.
 * After it resolves, builds and fires the AddToCart payload.
 *
 * @param addFn - The original async add-to-cart function
 * @param buildPayload - Function to extract tracking data from args and result
 * @returns Wrapped function that tracks on success
 */
export type BuildPayload<T extends (...args: any[]) => Promise<any>> = (
  args: Parameters<T>,
  result: Awaited<ReturnType<T>>
) => TrackAddToCartInput;

export function withAddToCartTracking<T extends (...args: any[]) => Promise<any>>(
  addFn: T,
  buildPayload: BuildPayload<T>
): T {
  return (async (...args: Parameters<T>) => {
    const res = await addFn(...args);
    try {
      const payload = buildPayload(args, res);
      trackAddToCart(payload);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Add-to-cart tracking skipped', error);
      }
    }
    return res;
  }) as T;
}
