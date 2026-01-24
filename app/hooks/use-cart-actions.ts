/**
 * useCartActions - High-level cart actions hook
 *
 * This hook provides a simple interface for cart operations while
 * leveraging the safe cart context for error handling and recovery.
 *
 * All mutations go through SafeCartProvider to ensure:
 * - userErrors are handled
 * - Stale carts are automatically recovered
 * - Context mismatches are detected
 *
 * ## Migration Note
 *
 * Previously this hook used useCart() directly. It now uses
 * useSafeCartContext() which provides the same functionality
 * with added resilience.
 */

import { useMemo } from 'react';
import { useSafeCartContext } from '../contexts/safe-cart-context';
import { useCartDrawer } from '../contexts/cart-drawer-context';
import type { SafeCartMutationResult } from '../lib/cart-service';

type VariantLike =
  | string
  | {
      node?: {
        id?: string;
      };
    };

/**
 * Return type for useCartActions hook
 */
interface UseCartActionsReturn {
  /**
   * Add item to cart with automatic quantity update for existing items
   * Returns a result object indicating success/failure
   */
  addToCart: (
    variant: VariantLike,
    quantityToAdd: number,
    productGid?: string,
  ) => Promise<SafeCartMutationResult>;

  /**
   * Whether a cart operation is in progress
   */
  isLoading: boolean;

  /**
   * Whether the cart is recovering from a failure
   */
  isRecovering: boolean;

  /**
   * Counts by merchandise ID for quick lookups
   */
  cartCounts: Record<string, number>;

  /**
   * Total quantity of items in cart
   */
  totalQuantity: number;

  /**
   * Any errors from the last mutation
   */
  lastErrors: Array<{ code: string; message: string }>;

  /**
   * Open the cart drawer (convenience method)
   */
  openCart: () => void;

  /**
   * Update quantity of a line item
   */
  updateQuantity: (
    lineId: string,
    newQuantity: number,
  ) => Promise<SafeCartMutationResult>;

  /**
   * Remove item from cart
   */
  removeFromCart: (lineId: string) => Promise<SafeCartMutationResult>;
}

/**
 * Hook for cart actions with resilient error handling
 *
 * Uses SafeCartProvider for all mutations, ensuring:
 * - Silent failures are detected and recovered
 * - Cart state is always authoritative
 * - Context mismatches are handled
 */
export const useCartActions = (): UseCartActionsReturn => {
  const {
    addToCart: safeAddToCart,
    updateQuantity: safeUpdateQuantity,
    removeFromCart: safeRemoveFromCart,
    isLoading,
    isRecovering,
    cartCounts,
    totalQuantity,
    lastErrors,
  } = useSafeCartContext();

  const { openCart } = useCartDrawer();

  /**
   * Add to cart with legacy-compatible interface
   *
   * Maintains same signature as previous implementation but now
   * leverages safe mutations under the hood.
   */
  const addToCart = async (
    variant: VariantLike,
    quantityToAdd: number,
    productGid?: string,
  ): Promise<SafeCartMutationResult> => {
    const merchandiseId =
      (typeof variant === 'string' ? variant : variant?.node?.id) ?? '';

    if (!merchandiseId || quantityToAdd <= 0) {
      return {
        success: false,
        cart: null,
        errors: [
          {
            code: 'UNKNOWN_ERROR',
            message: 'Invalid merchandise ID or quantity',
          },
        ],
        wasRecovered: false,
      };
    }

    const result = await safeAddToCart(variant, quantityToAdd, productGid);

    // Open cart on successful add (preserving previous behavior)
    if (result.success) {
      openCart();
    }

    return result;
  };

  return {
    addToCart,
    isLoading,
    isRecovering,
    cartCounts,
    totalQuantity,
    lastErrors,
    openCart,
    updateQuantity: safeUpdateQuantity,
    removeFromCart: safeRemoveFromCart,
  };
};

/**
 * Backward-compatible hook that returns a simpler interface
 * for components that only need basic cart info
 */
export const useCartInfo = () => {
  const { cartCounts, totalQuantity, isLoading } = useSafeCartContext();

  return useMemo(
    () => ({
      cartCounts,
      totalQuantity,
      isLoading,
    }),
    [cartCounts, totalQuantity, isLoading],
  );
};

export default useCartActions;
