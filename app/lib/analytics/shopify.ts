/**
 * Minimal Shopify Analytics publisher for headless storefronts.
 * Uses window.Shopify.analytics.publish if present; otherwise no-ops.
 * Safe for SSR environments.
 */

const canPublish = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const publish = (window as typeof window & {Shopify?: Record<string, any>})
      .Shopify?.analytics?.publish;
    return typeof publish === 'function';
  } catch {
    return false;
  }
};

export const SHOPIFY_EVENT = {
  PAGE_VIEW: 'PAGE_VIEW',
  ADD_TO_CART: 'ADD_TO_CART',
} as const;

export function publishShopifyEvent(event: string, payload?: Record<string, any>): void {
  if (!canPublish()) return;
  try {
    const scopedWindow = window as typeof window & {Shopify?: Record<string, any>};
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


