import { redirect } from 'react-router';
import type { Route } from './+types/cart';

// The bag is a drawer on this site; the old /cart page link goes to the shop.
export function loader({ request }: Route.LoaderArgs) {
  const { search } = new URL(request.url);
  return redirect(`/shop${search}`);
}
