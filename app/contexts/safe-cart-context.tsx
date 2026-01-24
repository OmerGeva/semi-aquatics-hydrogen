/**
 * SafeCartContext - Centralized cart state and mutations provider
 *
 * This context is the SINGLE AUTHORITY for cart operations in the app.
 * All cart mutations MUST go through this context to ensure:
 * - Consistent error handling
 * - Automatic recovery from stale carts
 * - Context validation
 * - Single source of truth for cart state
 *
 * ## Usage
 *
 * Wrap your app with SafeCartProvider (usually inside CartProvider):
 *
 * ```tsx
 * <CartProvider>
 *   <SafeCartProvider countryCode="US" languageCode="EN">
 *     <App />
 *   </SafeCartProvider>
 * </CartProvider>
 * ```
 *
 * Then use the useSafeCartContext hook in components:
 *
 * ```tsx
 * const { addToCart, updateQuantity, removeFromCart, isRecovering } = useSafeCartContext();
 * ```
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Cart as HydrogenCart } from '@shopify/hydrogen-react';
import { useSafeCart } from '../hooks/use-safe-cart';
import type {
  SafeCartMutationResult,
  CartMutationError,
  CartLineAddInput,
  CartLineUpdateInput,
} from '../lib/cart-service';
import { logCartMutation } from '../lib/cart-service';

/**
 * Props for a single variant that can be added to cart
 */
interface VariantLike {
  node?: {
    id?: string;
  };
}

/**
 * Context value exposed to consumers
 */
interface SafeCartContextValue {
  /** Current cart state (authoritative) */
  cart: HydrogenCart | null;
  /** Cart line items */
  lines: HydrogenCart['lines'] | null;
  /** Cart status */
  status: 'uninitialized' | 'creating' | 'fetching' | 'updating' | 'idle';
  /** Cart ID */
  cartId: string | undefined;
  /** Checkout URL */
  checkoutUrl: string | undefined;
  /** Cart cost breakdown */
  cost: HydrogenCart['cost'] | undefined;
  /** Total items in cart */
  totalQuantity: number;
  /** Whether a recovery operation is in progress */
  isRecovering: boolean;
  /** Whether any cart operation is in progress */
  isLoading: boolean;
  /** Last mutation errors */
  lastErrors: CartMutationError[];
  /** Counts by merchandise ID */
  cartCounts: Record<string, number>;

  /**
   * Add item(s) to cart - the primary add-to-cart method
   * Handles existing line detection and quantity updates automatically
   */
  addToCart: (
    variant: string | VariantLike,
    quantity: number,
    productGid?: string,
  ) => Promise<SafeCartMutationResult>;

  /**
   * Update quantity of a specific line item
   * Use this for +/- buttons in cart UI
   */
  updateQuantity: (
    lineId: string,
    newQuantity: number,
  ) => Promise<SafeCartMutationResult>;

  /**
   * Remove a line item from cart
   * Convenience method that calls safeRemoveLines
   */
  removeFromCart: (lineId: string) => Promise<SafeCartMutationResult>;

  /**
   * Batch add multiple items to cart
   */
  addMultipleToCart: (
    items: Array<{ merchandiseId: string; quantity: number }>,
  ) => Promise<SafeCartMutationResult>;

  /**
   * Force create a new cart (for explicit recovery)
   */
  forceNewCart: () => Promise<SafeCartMutationResult>;

  /**
   * Clear error state
   */
  clearErrors: () => void;

  /** Low-level access to safe mutations for advanced use cases */
  safeAddLines: (lines: CartLineAddInput[]) => Promise<SafeCartMutationResult>;
  safeUpdateLines: (
    lines: CartLineUpdateInput[],
  ) => Promise<SafeCartMutationResult>;
  safeRemoveLines: (lineIds: string[]) => Promise<SafeCartMutationResult>;
}

/**
 * Default context value (throws if used outside provider)
 */
const defaultContext: SafeCartContextValue = {
  cart: null,
  lines: null,
  status: 'uninitialized',
  cartId: undefined,
  checkoutUrl: undefined,
  cost: undefined,
  totalQuantity: 0,
  isRecovering: false,
  isLoading: false,
  lastErrors: [],
  cartCounts: {},
  addToCart: async () => {
    throw new Error('useSafeCartContext must be used within SafeCartProvider');
  },
  updateQuantity: async () => {
    throw new Error('useSafeCartContext must be used within SafeCartProvider');
  },
  removeFromCart: async () => {
    throw new Error('useSafeCartContext must be used within SafeCartProvider');
  },
  addMultipleToCart: async () => {
    throw new Error('useSafeCartContext must be used within SafeCartProvider');
  },
  forceNewCart: async () => {
    throw new Error('useSafeCartContext must be used within SafeCartProvider');
  },
  clearErrors: () => {
    throw new Error('useSafeCartContext must be used within SafeCartProvider');
  },
  safeAddLines: async () => {
    throw new Error('useSafeCartContext must be used within SafeCartProvider');
  },
  safeUpdateLines: async () => {
    throw new Error('useSafeCartContext must be used within SafeCartProvider');
  },
  safeRemoveLines: async () => {
    throw new Error('useSafeCartContext must be used within SafeCartProvider');
  },
};

const SafeCartContext = createContext<SafeCartContextValue>(defaultContext);

/**
 * Props for SafeCartProvider
 */
interface SafeCartProviderProps {
  children: ReactNode;
  /** Country code for @inContext (default: 'US') */
  countryCode?: string;
  /** Language code for @inContext (default: 'EN') */
  languageCode?: string;
  /** Callback when cart is recovered */
  onRecovery?: (newCartId: string) => void;
  /** Callback when recovery fails */
  onRecoveryFailed?: (errors: CartMutationError[]) => void;
}

/**
 * Provider component that centralizes all cart operations
 */
export function SafeCartProvider({
  children,
  countryCode = 'US',
  languageCode = 'EN',
  onRecovery,
  onRecoveryFailed,
}: SafeCartProviderProps): JSX.Element {
  const {
    cart,
    lines,
    status,
    cartId,
    checkoutUrl,
    cost,
    totalQuantity,
    isRecovering,
    lastErrors,
    safeAddLines,
    safeUpdateLines,
    safeRemoveLines,
    forceCreateNewCart,
    clearErrors,
  } = useSafeCart({
    countryCode,
    languageCode,
    autoRecover: true,
    onRecovery,
    onRecoveryFailed,
  });

  /**
   * Compute cart counts by merchandise ID
   */
  const cartCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (lines && Array.isArray(lines)) {
      lines.forEach((line: any) => {
        const merchandiseId = line?.merchandise?.id;
        if (merchandiseId) {
          counts[merchandiseId] = line.quantity ?? 0;
        }
      });
    }
    return counts;
  }, [lines]);

  /**
   * Find existing line for a merchandise ID
   */
  const findExistingLine = useCallback(
    (merchandiseId: string): { id: string; quantity: number } | null => {
      if (!lines || !Array.isArray(lines)) return null;

      const line = lines.find(
        (l: any) => l?.merchandise?.id === merchandiseId,
      );

      if (line) {
        return { id: line.id, quantity: line.quantity ?? 0 };
      }

      return null;
    },
    [lines],
  );

  /**
   * Add to cart - handles both new items and quantity updates
   */
  const addToCart = useCallback(
    async (
      variant: string | VariantLike,
      quantity: number,
      productGid?: string,
    ): Promise<SafeCartMutationResult> => {
      const merchandiseId =
        typeof variant === 'string' ? variant : variant?.node?.id ?? '';

      if (!merchandiseId || quantity <= 0) {
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

      logCartMutation('addToCart', cartId, { merchandiseId, quantity }, 'info');

      // Check if item already exists in cart
      const existingLine = findExistingLine(merchandiseId);

      if (existingLine) {
        // Update existing line with new total quantity
        const newQuantity = existingLine.quantity + quantity;
        return safeUpdateLines([{ id: existingLine.id, quantity: newQuantity }]);
      }

      // Add new line
      return safeAddLines([{ merchandiseId, quantity }]);
    },
    [cartId, findExistingLine, safeAddLines, safeUpdateLines],
  );

  /**
   * Update quantity of a line item
   */
  const updateQuantity = useCallback(
    async (
      lineId: string,
      newQuantity: number,
    ): Promise<SafeCartMutationResult> => {
      if (!lineId) {
        return {
          success: false,
          cart: null,
          errors: [
            { code: 'UNKNOWN_ERROR', message: 'Invalid line ID' },
          ],
          wasRecovered: false,
        };
      }

      logCartMutation('updateQuantity', cartId, { lineId, newQuantity }, 'info');

      // If quantity is 0 or less, remove the item
      if (newQuantity <= 0) {
        return safeRemoveLines([lineId]);
      }

      return safeUpdateLines([{ id: lineId, quantity: newQuantity }]);
    },
    [cartId, safeRemoveLines, safeUpdateLines],
  );

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback(
    async (lineId: string): Promise<SafeCartMutationResult> => {
      if (!lineId) {
        return {
          success: false,
          cart: null,
          errors: [
            { code: 'UNKNOWN_ERROR', message: 'Invalid line ID' },
          ],
          wasRecovered: false,
        };
      }

      logCartMutation('removeFromCart', cartId, { lineId }, 'info');

      return safeRemoveLines([lineId]);
    },
    [cartId, safeRemoveLines],
  );

  /**
   * Add multiple items to cart at once
   */
  const addMultipleToCart = useCallback(
    async (
      items: Array<{ merchandiseId: string; quantity: number }>,
    ): Promise<SafeCartMutationResult> => {
      if (!items.length) {
        return {
          success: false,
          cart: null,
          errors: [
            { code: 'UNKNOWN_ERROR', message: 'No items provided' },
          ],
          wasRecovered: false,
        };
      }

      logCartMutation('addMultipleToCart', cartId, { itemCount: items.length }, 'info');

      // Separate items into new adds and updates
      const newItems: CartLineAddInput[] = [];
      const updateItems: CartLineUpdateInput[] = [];

      for (const item of items) {
        const existingLine = findExistingLine(item.merchandiseId);
        if (existingLine) {
          updateItems.push({
            id: existingLine.id,
            quantity: existingLine.quantity + item.quantity,
          });
        } else {
          newItems.push({
            merchandiseId: item.merchandiseId,
            quantity: item.quantity,
          });
        }
      }

      // Perform updates first, then adds
      if (updateItems.length > 0) {
        const updateResult = await safeUpdateLines(updateItems);
        if (!updateResult.success) {
          return updateResult;
        }
      }

      if (newItems.length > 0) {
        return safeAddLines(newItems);
      }

      // All items were updates
      const currentCart = cart;
      if (currentCart) {
        return {
          success: true,
          cart: currentCart,
          errors: [],
          wasRecovered: false,
        };
      }

      return {
        success: true,
        cart: null,
        errors: [],
        wasRecovered: false,
      };
    },
    [cartId, cart, findExistingLine, safeAddLines, safeUpdateLines],
  );

  /**
   * Computed loading state
   */
  const isLoading = status === 'updating' || status === 'creating' || isRecovering;

  const value = useMemo<SafeCartContextValue>(
    () => ({
      cart,
      lines,
      status,
      cartId,
      checkoutUrl,
      cost,
      totalQuantity,
      isRecovering,
      isLoading,
      lastErrors,
      cartCounts,
      addToCart,
      updateQuantity,
      removeFromCart,
      addMultipleToCart,
      forceNewCart: forceCreateNewCart,
      clearErrors,
      safeAddLines,
      safeUpdateLines,
      safeRemoveLines,
    }),
    [
      cart,
      lines,
      status,
      cartId,
      checkoutUrl,
      cost,
      totalQuantity,
      isRecovering,
      isLoading,
      lastErrors,
      cartCounts,
      addToCart,
      updateQuantity,
      removeFromCart,
      addMultipleToCart,
      forceCreateNewCart,
      clearErrors,
      safeAddLines,
      safeUpdateLines,
      safeRemoveLines,
    ],
  );

  return (
    <SafeCartContext.Provider value={value}>
      {children}
    </SafeCartContext.Provider>
  );
}

/**
 * Hook to access safe cart context
 *
 * This is the ONLY approved way to perform cart mutations in the app.
 */
export function useSafeCartContext(): SafeCartContextValue {
  const context = useContext(SafeCartContext);

  if (context === defaultContext) {
    throw new Error(
      'useSafeCartContext must be used within a SafeCartProvider',
    );
  }

  return context;
}

export default SafeCartProvider;
