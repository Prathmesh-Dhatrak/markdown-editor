import React, { useState, useEffect, useRef } from 'react';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { FileSystemProvider } from './contexts/FileSystemContext';
import { UIStateProvider } from './contexts/UIStateContext';
import FolderTree from './components/explorer/FolderTree';
import MarkdownEditor from './components/editor/MarkdownEditor';
import MarkdownPreview from './components/preview/MarkdownPreview';
import EditorToolbar from './components/editor/EditorToolbar';
import SidebarToggle from './components/common/SidebarToggle';
import { useUIState } from './hooks/useUIState';
import { ExportModal } from './components/modals/ExportModal';
import { ImportModal } from './components/modals/ImportModal';

const AppContent: React.FC = () => {
  const { sidebarWidth, previewEnabled, setSidebarWidth } = useUIState();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Use a ref to track user-initiated toggle vs. auto-collapse
  const userToggledRef = useRef(false);
  const initialCheckDoneRef = useRef(false);

  // Initial setup only - detect mobile view and set initial state
  useEffect(() => {
    if (!initialCheckDoneRef.current) {
      const isSmallScreen = window.innerWidth < 768;
      console.log("Initial screen size check:", isSmallScreen ? "mobile" : "desktop");
      setIsMobileView(isSmallScreen);
      
      if (isSmallScreen) {
        console.log("Initial setup: collapsing sidebar for mobile");
        setIsSidebarCollapsed(true);
        setSidebarWidth(0);
      }
      
      initialCheckDoneRef.current = true;
    }
  }, [setSidebarWidth]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 768;
      
      // Only update if view type changed
      if ((isSmallScreen && !isMobileView) || (!isSmallScreen && isMobileView)) {
        console.log("View changed to:", isSmallScreen ? "mobile" : "desktop");
        setIsMobileView(isSmallScreen);
        
        // Only auto-collapse when changing to mobile and not user toggled
        if (isSmallScreen && !userToggledRef.current) {
          console.log("Auto-collapsing sidebar due to resize to mobile");
          setIsSidebarCollapsed(true);
          setSidebarWidth(0);
        }
        
        // Reset user toggle flag when switching to desktop
        if (!isSmallScreen) {
          userToggledRef.current = false;
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileView, setSidebarWidth]);

  // Toggle function with userToggled flag
  const toggleSidebar = () => {
    userToggledRef.current = true; // Mark as user-initiated
    
    const newState = !isSidebarCollapsed;
    console.log("USER TOGGLE: Setting sidebar to:", newState ? "Collapsed" : "Expanded");
    
    setIsSidebarCollapsed(newState);
    setSidebarWidth(newState ? 0 : 250);
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <EditorToolbar
        onExport={() => setIsExportModalOpen(true)}
        onImport={() => setIsImportModalOpen(true)}
        isMobileView={isMobileView}
        onToggleSidebar={toggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar toggle button */}
        <SidebarToggle
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />

        {/* Sidebar with transition styling */}
        <div
          className="sidebar border-r dark:border-gray-700 overflow-hidden transition-all duration-300"
          style={{
            width: isSidebarCollapsed ? '0px' : `${sidebarWidth}px`,
            minWidth: isSidebarCollapsed ? '0px' : `${sidebarWidth}px`,
            maxWidth: isSidebarCollapsed ? '0px' : `${sidebarWidth}px`,
            opacity: isSidebarCollapsed ? 0 : 1
          }}
        >
          <div className="sidebar-content w-full h-full overflow-y-auto">
            <FolderTree />
          </div>
        </div>

        {/* Editor/Preview Area */}
        <div className={`flex-1 flex flex-col md:flex-row overflow-hidden ${isSidebarCollapsed ? 'pl-0 md:pl-10' : ''}`}>
          {isMobileView ? (
            // Mobile view: Stack vertically with conditional preview
            <div className="flex flex-col h-full">
              <div className={`${previewEnabled ? 'h-1/2' : 'h-full'} overflow-hidden`}>
                <MarkdownEditor />
              </div>
              {previewEnabled && (
                <div className="h-1/2 overflow-hidden border-t dark:border-gray-700">
                  <MarkdownPreview />
                </div>
              )}
            </div>
          ) : (
            // Desktop view: Split horizontally as before
            previewEnabled ? (
              <>
                <div className="flex-1 overflow-hidden border-r dark:border-gray-700">
                  <MarkdownEditor />
                </div>
                <div className="flex-1 overflow-hidden">
                  <MarkdownPreview />
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-hidden">
                <MarkdownEditor />
              </div>
            )
          )}
        </div>
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};

function App() {
  return (
    <DatabaseProvider>
      <FileSystemProvider>
        <UIStateProvider>
          <AppContent />
        </UIStateProvider>
      </FileSystemProvider>
    </DatabaseProvider>
  );
}

export default App;