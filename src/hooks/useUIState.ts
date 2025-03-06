import { useContext } from "react";
import { UIStateContextType } from "../types";
import { UIStateContext } from "../contexts/UIStateContext";

export const useUIState = (): UIStateContextType => {
    const context = useContext(UIStateContext);
    if (context === undefined) {
      throw new Error('useUIState must be used within a UIStateProvider');
    }
    return context;
  };