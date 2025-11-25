import React, { createContext, useContext } from 'react';

interface RecommendedProductsContextType {
  products: any[];
}

const RecommendedProductsContext = createContext<RecommendedProductsContextType | undefined>(undefined);

interface RecommendedProductsProviderProps {
  children: React.ReactNode;
  products: any[];
}

export function RecommendedProductsProvider({ children, products }: RecommendedProductsProviderProps) {
  return (
    <RecommendedProductsContext.Provider value={{ products }}>
      {children}
    </RecommendedProductsContext.Provider>
  );
}

export function useRecommendedProducts() {
  const context = useContext(RecommendedProductsContext);
  if (context === undefined) {
    throw new Error('useRecommendedProducts must be used within RecommendedProductsProvider');
  }
  return context.products;
}
