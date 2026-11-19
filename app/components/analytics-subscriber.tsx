import { useAnalytics } from '@shopify/hydrogen';
import { useEffect } from 'react';
import { metaPixel } from '~/lib/analytics/metaPixel';
import { trackGa, trackMetaPageView } from '~/lib/analytics/third-party';
import { gidToNumericId } from '~/lib/shopify/gid';

/**
 * Forward Hydrogen's `product_viewed` event to Meta (ViewContent) and GA4
 * (view_item). Product IDs are sent as numeric Shopify IDs, which is what the
 * Shopify-synced Meta catalog uses for its item groups.
 */
function forwardProductView(data: any) {
  const product = data?.products?.[0];
  if (!product?.id) return;

  const productId = gidToNumericId(String(product.id));
  const variantId = product.variantId ? gidToNumericId(String(product.variantId)) : undefined;
  const price = Number(product.price);
  const value = Number.isFinite(price) ? price : undefined;
  const currency = data?.shop?.currency || 'USD';

  metaPixel.viewContent({
    content_ids: [productId],
    content_type: 'product_group',
    content_name: product.title,
    content_category: product.productType || undefined,
    value,
    currency,
  });

  trackGa('view_item', {
    currency,
    value,
    items: [
      {
        item_id: variantId ?? productId,
        item_name: product.title,
        item_brand: product.vendor,
        item_category: product.productType || undefined,
        item_variant: product.variantTitle,
        price: value,
        quantity: 1,
      },
    ],
  });
}

// Dispatch events for the debug panel to catch
function logToDebugPanel(eventName: string, data: any) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('analytics-event', {
        detail: {
          timestamp: new Date().toLocaleTimeString(),
          eventName,
          payload: data,
        },
      })
    );
  }
}

export function AnalyticsSubscriber() {
  const { subscribe, register } = useAnalytics();
  const { ready } = register('Debug Analytics Subscriber');

  useEffect(() => {
    // Subscribe to all standard events
    subscribe('page_viewed', (data) => {
      logToDebugPanel('page_viewed', data);
      // The first PageView is sent when the pixel initialises; this covers
      // client-side navigations. GA4 tracks history changes by itself.
      trackMetaPageView();
    });

    subscribe('product_viewed', (data) => {
      logToDebugPanel('product_viewed', data);
      forwardProductView(data);
    });

    subscribe('collection_viewed', (data) => {
      logToDebugPanel('collection_viewed', data);
    });

    subscribe('cart_viewed', (data) => {
      logToDebugPanel('cart_viewed', data);
    });

    subscribe('cart_updated', (data) => {
      logToDebugPanel('cart_updated', data);
    });

    subscribe('product_added_to_cart', (data) => {
      logToDebugPanel('product_added_to_cart', data);
    });

    subscribe('product_removed_from_cart', (data) => {
      logToDebugPanel('product_removed_from_cart', data);
    });

    // Mark ready
    ready();
  }, [subscribe, ready]);

  return null;
}
