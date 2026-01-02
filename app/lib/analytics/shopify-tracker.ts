/**
 * Direct Shopify Analytics Tracking
 * Since window.Shopify.analytics doesn't exist in Hydrogen,
 * we send events directly to Shopify's endpoints
 */

interface ShopifyEventPayload {
  event_name: string;
  event_time: number;
  [key: string]: any;
}

export async function sendToShopifyAnalytics(
  eventName: string,
  payload: any,
  shopId: string,
  storefrontId: string
) {
  try {
    // Build the event payload in Shopify's expected format
    const eventPayload: ShopifyEventPayload = {
      event_name: eventName,
      event_time: Date.now(),
      shop_id: parseInt(shopId),
      storefront_id: storefrontId,
      ...payload,
    };

    // Send to Shopify's tracking endpoint
    // Note: This might require CORS configuration or might not be allowed
    const response = await fetch('https://monorail-edge.shopifysvc.com/v1/produce', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schema_id: 'custom_storefront_event/1.0',
        payload: eventPayload,
        metadata: {
          event_created_at_ms: Date.now(),
        },
      }),
    });

    if (!response.ok) {
      console.error('[Shopify Tracker] Failed to send event:', response.status);
    }
  } catch (error) {
    console.error('[Shopify Tracker] Error sending event:', error);
  }
}
