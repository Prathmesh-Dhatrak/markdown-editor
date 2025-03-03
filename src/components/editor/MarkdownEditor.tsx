import React, { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { useFileSystem } from '../../contexts/FileSystemContext';
import { useUIState } from '../../contexts/UIStateContext';
import { debounce } from '../../lib/utils';

const MarkdownEditor: React.FC = () => {
  const { activeFile, updateFileContent } = useFileSystem();
  const { darkMode } = useUIState();
  const [content, setContent] = useState('');
  
  useEffect(() => {
    if (activeFile) {
      setContent(activeFile.content);
    } else {
      setContent('');
    }
  }, [activeFile]);
  
  const debouncedUpdateContent = debounce(async (value: string) => {
    if (activeFile) {
      await updateFileContent(activeFile.id, value);
    }
  }, 500);
  
  const handleChange = (value: string) => {
    setContent(value);
    debouncedUpdateContent(value);
  };
  
  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>Select or create a file to start editing</p>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-auto">
      <CodeMirror
        value={content}
        height="100%"
        extensions={[
          markdown({ base: markdownLanguage, codeLanguages: languages }),
        ]}
        onChange={handleChange}
        theme={darkMode ? githubDark : githubLight}
        className="h-full"
      />
    </div>
  );
};

export default MarkdownEditor;