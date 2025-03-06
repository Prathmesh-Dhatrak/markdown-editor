import React from 'react';
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
  Sun
} from 'lucide-react';
import { useFileSystem } from '../../hooks/useFileSystem';
import { useUIState } from '../../hooks/useUIState';

interface EditorToolbarProps {
  onExport: () => void;
  onImport: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ onExport, onImport }) => {
  const { activeFile, updateFileContent } = useFileSystem();
  const { previewEnabled, togglePreview, darkMode, toggleDarkMode } = useUIState();
  
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
  };
  
  return (
    <div className="flex items-center p-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div className="flex space-x-1 mr-4">
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
      </div>
      
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