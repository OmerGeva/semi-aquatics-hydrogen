import { redirect } from 'react-router';

// The site has no contact page; the Terms page holds the contact details.
export function loader() {
  return redirect('/terms-of-service');
}
