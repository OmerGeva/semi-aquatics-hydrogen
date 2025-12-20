import { ShowPageProps } from '../../interfaces/page_interface';

// packages
import React, { useState, useMemo } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

// helper functions
import { firstSelectedVariant } from './utils'

// components
import ShowPageDesktop from './desktop/show-page-desktop.component';
import ShowPageMobile from './mobile/show-page-mobile.component';

// hooks
import { useIsMobile } from '../../hooks/use-is-mobile';
import { useIsTimeLeft } from '../../hooks/use-is-time-left';
import { useCartActions } from '../../hooks/use-cart-actions';

// analytics
import { withAddToCartTracking } from '../../lib/analytics/addToCart';
import { useAnalytics } from '@shopify/hydrogen';
import { useEffect } from 'react';
import { SHOPIFY_EVENT } from '../../lib/analytics/shopify';

interface ShowPagePropsWithArchive extends ShowPageProps {
  isArchiveProduct?: boolean;
}

const ShowPage: React.FC<ShowPagePropsWithArchive> = ({ product, isArchiveProduct = false }) => {
  const { addToCart, isLoading } = useCartActions();
  const { publish, ready } = useAnalytics() as any;

  const [numberToAdd, setNumberToAdd] = useState(1);
  const [selectedDesktop, setSelectedDesktop] = useState(null);
  const [selected, setSelected] = useState(firstSelectedVariant(product));
  const [slideNumber, setSlideNumber] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const isMobile = useIsMobile();
  const isTimeLeft = useIsTimeLeft();
  // const isNewProduct = useIsNewProduct(product.node.id);
  const isNewProduct = true;
  const navigate = useNavigate();
  const passwordGuessed = useSelector((state: any) => state.user.passwordGuessed);

  useEffect(() => {
    if (ready) {
      const variant = selected || firstSelectedVariant(product);
      publish(SHOPIFY_EVENT.PRODUCT_VIEW, {
        productGid: product.node.id,
        variantGid: variant?.id || '',
      });
    }
  }, [product.node.id, selected, publish, ready]);

  // Wrap addToCart with Meta Pixel tracking
  const addToCartTracked = useMemo(
    () =>
      withAddToCartTracking(addToCart, ([variant, quantity]) => {
        const variantNode = (variant as any)?.node ?? variant;
        const variantGid = variantNode?.id ?? '';
        const price = Number(variantNode?.priceV2?.amount ?? 0);
        const currency = variantNode?.priceV2?.currencyCode ?? 'USD';
        const title = product.node.title;
        const category = product.node.productType || '';

        return {
          variantGids: [variantGid],
          quantities: [quantity],
          prices: [price],
          currency,
          contentName: title,
          contentCategory: category,
        };
      }),
    [addToCart, product]
  );

  const handleOnAddToCart = async (selected: any) => {
    if (isAddingToCart) return;

    setIsAddingToCart(true);
    setAddToCartSuccess(false);

    try {
      const success = await addToCartTracked(selected, numberToAdd, product.node.id);

      setAddToCartSuccess(success);

      if (success) {
        // Reset success state after animation completes
        setTimeout(() => {
          setAddToCartSuccess(false);
        }, 2000);
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (
    passwordGuessed != import.meta.env.VITE_WEBSITE_LOCK_PASSWORD &&
    isTimeLeft &&
    isNewProduct
  ) {
    navigate('/shop')
  };

  return (
    <React.Fragment>
      {
        isMobile ?
          <ShowPageMobile
            product={product}
            selected={selected}
            setSelected={setSelected}
            handleOnAddToCart={product.node.availableForSale ? handleOnAddToCart : () => { }}
            setNumberToAdd={setNumberToAdd}
            slideNumber={slideNumber}
            setSlideNumber={setSlideNumber}
            numberToAdd={numberToAdd}
            isNewProduct={isNewProduct}
            isAddingToCart={isAddingToCart || isLoading}
            addToCartSuccess={addToCartSuccess}
            isArchiveProduct={isArchiveProduct} />
          :
          <ShowPageDesktop
            product={product}
            selected={selectedDesktop}
            setSelected={setSelectedDesktop}
            handleOnAddToCart={product.node.availableForSale ? handleOnAddToCart : () => { }}
            isAddingToCart={isAddingToCart || isLoading}
            addToCartSuccess={addToCartSuccess}
            setNumberToAdd={setNumberToAdd}
            slideNumber={slideNumber}
            setSlideNumber={setSlideNumber}
            numberToAdd={numberToAdd}
            isNewProduct={isNewProduct}
            isArchiveProduct={isArchiveProduct} />
      }

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        draggablePercent={0}
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover={false} />
    </React.Fragment>
  );
};

export default ShowPage;
