import { data } from 'react-router';
import NotFound from '~/components/not-found/not-found.component';

// Unknown URLs must return a real 404 so server.ts can apply any URL
// redirects set up in Shopify admin (storefrontRedirect only runs on a 404).
export function loader() {
  return data(null, { status: 404 });
}

export function meta() {
  return [{ title: 'Page Not Found | Semi Aquatics' }];
}

export default function NotFoundRoute() {
  return <NotFound />;
}
