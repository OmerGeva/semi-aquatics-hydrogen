import {useLoaderData} from 'react-router';
import type {Route} from './+types/artists._index';
import ArtistsPage from '~/components/artists-page/artists-page.component';
import Cms from '~/cms';
import {generateSlug} from '~/utils/generate-slug';
import {pageTitle} from '~/lib/meta';

export async function loader(_args: Route.LoaderArgs) {
  const cms = new Cms();
  const artists = await cms.getArtists();

  const artistsWithSlugs = artists.map((artist) => ({
    ...artist,
    slug: generateSlug(artist.name),
  }));

  return {artists: artistsWithSlugs};
}

export function meta() {
  return [{ title: pageTitle('Artists') }];
}

export default function ArtistsIndexRoute() {
  const data = useLoaderData<typeof loader>();
  return <ArtistsPage artists={data.artists} />;
}
