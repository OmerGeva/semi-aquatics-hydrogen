import type { ReactNode } from 'react';
import { Analytics, getShopAnalytics, useNonce } from '@shopify/hydrogen';
import { CartProvider, ShopifyProvider, useCart } from '@shopify/hydrogen-react';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type { Route } from './+types/root';
import SiteLayout from '~/components/layout/layout.component';
import favicon from '~/assets/favicon-32x32.png';
import tailwindStyles from '~/styles/tailwind.css?url';
import { Provider as ReduxProvider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import { store } from '~/redux/store';
import { WaveSoundsProvider } from '~/contexts/wave-sounds-context';
import { CartDrawerProvider } from '~/contexts/cart-drawer-context';
import { MobileProvider } from '~/contexts/mobile-context';
import { RecommendedProductsProvider } from '~/contexts/recommended-products-context';
import { CartAutoOpener } from '~/components/cart/cart-auto-opener';
import { AnalyticsDebug } from '~/components/analytics-debug';
import { AnalyticsSubscriber } from '~/components/analytics-subscriber';
import { CART_QUERY_FRAGMENT } from '~/lib/fragments';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    { rel: 'icon', type: 'image/svg+xml', href: favicon },
    { rel: 'stylesheet', href: tailwindStyles },
    // Preload fonts to prevent FOUT
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
  ];
}

// Suppress useLayoutEffect warning from CartProvider during SSR
if (typeof window === 'undefined') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (
      args[0]?.includes?.('useLayoutEffect') &&
      args[0]?.includes?.('server')
    ) {
      return;
    }
    originalError(...args);
  };
}

// Check if cart is stale (older than 7 days since last update)
function isCartStale(cartUpdatedAt: string | undefined): boolean {
  if (!cartUpdatedAt) return true;

  const updatedAt = new Date(cartUpdatedAt);
  const now = new Date();
  const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);

  // Consider cart stale if not updated in 7 days
  return daysSinceUpdate > 7;
}

export async function loader(args: Route.LoaderArgs) {
  const { storefront, env, cart, customerAccount } = args.context;

  let existingCart = await cart.get();

  // Create new cart if none exists or if existing cart is stale
  if (!existingCart || isCartStale(existingCart?.updatedAt)) {
    existingCart = await cart.create({});
  }

  const userAgent = args.request.headers.get('user-agent') || '';
  const isMobileInitial = /mobile|android|phone|iphone/i.test(userAgent);

  // Fetch recommended products server-side to avoid CORS issues
  let recommendedProducts = [];
  try {
    const recommendedData = await storefront.query(`#graphql
      query GetRecommendedCollection {
        collectionByHandle(handle: "2025-drop-1") {
          id
          title
          products(first: 5) {
            edges {
              node {
                id
                handle
                title
                availableForSale
                images(first: 5) {
                  edges {
                    node {
                      altText
                      transformedSrc
                    }
                  }
                }
                variants(first: 5) {
                  edges {
                    node {
                      id
                      title
                      availableForSale
                      priceV2 {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `);
    recommendedProducts = recommendedData?.collectionByHandle?.products?.edges ?? [];
  } catch (error) {
    console.error('Failed to fetch recommended products:', error);
  }

  const shop = getShopAnalytics({
    storefront,
    publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
  });

  return {
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop,
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN || env.PUBLIC_STORE_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN || '',
      withPrivacyBanner: true,
      country: storefront?.i18n?.country || 'US',
      language: storefront?.i18n?.language || 'EN',
    },
    // @ts-ignore
    cart: existingCart?.cart || existingCart,
    isLoggedIn: customerAccount.isLoggedIn(),
    isMobileInitial,
    recommendedProducts,
  };
}

export function Layout({ children }: { children?: React.ReactNode }) {
  const nonce = useNonce();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              * {
                margin: 0;
                padding: 0;
              }
              html, body {
                width: 100%;
                height: 100%;
              }
              body {
                background: white;
              }
            `,
          }}
          nonce={nonce}
          suppressHydrationWarning
        />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              // Detect mobile before React hydrates to ensure consistent rendering
              window.__isMobileDetected = /mobile|android|phone/i.test(navigator.userAgent) || window.innerWidth < 720;
            `,
          }}
        />
        <Links />
      </head>
      <body suppressHydrationWarning>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');


  if (!data) {
    return <Outlet />;
  }

  return (
    <MobileProvider isMobileInitial={data.isMobileInitial || false}>
      <ShopifyProvider
        storeDomain={data.publicStoreDomain}
        storefrontToken={data.consent.storefrontAccessToken}
        storefrontApiVersion="2025-07"
        countryIsoCode={data.consent.country}
        languageIsoCode={data.consent.language}
      >
        <CartProvider
          cartFragment={CART_QUERY_FRAGMENT}
          data={
            data.cart
              ? {
                ...data.cart,
                lines: data.cart.lines || { nodes: [] },
                note: data.cart.note || '',
                discountCodes: data.cart.discountCodes || [],
              }
              : null
          }
        >
          <AnalyticsProviderWithCart shop={data.shop} consent={data.consent}>
            <AnalyticsSubscriber />
            <AnalyticsDebug />
            <RecommendedProductsProvider products={data.recommendedProducts || []}>
              <LegacyProviders>
                <CartAutoOpener />
                <SiteLayout>
                  <Outlet />
                </SiteLayout>
              </LegacyProviders>
            </RecommendedProductsProvider>
          </AnalyticsProviderWithCart>
        </CartProvider>
      </ShopifyProvider>
    </MobileProvider>
  );
}

function AnalyticsProviderWithCart({
  children,
  shop,
  consent,
}: {
  children: ReactNode;
  shop: RootLoader['shop'];
  consent: RootLoader['consent'];
}) {
  const cart = useCart();
  const analyticsCart =
    cart?.lines && Array.isArray(cart.lines)
      ? { ...cart, lines: { nodes: cart.lines } }
      : cart;

  return (
    <Analytics.Provider cart={analyticsCart} shop={shop} consent={consent}>
      {children}
    </Analytics.Provider>
  );
}

function LegacyProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <CartDrawerProvider>
        <CookiesProvider>
          <WaveSoundsProvider>{children}</WaveSoundsProvider>
        </CookiesProvider>
      </CartDrawerProvider>
    </ReduxProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>Oops</h1>
      <h2>{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}
