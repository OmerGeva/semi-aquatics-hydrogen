import { useCart } from '@shopify/hydrogen-react';
import { IoClose } from 'react-icons/io5';
import { FiPlus } from "react-icons/fi"
import { FiMinus } from "react-icons/fi";
import RecommendedProducts from './recommended-products/recommended-products.component';
import { useCallback, useState, useEffect, useRef } from 'react';
import PaymentIcons from '../payment-icons/payment-icons.component';
import { useDropLock } from '../../hooks/use-drop-lock';
import { useIsMobile } from '../../hooks/use-is-mobile';
import { useCartDrawer } from '../../contexts/cart-drawer-context';
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
} as const;

const CartSidebar: React.FC = () => {
  const { isCartOpen, closeCart } = useCartDrawer();
  const { lines, checkoutUrl, cost, status, linesUpdate, id: cartId } = useCart();

  const items = lines ?? [];
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { isDropLocked, loading: dropLockLoading } = useDropLock();

  const shouldTrackCartView = isCartOpen;

  const handleCheckout = useCallback((e: React.MouseEvent) => {
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    setIsCheckingOut(true);
    // The page will navigate away, so we don't need to reset the state
  }, [items.length]);

  // hydrogen-react's cart ignores linesUpdate while a cart request is in
  // flight, so a quick second tap on "+" or "-" was lost. Queue the taps, and
  // send each one once the cart is free, counting from the bag's latest
  // quantity (same approach as addToCart in hooks/use-cart-actions.ts).
  const statusRef = useRef(status);
  const linesRef = useRef(lines);
  statusRef.current = status;
  linesRef.current = lines;
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const isBusy = () =>
    statusRef.current === 'creating' ||
    statusRef.current === 'fetching' ||
    statusRef.current === 'updating';

  const waitWhile = async (condition: () => boolean, timeoutMs: number) => {
    const start = Date.now();
    while (condition() && Date.now() - start < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return !condition();
  };

  const quantityOf = (lineItemId: string) =>
    (linesRef.current ?? []).find((line: any) => line?.id === lineItemId)
      ?.quantity ?? 0;

  const changeItemCount = useCallback(
    (lineItemId: string, change: number) => {
      queueRef.current = queueRef.current
        .then(async () => {
          if (!(await waitWhile(isBusy, 15000))) return;

          const before = quantityOf(lineItemId);
          const newQuantity = Math.max(before + change, 0);
          if (before === 0 || newQuantity === before) return;

          linesUpdate([{ id: lineItemId, quantity: newQuantity }]);

          // Wait for this update to finish before the next queued tap.
          await waitWhile(
            () => !isBusy() && quantityOf(lineItemId) === before,
            2000,
          );
          await waitWhile(isBusy, 15000);
        })
        .catch((error) => {
          console.error('Error updating bag quantity:', error);
        });
    },
    [linesUpdate],
  );

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isCartOpen]);

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
        <div className={styles.content} data-lenis-prevent>
          {status === 'uninitialized' && !checkoutUrl ? (
            <p>Loading cart...</p>
          ) : items.length === 0 ? (
            <p>Your bag is empty</p>
          ) : (
            <div className={styles.lineItems}>
              {items.map((line: any) => {
                const isArchiveProduct = line.merchandise?.product?.tags?.includes('shop-archive') || false;
                const imageIndex = isArchiveProduct ? 0 : 2;
                const imageUrl = line.merchandise?.image?.url ||
                  line.merchandise?.product?.images?.edges?.[imageIndex]?.node?.transformedSrc ||
                  '';

                return (
                  <div className={styles.lineItem} key={line.id}>
                    <div className={`${styles.imageContainer} ${isArchiveProduct ? 'archiveProduct' : ''}`}>
                      <img
                        src={imageUrl}
                        alt={line.merchandise?.product?.title || 'Cart item'}
                        style={isArchiveProduct ? { objectFit: 'contain' } : {}}
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
                              changeItemCount(line.id, -1);
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
                              changeItemCount(line.id, 1);
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
            href={items.length > 0 && checkoutUrl ? checkoutUrl : '#'}
            className={`${items.length === 0 ? styles.disabled : ''}`}
            onClick={handleCheckout}
          >
            <div className={`${styles.checkoutBtn} ${isCheckingOut ? styles.checkoutBtnLoading : ''}`}>
              {items.length === 0 ? 'Cart is empty' : isCheckingOut ? 'Processing...' : 'Proceed to checkout'}
            </div>
          </a>
          <PaymentIcons />
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
