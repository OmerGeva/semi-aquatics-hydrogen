import {createContext, useContext, useMemo, useState} from 'react';

type CartDrawerContextValue = {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartDrawerContext = createContext<CartDrawerContextValue | undefined>(
  undefined,
);

export function CartDrawerProvider({children}: {children: React.ReactNode}) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const value = useMemo<CartDrawerContextValue>(
    () => ({
      isCartOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
    }),
    [isCartOpen],
  );

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const context = useContext(CartDrawerContext);
  if (!context) {
    throw new Error('useCartDrawer must be used within a CartDrawerProvider');
  }
  return context;
}
