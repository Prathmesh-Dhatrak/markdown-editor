import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Code, 
  FileDown, 
  FileUp, 
  Eye, 
  EyeOff,
  Moon,
  Sun,
  MoreHorizontal,
  FolderOpen,
  ChevronLeft
} from 'lucide-react';
import { useFileSystem } from '../../hooks/useFileSystem';
import { useUIState } from '../../hooks/useUIState';

interface EditorToolbarProps {
  onExport: () => void;
  onImport: () => void;
  isMobileView?: boolean;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ 
  onExport, 
  onImport, 
  isMobileView = false,
  onToggleSidebar,
  isSidebarCollapsed = false
}) => {
  const { activeFile, updateFileContent } = useFileSystem();
  const { previewEnabled, togglePreview, darkMode, toggleDarkMode } = useUIState();
  const [isFormattingMenuOpen, setIsFormattingMenuOpen] = useState(false);
  
  const handleToggleSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleSidebar) {
      console.log("Toolbar sidebar toggle clicked");
      onToggleSidebar();
    }
  };
  
  const insertMarkdown = (markdownTemplate: string, selectionTemplate?: string) => {
    if (!activeFile) return;
    
    const textarea = document.querySelector('.cm-content') as HTMLElement;
    if (!textarea) return;
    
    // This is a simplified approach - for a production app, you'd use CodeMirror's API
    // to properly handle selections and insertions
    const selection = window.getSelection()?.toString() || '';
    
    let textToInsert = markdownTemplate;
    if (selection && selectionTemplate) {
      textToInsert = selectionTemplate.replace('$SELECTION', selection);
    }
    
    // For this MVP, we'll just append to the end of the content
    // In a real implementation, you'd insert at cursor position
    const newContent = activeFile.content + '\n' + textToInsert;
    updateFileContent(activeFile.id, newContent);
    
    // Close mobile formatting menu after selection
    if (isMobileView) {
      setIsFormattingMenuOpen(false);
    }
  };
  
  // Formatting buttons that will be shown directly or in dropdown for mobile
  const formattingButtons = (
    <>
      <button
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        onClick={() => insertMarkdown('**Bold text**', '**$SELECTION**')}
        title="Bold"
        disabled={!activeFile}
      >
        <Bold size={16} />
      </button>
      <button
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        onClick={() => insertMarkdown('*Italic text*', '*$SELECTION*')}
        title="Italic"
        disabled={!activeFile}
      >
        <Italic size={16} />
      </button>
      <button
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        onClick={() => insertMarkdown('- Item 1\n- Item 2\n- Item 3')}
        title="Unordered List"
        disabled={!activeFile}
      >
        <List size={16} />
      </button>
      <button
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        onClick={() => insertMarkdown('1. Item 1\n2. Item 2\n3. Item 3')}
        title="Ordered List"
        disabled={!activeFile}
      >
        <ListOrdered size={16} />
      </button>
      <button
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        onClick={() => insertMarkdown('[Link text](https://example.com)', '[$SELECTION](https://example.com)')}
        title="Link"
        disabled={!activeFile}
      >
        <Link size={16} />
      </button>
      <button
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        onClick={() => insertMarkdown('![Image alt text](https://example.com/image.jpg)')}
        title="Image"
        disabled={!activeFile}
      >
        <Image size={16} />
      </button>
      <button
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        onClick={() => insertMarkdown('```\ncode block\n```', '```\n$SELECTION\n```')}
        title="Code Block"
        disabled={!activeFile}
      >
        <Code size={16} />
      </button>
    </>
  );
  
  return (
    <div className="flex items-center p-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 relative">
      {/* Sidebar toggle in toolbar for mobile screens */}
      {isMobileView && onToggleSidebar && (
        <button
          className="p-1 mr-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
          onClick={handleToggleSidebar}
          title={isSidebarCollapsed ? "Open Explorer" : "Close Explorer"}
        >
          {isSidebarCollapsed ? (
            <FolderOpen size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
      )}
      
      {/* Mobile formatting menu button */}
      {isMobileView ? (
        <div className="relative">
          <button
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded mr-2"
            onClick={() => setIsFormattingMenuOpen(!isFormattingMenuOpen)}
          >
            <MoreHorizontal size={16} />
          </button>
          
          {/* Mobile formatting dropdown */}
          {isFormattingMenuOpen && (
            <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 flex flex-col">
              {formattingButtons}
            </div>
          )}
        </div>
      ) : (
        <div className="flex space-x-1 mr-4">
          {formattingButtons}
        </div>
      )}
      
      <div className="flex-1"></div>
      
      <div className="flex space-x-1">
        <button
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          onClick={togglePreview}
          title={previewEnabled ? 'Hide Preview' : 'Show Preview'}
        >
          {previewEnabled ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <button
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          onClick={toggleDarkMode}
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          onClick={onExport}
          title="Export"
        >
          <FileDown size={16} />
        </button>
        <button
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          onClick={onImport}
          title="Import"
        >
          <FileUp size={16} />
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;