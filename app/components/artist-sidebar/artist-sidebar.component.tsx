import { Link } from 'react-router';
import { useLocation } from 'react-router';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { ArtistsT } from '../../types';
import { Dispatch, SetStateAction } from 'react';

const styles = {
  artistSidebar: 'artistSidebar',
  artistItem: 'artistItem',
  selected: 'selected',
  arrowIcon: 'arrowIcon',
} as const;

interface ArtistSidebarProps {
  artists: ArtistsT;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const ArtistSidebar: React.FC<ArtistSidebarProps> = ({ artists, setIsSidebarOpen }) => {
  const handleClick = () => {
    setIsSidebarOpen(false);
  };

  const location = useLocation();
  // Extract the slug from the URL pathname
  const pathParts = location.pathname.split('/');
  const currentSlug = pathParts.includes('artists') ? pathParts[pathParts.indexOf('artists') + 1] : null;

  return (
    <div className={styles.artistSidebar}>
      <h2>Artists</h2>
      <ul>
        {artists.map((artist) => (
          <li
            key={artist.slug}
            className={`${styles.artistItem} ${currentSlug === artist.slug ? styles.selected : ''
              }`}
            onClick={handleClick}
          >
            <Link to={`/artists/${artist.slug}`}>
              <HiOutlineArrowRight className={styles.arrowIcon} />
              <span>{artist.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArtistSidebar;
