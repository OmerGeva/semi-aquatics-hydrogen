import {ServerRouter} from 'react-router';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';
import {THIRD_PARTY_CSP} from '~/lib/analytics/third-party';

/**
 * Render the app server-side but with minimal dependencies
 * Client will still hydrate and handle interactions
 */
export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  // Hydrogen's defaults only allow Shopify hosts. Anything a third-party tag
  // loads or calls has to be listed here, or the browser blocks it silently.
  // `scriptSrc`, `imgSrc` and `fontSrc` have no Hydrogen default, so the
  // Shopify hosts they previously inherited from `default-src` are repeated.
  const shopifyHosts = ["'self'", 'https://cdn.shopify.com', 'https://shopify.com'];
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN || context.env.PUBLIC_STORE_DOMAIN || '',
      storeDomain: context.env.PUBLIC_STORE_DOMAIN || '',
    },
    scriptSrc: [...shopifyHosts, ...THIRD_PARTY_CSP.scriptSrc],
    connectSrc: [...THIRD_PARTY_CSP.connectSrc],
    imgSrc: [...shopifyHosts, 'data:', ...THIRD_PARTY_CSP.imgSrc],
    styleSrc: [...THIRD_PARTY_CSP.styleSrc],
    fontSrc: [...shopifyHosts, 'data:', ...THIRD_PARTY_CSP.fontSrc],
  });

  // Render the full app routes
  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter context={reactRouterContext} url={request.url} nonce={nonce} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
