import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getAppState, updateUISettings } from '../lib/db';
import { UISettings, UIStateContextType } from '../types';
import { useDatabase } from '../hooks/useDatabase';


export const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

export const UIStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isInitialized } = useDatabase();
  const [uiSettings, setUISettings] = useState<UISettings>({
    sidebarWidth: 250,
    previewEnabled: true,
    darkMode: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUISettings = async () => {
      if (!isInitialized) return;
      
      setIsLoading(true);
      try {
        const appState = await getAppState();
        setUISettings(appState.uiSettings);
      } catch (error) {
        console.error('Failed to load UI settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUISettings();
  }, [isInitialized]);

  useEffect(() => {
    // Apply dark mode to the document
    if (uiSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [uiSettings.darkMode]);

  const setSidebarWidth = async (width: number) => {
    const newSettings = { ...uiSettings, sidebarWidth: width };
    await updateUISettings({ sidebarWidth: width });
    setUISettings(newSettings);
  };

  const togglePreview = async () => {
    const newPreviewEnabled = !uiSettings.previewEnabled;
    const newSettings = { ...uiSettings, previewEnabled: newPreviewEnabled };
    await updateUISettings({ previewEnabled: newPreviewEnabled });
    setUISettings(newSettings);
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !uiSettings.darkMode;
    const newSettings = { ...uiSettings, darkMode: newDarkMode };
    await updateUISettings({ darkMode: newDarkMode });
    setUISettings(newSettings);
  };

  return (
    <UIStateContext.Provider
      value={{
        sidebarWidth: uiSettings.sidebarWidth,
        previewEnabled: uiSettings.previewEnabled,
        darkMode: uiSettings.darkMode,
        isLoading,
        setSidebarWidth,
        togglePreview,
        toggleDarkMode,
      }}
    >
      {children}
    </UIStateContext.Provider>
  );
};
