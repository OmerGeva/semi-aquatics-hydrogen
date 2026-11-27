import TermsOfServicePage from '~/components/terms-of-service-page/terms-of-service-page.component';
import { pageTitle } from '~/lib/meta';

export function meta() {
  return [{ title: pageTitle('Terms of Service') }];
}

export default function TermsOfServiceRoute() {
  return <TermsOfServicePage />;
}
