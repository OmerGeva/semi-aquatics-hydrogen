/**
 * Minimal Shopify Analytics publisher for headless storefronts.
 * Uses window.Shopify.analytics.publish if present; otherwise no-ops.
 * Safe for SSR environments.
 */

const canPublish = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const publish = (window as typeof window & { Shopify?: Record<string, any> })
      .Shopify?.analytics?.publish;
    return typeof publish === 'function';
  } catch {
    return false;
  }
};

export const SHOPIFY_EVENT = {
  PAGE_VIEW: 'page_view' as any,
  PRODUCT_VIEW: 'product_view' as any,
  SEARCH_SUBMIT: 'search_submit' as any,
  ADD_TO_CART: 'add_to_cart' as any,
  REMOVE_FROM_CART: 'remove_from_cart' as any,
  CART_UPDATE: 'cart_update' as any,
  CART_VIEW: 'cart_view' as any,
  CHECKOUT_START: 'checkout_start' as any,
} as const;

export function publishShopifyEvent(event: string, payload?: Record<string, any>): void {
  if (!canPublish()) return;
  try {
    const scopedWindow = window as typeof window & { Shopify?: Record<string, any> };
    scopedWindow.Shopify?.analytics?.publish?.(event, payload ?? {});
  } catch {
    // never throw from analytics
  }
}

export function trackPageView(payload?: {
  url?: string;
  path?: string;
  title?: string;
  referrer?: string;
}): void {
  const defaultPayload = typeof window !== 'undefined'
    ? {
      url: window.location.href,
      path: window.location.pathname + window.location.search,
      title: document?.title,
      referrer: document?.referrer,
    }
    : {};
  publishShopifyEvent(SHOPIFY_EVENT.PAGE_VIEW, { ...defaultPayload, ...(payload ?? {}) });
}

export function trackAddToCartShopify(payload?: {
  variantGids?: string[];
  quantities?: number[];
  currency?: string;
  value?: number;
}): void {
  publishShopifyEvent(SHOPIFY_EVENT.ADD_TO_CART, payload ?? {});
}


