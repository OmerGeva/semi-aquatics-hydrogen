import { getSitemap } from '@shopify/hydrogen';
import type { Route } from './+types/sitemap.$type.$page[.xml]';

export async function loader({ request, params, context: { storefront } }: Route.LoaderArgs) {
  if (params.type !== 'products') {
    throw new Response('Not Found', { status: 404 });
  }

  const response = await getSitemap({
    storefront,
    request,
    params,
    getLink: ({ baseUrl, handle }) => `${baseUrl}/products/${handle}`,
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}
