/**
 * Cart Service - Centralized cart mutation handling with error recovery
 *
 * This module provides resilient cart operations that handle Shopify's silent failures.
 *
 * ## Why This Exists
 *
 * Shopify's Storefront API returns HTTP 200 for cart mutations even when they fail.
 * The only indicators of failure are:
 * 1. `userErrors` array in the response (explicit errors)
 * 2. Unchanged `updatedAt` timestamp or `totalQuantity` (silent no-ops)
 *
 * Common causes of silent failures:
 * - Stale/expired cart IDs (carts expire after ~10 days of inactivity)
 * - Cart created in different country/language context
 * - Cart session drift between server and client
 * - Invalid line item IDs after cart recreation
 *
 * ## Architecture
 *
 * All cart mutations flow through `safeCartMutation()` which:
 * 1. Executes the mutation
 * 2. Inspects `userErrors` from the response
 * 3. Detects no-op mutations (unchanged cart state)
 * 4. Auto-recovers by creating a fresh cart and retrying
 * 5. Returns the authoritative cart state to replace (not merge) in app state
 */

import type { Cart as HydrogenCart, CartUserError } from '@shopify/hydrogen-react';

// Re-export for convenience
export type { CartUserError };

/**
 * Result of a safe cart mutation.
 * Always contains the authoritative cart state or an error.
 */
export interface SafeCartMutationResult {
  success: boolean;
  cart: HydrogenCart | null;
  errors: CartMutationError[];
  /** True if the cart was recreated during recovery */
  wasRecovered: boolean;
  /** The new cart ID if recovery occurred */
  newCartId?: string;
}

/**
 * Structured error from cart mutations
 */
export interface CartMutationError {
  code: CartMutationErrorCode;
  message: string;
  field?: string;
  /** Original userError from Shopify if applicable */
  originalError?: CartUserError;
}

export type CartMutationErrorCode =
  | 'USER_ERROR' // Shopify returned explicit userErrors
  | 'STALE_CART' // Cart ID is invalid or expired
  | 'NO_OP_MUTATION' // Mutation was silently ignored
  | 'CONTEXT_MISMATCH' // Cart context doesn't match current context
  | 'RECOVERY_FAILED' // Failed to recover with new cart
  | 'UNKNOWN_ERROR'; // Unexpected error

/**
 * Context information used when cart was created.
 * Stored alongside cart ID to detect context mismatches.
 */
export interface CartContext {
  countryCode: string;
  languageCode: string;
  createdAt: string;
}

/**
 * Mutation types supported by the cart service
 */
export type CartMutationType = 'add' | 'update' | 'remove';

/**
 * Input for line add mutations
 */
export interface CartLineAddInput {
  merchandiseId: string;
  quantity: number;
  attributes?: { key: string; value: string }[];
}

/**
 * Input for line update mutations
 */
export interface CartLineUpdateInput {
  id: string;
  quantity: number;
  attributes?: { key: string; value: string }[];
}

/**
 * Configuration for cart recovery behavior
 */
export interface CartRecoveryConfig {
  /** Whether to automatically attempt recovery on failure */
  autoRecover: boolean;
  /** Maximum number of recovery attempts */
  maxRetries: number;
  /** Callback when recovery occurs */
  onRecovery?: (newCartId: string) => void;
  /** Callback when recovery fails */
  onRecoveryFailed?: (errors: CartMutationError[]) => void;
}

const DEFAULT_RECOVERY_CONFIG: CartRecoveryConfig = {
  autoRecover: true,
  maxRetries: 1,
};

/**
 * Storage key for cart context metadata
 */
const CART_CONTEXT_KEY = 'semiaquatics_cart_context';

/**
 * Get stored cart context from localStorage (client-side only)
 */
export function getStoredCartContext(): CartContext | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(CART_CONTEXT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Store cart context to localStorage (client-side only)
 */
export function setStoredCartContext(context: CartContext): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CART_CONTEXT_KEY, JSON.stringify(context));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clear stored cart context (client-side only)
 */
export function clearStoredCartContext(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(CART_CONTEXT_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if current context matches the stored cart context.
 *
 * @inContext is only applied during cart creation, not on every mutation.
 * If context changed since cart creation, mutations may be silently ignored.
 */
export function isContextMatch(
  currentCountry: string,
  currentLanguage: string,
): boolean {
  const stored = getStoredCartContext();
  if (!stored) {
    // No stored context - assume match (first cart creation)
    return true;
  }

  return (
    stored.countryCode === currentCountry &&
    stored.languageCode === currentLanguage
  );
}

/**
 * Detect if a mutation was a no-op by comparing cart state before and after.
 *
 * Shopify may silently ignore mutations when:
 * - Cart ID is stale/expired
 * - Cart belongs to a different session
 * - Line item IDs are invalid
 *
 * We detect this by comparing:
 * 1. `updatedAt` timestamp - should change on any successful mutation
 * 2. `totalQuantity` - should reflect the mutation's effect
 */
export function detectNoOpMutation(
  previousCart: Pick<HydrogenCart, 'updatedAt' | 'totalQuantity'> | null,
  currentCart: Pick<HydrogenCart, 'updatedAt' | 'totalQuantity'> | null,
  mutationType: CartMutationType,
  expectedQuantityChange?: number,
): boolean {
  if (!previousCart || !currentCart) {
    // Can't compare - don't flag as no-op
    return false;
  }

  // Check if updatedAt is unchanged (strong indicator of no-op)
  const timestampUnchanged = previousCart.updatedAt === currentCart.updatedAt;

  // For add/remove, also check quantity expectations
  if (mutationType === 'add' && expectedQuantityChange !== undefined) {
    const actualChange =
      (currentCart.totalQuantity ?? 0) - (previousCart.totalQuantity ?? 0);
    const quantityMismatch = actualChange !== expectedQuantityChange;

    // Both unchanged timestamp AND quantity mismatch = definite no-op
    if (timestampUnchanged && quantityMismatch) {
      return true;
    }
  }

  // For remove operations, quantity should decrease
  if (mutationType === 'remove' && expectedQuantityChange !== undefined) {
    const actualChange =
      (previousCart.totalQuantity ?? 0) - (currentCart.totalQuantity ?? 0);
    const quantityMismatch = actualChange !== expectedQuantityChange;

    if (timestampUnchanged && quantityMismatch) {
      return true;
    }
  }

  // For updates, only timestamp is reliable indicator
  // (quantity may or may not change depending on the update)
  return timestampUnchanged;
}

/**
 * Extract errors from Shopify userErrors array into structured CartMutationErrors
 */
export function extractUserErrors(
  userErrors: CartUserError[] | null | undefined,
): CartMutationError[] {
  if (!userErrors || userErrors.length === 0) {
    return [];
  }

  return userErrors.map((err) => ({
    code: 'USER_ERROR' as const,
    message: err.message,
    field: err.field?.join('.'),
    originalError: err,
  }));
}

/**
 * Create an error for stale cart detection
 */
export function createStaleCartError(cartId: string): CartMutationError {
  return {
    code: 'STALE_CART',
    message: `Cart ${cartId} is stale or expired. A new cart will be created.`,
  };
}

/**
 * Create an error for no-op mutation detection
 */
export function createNoOpError(): CartMutationError {
  return {
    code: 'NO_OP_MUTATION',
    message:
      'Mutation was silently ignored by Shopify. This typically means the cart is stale.',
  };
}

/**
 * Create an error for context mismatch
 */
export function createContextMismatchError(
  expected: CartContext,
  current: { countryCode: string; languageCode: string },
): CartMutationError {
  return {
    code: 'CONTEXT_MISMATCH',
    message: `Cart was created for ${expected.countryCode}/${expected.languageCode} but current context is ${current.countryCode}/${current.languageCode}. Cart will be recreated.`,
  };
}

/**
 * Create an error for recovery failure
 */
export function createRecoveryFailedError(
  originalErrors: CartMutationError[],
): CartMutationError {
  return {
    code: 'RECOVERY_FAILED',
    message: `Failed to recover cart after ${originalErrors.length} error(s): ${originalErrors.map((e) => e.message).join('; ')}`,
  };
}

/**
 * Log cart mutation for debugging
 */
export function logCartMutation(
  operation: string,
  cartId: string | undefined,
  details: Record<string, unknown>,
  level: 'info' | 'warn' | 'error' = 'info',
): void {
  const prefix = `[CartService] ${operation}`;
  const message = { cartId, ...details };

  switch (level) {
    case 'warn':
      console.warn(prefix, message);
      break;
    case 'error':
      console.error(prefix, message);
      break;
    default:
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(prefix, message);
      }
  }
}

/**
 * Build a successful mutation result
 */
export function buildSuccessResult(
  cart: HydrogenCart,
  wasRecovered = false,
  newCartId?: string,
): SafeCartMutationResult {
  return {
    success: true,
    cart,
    errors: [],
    wasRecovered,
    newCartId,
  };
}

/**
 * Build a failed mutation result
 */
export function buildFailureResult(
  errors: CartMutationError[],
  cart: HydrogenCart | null = null,
): SafeCartMutationResult {
  return {
    success: false,
    cart,
    errors,
    wasRecovered: false,
  };
}
