import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import styles from './ArtistPreview.module.scss';
import Cms from '../../../cms'
import { ArtistT } from '../../../types';


interface ArtistPreviewProps {
  artworkId: string;
}

const ArtistPreview: React.FC<ArtistPreviewProps> = ({ artworkId }) => {
  const [artist, setArtist] = useState<ArtistT | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await new Cms().getArtistByArtwork(artworkId);
        setArtist(response);
      } catch (err) {
        setError('Failed to load artist.');
        console.error('Error fetching artist:', err);
      } finally {
        setLoading(false);
      }
    };

    if (artworkId) {
      void fetchArtist();
    }
  }, [artworkId]);

  if (loading) return <p>Loading artist information...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!artist) return <p className={styles.error}>Artist not found.</p>;

  return (
    <div className={styles.artistPreview}>
      <div className={styles.artistHeader}>
        <div className={styles.artistDetails}>
          <h3>{artist.name}</h3>
          { artist.instagram &&
            <a href={`https://instagram.com/${artist.instagram}`} target="_blank" rel="noopener noreferrer" className={styles.instagram}>
              @{artist.instagram}
            </a>
          }
        </div>
        <Link href={`/artists/${artist.name.toLowerCase().replace(/\s+/g, '-')}`} className={styles.seeMore}>
          See More Products →
        </Link>
      </div>

      <div className={styles.artworkGrid}>
        {artist.artworks.map((art) => (
          <div key={art.id} className={styles.artworkItem}>
            {/* CMS artworks use ID-based routing; these are not Shopify products with handles */}
            <Link href={`/shop/${art.id}`}>
              <img src={art.image} alt={art.name} />
              <p>{art.name}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistPreview;
