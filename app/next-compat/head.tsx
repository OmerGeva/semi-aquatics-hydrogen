import type {PropsWithChildren} from 'react';

/**
 * Minimal shim to keep legacy Next.js components compiling.
 * Consumers should migrate to Hydrogen's <Seo /> and root links.
 */
export default function Head({children}: PropsWithChildren) {
  return <>{children}</>;
}
