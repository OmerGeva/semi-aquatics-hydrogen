import React, { useMemo } from 'react';
import { useIsNewProduct } from '../../hooks/use-is-new-product';
import { Link } from 'react-router';
import { useLocation } from 'react-router';

const styles = {
  productPreviewContainer: 'productPreviewContainer',
  soldOut: 'soldOut',
  imageContainer: 'imageContainer',
  hasSecondary: 'hasSecondary',
  primaryImage: 'primaryImage',
  secondaryImage: 'secondaryImage',
  isArtistPage: 'isArtistPage',
  previewDetails: 'previewDetails',
  isSmallText: 'isSmallText',
  cardDetail: 'cardDetail',
} as const;

const ARTISTS_ROUTE = '/artists'

interface ProductPreviewProps {
  image: string;
  title?: string;
  id: string;
  handle?: string;
  isSoldOut: boolean;
  isSmallText?: boolean;
  isArchive: boolean;
  secondaryImage?: string;
  price?: string;
  isTimeLeft?: boolean;
  imageClassName?: string;
  containerClassName?: string;
  disableDefaultImageContainer?: boolean;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({
  image,
  title,
  id,
  handle,
  isSoldOut,
  secondaryImage,
  isSmallText,
  isArchive,
  price,
  isTimeLeft,
  imageClassName = '',
  containerClassName = '',
  disableDefaultImageContainer = false,
}) => {
  // const isNewProduct = useIsNewProduct(id);
  const isNewProduct = false
  const deconstructedId = id.split('/').splice(-1)[0];
  const { pathname } = useLocation();
  const isArtistPage = useMemo(() => pathname.startsWith(ARTISTS_ROUTE), [pathname])
  // Handle-driven URL routing: use handle for Shopify products, fall back to ID for non-Shopify products
  const productHref = handle ? `/products/${handle}` : `/shop/${deconstructedId}`;

  return (
    <div className={styles.productPreviewContainer}>
      <Link to={productHref} className="block w-full">
        {/* {isSoldOut && !isArchive && (
          <div className={styles.soldOut}>
            <h3>{isNewProduct && isTimeLeft ? 'COMING SOON' : 'SOLD OUT'}</h3>
          </div>
        )} */}
        <div className={`${!disableDefaultImageContainer ? styles.imageContainer : ''} ${secondaryImage ? styles.hasSecondary : ''} ${containerClassName}`}>
          {secondaryImage ? (
            <>
              <img className={`${styles.primaryImage} ${imageClassName}`} src={image} alt={title} />
              <img className={`${styles.secondaryImage} ${imageClassName}`} src={secondaryImage} alt={`${title} alternate view`} />
            </>
          ) : (
            <img src={image} className={`${isArtistPage ? styles.isArtistPage : ''} ${imageClassName}`} alt={title} />
          )}
        </div>
        {title &&
          <div className={`${styles.previewDetails} ${isSmallText ? styles.isSmallText : ''}`}>
            <h3 className={styles.cardDetail}>{title}</h3>
            {!isArchive && price && parseInt(price) > 0 &&
              <h3 className={styles.cardDetail}>${price}0</h3>}
          </div>
        }
      </Link>
    </div>
  );
};

export default ProductPreview;
