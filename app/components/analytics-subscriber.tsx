import { useAnalytics } from '@shopify/hydrogen';
import { useEffect } from 'react';

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
    });

    subscribe('product_viewed', (data) => {
      logToDebugPanel('product_viewed', data);
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
