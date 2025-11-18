import React, { useMemo } from 'react';
import { useIsNewProduct } from '../../hooks/use-is-new-product';
import styles from './ProductPreview.module.scss';
import { Link } from 'react-router';
import { useLocation } from 'react-router';

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
      <Link to={productHref}>
        {/* {isSoldOut && !isArchive && (
          <div className={styles.soldOut}>
            <h3>{isNewProduct && isTimeLeft ? 'COMING SOON' : 'SOLD OUT'}</h3>
          </div>
        )} */}
        <div className={`${styles.imageContainer} ${secondaryImage ? styles.hasSecondary : ''}`}>
          {secondaryImage ? (
            <>
              <img className={styles.primaryImage} src={image} alt={title} />
              <img className={styles.secondaryImage} src={secondaryImage} alt={`${title} alternate view`} />
            </>
          ) : (
            <img src={image} className={isArtistPage ? styles.isArtistPage : ''} alt={title} />
          )}
        </div>
        {title &&
        <div className={`${styles.previewDetails} ${isSmallText ? styles.isSmallText : ''}`}>
          <h3 className={styles.cardDetail}>{title}</h3>
          { !isArchive && price && parseInt(price) > 0 &&
           <h3 className={styles.cardDetail}>${price}0</h3> }
        </div>
        }
      </Link>
    </div>
  );
};

export default ProductPreview;
