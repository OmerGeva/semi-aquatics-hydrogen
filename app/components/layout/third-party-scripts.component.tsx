import { useEffect, useState, useRef } from 'react'
import { useGeoAndConsent } from '../../lib/consent/useConsent'
import { useAnalytics } from '@shopify/hydrogen'

const ThirdPartyScripts = () => {
  const { consent } = useGeoAndConsent()
  const [allowAnalytics, setAllowAnalytics] = useState(false)
  const [allowMarketing, setAllowMarketing] = useState(false)
  const { register, customerPrivacy: customerPrivacyFromAnalytics } = useAnalytics()
  const { ready } = register('CustomConsentBanner')

  useEffect(() => {
    setAllowAnalytics(!!consent?.analytics)
    setAllowMarketing(!!consent?.marketing)
  }, [consent])

  const lastConsentRef = useRef<string | null>(null);
  const hasSetConsent = useRef(false);
  const retryCount = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const consentKey = JSON.stringify(consent);
    if (lastConsentRef.current === consentKey) {
      return;
    }

    // Reset retry count and hasSetConsent flag if consent changes
    hasSetConsent.current = false;
    retryCount.current = 0;

    const getConsentPayload = () => {
      return {
        analytics: !!consent?.analytics,
        marketing: !!consent?.marketing,
        preferences: false,
        sale_of_data: false,
      };
    };

    const initConsent = () => {
      if (hasSetConsent.current) {
        return;
      }

      const shopify = (window as any).Shopify;
      const customerPrivacy = shopify?.customerPrivacy;

      if (customerPrivacy?.setTrackingConsent) {
        const consentPayload = getConsentPayload();
        customerPrivacy.setTrackingConsent(consentPayload, (error: any) => {
          if (error) {
            console.error('[ThirdPartyScripts] Shopify tracking consent error:', error);
          } else {
            hasSetConsent.current = true;
            lastConsentRef.current = consentKey;
            // Signal to Analytics.Provider that consent integration is ready
            ready();
          }
        });
      } else if (shopify?.loadFeatures) {
        shopify.loadFeatures([
          {
            name: 'consent-tracking-api',
            version: '0.1',
          },
        ], (error: any) => {
          if (error) {
            console.error('[ThirdPartyScripts] Error loading Shopify features:', error);
          } else {
            // Retry initConsent after loading features
            setTimeout(initConsent, 500);
          }
        });
      } else {
        if (retryCount.current < 10) {
          retryCount.current++;
          setTimeout(initConsent, 1000);
        } else {
          console.error('[ThirdPartyScripts] Shopify Privacy SDK failed to load after 10 retries');
        }
      }
    };

    initConsent();
  }, [consent]);

  return (
    <>
      {allowAnalytics && (
        <>
          <script src="https://www.googletagmanager.com/gtag/js?id=G-VVVEV1RSEL" async></script>
          <script dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-VVVEV1RSEL');
            `
          }} />
        </>
      )}

      {allowMarketing && (
        <>
          <script src="https://backend.alia-cloudflare.com/public/embed.js?shop=semi-aquatics.myshopify.com" async></script>
          <script src="https://cdn.attn.tv/semiaquatics/dtag.js" async></script>
          <script dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '269716947689981');
              fbq('track', 'PageView');
            `
          }} />
          <noscript>
            <img height="1" width="1" style={{ display: 'none' }}
              src="https://www.facebook.com/tr?id=269716947689981&ev=PageView&noscript=1" />
          </noscript>
        </>
      )}
    </>
  )
}

export default ThirdPartyScripts