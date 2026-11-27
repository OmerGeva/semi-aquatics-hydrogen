import { data, redirect } from 'react-router';
import type { Route } from './+types/policies.$';
import NotFound from '~/components/not-found/not-found.component';

// Shopify policy pages that this site has its own page for.
const SITE_POLICY_PAGES: Record<string, string> = {
  'privacy-policy': '/privacy-policy',
  'terms-of-service': '/terms-of-service',
  'contact-information': '/terms-of-service',
};

const CHECKOUT_DOMAIN = 'https://semi-aquatics.myshopify.com';

export function loader({ params }: Route.LoaderArgs) {
  const handle = params['*'] ?? '';

  if (SITE_POLICY_PAGES[handle]) {
    return redirect(SITE_POLICY_PAGES[handle]);
  }

  // Other policies (refund, shipping...) are served by Shopify.
  if (/^[a-z0-9-]+$/.test(handle)) {
    return redirect(`${CHECKOUT_DOMAIN}/policies/${handle}`);
  }

  return data(null, { status: 404 });
}

export function meta() {
  return [{ title: 'Page Not Found | Semi Aquatics' }];
}

export default function PoliciesRoute() {
  return <NotFound />;
}
