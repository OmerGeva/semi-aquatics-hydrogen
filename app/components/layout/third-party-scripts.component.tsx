import { useEffect, useState } from 'react'
import { useAnalytics } from '@shopify/hydrogen'
import {
  initAlia,
  initGoogleAnalytics,
  initMetaPixel,
} from '../../lib/analytics/third-party'

/**
 * Loads third-party tags once the visitor's consent allows it.
 *
 * Consent comes from Shopify's Customer Privacy API (via Hydrogen). Tags are
 * injected from an effect instead of being rendered as JSX: a <script> element
 * that React creates on the client is never executed by the browser.
 *
 * The Attentive (cdn.attn.tv) tag that used to be listed here is not loaded.
 * It never ran on this storefront, and it is not allowed by the CSP. Add it to
 * `third-party.ts` (loader and CSP hosts) if Attentive is still in use.
 */
const ThirdPartyScripts = () => {
  const [allowAnalytics, setAllowAnalytics] = useState(false)
  const [allowMarketing, setAllowMarketing] = useState(false)
  const { customerPrivacy } = useAnalytics()

  useEffect(() => {
    const updateConsent = () => {
      if (!customerPrivacy) return;
      setAllowAnalytics(customerPrivacy.analyticsProcessingAllowed());
      setAllowMarketing(customerPrivacy.marketingAllowed());
    };

    updateConsent();

    const handler = () => updateConsent();
    document.addEventListener('visitorConsentCollected', handler as EventListener);
    return () => document.removeEventListener('visitorConsentCollected', handler as EventListener);
  }, [customerPrivacy]);

  useEffect(() => {
    if (allowAnalytics) initGoogleAnalytics();
  }, [allowAnalytics]);

  useEffect(() => {
    if (!allowMarketing) return;
    initMetaPixel();
    initAlia();
  }, [allowMarketing]);

  return null
}

export default ThirdPartyScripts
