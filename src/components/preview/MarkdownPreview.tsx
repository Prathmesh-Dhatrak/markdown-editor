import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useFileSystem } from '../../contexts/FileSystemContext';
import type { Components } from 'react-markdown';

// Interface for the code component props which includes inline prop
interface CodeProps {
  children?: React.ReactNode;
  className?: string;
  // This is the key property we need to properly type
  inline?: boolean;
}

const MarkdownPreview: React.FC = () => {
  const { activeFile } = useFileSystem();
  
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
      <h1 className="text-3xl font-bold mt-6 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        {children}
      </h1>
    ),
    h2: ({children}) => (
      <h2 className="text-2xl font-bold mt-5 mb-3 pb-1 border-b border-gray-200 dark:border-gray-700">
        {children}
      </h2>
    ),
    h3: ({children}) => (
      <h3 className="text-xl font-bold mt-4 mb-2">
        {children}
      </h3>
    ),
    h4: ({children}) => (
      <h4 className="text-lg font-bold mt-3 mb-2">
        {children}
      </h4>
    ),
    h5: ({children}) => (
      <h5 className="text-base font-bold mt-3 mb-1">
        {children}
      </h5>
    ),
    h6: ({children}) => (
      <h6 className="text-sm font-bold mt-3 mb-1">
        {children}
      </h6>
    ),
    p: ({children}) => (
      <p className="my-4">
        {children}
      </p>
    ),
    ul: ({children}) => (
      <ul className="list-disc pl-8 my-4">
        {children}
      </ul>
    ),
    ol: ({children}) => (
      <ol className="list-decimal pl-8 my-4">
        {children}
      </ol>
    ),
    li: ({children}) => (
      <li className="my-1">
        {children}
      </li>
    ),
    blockquote: ({children}) => (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic text-gray-700 dark:text-gray-300 my-4">
        {children}
      </blockquote>
    ),
    // Use the custom CodeProps interface to properly type this component
    code: ({inline, className, children}: CodeProps) => {
      if (inline) {
        return (
          <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
            {children}
          </code>
        );
      }
      return (
        <code className={className}>
          {children}
        </code>
      );
    },
    pre: ({children}) => (
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto my-4">
        {children}
      </pre>
    )
  };
  
  return (
    <div className="h-full overflow-auto p-4 markdown-preview prose dark:prose-invert max-w-none">
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