import LookbookPage from '~/components/lookbook-page/lookbook-page.component';
import { pageTitle } from '~/lib/meta';

export function meta() {
  return [{ title: pageTitle('Lookbook') }];
}

export default function LookbookRoute() {
  return <LookbookPage />;
}
