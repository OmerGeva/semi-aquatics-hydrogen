import React, { createContext, useContext, useEffect, useState } from 'react';
import Cms from '../cms';

interface DropData {
  _id: string;
  title: string;
  dateTime: string;
  __v: number;
}

interface DropContextType {
  dropData: DropData | null;
  loading: boolean;
  error: string | null;
}

const DropContext = createContext<DropContextType>({
  dropData: null,
  loading: true,
  error: null,
});

export const useNextDrop = () => useContext(DropContext);

export const DropProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dropData, setDropData] = useState<DropData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrop = async () => {
      try {
        const response = await new Cms().getNextDrop();
        setDropData(response);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch drop data');
        setLoading(false);
      }
    };

    void fetchDrop();
  }, []);


  return (
    <DropContext.Provider value={{ dropData, loading, error }}>
      {children}
    </DropContext.Provider>
  );
};
