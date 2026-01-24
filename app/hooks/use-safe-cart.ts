/**
 * useSafeCart - Resilient cart operations with automatic error recovery
 *
 * This hook wraps Hydrogen's useCart() to provide:
 * - userErrors inspection on every mutation
 * - No-op detection for silent failures
 * - Automatic cart recovery on stale/invalid carts
 * - Context mismatch detection and handling
 * - Single source of truth for cart state
 *
 * ## Usage
 *
 * Replace direct useCart() calls with useSafeCart():
 *
 * ```tsx
 * const { safeAddLines, safeUpdateLines, safeRemoveLines, cart, isRecovering } = useSafeCart();
 *
 * // Add items - automatically handles stale carts
 * const result = await safeAddLines([{ merchandiseId: '...', quantity: 1 }]);
 * if (!result.success) {
 *   console.error('Failed:', result.errors);
 * }
 * ```
 */

import { useCallback, useRef, useState, useMemo } from 'react';
import { useCart } from '@shopify/hydrogen-react';
import type { Cart as HydrogenCart, CartUserError } from '@shopify/hydrogen-react';
import {
  type SafeCartMutationResult,
  type CartMutationError,
  type CartLineAddInput,
  type CartLineUpdateInput,
  type CartContext,
  extractUserErrors,
  detectNoOpMutation,
  createNoOpError,
  createStaleCartError,
  createContextMismatchError,
  createRecoveryFailedError,
  getStoredCartContext,
  setStoredCartContext,
  clearStoredCartContext,
  isContextMatch,
  logCartMutation,
  buildSuccessResult,
  buildFailureResult,
} from '../lib/cart-service';

/**
 * Extended cart type that includes userErrors from mutations
 */
interface CartWithErrors extends HydrogenCart {
  userErrors?: CartUserError[];
}

/**
 * Options for safe cart operations
 */
interface SafeCartOptions {
  /** Country code for context validation */
  countryCode?: string;
  /** Language code for context validation */
  languageCode?: string;
  /** Whether to auto-recover on failure (default: true) */
  autoRecover?: boolean;
  /** Callback when cart is recovered */
  onRecovery?: (newCartId: string) => void;
  /** Callback when recovery fails */
  onRecoveryFailed?: (errors: CartMutationError[]) => void;
}

/**
 * Return type for useSafeCart hook
 */
interface UseSafeCartReturn {
  /** Current cart state */
  cart: HydrogenCart | null;
  /** Cart lines */
  lines: HydrogenCart['lines'] | null;
  /** Cart status */
  status: 'uninitialized' | 'creating' | 'fetching' | 'updating' | 'idle';
  /** Cart ID */
  cartId: string | undefined;
  /** Checkout URL */
  checkoutUrl: string | undefined;
  /** Cart cost */
  cost: HydrogenCart['cost'] | undefined;
  /** Total quantity in cart */
  totalQuantity: number;
  /** Whether a recovery operation is in progress */
  isRecovering: boolean;
  /** Last mutation errors (if any) */
  lastErrors: CartMutationError[];

  /** Safely add lines to cart with error handling and recovery */
  safeAddLines: (
    lines: CartLineAddInput[],
  ) => Promise<SafeCartMutationResult>;

  /** Safely update lines in cart with error handling and recovery */
  safeUpdateLines: (
    lines: CartLineUpdateInput[],
  ) => Promise<SafeCartMutationResult>;

  /** Safely remove lines from cart with error handling and recovery */
  safeRemoveLines: (lineIds: string[]) => Promise<SafeCartMutationResult>;

  /** Force create a new cart (useful for explicit recovery) */
  forceCreateNewCart: () => Promise<SafeCartMutationResult>;

  /** Clear any stored error state */
  clearErrors: () => void;
}

/**
 * Default options for safe cart operations
 */
const DEFAULT_OPTIONS: Required<SafeCartOptions> = {
  countryCode: 'US',
  languageCode: 'EN',
  autoRecover: true,
  onRecovery: () => {},
  onRecoveryFailed: () => {},
};

/**
 * Hook for resilient cart operations with automatic error recovery.
 *
 * This is the ONLY way cart mutations should be performed in the app.
 * Do not use useCart() directly for mutations.
 */
export function useSafeCart(options: SafeCartOptions = {}): UseSafeCartReturn {
  const {
    countryCode,
    languageCode,
    autoRecover,
    onRecovery,
    onRecoveryFailed,
  } = { ...DEFAULT_OPTIONS, ...options };

  // Get Hydrogen cart hook
  const cart = useCart();

  // Local state for recovery and errors
  const [isRecovering, setIsRecovering] = useState(false);
  const [lastErrors, setLastErrors] = useState<CartMutationError[]>([]);

  // Ref to track cart state before mutations for no-op detection
  const preOpCartStateRef = useRef<{
    updatedAt: string;
    totalQuantity: number;
  } | null>(null);

  // Ref to prevent concurrent mutations
  const mutationInProgressRef = useRef(false);

  /**
   * Capture cart state before a mutation for comparison
   */
  const capturePreOpState = useCallback(() => {
    if (cart) {
      preOpCartStateRef.current = {
        updatedAt: (cart as HydrogenCart).updatedAt ?? '',
        totalQuantity: cart.totalQuantity ?? 0,
      };
    }
  }, [cart]);

  /**
   * Wait for cart status to become idle after a mutation
   */
  const waitForMutationComplete = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      // Poll for status change - Hydrogen doesn't expose mutation promises
      const checkStatus = () => {
        if (cart.status === 'idle' || cart.status === 'uninitialized') {
          resolve();
        } else {
          setTimeout(checkStatus, 50);
        }
      };
      // Start checking after a small delay to allow status to change
      setTimeout(checkStatus, 100);
    });
  }, [cart.status]);

  /**
   * Get current cart as HydrogenCart with proper typing
   */
  const getCurrentCart = useCallback((): HydrogenCart | null => {
    if (!cart || cart.status === 'uninitialized') return null;
    return cart as unknown as HydrogenCart;
  }, [cart]);

  /**
   * Check for userErrors in the cart response.
   * Hydrogen doesn't directly expose userErrors, but we can check for
   * cart state that indicates failure.
   */
  const checkForUserErrors = useCallback((): CartUserError[] => {
    // Hydrogen's CartProvider handles userErrors internally
    // We can access them through the cart object if present
    const currentCart = cart as unknown as CartWithErrors;
    return currentCart?.userErrors ?? [];
  }, [cart]);

  /**
   * Create a fresh cart and store context
   */
  const createFreshCart = useCallback(async (): Promise<string | null> => {
    try {
      logCartMutation('createFreshCart', undefined, { countryCode, languageCode }, 'info');

      // Use Hydrogen's cartCreate
      cart.cartCreate({});

      // Wait for cart creation to complete
      await waitForMutationComplete();

      const newCart = getCurrentCart();
      if (newCart?.id) {
        // Store context for future validation
        const context: CartContext = {
          countryCode,
          languageCode,
          createdAt: new Date().toISOString(),
        };
        setStoredCartContext(context);

        logCartMutation('createFreshCart', newCart.id, { success: true }, 'info');
        return newCart.id;
      }

      return null;
    } catch (error) {
      logCartMutation('createFreshCart', undefined, { error }, 'error');
      return null;
    }
  }, [cart, countryCode, languageCode, waitForMutationComplete, getCurrentCart]);

  /**
   * Perform cart recovery: create new cart and retry the original mutation
   */
  const performRecovery = useCallback(
    async (
      originalMutation: () => Promise<void>,
      originalErrors: CartMutationError[],
    ): Promise<SafeCartMutationResult> => {
      setIsRecovering(true);

      try {
        logCartMutation('performRecovery', cart.id, { originalErrors }, 'warn');

        // Clear old context
        clearStoredCartContext();

        // Create fresh cart
        const newCartId = await createFreshCart();

        if (!newCartId) {
          const recoveryError = createRecoveryFailedError(originalErrors);
          onRecoveryFailed([recoveryError]);
          return buildFailureResult([recoveryError]);
        }

        // Retry the original mutation
        capturePreOpState();
        await originalMutation();
        await waitForMutationComplete();

        // Check for errors again
        const userErrors = checkForUserErrors();
        if (userErrors.length > 0) {
          const errors = extractUserErrors(userErrors);
          onRecoveryFailed(errors);
          return buildFailureResult(errors);
        }

        const recoveredCart = getCurrentCart();
        if (recoveredCart) {
          logCartMutation('performRecovery', newCartId, { success: true }, 'info');
          onRecovery(newCartId);
          return buildSuccessResult(recoveredCart, true, newCartId);
        }

        const recoveryError = createRecoveryFailedError(originalErrors);
        onRecoveryFailed([recoveryError]);
        return buildFailureResult([recoveryError]);
      } finally {
        setIsRecovering(false);
      }
    },
    [
      cart.id,
      createFreshCart,
      capturePreOpState,
      waitForMutationComplete,
      checkForUserErrors,
      getCurrentCart,
      onRecovery,
      onRecoveryFailed,
    ],
  );

  /**
   * Execute a mutation with full error handling and optional recovery
   */
  const executeSafeMutation = useCallback(
    async (
      mutationFn: () => Promise<void>,
      mutationType: 'add' | 'update' | 'remove',
      expectedQuantityChange?: number,
    ): Promise<SafeCartMutationResult> => {
      // Prevent concurrent mutations
      if (mutationInProgressRef.current) {
        return buildFailureResult([
          {
            code: 'UNKNOWN_ERROR',
            message: 'Another mutation is already in progress',
          },
        ]);
      }

      mutationInProgressRef.current = true;
      setLastErrors([]);

      try {
        // Check context match before mutation
        if (!isContextMatch(countryCode, languageCode)) {
          const storedContext = getStoredCartContext();
          if (storedContext) {
            const mismatchError = createContextMismatchError(storedContext, {
              countryCode,
              languageCode,
            });

            logCartMutation('executeSafeMutation', cart.id, { mismatchError }, 'warn');

            if (autoRecover) {
              return performRecovery(mutationFn, [mismatchError]);
            }

            setLastErrors([mismatchError]);
            return buildFailureResult([mismatchError]);
          }
        }

        // Capture pre-mutation state
        capturePreOpState();

        // Execute the mutation
        await mutationFn();

        // Wait for mutation to complete
        await waitForMutationComplete();

        // Check for explicit userErrors
        const userErrors = checkForUserErrors();
        if (userErrors.length > 0) {
          const errors = extractUserErrors(userErrors);
          logCartMutation(
            'executeSafeMutation',
            cart.id,
            { mutationType, userErrors: errors },
            'warn',
          );

          if (autoRecover) {
            return performRecovery(mutationFn, errors);
          }

          setLastErrors(errors);
          return buildFailureResult(errors);
        }

        // Check for silent no-op mutations
        const currentCart = getCurrentCart();
        const isNoOp = detectNoOpMutation(
          preOpCartStateRef.current,
          currentCart,
          mutationType,
          expectedQuantityChange,
        );

        if (isNoOp) {
          const noOpError = createNoOpError();
          const staleError = createStaleCartError(cart.id ?? 'unknown');
          const errors = [staleError, noOpError];

          logCartMutation(
            'executeSafeMutation',
            cart.id,
            { mutationType, isNoOp: true },
            'warn',
          );

          if (autoRecover) {
            return performRecovery(mutationFn, errors);
          }

          setLastErrors(errors);
          return buildFailureResult(errors);
        }

        // Success!
        if (currentCart) {
          return buildSuccessResult(currentCart);
        }

        // No cart after mutation - unusual but handle gracefully
        return buildFailureResult([
          { code: 'UNKNOWN_ERROR', message: 'No cart state after mutation' },
        ]);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const errors: CartMutationError[] = [
          { code: 'UNKNOWN_ERROR', message: errorMessage },
        ];

        logCartMutation(
          'executeSafeMutation',
          cart.id,
          { mutationType, error: errorMessage },
          'error',
        );

        setLastErrors(errors);
        return buildFailureResult(errors);
      } finally {
        mutationInProgressRef.current = false;
      }
    },
    [
      cart.id,
      countryCode,
      languageCode,
      autoRecover,
      capturePreOpState,
      waitForMutationComplete,
      checkForUserErrors,
      getCurrentCart,
      performRecovery,
    ],
  );

  /**
   * Safely add lines to cart
   */
  const safeAddLines = useCallback(
    async (lines: CartLineAddInput[]): Promise<SafeCartMutationResult> => {
      const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);

      return executeSafeMutation(
        async () => {
          cart.linesAdd(lines);
        },
        'add',
        totalQuantity,
      );
    },
    [cart, executeSafeMutation],
  );

  /**
   * Safely update lines in cart
   */
  const safeUpdateLines = useCallback(
    async (lines: CartLineUpdateInput[]): Promise<SafeCartMutationResult> => {
      return executeSafeMutation(
        async () => {
          cart.linesUpdate(lines);
        },
        'update',
      );
    },
    [cart, executeSafeMutation],
  );

  /**
   * Safely remove lines from cart
   */
  const safeRemoveLines = useCallback(
    async (lineIds: string[]): Promise<SafeCartMutationResult> => {
      return executeSafeMutation(
        async () => {
          cart.linesRemove(lineIds);
        },
        'remove',
        lineIds.length,
      );
    },
    [cart, executeSafeMutation],
  );

  /**
   * Force create a new cart
   */
  const forceCreateNewCart = useCallback(async (): Promise<SafeCartMutationResult> => {
    setIsRecovering(true);
    setLastErrors([]);

    try {
      clearStoredCartContext();
      const newCartId = await createFreshCart();

      if (newCartId) {
        const newCart = getCurrentCart();
        if (newCart) {
          onRecovery(newCartId);
          return buildSuccessResult(newCart, true, newCartId);
        }
      }

      const error: CartMutationError = {
        code: 'RECOVERY_FAILED',
        message: 'Failed to create new cart',
      };
      setLastErrors([error]);
      return buildFailureResult([error]);
    } finally {
      setIsRecovering(false);
    }
  }, [createFreshCart, getCurrentCart, onRecovery]);

  /**
   * Clear error state
   */
  const clearErrors = useCallback(() => {
    setLastErrors([]);
  }, []);

  // Memoize cart values
  const cartValues = useMemo(
    () => ({
      cart: getCurrentCart(),
      lines: cart.lines ?? null,
      status: cart.status,
      cartId: cart.id,
      checkoutUrl: cart.checkoutUrl ?? undefined,
      cost: cart.cost ?? undefined,
      totalQuantity: cart.totalQuantity ?? 0,
    }),
    [cart, getCurrentCart],
  );

  return {
    ...cartValues,
    isRecovering,
    lastErrors,
    safeAddLines,
    safeUpdateLines,
    safeRemoveLines,
    forceCreateNewCart,
    clearErrors,
  };
}

export default useSafeCart;
