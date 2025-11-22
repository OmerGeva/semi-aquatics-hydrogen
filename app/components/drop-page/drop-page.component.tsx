import { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import CountdownTimer from '../countdown-timer/countdown-timer.component';
import PasswordWall from '../password-wall/password-wall.component';
import ProductPreview from '../product-preview/product-preview.component';
import { CollectionT } from '../../types';
import { useIsMobile } from '../../hooks/use-is-mobile';
import { useDropLock } from '../../hooks/use-drop-lock';

const styles = {
  dropPageContainer: 'dropPageContainer',
  dropHeader: 'dropHeader',
  dropTitle: 'dropTitle',
  lockerDropHeader: 'lockerDropHeader',
  dropDescription: 'dropDescription',
  productsSection: 'productsSection',
  productsWrapper: 'productsWrapper',
  categoryHeader: 'categoryHeader',
  categoryDescription: 'categoryDescription',
  filterTabsWrapper: 'filterTabsWrapper',
  hasOverflow: 'hasOverflow',
  scrolledToEnd: 'scrolledToEnd',
  filterTabs: 'filterTabs',
  filterButton: 'filterButton',
  mobileFilterButton: 'mobileFilterButton',
  active: 'active',
  productsContainer: 'productsContainer',
  noProducts: 'noProducts',
  lockedDropContainer: 'lockedDropContainer',
} as const;

type ProductType = 'all' | 'drop' | 'mainline' | 'tshirt' | 'hoodie' | 'crewneck';

const PRODUCT_TYPE_MAP: Record<string, ProductType> = {
  'T-Shirts': 'tshirt',
  'Organic Cotton Hoodies': 'hoodie',
  'Organic Cotton Crews': 'crewneck'
};

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  all: 'Shop All',
  drop: 'Drop',
  mainline: 'Main Line',
  tshirt: 'T-Shirt',
  hoodie: 'Hoodie',
  crewneck: 'Crewneck'
};

const PRODUCT_TYPE_DESCRIPTIONS: Record<ProductType, string> = {
  all: 'Skip the sorting - just plunge in. This is every piece we\'ve reeled in at Semi Aquatics, all in one place.',
  drop: 'Ride the latest wave - our limited collection, exclusive to this release and gone once it drifts away.',
  mainline: 'Catch our core classics - timeless pieces that surface again and again whenever they swim off the shelf.',
  tshirt: 'Relaxed fit tees with a slight crop, cut from sturdy-soft organic cotton.',
  hoodie: 'Relaxed-fit hoodies constructed from heavyweight 500gsm organic cotton fleece.',
  crewneck: 'Relaxed-fit crewnecks constructed from heavyweight 500gsm organic cotton fleece.'
};

interface DropPageProps {
  dropItems: CollectionT;
  mainLineItems: CollectionT;
  password: string | null;
  dropData: any;
}

const DropPage: React.FC<DropPageProps> = ({ dropItems, mainLineItems, password, dropData }) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { products } = dropItems;
  // Password lock handled via useDropLock
  const [selectedType, setSelectedType] = useState<ProductType>(() => {
    // Get the tab from URL parameter, default to 'all' if not valid
    const searchParams = new URLSearchParams(location.search);
    const tabFromUrl = searchParams.get('tab') as string;
    return Object.keys(PRODUCT_TYPE_LABELS).includes(tabFromUrl) ? tabFromUrl as ProductType : 'all';
  });
  const [hasOverflow, setHasOverflow] = useState<boolean>(false);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState<boolean>(false);
  const filterTabsRef = useRef<HTMLDivElement>(null);

  // Update URL when tab changes
  const updateSelectedType = (newType: ProductType) => {
    setSelectedType(newType);

    // Update URL with new tab parameter
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', newType);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: false });
  };

  const dropTitle = useMemo(() => {
    return dropData?.title || 'Latest Drop';
  }, [dropData]);

  const { isDropLocked } = useDropLock({ password, dropDateTime: dropData?.dateTime ?? null });

  const allProducts = useMemo(() => {
    const dropProductsEdges = products?.edges || [];
    const mainLineProductsEdges = mainLineItems?.products?.edges || [];

    // Add a source property to identify where each product comes from
    const dropProductsWithSource = dropProductsEdges.map((product: any) => ({
      ...product,
      source: 'drop'
    }));

    const mainLineProductsWithSource = mainLineProductsEdges.map((product: any) => ({
      ...product,
      source: 'mainline'
    }));

    // Combine both collections for "Shop All"
    return [...dropProductsWithSource, ...mainLineProductsWithSource];
  }, [products, mainLineItems]);

  const filteredProducts = useMemo(() => {
    if (allProducts.length === 0) return [];


    return allProducts.filter((product: any) => {
      // For 'all', show everything
      if (selectedType === 'all') return true;

      // For 'drop', show only drop collection items
      if (selectedType === 'drop') return product.source === 'drop';

      // For 'mainline', show only main line collection items
      if (selectedType === 'mainline') return product.source === 'mainline';

      // For specific product types (tshirt, hoodie, crewneck)
      const productType = PRODUCT_TYPE_MAP[product.node.productType];
      return productType === selectedType;
    });
  }, [allProducts, selectedType]);

  // Countdown logic moved into useDropLock

  // Check if filter tabs are overflowing and need the gradient
  const checkForOverflow = () => {
    const container = filterTabsRef.current;
    if (container) {
      // Check if scrollable width is greater than visible width
      const hasHorizontalOverflow = container.scrollWidth > container.clientWidth;
      setHasOverflow(hasHorizontalOverflow);
    }
  };

  // Handle scroll events to detect when scrolled to the end
  const handleScroll = () => {
    const container = filterTabsRef.current;
    if (container) {
      const scrollLeft = container.scrollLeft;
      const clientWidth = container.clientWidth;
      const scrollWidth = container.scrollWidth;
      // Use a more lenient threshold for mobile (5px instead of 1px)
      const threshold = isMobile ? 5 : 1;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - threshold;

      setIsScrolledToEnd(isAtEnd);
    }
  };

  // Check on initial render and when window resizes
  useEffect(() => {
    // Use timeout to ensure DOM is fully rendered before checking
    const timer = setTimeout(() => {
      checkForOverflow();
    }, 100);

    // Add resize listener
    window.addEventListener('resize', checkForOverflow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkForOverflow);
    };
  }, [filteredProducts]); // Re-check when products change as it might affect tabs

  // Add scroll listener to filter tabs
  useEffect(() => {
    const container = filterTabsRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);

      // Test the scroll detection immediately
      setTimeout(() => {
        handleScroll();
      }, 1000);

      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Run check on component mount and after state changes
  useEffect(() => {
    checkForOverflow();
  }, [selectedType, allProducts.length]);

  // Handle URL parameter changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabFromUrl = searchParams.get('tab') as string;
    if (tabFromUrl && Object.keys(PRODUCT_TYPE_LABELS).includes(tabFromUrl)) {
      setSelectedType(tabFromUrl as ProductType);
    }
  }, [location.search]);

  return (
    <div className={`${styles.dropPageContainer} ${isDropLocked ? styles.lockedDropContainer : ''}`}>
      {/* <div className={`${styles.dropHeader} ${isDropLocked ? styles.lockerDropHeader : ''}`}>
        { isInFuture && adjustedDropDateTime && <CountdownTimer dropDateTime={adjustedDropDateTime} setShowCountdown={setIsInFuture}/> }
      </div> */}

      {isDropLocked &&
        <PasswordWall images={allProducts.map((product: any) => product.node.images.edges[2].node.transformedSrc)} password={password} />
      }

      {!isDropLocked && (
        <div className={styles.productsSection}>
          <div className={`${styles.filterTabsWrapper} ${hasOverflow ? styles.hasOverflow : ''} ${isScrolledToEnd ? styles.scrolledToEnd : ''}`}>
            <div className={styles.filterTabs} ref={filterTabsRef}>
              {Object.entries(PRODUCT_TYPE_LABELS).map(([type, label], index) => (
                 isMobile ?
                  <button
                  key = { type }
                  className = {`${styles.filterButton} ${styles.mobileFilterButton} ${selectedType === type ? styles.active : ''}`}
              onClick={() => updateSelectedType(type as ProductType)}
                  data-text={label}
                >
              {`${label}${!isMobile && index !== Object.entries(PRODUCT_TYPE_LABELS).length - 1 ? ',' : ''}`}
            </button>
                :
                  <button
                    key={type}
                    className={`${styles.filterButton} ${selectedType === type ? styles.active : ''}`}
                    onClick={() => updateSelectedType(type as ProductType)}
                  data-text={label}
                  >
                    {`${label}${!isMobile && index !== Object.entries(PRODUCT_TYPE_LABELS).length - 1 ? ',' : ''}`}
                  </button>

              ))}
            </div>
          </div>

          {/* Category Description is now below the filter tabs */}
          <div className={styles.categoryHeader}>
            <p className={styles.categoryDescription}>{PRODUCT_TYPE_DESCRIPTIONS[selectedType]}</p>
          </div>


          <div className={styles.productsWrapper}>
            <div className={styles.productsContainer}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product: any) => (
                  <ProductPreview
                    key={product.node.id}
                    image={product.node.images.edges[1] ? product.node.images.edges[1].node.transformedSrc : ''}
                    secondaryImage={product.node.images.edges[2] ? product.node.images.edges[2].node.transformedSrc : undefined}
                    title={product.node.title}
                    isSoldOut={!product.node.availableForSale}
                    price={product.node.variants.edges[0] ? product.node.variants.edges[0].node.priceV2.amount : ''}
                    id={product.node.id}
                    handle={product.node.handle}
                    isArchive={false}
                  />
                ))
              ) : (
                <div className={styles.noProducts}>No products found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropPage;
