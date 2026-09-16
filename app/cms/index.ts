import { ArtistT, ArtistsT } from '../types';
import { ARTISTS } from '../constants/artists';

// The Render CMS service is suspended, so all CMS data is served from local constants.
class Cms {
  // Report the last drop as already released so the drop page is never locked.
  async getNextDrop() {
    return { _id: 'last-drop', title: 'Latest Drop', dateTime: '2026-01-01T00:00:00.000Z', __v: 0 };
  }

  async getArtistByArtwork(artworkId: string): Promise<ArtistT | null> {
    return ARTISTS.find((artist) => artist.artworks.some((artwork) => artwork.id === artworkId)) ?? null;
  }

  async getNextDropPassword(): Promise<{ password: string | null }> {
    return { password: null };
  }

  async getArtists(): Promise<ArtistsT> {
    return ARTISTS;
  }
}

export default Cms;
