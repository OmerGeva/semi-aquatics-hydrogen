import { useEffect, useState } from 'react';

// Global event store to track analytics events
const analyticsEvents: any[] = [];

export function logAnalyticsEvent(eventName: string, payload: any) {
  const timestamp = new Date().toLocaleTimeString();
  const event = { timestamp, eventName, payload };

  analyticsEvents.unshift(event);
  if (analyticsEvents.length > 20) {
    analyticsEvents.pop();
  }

  // Dispatch custom event for the component to listen to
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('analytics-event', { detail: event }));
  }

  // IMPORTANT: Send to Shopify's analytics using the custom event schema
  if (typeof window !== 'undefined') {
    try {
      const shopify = (window as any).Shopify;

      if (shopify?.analytics) {
        // Use Shopify's custom event tracking with proper schema
        const customPayload = {
          event_name: eventName,
          event_time: Date.now(),
          ...payload,
        };

        // Try using Shopify.analytics.publish with custom schema
        if (shopify.analytics.publish) {
          shopify.analytics.publish('custom_event', customPayload);
        }

        // Also try the CustomerPrivacy API method for tracking
        if (shopify.customerPrivacy?.track) {
          shopify.customerPrivacy.track(eventName, customPayload);
        }
      }
    } catch (error) {
      console.error('[logAnalyticsEvent] Error sending to Shopify analytics:', error);
    }
  }
}

export function AnalyticsDebug() {
  const [events, setEvents] = useState<any[]>([]);
  const [consentStatus, setConsentStatus] = useState<any>(null);
  const [networkRequests, setNetworkRequests] = useState<any[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Listen for our custom analytics events
    const handleEvent = (e: any) => {
      setEvents((prev) => [e.detail, ...prev.slice(0, 19)]);
    };

    window.addEventListener('analytics-event', handleEvent);

    // Monitor fetch/XHR requests
    const originalFetch = window.fetch;
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    // Intercept fetch
    window.fetch = async (...args) => {
      const url = args[0]?.toString() || '';
      if (url.includes('monorail') || url.includes('produce') || url.includes('analytics')) {
        const timestamp = new Date().toLocaleTimeString();
        setNetworkRequests((prev) => [{ timestamp, url, type: 'fetch' }, ...prev.slice(0, 9)]);
      }
      return originalFetch(...args);
    };

    // Intercept XHR
    XMLHttpRequest.prototype.open = function(method: string, url: string) {
      if (url.includes('monorail') || url.includes('produce') || url.includes('analytics')) {
        const timestamp = new Date().toLocaleTimeString();
        setNetworkRequests((prev) => [{ timestamp, url, type: 'xhr' }, ...prev.slice(0, 9)]);
      }
      return originalXHROpen.apply(this, arguments as any);
    };

    // Check Customer Privacy API status
    const checkConsent = () => {
      if (typeof window !== 'undefined' && (window as any).Shopify?.customerPrivacy) {
        const consent = (window as any).Shopify.customerPrivacy.currentVisitorConsent();
        setConsentStatus(consent);
      }
    };

    checkConsent();
    const interval = setInterval(checkConsent, 2000);

    return () => {
      window.removeEventListener('analytics-event', handleEvent);
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;
      clearInterval(interval);
    };
  }, []);

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        maxWidth: isMinimized ? 250 : 500,
        maxHeight: isMinimized ? 50 : 500,
        overflow: 'auto',
        background: 'rgba(0, 0, 0, 0.95)',
        color: 'white',
        padding: 12,
        fontSize: 11,
        fontFamily: 'monospace',
        zIndex: 9999,
        borderRadius: 4,
        border: '1px solid #444',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMinimized ? 0 : 8
      }}>
        <div style={{ fontWeight: 'bold', fontSize: 13, color: '#fbbf24' }}>
          Analytics Debug Panel
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          style={{
            background: 'transparent',
            border: '1px solid #666',
            color: '#fbbf24',
            cursor: 'pointer',
            padding: '2px 8px',
            borderRadius: 3,
            marginLeft: '1rem',
            fontSize: 11,
          }}
        >
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>

      {!isMinimized && (<>


      {consentStatus && (
        <div style={{
          marginBottom: 8,
          padding: 6,
          background: 'rgba(74, 222, 128, 0.1)',
          borderRadius: 3,
          fontSize: 10,
        }}>
          <div style={{ color: '#4ade80', fontWeight: 'bold' }}>Consent Status:</div>
          <div>Analytics: {consentStatus.analytics ? '✓' : '✗'}</div>
          <div>Marketing: {consentStatus.marketing ? '✓' : '✗'}</div>
        </div>
      )}

      {/* Network Requests Section */}
      <div style={{
        marginBottom: 8,
        padding: 6,
        background: networkRequests.length > 0 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        borderRadius: 3,
        fontSize: 10,
      }}>
        <div style={{
          color: networkRequests.length > 0 ? '#4ade80' : '#ef4444',
          fontWeight: 'bold',
          marginBottom: 4
        }}>
          Network Requests ({networkRequests.length})
        </div>
        {networkRequests.length === 0 ? (
          <div style={{ opacity: 0.6, fontSize: 9 }}>
            ⚠️ No analytics network requests detected yet
          </div>
        ) : (
          networkRequests.slice(0, 3).map((req, i) => (
            <div key={i} style={{ fontSize: 9, marginTop: 2, opacity: 0.8 }}>
              {req.timestamp} - {req.type.toUpperCase()}
            </div>
          ))
        )}
      </div>

      {/* Events Section */}
      <div style={{ fontWeight: 'bold', marginBottom: 6, fontSize: 11 }}>
        Published Events ({events.length})
      </div>

      {events.length === 0 ? (
        <div style={{ opacity: 0.6 }}>No events yet...</div>
      ) : (
        events.map((event, i) => (
          <div
            key={i}
            style={{
              borderTop: '1px solid #333',
              paddingTop: 4,
              marginTop: 4,
            }}
          >
            <div style={{ color: '#4ade80', fontWeight: 'bold' }}>
              {event.timestamp} - {event.eventName}
            </div>
            {event.payload && Object.keys(event.payload).length > 0 && (
              <pre style={{ margin: 0, fontSize: 10, opacity: 0.8, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(event.payload, null, 2).slice(0, 300)}
              </pre>
            )}
          </div>
        ))
      )}
      </>)}
    </div>
  );
}
