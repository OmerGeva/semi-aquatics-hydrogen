import React, { useState } from 'react';
import { useRecommendedProducts } from '../../../hooks/use-recommended-products';
import ProductPreview from '../../product-preview/product-preview.component';
import styles from './RecommendedProducts.module.scss';
import { useCartActions } from '../../../hooks/use-cart-actions';
import { useIsMobile } from '../../../hooks/use-is-mobile';

interface PropsT {
  width?: 50 | 75 | 100;
  textAlign?: 'left' | 'center' | 'right';
  textSize?: 'small' | 'medium' | 'large';
  itemCount?: number;
  withAddToCart?: boolean;
  onClick?: () => void;
}

const DEFAULT_ITEM_COUNT = 4;
const DEFAULT_WIDTH = 100;
const DEFAULT_TEXT_ALIGN = 'left';
const DEFAULT_TEXT_SIZE = 'small';

// Subcomponent for displaying sizes
const ProductSizes: React.FC<{ variants: any[] }> = ({ variants }) => {
  const { addToCart } = useCartActions();

  const handleSizeClick = (variantData: any) => {
    void addToCart(variantData, 1);
  };

  return (
  <div className={styles.sizeFlex}>
    {variants.map((variant) => (
      <div
        key={variant.node.id}
        className={variant.node.availableForSale ? styles.availableSize : styles.soldOutSize}
        onClick={() =>
          variant.node.availableForSale ? handleSizeClick(variant) : null
        }
      >
        {variant.node.title}
      </div>
    ))}
  </div>
  )
};

const RecommendedProducts: React.FC<PropsT> = ({
  width = DEFAULT_WIDTH,
  textAlign = DEFAULT_TEXT_ALIGN,
  textSize = DEFAULT_TEXT_SIZE,
  itemCount = DEFAULT_ITEM_COUNT,
  withAddToCart = false,
  onClick = () => {},
}) => {
  const { products, loading, error } = useRecommendedProducts();
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  if (loading || error || products.length === 0) return null;

  return (
    <div className={styles.recommendedWrapper}>
      <p className={`${styles.title} ${styles[textSize]}`} style={{ textAlign }}>
        You might also like
      </p>
      <div className={`${styles.grid} ${styles[`grid${itemCount}`]}`} style={{ width: `${width}%` }}>
        {products.slice(0, itemCount).map(({ node: product }) => (
          <div
            key={product.id}
            className={styles.previewWithTitle}
            onMouseEnter={() => setHoveredProductId(product.id)}
            onMouseLeave={() => setHoveredProductId(null)}
          >
            <div
              onClick={onClick}
            >
            <ProductPreview
              id={product.id}
              handle={product.handle}
              image={product.images.edges[2]?.node?.transformedSrc}
              isSoldOut={true}
              isSmallText={true}
              isArchive={true}
              isTimeLeft={false}

            />
            </div>
            <div className={styles.productTitle}>
              {hoveredProductId === product.id && !isMobile && withAddToCart ? (
                <ProductSizes variants={product.variants.edges} />
              ) : (
                <h3>{product.title}</h3>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
