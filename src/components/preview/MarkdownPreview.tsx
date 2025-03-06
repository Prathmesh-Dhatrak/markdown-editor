import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { Components } from 'react-markdown';
import { useFileSystem } from '../../hooks/useFileSystem';
import { useUIState } from '../../hooks/useUIState';

// Interface for the code component props which includes inline prop
interface CodeProps {
  children?: React.ReactNode;
  className?: string;
  // This is the key property we need to properly type
  inline?: boolean;
}

const MarkdownPreview: React.FC = () => {
  const { activeFile } = useFileSystem();
  const { isMobileView, previewEnabled } = useUIState();
  const [previewHeight, setPreviewHeight] = useState('100%');
  
  // Update preview height for mobile view
  useEffect(() => {
    const updateHeight = () => {
      if (isMobileView) {
        // For mobile, we'll use the container's height constraint instead of calculating
        setPreviewHeight('100%');
      } else {
        setPreviewHeight('100%');
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    return () => window.removeEventListener('resize', updateHeight);
  }, [isMobileView, previewEnabled]);
  
  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>Select a file to preview</p>
      </div>
    );
  }
  
  // Use the Components type from react-markdown
  const components: Components = {
    h1: ({children}) => (
      <h1 className="text-2xl md:text-3xl font-bold mt-4 md:mt-6 mb-3 md:mb-4 pb-1 md:pb-2 border-b border-gray-200 dark:border-gray-700">
        {children}
      </h1>
    ),
    h2: ({children}) => (
      <h2 className="text-xl md:text-2xl font-bold mt-4 md:mt-5 mb-2 md:mb-3 pb-1 border-b border-gray-200 dark:border-gray-700">
        {children}
      </h2>
    ),
    h3: ({children}) => (
      <h3 className="text-lg md:text-xl font-bold mt-3 md:mt-4 mb-2">
        {children}
      </h3>
    ),
    h4: ({children}) => (
      <h4 className="text-base md:text-lg font-bold mt-2 md:mt-3 mb-1 md:mb-2">
        {children}
      </h4>
    ),
    h5: ({children}) => (
      <h5 className="text-sm md:text-base font-bold mt-2 md:mt-3 mb-1">
        {children}
      </h5>
    ),
    h6: ({children}) => (
      <h6 className="text-xs md:text-sm font-bold mt-2 md:mt-3 mb-1">
        {children}
      </h6>
    ),
    p: ({children}) => (
      <p className="my-2 md:my-4 text-sm md:text-base">
        {children}
      </p>
    ),
    ul: ({children}) => (
      <ul className="list-disc pl-5 md:pl-8 my-2 md:my-4">
        {children}
      </ul>
    ),
    ol: ({children}) => (
      <ol className="list-decimal pl-5 md:pl-8 my-2 md:my-4">
        {children}
      </ol>
    ),
    li: ({children}) => (
      <li className="my-1 text-sm md:text-base">
        {children}
      </li>
    ),
    blockquote: ({children}) => (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-3 md:pl-4 italic text-gray-700 dark:text-gray-300 my-2 md:my-4 text-sm md:text-base">
        {children}
      </blockquote>
    ),
    // Use the custom CodeProps interface to properly type this component
    code: ({inline, className, children}: CodeProps) => {
      if (inline) {
        return (
          <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs md:text-sm">
            {children}
          </code>
        );
      }
      return (
        <code className={`${className} text-xs md:text-sm`}>
          {children}
        </code>
      );
    },
    pre: ({children}) => (
      <pre className="bg-gray-100 dark:bg-gray-800 p-2 md:p-4 rounded overflow-x-auto my-2 md:my-4 text-xs md:text-sm">
        {children}
      </pre>
    )
  };
  
  return (
    <div 
      className="overflow-auto p-2 md:p-4 markdown-preview prose dark:prose-invert max-w-none"
      style={{ height: previewHeight }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {activeFile.content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;