import styles from './ArtistsPage.module.scss';
import ArtistSidebar from '../artist-sidebar/artist-sidebar.component';
import ArtistDetails from '../artist-details/artist-details.component';
import { useEffect, useState } from 'react';
import { ArtistsT, ArtistT } from '../../types';
import { useIsMobile } from '../../hooks/use-is-mobile';

interface ArtistsPageProps {
  artists: ArtistsT;
  selectedArtist?: ArtistT;
}

const ArtistsPage: React.FC<ArtistsPageProps> = ({ artists, selectedArtist }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const artistToShow = selectedArtist || artists[0];
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <div className={styles.artistsPageContainer}>
      <div
        className={styles.mobileToggleButton}
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? 'Close' : 'Choose Artist'}
      </div>

      <div
        className={`${styles.sidebarContainer} ${
          isSidebarOpen ? styles.open : ''
        }`}
      >
        <ArtistSidebar artists={artists} setIsSidebarOpen={setIsSidebarOpen} />
      </div>

      <ArtistDetails artist={artistToShow} />
    </div>
  );
};

export default ArtistsPage;
