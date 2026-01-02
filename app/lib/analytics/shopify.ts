/**
 * Shopify Analytics event constants for Hydrogen.
 * These match the standard Hydrogen/Shopify analytics event names.
 */

export const SHOPIFY_EVENT = {
  PAGE_VIEW: 'page_viewed',
  PRODUCT_VIEW: 'product_viewed',
  SEARCH_VIEW: 'search_viewed',
  COLLECTION_VIEW: 'collection_viewed',
  ADD_TO_CART: 'product_added_to_cart',
  REMOVE_FROM_CART: 'product_removed_from_cart',
  CART_UPDATE: 'cart_updated',
  CART_VIEW: 'cart_viewed',
  CHECKOUT_START: 'checkout_started',
} as const;

// Legacy function - kept for compatibility but not used
// Analytics are now handled by Hydrogen's Analytics.Provider
export function trackAddToCartShopify(payload?: Record<string, any>): void {
  // No-op - analytics handled by Hydrogen's Analytics.Provider
}


