import React, { createContext, useState, useEffect, ReactNode, useRef } from 'react';
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
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Reference to track manual user interactions
  const userToggledPreview = useRef(false);

  // Check for mobile view - only set on initial load and let App component handle afterward
  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
    };
    
    // Check initially
    checkMobileView();
    
    // Don't add resize listener here - we'll handle this in the App component
    // to avoid duplicate/competing listeners
  }, []);

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

  // Mobile-specific effect: Auto-disable preview on small screens ONLY on initial load
  useEffect(() => {
    if (isMobileView && uiSettings.previewEnabled && !userToggledPreview.current) {
      // On very small screens, automatically disable preview ONLY if user hasn't manually toggled
      if (window.innerWidth < 480) {
        updateUISettings({ previewEnabled: false })
          .then(() => {
            setUISettings(prev => ({
              ...prev,
              previewEnabled: false
            }));
          })
          .catch(err => console.error("Failed to auto-disable preview:", err));
      }
    }
  }, [isMobileView, uiSettings.previewEnabled]);

  const setSidebarWidth = async (width: number) => {
    // Console log for debugging
    console.log(`Setting sidebar width to: ${width}px`);
    
    const newSettings = { ...uiSettings, sidebarWidth: width };
    
    try {
      await updateUISettings({ sidebarWidth: width });
      setUISettings(newSettings);
    } catch (error) {
      console.error('Failed to update sidebar width:', error);
    }
  };

  const togglePreview = async () => {
    // Mark that user has manually toggled the preview
    userToggledPreview.current = true;
    
    const newPreviewEnabled = !uiSettings.previewEnabled;
    const newSettings = { ...uiSettings, previewEnabled: newPreviewEnabled };
    
    try {
      await updateUISettings({ previewEnabled: newPreviewEnabled });
      setUISettings(newSettings);
    } catch (error) {
      console.error('Failed to toggle preview:', error);
    }
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !uiSettings.darkMode;
    const newSettings = { ...uiSettings, darkMode: newDarkMode };
    
    try {
      await updateUISettings({ darkMode: newDarkMode });
      setUISettings(newSettings);
    } catch (error) {
      console.error('Failed to toggle dark mode:', error);
    }
  };

  return (
    <UIStateContext.Provider
      value={{
        sidebarWidth: uiSettings.sidebarWidth,
        previewEnabled: uiSettings.previewEnabled,
        darkMode: uiSettings.darkMode,
        isMobileView,
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