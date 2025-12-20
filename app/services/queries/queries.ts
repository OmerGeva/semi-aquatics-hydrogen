// ============================================
// Hydrogen Queries (string format)
// ============================================

export const GET_MAIN_LINE_QUERY = `#graphql
query {
  collection(id: "gid://shopify/Collection/285501653067") {
    title
    id
    products(first: 30) {
      edges {
        node {
          id
          handle
          title
          productType
          availableForSale
          tags
          images(first: 5) {
            edges {
              node {
                altText
                transformedSrc
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                priceV2 {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
}
` as const;

export const GET_ARCHIVE_SALE_QUERY = `#graphql
query {
  collection(id: "gid://shopify/Collection/268665258059") {
    title
    id
    products(first: 30) {
      edges {
        node {
          id
          handle
          title
          productType
          availableForSale
          tags
          images(first: 5) {
            edges {
              node {
                altText
                transformedSrc
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                priceV2 {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
}
` as const;

export const GET_DROP_QUERY = `#graphql
query {
  collections(first: 1, query: "id:285501751371") {
    edges {
      node {
        title
        id
        products(first: 30) {
          edges {
            node {
              id
              handle
              title
              productType
              availableForSale
              tags
              images(first: 5) {
                edges {
                  node {
                    altText
                    transformedSrc
                  }
                }
              }
              variants(first: 5) {
                edges {
                  node {
                    priceV2 {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
` as const;

export const GET_PRODUCT_BY_PRODUCT_ID = `#graphql
query GetProduct($productId: ID!) {
  node(id: $productId) {
    ...on Product {
      title
      id
      handle
      description
      productType
      descriptionHtml
      availableForSale
      tags
      images(first: 10) {
        edges {
          node {
            altText
            transformedSrc
          }
        }
      }
      options {
        id
        name
        values
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            availableForSale
            priceV2 {
              amount
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
}
` as const;

export const GET_PRODUCT_BY_HANDLE = `#graphql
query GetProductByHandle($handle: String!) {
  productByHandle(handle: $handle) {
    title
    id
    handle
    description
    productType
    descriptionHtml
    availableForSale
    tags
    images(first: 10) {
      edges {
        node {
          altText
          transformedSrc
        }
      }
    }
    options {
      id
      name
      values
    }
    variants(first: 10) {
      edges {
        node {
          id
          title
          availableForSale
          priceV2 {
            amount
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
}
` as const;
