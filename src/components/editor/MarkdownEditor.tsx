import React, { useEffect, useState, useRef, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { debounce } from '../../lib/utils';
import { useFileSystem } from '../../hooks/useFileSystem';
import { useUIState } from '../../hooks/useUIState';

const MarkdownEditor: React.FC = () => {
  const { activeFile, updateFileContent } = useFileSystem();
  const { darkMode } = useUIState();
  const [content, setContent] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  
  // Keep track of the content changes
  const contentRef = useRef('');
  
  // Create a stable debounced update function with useCallback + useRef
  const debouncedUpdateRef = useRef<(value: string, fileId: string) => void>();
  
  // Initialize the debounced function only once
  useEffect(() => {
    debouncedUpdateRef.current = debounce(async (value: string, fileId: string) => {
      try {
        console.log(`Saving content for file ${fileId}, content length: ${value.length}`);
        await updateFileContent(fileId, value);
        console.log(`Content saved successfully for file ${fileId}`);
      } catch (error) {
        console.error(`Error saving content for file ${fileId}:`, error);
      }
    }, 500);
  }, [updateFileContent]);

  // Handle updates to the active file
  useEffect(() => {
    if (activeFile) {
      console.log(`Active file changed to: ${activeFile.name} (${activeFile.id})`);
      console.log(`Content length: ${activeFile.content.length}`);
      
      // First check if the content is already current to avoid unnecessary editor resets
      if (contentRef.current !== activeFile.content) {
        contentRef.current = activeFile.content;
        setContent(activeFile.content);
      }
      
      setIsInitialized(true);
    } else {
      console.log('No active file');
      contentRef.current = '';
      setContent('');
    }
  }, [activeFile]);

  // Function to handle content changes from the editor
  const handleChange = useCallback((value: string) => {
    console.log(`Editor content changed, new length: ${value.length}`);
    contentRef.current = value;
    setContent(value);
    
    if (activeFile && debouncedUpdateRef.current) {
      debouncedUpdateRef.current(value, activeFile.id);
    }
  }, [activeFile]);

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>Select or create a file to start editing</p>
      </div>
    );
  }

  // Only attempt to render the editor if we've initialized the content from the active file
  return (
    <div className="h-full overflow-auto" ref={editorContainerRef}>
      {isInitialized ? (
        <CodeMirror
          value={content}
          height="100%"
          extensions={[
            markdown({ 
              base: markdownLanguage, 
              codeLanguages: languages,
              addKeymap: true 
            })
          ]}
          onChange={handleChange}
          theme={darkMode ? githubDark : githubLight}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            highlightSpecialChars: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightSelectionMatches: true
          }}
        />
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">Loading editor...</p>
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;