import { gql } from "@apollo/client";

export const PRODUCT_FRAGMENT = gql`
fragment product on Product {
    id
    title
    images(first: 1) {
        edges {
            node {
            altText
            transformedSrc
            }
        }
    }
}
`
