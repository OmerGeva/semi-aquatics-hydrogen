import {useLoaderData} from 'react-router';
import type {Route} from './+types/artists.$slug';
import ArtistsPage from '~/components/artists-page/artists-page.component';
import Cms from '~/cms';
import {generateSlug} from '~/utils/generate-slug';

export async function loader({params}: Route.LoaderArgs) {
  const {slug} = params;
  if (!slug) {
    throw new Response('Not Found', {status: 404});
  }

  const cms = new Cms();
  const artists = await cms.getArtists();
  const artistsWithSlugs = artists.map((artist) => ({
    ...artist,
    slug: generateSlug(artist.name),
  }));

  const selectedArtist = artistsWithSlugs.find(
    (artist) => artist.slug === slug.toLowerCase(),
  );

  if (!selectedArtist) {
    throw new Response(null, {
      status: 302,
      headers: {Location: '/artists'},
    });
  }

  return {
    artists: artistsWithSlugs,
    selectedArtist,
  };
}

export default function ArtistRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <ArtistsPage artists={data.artists} selectedArtist={data.selectedArtist} />
  );
}
