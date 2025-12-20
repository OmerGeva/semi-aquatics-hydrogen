import { useEffect, useState } from 'react'
import { useGeoAndConsent } from '../../lib/consent/useConsent'

const ThirdPartyScripts = () => {
  const { consent } = useGeoAndConsent()
  const [allowAnalytics, setAllowAnalytics] = useState(false)
  const [allowMarketing, setAllowMarketing] = useState(false)

  useEffect(() => {
    setAllowAnalytics(!!consent?.analytics)
    setAllowMarketing(!!consent?.marketing)
  }, [consent])

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!consent?.analytics) return;

    const privacy = (window as any).Shopify?.customerPrivacy;
    if (!privacy?.setTrackingConsent) return;

    privacy.setTrackingConsent(true, {
      analytics: true,
      marketing: !!consent.marketing,
      preferences: false,
    });
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