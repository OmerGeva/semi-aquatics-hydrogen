export type ProductT = {
  node: {
    availableForSale: boolean;
    descriptionHtml: string;
    id: string;
    // Handle-driven routing: includes numeric suffix for de-duplication (e.g., "soft-landing-1")
    handle: string;
    images: {
      edges: Array<{
        node: ProductImageT;
      }>;
    };
    title: string;
    productType: string;
    description: string;
    options: Array<ProductOptionT>;
    variants: ProductVariantT;
    vendor: string;
  };
};

export type ProductImageT = {
  altText: string | null;
  transformedSrc: string;
};

export type ProductVariantT = {
  edges: Array<{
    node: {
      id: string;
      title: string;
      availableForSale: boolean;
      priceV2: {
        amount: string;
        currencyCode?: string;
      };
      selectedOptions: Array<{
        name: string;
        value: string;
      }>;
    };
  }>;
};

export type ProductOptionT = {
  id: string;
  name: string;
  values: string[];
};

export type CollectionT = {
  __typename: string;
  title: string;
  id: string;
  products: {
    edges: Array<ProductT>;
  };
};
