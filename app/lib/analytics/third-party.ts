/**
 * Third-party marketing and analytics tags (Meta Pixel, Google Analytics 4, Alia).
 *
 * Tags are loaded imperatively from the client. A `<script>` element that React
 * renders after hydration is never executed by the browser, which is why the
 * previous JSX-based loader left `fbq` and `gtag` undefined in production.
 *
 * Every host used here must also be listed in `THIRD_PARTY_CSP` below, which
 * `entry.server.tsx` merges into the Content-Security-Policy header.
 */

export const GA_MEASUREMENT_ID = 'G-VVVEV1RSEL';
export const META_PIXEL_ID = '269716947689981';
export const ALIA_EMBED_URL =
  'https://backend.alia-cloudflare.com/public/embed.js?shop=semi-aquatics.myshopify.com';
export const KLAVIYO_COMPANY_ID = 'WBAM5n';
export const KLAVIYO_NEWSLETTER_LIST_ID = 'RPjb23';

/**
 * Hosts the tags above need, grouped by CSP directive.
 * Keep this next to the loaders so the two cannot drift apart.
 */
export const THIRD_PARTY_CSP = {
  scriptSrc: [
    'https://connect.facebook.net',
    'https://*.googletagmanager.com',
    'https://backend.alia-cloudflare.com',
    'https://backend.alia-prod.com',
  ],
  connectSrc: [
    'https://www.facebook.com',
    'https://connect.facebook.net',
    // GA4 (the last three are used when Google signals is enabled)
    'https://*.google-analytics.com',
    'https://analytics.google.com',
    'https://*.analytics.google.com',
    'https://*.googletagmanager.com',
    'https://*.g.doubleclick.net',
    'https://www.google.com',
    'https://backend.alia-cloudflare.com',
    'https://backend.alia-prod.com',
    'https://a.klaviyo.com',
  ],
  imgSrc: [
    'https://www.facebook.com',
    'https://*.google-analytics.com',
    'https://*.googletagmanager.com',
    'https://*.g.doubleclick.net',
    'https://www.google.com',
    // Alia popup artwork, and the country flags in its phone-number field
    'https://files.alia-prod.com',
    'https://purecatamphetamine.github.io',
  ],
  styleSrc: ['https://fonts.googleapis.com'],
  fontSrc: ['https://fonts.gstatic.com'],
  // The Meta Pixel sends larger events by posting a form into a hidden
  // iframe on www.facebook.com. Without this, those events are blocked.
  frameSrc: ['https://www.facebook.com'],
} as const;

type QueuedCall = unknown[];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

const MAX_QUEUED_CALLS = 25;
const pendingMetaCalls: QueuedCall[] = [];
const pendingGaCalls: QueuedCall[] = [];
let metaReady = false;
let gaReady = false;
let lastMetaPageViewUrl: string | null = null;

const isBrowser = () => typeof window !== 'undefined';

function enqueue(queue: QueuedCall[], call: QueuedCall) {
  if (queue.length >= MAX_QUEUED_CALLS) queue.shift();
  queue.push(call);
}

/**
 * Append a script tag once. Created with `document.createElement`, so the
 * browser executes it (unlike a script element rendered by React on the client).
 */
export function loadScriptOnce(src: string, id: string): void {
  if (!isBrowser() || document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

/**
 * Google Analytics 4. Safe to call repeatedly; only the first call does work.
 */
export function initGoogleAnalytics(): void {
  if (!isBrowser() || gaReady) return;
  gaReady = true;

  window.dataLayer = window.dataLayer || [];
  // gtag.js requires the `arguments` object itself, not an array copy.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);

  loadScriptOnce(
    `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
    'ga4-gtag',
  );

  pendingGaCalls.splice(0).forEach((call) => window.gtag!(...call));
}

/**
 * Meta Pixel. Safe to call repeatedly; only the first call does work.
 * Mirrors Meta's standard base code, without needing an inline script.
 */
export function initMetaPixel(): void {
  if (!isBrowser() || metaReady) return;
  metaReady = true;

  if (!window.fbq) {
    const fbq: any = function fbqStub() {
      if (fbq.callMethod) {
        // eslint-disable-next-line prefer-rest-params, prefer-spread
        fbq.callMethod.apply(fbq, arguments);
      } else {
        // eslint-disable-next-line prefer-rest-params
        fbq.queue.push(arguments);
      }
    };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = fbq;
    loadScriptOnce('https://connect.facebook.net/en_US/fbevents.js', 'meta-pixel');
  }

  window.fbq!('init', META_PIXEL_ID);
  window.fbq!('track', 'PageView');
  lastMetaPageViewUrl = window.location.href;

  pendingMetaCalls.splice(0).forEach((call) => window.fbq!(...call));
}

/** Alia popups (email capture). */
export function initAlia(): void {
  loadScriptOnce(ALIA_EMBED_URL, 'alia-embed');
}

/**
 * Send a Meta Pixel event. If the pixel has not been initialised yet (consent
 * still pending, or the tag is still loading) the call is held and replayed on
 * init. If consent is never given, the held calls are simply never sent.
 */
export function trackMeta(event: string, params: Record<string, unknown> = {}): void {
  if (!isBrowser()) return;
  const call: QueuedCall = ['track', event, params];
  if (metaReady && typeof window.fbq === 'function') {
    window.fbq(...call);
  } else {
    enqueue(pendingMetaCalls, call);
  }
}

/**
 * Meta PageView for client-side navigations. The first PageView is sent by
 * `initMetaPixel`; this only fires when the URL has changed since then.
 */
export function trackMetaPageView(): void {
  if (!isBrowser() || !metaReady || typeof window.fbq !== 'function') return;
  const url = window.location.href;
  if (url === lastMetaPageViewUrl) return;
  lastMetaPageViewUrl = url;
  window.fbq('track', 'PageView');
}

/** Send a GA4 event, held until GA is initialised (same rules as `trackMeta`). */
export function trackGa(event: string, params: Record<string, unknown> = {}): void {
  if (!isBrowser()) return;
  const call: QueuedCall = ['event', event, params];
  if (gaReady && typeof window.gtag === 'function') {
    window.gtag(...call);
  } else {
    enqueue(pendingGaCalls, call);
  }
}
