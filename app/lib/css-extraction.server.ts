/**
 * CSS Extraction for SSR
 * Extracts CSS files from React Router manifest for matched routes
 */

import type { ServerBuild } from 'react-router';

interface CSSExtractionOptions {
  assets: ServerBuild['assets'];
  matchedRoutes: Array<{ id: string; route: any }>;
}

/**
 * Extract CSS files for matched routes and their parents
 * Ensures we include CSS from all routes in the hierarchy
 */
export function extractCSSForRoutes(options: CSSExtractionOptions): string[] {
  const { assets, matchedRoutes } = options;

  if (!assets) {
    console.warn('CSS extraction: no assets manifest provided');
    return [];
  }

  const cssSet = new Set<string>();

  // Collect all route IDs from matched routes and their parents
  const routeIdsToProcess = new Set<string>();

  for (const match of matchedRoutes) {
    // Add the matched route
    routeIdsToProcess.add(match.id);

    // Walk up the parent chain
    let parentId = match.route.parentId;
    while (parentId) {
      routeIdsToProcess.add(parentId);
      const parentRoute = assets?.routes?.[parentId];
      parentId = parentRoute?.parentId;
    }
  }

  // Extract CSS for each route
  for (const routeId of routeIdsToProcess) {
    const routeAsset = assets?.routes?.[routeId];
    if (routeAsset?.css) {
      routeAsset.css.forEach((cssFile: string) => {
        cssSet.add(cssFile);
      });
    }
  }

  // Also include entry CSS if available
  if (assets?.entry?.css) {
    assets.entry.css.forEach((cssFile: string) => {
      cssSet.add(cssFile);
    });
  }

  return Array.from(cssSet);
}

/**
 * Generate HTML link tags for CSS files
 */
export function generateCSSLinkTags(cssFiles: string[]): string {
  return cssFiles
    .map((href) => `<link rel="stylesheet" href="${href}" />`)
    .join('\n  ');
}

/**
 * Inject CSS links into HTML head
 */
export function injectCSSIntoHTML(
  html: string,
  cssLinkTags: string,
): string {
  if (!cssLinkTags) {
    return html;
  }

  // Find the closing </head> tag and inject CSS before it
  const headCloseIndex = html.indexOf('</head>');
  if (headCloseIndex === -1) {
    console.warn('CSS injection: </head> tag not found in HTML');
    return html;
  }

  return (
    html.slice(0, headCloseIndex) +
    '  ' +
    cssLinkTags +
    '\n' +
    html.slice(headCloseIndex)
  );
}
