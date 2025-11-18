import axios from 'axios';
import { ArtistT, ArtistsT } from '../types';

const baseUri =
  (import.meta.env.VITE_DEV_CMS === 'development'
    ? 'http://localhost:3000'
    : 'https://semi-aquatics-cms.onrender.com');

class Cms {
  async getNextDrop() {
    try {
      const response = await axios.get(`${baseUri}/api/next-drop`);
      // Keep the UTC Date as returned by the API for accurate comparisons across timezones.
      // Display conversions to EST should be handled at render time if needed.
      return response.data;
    } catch (error) {
      console.error('Error fetching next drop:', error);
      throw error;
    }
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

  async getNextDropPassword(): Promise<{ password: string }> {
    try {
      const response = await axios.get(`${baseUri}/api/nxt-drop-password`);
      return response.data;
    } catch (error) {
      console.error('Error fetching next drop:', error);
      throw error;
    }
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
