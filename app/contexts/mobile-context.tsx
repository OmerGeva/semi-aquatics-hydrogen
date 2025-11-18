import React, { createContext, useContext, ReactNode } from 'react';

interface MobileContextType {
  isMobileInitial: boolean;
}

const MobileContext = createContext<MobileContextType | undefined>(undefined);

export function MobileProvider({
  children,
  isMobileInitial,
}: {
  children: ReactNode;
  isMobileInitial: boolean;
}) {
  return (
    <MobileContext.Provider value={{ isMobileInitial }}>
      {children}
    </MobileContext.Provider>
  );
}

export function useMobileContext() {
  const context = useContext(MobileContext);
  if (!context) {
    // Fallback if not in provider
    return { isMobileInitial: false };
  }
  return context;
}
