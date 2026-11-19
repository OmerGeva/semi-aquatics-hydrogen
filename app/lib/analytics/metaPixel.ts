/**
 * SSR-safe Meta Pixel tracking utilities.
 * Guards all browser globals; never throws on server.
 *
 * Events go through `trackMeta`, which holds them until the pixel has been
 * initialised (after marketing consent) and replays them then.
 */

import { trackMeta } from './third-party';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export const metaPixel = {
  /**
   * Generic track event wrapper
   */
  track(event: string, params?: Record<string, any>) {
    trackMeta(event, params ?? {});
  },

  /**
   * AddToCart event wrapper
   */
  addToCart(params: Record<string, any>) {
    trackMeta('AddToCart', params);
  },

  /**
   * ViewContent event wrapper
   */
  viewContent(params: Record<string, any>) {
    trackMeta('ViewContent', params);
  },
};
