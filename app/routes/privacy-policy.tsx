import PrivacyPolicyPage from '~/components/privacy-policy-page/privacy-policy-page.component';
import { pageTitle } from '~/lib/meta';

export function meta() {
  return [{ title: pageTitle('Privacy Policy') }];
}

export default function PrivacyPolicyRoute() {
  return <PrivacyPolicyPage />;
}
