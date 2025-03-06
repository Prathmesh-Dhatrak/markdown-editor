import React, { useState } from 'react';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { FileSystemProvider } from './contexts/FileSystemContext';
import { UIStateProvider } from './contexts/UIStateContext';
import FolderTree from './components/explorer/FolderTree';
import MarkdownEditor from './components/editor/MarkdownEditor';
import MarkdownPreview from './components/preview/MarkdownPreview';
import EditorToolbar from './components/editor/EditorToolbar';
import ExportModal from './components/modals/ExportModal';
import ImportModal from './components/modals/ImportModal';
import { useUIState } from './hooks/useUIState';

const AppContent: React.FC = () => {
  const { sidebarWidth, previewEnabled } = useUIState();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <EditorToolbar 
        onExport={() => setIsExportModalOpen(true)}
        onImport={() => setIsImportModalOpen(true)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div 
          className="border-r dark:border-gray-700 overflow-hidden"
          style={{ width: `${sidebarWidth}px` }}
        >
          <FolderTree />
        </div>
        
        {/* Editor/Preview Area */}
        <div className="flex-1 flex overflow-hidden">
          {previewEnabled ? (
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