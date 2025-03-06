import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { initDB } from '../lib/db';
import { DatabaseContextType } from '../types';

export const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize database'));
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  return (
    <DatabaseContext.Provider value={{ isLoading, error, isInitialized }}>
      {children}
    </DatabaseContext.Provider>
  );
};