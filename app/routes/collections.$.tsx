import { redirect } from 'react-router';
import type { Route } from './+types/collections.$';

// Old Shopify theme collection links (/collections/all and the rest) go to the shop.
export function loader({ request }: Route.LoaderArgs) {
  const { search } = new URL(request.url);
  return redirect(`/shop${search}`);
}
