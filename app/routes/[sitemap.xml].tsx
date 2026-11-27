import { getSitemapIndex } from '@shopify/hydrogen';
import type { Route } from './+types/[sitemap.xml]';

// Only products: the site's collections and Shopify pages are not served here.
export async function loader({ request, context: { storefront } }: Route.LoaderArgs) {
  const response = await getSitemapIndex({
    storefront,
    request,
    types: ['products'],
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}
