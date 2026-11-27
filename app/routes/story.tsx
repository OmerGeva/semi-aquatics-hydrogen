import StoryPage from '~/components/story-page/story-page.component';
import { pageTitle } from '~/lib/meta';

export function meta() {
  return [{ title: pageTitle('Story') }];
}

export default function StoryRoute() {
  return <StoryPage />;
}
