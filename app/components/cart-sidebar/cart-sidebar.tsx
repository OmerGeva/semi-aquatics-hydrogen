/**
 * CartSidebar - Cart drawer component with resilient mutations
 *
 * This component displays the cart items and allows users to:
 * - View cart contents
 * - Update item quantities
 * - Remove items
 * - Proceed to checkout
 *
 * All cart mutations go through SafeCartProvider for automatic
 * error handling and recovery from stale carts.
 */

import { IoClose } from 'react-icons/io5';
import { FiPlus, FiMinus } from 'react-icons/fi';
import RecommendedProducts from './recommended-products/recommended-products.component';
import { useCallback, useState, useEffect } from 'react';
import PaymentIcons from '../payment-icons/payment-icons.component';
import { useDropLock } from '../../hooks/use-drop-lock';
import { useCartDrawer } from '../../contexts/cart-drawer-context';
import { useSafeCartContext } from '../../contexts/safe-cart-context';
import { Analytics } from '@shopify/hydrogen';

const styles = {
  backdrop: 'backdrop',
  visible: 'visible',
  drawer: 'drawer',
  open: 'open',
  header: 'header',
  closeBtn: 'closeBtn',
  content: 'content',
  lineItems: 'lineItems',
  lineItem: 'lineItem',
  imageContainer: 'imageContainer',
  itemInfo: 'itemInfo',
  flexBoxPriceSize: 'flexBoxPriceSize',
  flex_grower: 'flex_grower',
  sizeText: 'sizeText',
  sizeAdjustments: 'sizeAdjustments',
  sizeAdjuster: 'sizeAdjuster',
  sizeAdjusterBtn: 'sizeAdjusterBtn',
  sizeAdjusterCount: 'sizeAdjusterCount',
  removeItem: 'removeItem',
  recommendedProductsWrapper: 'recommendedProductsWrapper',
  footer: 'footer',
  checkoutText: 'checkoutText',
  checkoutBtn: 'checkoutBtn',
  checkoutBtnLoading: 'checkoutBtnLoading',
  disabled: 'disabled',
  errorBanner: 'errorBanner',
  recoveringBanner: 'recoveringBanner',
} as const;

const CartSidebar: React.FC = () => {
  const { isCartOpen, closeCart } = useCartDrawer();

  // Use safe cart context for resilient mutations
  const {
    lines,
    checkoutUrl,
    cost,
    status,
    updateQuantity,
    isRecovering,
    lastErrors,
    clearErrors,
  } = useSafeCartContext();

  const items = lines ?? [];
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { isDropLocked, loading: dropLockLoading } = useDropLock();

  const shouldTrackCartView = isCartOpen;

  const handleCheckout = useCallback(
    (e: React.MouseEvent) => {
      if (!Array.isArray(items) || items.length === 0) {
        e.preventDefault();
        return;
      }
      setIsCheckingOut(true);
      // The page will navigate away, so we don't need to reset the state
    },
    [items],
  );

  /**
   * Change item quantity using safe mutation.
   *
   * The updateQuantity function from SafeCartProvider handles:
   * - Quantity updates (newQuantity > 0)
   * - Item removal (newQuantity <= 0)
   * - Error recovery for stale carts
   */
  const changeItemCount = useCallback(
    async (lineItemId: string, newQuantity: number) => {
      if (newQuantity < 0) return;

      const result = await updateQuantity(lineItemId, newQuantity);

      if (!result.success) {
        // Errors are automatically stored in lastErrors
        // and can be displayed to the user
        console.error('[CartSidebar] Failed to update quantity:', result.errors);
      }

      if (result.wasRecovered) {
        console.log('[CartSidebar] Cart was recovered after update');
      }
    },
    [updateQuantity],
  );

  // Clear errors when cart closes
  useEffect(() => {
    if (!isCartOpen) {
      clearErrors();
    }
  }, [isCartOpen, clearErrors]);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isCartOpen]);

  const itemCount = Array.isArray(items) ? items.length : 0;

  return (
    <>
      {shouldTrackCartView && <Analytics.CartView />}
      <div
        className={`${styles.backdrop} ${isCartOpen ? styles.visible : ''}`}
        onClick={closeCart}
      />
      <div
        className={`${styles.drawer} ${isCartOpen ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        style={{
          // Ensure cart drawer is hidden during SSR/initial render before CSS classes apply
          transform: isCartOpen ? 'translateX(0)' : 'translateX(200%)',
        }}
      >
        <div className={styles.header}>
          <p>Bag</p>
          <button onClick={closeCart} className={styles.closeBtn}>
            <IoClose size={24} />
          </button>
        </div>
        <hr />

        {/* Recovery indicator */}
        {isRecovering && (
          <div className={styles.recoveringBanner}>
            Updating cart...
          </div>
        )}

        {/* Error banner */}
        {lastErrors.length > 0 && (
          <div className={styles.errorBanner}>
            {lastErrors.map((error, index) => (
              <p key={index}>{error.message}</p>
            ))}
          </div>
        )}

        <div className={styles.content} data-lenis-prevent>
          {status === 'uninitialized' && !checkoutUrl ? (
            <p>Loading cart...</p>
          ) : itemCount === 0 ? (
            <p>Your bag is empty</p>
          ) : (
            <div className={styles.lineItems}>
              {Array.isArray(items) &&
                items.map((line: any) => {
                  const isArchiveProduct =
                    line.merchandise?.product?.tags?.includes('shop-archive') ||
                    false;
                  const imageIndex = isArchiveProduct ? 0 : 2;
                  const imageUrl =
                    line.merchandise?.image?.url ||
                    line.merchandise?.product?.images?.edges?.[imageIndex]?.node
                      ?.transformedSrc ||
                    '';

                  return (
                    <div className={styles.lineItem} key={line.id}>
                      <div
                        className={`${styles.imageContainer} ${isArchiveProduct ? 'archiveProduct' : ''}`}
                      >
                        <img
                          src={imageUrl}
                          alt={line.merchandise?.product?.title || 'Cart item'}
                          style={
                            isArchiveProduct ? { objectFit: 'contain' } : {}
                          }
                        />
                      </div>
                      <div className={styles.itemInfo}>
                        <div className={styles.flexBoxPriceSize}>
                          <p>{line.merchandise?.product?.title}</p>
                          <div className={styles.flex_grower}></div>
                          <p>
                            $
                            {Number(
                              line.cost?.totalAmount?.amount ??
                                line.cost?.subtotalAmount?.amount ??
                                0,
                            ).toFixed(2)}
                          </p>
                        </div>
                        <p className={styles.sizeText}>
                          {line.merchandise?.title}
                        </p>
                        <div className={styles.sizeAdjustments}>
                          <div className={styles.sizeAdjuster}>
                            <div
                              className={styles.sizeAdjusterBtn}
                              onClick={() => {
                                void changeItemCount(
                                  line.id,
                                  Math.max(line.quantity - 1, 0),
                                );
                              }}
                            >
                              <FiMinus />
                            </div>
                            <div className={styles.sizeAdjusterCount}>
                              {line.quantity}
                            </div>
                            <div
                              className={styles.sizeAdjusterBtn}
                              onClick={() => {
                                void changeItemCount(line.id, line.quantity + 1);
                              }}
                            >
                              <FiPlus />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
        {!dropLockLoading && !isDropLocked && (
          <div className={styles.recommendedProductsWrapper}>
            <RecommendedProducts
              withAddToCart
              onClick={closeCart}
              columns={4}
              productContainerClassName="!w-full !aspect-[3/4] mx-auto !flex !justify-center !items-center"
            />
          </div>
        )}
        <div className={styles.footer}>
          <div className={styles.checkoutText}>
            <p>Subtotal:</p>
            <p>${Number(cost?.subtotalAmount?.amount ?? 0).toFixed(2)}</p>
          </div>
          <a
            href={itemCount > 0 && checkoutUrl ? checkoutUrl : '#'}
            className={`${itemCount === 0 ? styles.disabled : ''}`}
            onClick={handleCheckout}
          >
            <div
              className={`${styles.checkoutBtn} ${isCheckingOut ? styles.checkoutBtnLoading : ''}`}
            >
              {itemCount === 0
                ? 'Cart is empty'
                : isCheckingOut
                  ? 'Processing...'
                  : 'Proceed to checkout'}
            </div>
          </a>
          <PaymentIcons />
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
