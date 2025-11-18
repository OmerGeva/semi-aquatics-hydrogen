export interface Cart {
  __typename: 'Cart';
  id: string;
  createdAt: string;
  updatedAt: string;
  estimatedCost: CartEstimatedCost;
  lines: {
    __typename: 'BaseCartLineConnection';
    edges: CartLineEdge[];
  };
}

export interface CartEstimatedCost {
  __typename: 'CartEstimatedCost';
  totalAmount: MoneyV2;
  subtotalAmount: MoneyV2;
  totalTaxAmount: MoneyV2 | null;
  totalDutyAmount: MoneyV2 | null;
}

export interface CartLineEdge {
  __typename: 'BaseCartLineEdge';
  node: CartLine;
}

export interface CartLine {
  __typename: 'CartLine';
  id: string;
  quantity: number;
  merchandise: ProductVariant;
}

export interface ProductVariant {
  __typename: 'ProductVariant';
  id: string;
  title: string;
  product: {
    __typename: 'Product';
    title: string;
  };
  image: {
    __typename: 'Image';
    transformedSrc: string;
  };
  priceV2: MoneyV2;
}

export interface MoneyV2 {
  __typename: 'MoneyV2';
  amount: string;
  currencyCode: string;
}
