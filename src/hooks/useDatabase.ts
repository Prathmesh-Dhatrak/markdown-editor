import { useContext } from "react";
import { DatabaseContext } from "../contexts/DatabaseContext";
import { DatabaseContextType } from "../types";

export const useDatabase = (): DatabaseContextType => {
    const context = useContext(DatabaseContext);
    if (context === undefined) {
      throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
  };