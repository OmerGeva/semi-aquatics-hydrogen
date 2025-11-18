/**
 * Extracts numeric Shopify ID from a GID string.
 * @param gid - Shopify Global ID (e.g., "gid://shopify/ProductVariant/12345")
 * @returns Numeric ID as string (e.g., "12345")
 */
export const gidToNumericId = (gid: string): string => gid.split('/').pop() ?? gid;
