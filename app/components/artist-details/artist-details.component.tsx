import ProductPreview from '../product-preview/product-preview.component';
import { ArtistT } from '../../types';
import { HiOutlineArrowRight } from "react-icons/hi2";

const styles = {
  artistDetails: 'artistDetails',
  artistNameHeader: 'artistNameHeader',
  artistName: 'artistName',
  artistProductsContainer: 'artistProductsContainer',
} as const;

interface ArtistDetailsProps {
  artist: ArtistT;
}

const ArtistDetails: React.FC<ArtistDetailsProps> = ({ artist }) => {
  return (
    <div className={styles.artistDetails}>
      <div className={styles.artistNameHeader}>
        <HiOutlineArrowRight />
        <h1 className={styles.artistName}>{artist.name}</h1>
      </div>
      <div className={styles.artistProductsContainer}>
        {artist.artworks.map((artwork) => (
          <ProductPreview
            key={artwork.id}
            id={artwork.id}
            title={artwork.name}
            image={artwork.image}
            isSoldOut={true}
            isArchive={true}
            isTimeLeft={false}
            disableDefaultImageContainer={true}
            imageClassName="!h-full !w-full !object-contain !object-center"
            containerClassName="!w-full !aspect-[3/4] mx-auto !flex !justify-center !items-center"
          />
        ))}
      </div>
    </div>
  );
};

export default ArtistDetails;
