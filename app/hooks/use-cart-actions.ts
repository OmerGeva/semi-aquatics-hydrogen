import { useMemo, useRef, useState } from 'react';
import { useCart } from '@shopify/hydrogen-react';
import { useCartDrawer } from '../contexts/cart-drawer-context';

type VariantLike =
  | string
  | {
    node?: {
      id?: string;
    };
  };

export const useCartActions = () => {
  const { lines, linesAdd, linesUpdate, status } = useCart();
  const { openCart } = useCartDrawer();
  const [pending, setPending] = useState(false);

  // hydrogen-react's cart silently ignores linesAdd/linesUpdate while it is
  // busy (creating, fetching or updating). Right after a first visit the cart
  // is busy setting the buyer's country, so an early tap on "Add to bag" was
  // dropped while the button still said "added". Keep the latest cart state in
  // refs so an add can wait for the cart to be free and then check it landed.
  const statusRef = useRef(status);
  const linesRef = useRef(lines);
  statusRef.current = status;
  linesRef.current = lines;

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

  const quantityOf = (merchandiseId: string) =>
    (linesRef.current ?? []).reduce(
      (sum: number, line: any) =>
        line?.merchandise?.id === merchandiseId ? sum + (line.quantity ?? 0) : sum,
      0,
    );

  const cartCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    lines?.forEach((line: any) => {
      const merchandiseId = line.merchandise?.id;
      if (merchandiseId) {
        counts[merchandiseId] = line.quantity;
      }
    });
    return counts;
  }, [lines]);

  const addToCart = async (
    variant: VariantLike,
    quantityToAdd: number,
    productGid?: string,
  ): Promise<boolean> => {
    const merchandiseId =
      (typeof variant === 'string' ? variant : variant?.node?.id) ?? '';

    if (!merchandiseId || quantityToAdd <= 0) {
      return false;
    }

    setPending(true);
    try {
      // Wait for any cart request in flight; otherwise this add is dropped.
      if (!(await waitWhile(isBusy, 15000))) return false;

      const before = quantityOf(merchandiseId);
      const existingLine = (linesRef.current ?? []).find(
        (line: any) => line?.merchandise?.id === merchandiseId,
      );

      if (existingLine?.id) {
        linesUpdate([
          {
            id: existingLine.id,
            quantity: (existingLine.quantity ?? 0) + quantityToAdd,
          },
        ]);
      } else {
        linesAdd([
          {
            merchandiseId,
            quantity: quantityToAdd,
          },
        ]);
      }

      // Report success only once the bag really holds more of this item.
      await waitWhile(() => !isBusy() && quantityOf(merchandiseId) <= before, 2000);
      await waitWhile(isBusy, 15000);
      return quantityOf(merchandiseId) > before;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    } finally {
      setPending(false);
    }
  };

  // Only use local pending state - status can be 'updating' during hydration
  const isLoading = pending;

  return { addToCart, isLoading, cartCounts };
};
