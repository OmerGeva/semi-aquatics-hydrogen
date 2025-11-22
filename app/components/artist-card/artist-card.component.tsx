import { useState } from 'react';
import { Link } from 'react-router';

const styles = {
  artistCardContainer: 'artistCardContainer',
  open: 'open',
  artistAndIcon: 'artistAndIcon',
  isOpenColor: 'isOpenColor',
  artist: 'artist',
  icon: 'icon',
  isOpenIcon: 'isOpenIcon',
  artworkContainer: 'artworkContainer',
  linkImageText: 'linkImageText',
} as const;

// Icons
import { BsArrowUp } from 'react-icons/bs';

interface ArtistCardProps {
  artistName: string;
  artworks: {
    name: string,
    id: string,
    image: string,
    drop: number
  }[];
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artistName, artworks }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${styles.artistCardContainer} ${isOpen ? styles.open : ''}`}>
      <div className={`${styles.artistAndIcon} ${isOpen ? styles.isOpenColor : '' }`} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={styles.artist}>{artistName}</h2>
        <div className={`${styles.icon} ${isOpen ? styles.isOpenIcon : '' }`}>
          <BsArrowUp />
        </div>
      </div>

      <div className={styles.artworkContainer}>
        {artworks.map((artwork) => (
          <div className={styles.linkImageText} key={artwork.id}>
              {/* CMS artworks use ID-based routing; these are not Shopify products with handles */}
              <Link to={`/shop/${artwork.id}`}>
                <div>
                  <img src={artwork.image} alt={artwork.name} />
                  <p>{artwork.name}</p>
                </div>
              </Link>
          </div>
        ))}

      </div>
    </div>
  )
}

export default ArtistCard;
