import axios from 'axios';
import { ArtistT, ArtistsT } from '../types';

const baseUri =
  (import.meta.env.VITE_DEV_CMS === 'development'
    ? 'http://localhost:3000'
    : 'https://semi-aquatics-cms.onrender.com');

class Cms {
  // The drop CMS service is offline. Report the last drop as already released
  // so the drop page is never locked.
  async getNextDrop() {
    return { _id: 'last-drop', title: 'Latest Drop', dateTime: '2026-01-01T00:00:00.000Z', __v: 0 };
  }
  
  async getArtistByArtwork(artworkId: string): Promise<ArtistT | null> {
    try {
      const response = await axios.get(`${baseUri}/api/artist?artworkId=${artworkId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching artist by artwork:', error);
      return null;
    }
  }

  async getNextDropPassword(): Promise<{ password: string | null }> {
    return { password: null };
  }

  async getArtists(): Promise<ArtistsT> {
    try {
      const response = await fetch(`${baseUri}/api/artists`);

      if (!response.ok) {
        throw new Error('Failed to fetch artists');
      }

      const data = (await response.json()) as ArtistsT;
      return data;
    } catch (error) {
      console.error('Error fetching artists:', error);
      throw error;
    }
  }
}

export default Cms;
