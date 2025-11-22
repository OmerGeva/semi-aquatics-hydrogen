import React, { useState } from 'react';
import { useRecommendedProducts } from '../../../hooks/use-recommended-products';
import ProductPreview from '../../product-preview/product-preview.component';
import { useCartActions } from '../../../hooks/use-cart-actions';
import { useIsMobile } from '../../../hooks/use-is-mobile';

const styles = {
  sizeFlex: 'sizeFlex',
  availableSize: 'availableSize',
  soldOutSize: 'soldOutSize',
  recommendedWrapper: 'recommendedWrapper',
  title: 'title',
  small: 'small',
  medium: 'medium',
  large: 'large',
  grid: 'grid',
  grid4: 'grid4',
  grid3: 'grid3',
  previewWithTitle: 'previewWithTitle',
  productTitle: 'productTitle',
} as const;

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
  );
};

const RecommendedProducts: React.FC<PropsT & { columns?: number; productContainerClassName?: string }> = ({
  width = DEFAULT_WIDTH,
  textAlign = DEFAULT_TEXT_ALIGN,
  textSize = DEFAULT_TEXT_SIZE,
  itemCount = DEFAULT_ITEM_COUNT,
  withAddToCart = false,
  onClick = () => { },
  columns = 4,
  productContainerClassName = "!w-full !aspect-[3/4] mx-auto !flex !justify-center !items-center",
}) => {
  const { products, loading, error } = useRecommendedProducts();
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  if (loading || error || products.length === 0) return null;

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  }[columns] || 'grid-cols-4';

  return (
    <div className={styles.recommendedWrapper}>
      <p className={`${styles.title} ${styles[textSize]}`} style={{ textAlign }}>
        You might also like
      </p>
      <div className={`grid w-full gap-4 ${gridColsClass}`}>
        {products.slice(0, itemCount).map(({ node: product }) => (
          <div
            key={product.id}
            className="flex flex-col items-start w-full"
            onMouseEnter={() => setHoveredProductId(product.id)}
            onMouseLeave={() => setHoveredProductId(null)}
          >
            <div
              onClick={onClick}
              className="w-full"
            >
              <ProductPreview
                id={product.id}
                handle={product.handle}
                image={product.images.edges[2]?.node?.transformedSrc}
                isSoldOut={true}
                isSmallText={true}
                isArchive={true}
                isTimeLeft={false}
                imageClassName="!h-full !w-full !object-center"
                containerClassName={productContainerClassName}
                disableDefaultImageContainer={true}
              />
            </div>
            <div className={styles.productTitle}>
              {hoveredProductId === product.id && withAddToCart ? (
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
