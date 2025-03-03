import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useFileSystem } from '../../contexts/FileSystemContext';

const MarkdownPreview: React.FC = () => {
  const { activeFile } = useFileSystem();
  
  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>Select a file to preview</p>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-auto p-4 prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {activeFile.content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;