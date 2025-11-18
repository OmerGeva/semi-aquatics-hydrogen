/**
 * SSR-safe Meta Pixel tracking utilities.
 * Guards all browser globals; never throws on server.
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

const hasFbq = () =>
  typeof window !== 'undefined' && typeof window.fbq === 'function';

export const metaPixel = {
  /**
   * Generic track event wrapper
   */
  track(event: string, params?: Record<string, any>) {
    if (hasFbq()) window.fbq!('track', event, params ?? {});
  },

  /**
   * AddToCart event wrapper
   */
  addToCart(params: Record<string, any>) {
    if (hasFbq()) window.fbq!('track', 'AddToCart', params);
  },
};
