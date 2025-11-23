import { useMemo, useState } from 'react';
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
  ): Promise<boolean> => {
    const merchandiseId =
      (typeof variant === 'string' ? variant : variant?.node?.id) ?? '';

    if (!merchandiseId || quantityToAdd <= 0) {
      return false;
    }

    setPending(true);
    try {
      const existingLine = lines?.find(
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


      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    } finally {
      setPending(false);
    }
  };

  const isLoading = pending || status === 'updating';

  return { addToCart, isLoading, cartCounts };
};
