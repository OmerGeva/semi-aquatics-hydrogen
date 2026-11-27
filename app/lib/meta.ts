const SITE_NAME = 'Semi Aquatics';

export const pageTitle = (name?: string) =>
  name ? `${name} | ${SITE_NAME}` : SITE_NAME;

// Shorten text to about `max` characters, cutting at a word boundary.
const trimDescription = (text: string, max = 155) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:-]+$/, '')}…`;
};

type ProductForMeta = {
  title?: string;
  description?: string;
  images?: { edges?: { node?: { transformedSrc?: string } }[] };
};

// Page title, description and link-preview tags for a product page.
export const productMeta = (product?: ProductForMeta | null) => {
  if (!product?.title) return [{ title: SITE_NAME }];

  const title = pageTitle(product.title);
  const description = product.description ? trimDescription(product.description) : '';
  const image = product.images?.edges?.[0]?.node?.transformedSrc;

  return [
    { title },
    ...(description ? [{ name: 'description', content: description }] : []),
    { property: 'og:title', content: title },
    ...(description ? [{ property: 'og:description', content: description }] : []),
    { property: 'og:type', content: 'product' },
    ...(image ? [{ property: 'og:image', content: image }] : []),
    { name: 'twitter:card', content: 'summary_large_image' },
  ];
};
