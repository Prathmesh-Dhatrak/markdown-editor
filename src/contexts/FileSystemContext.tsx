import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getAllFolders, 
  getAllFiles, 
  getChildFolders, 
  getFilesByFolder,
  createFolder,
  createFile,
  updateFolder,
  updateFile,
  deleteFolder,
  deleteFile,
  getAppState,
  setActiveFile,
  setActiveFolder
} from '../lib/db';
import { FolderData, FileData } from '../types';
import { useDatabase } from './DatabaseContext';

interface FileSystemContextType {
  folders: FolderData[];
  files: FileData[];
  activeFileId: string | null;
  activeFolderId: string | null;
  activeFile: FileData | null;
  isLoading: boolean;
  error: Error | null;
  refreshFileSystem: () => Promise<void>;
  createNewFolder: (name: string, parentId: string | null) => Promise<string>;
  createNewFile: (name: string, folderId: string, content?: string) => Promise<string>;
  updateFolderName: (id: string, name: string) => Promise<void>;
  updateFileContent: (id: string, content: string) => Promise<void>;
  updateFileName: (id: string, name: string) => Promise<void>;
  removeFolder: (id: string, recursive: boolean) => Promise<void>;
  removeFile: (id: string) => Promise<void>;
  setActiveFileById: (id: string | null) => Promise<void>;
  setActiveFolderById: (id: string | null) => Promise<void>;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const FileSystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isInitialized } = useDatabase();
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>('root');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const activeFile = activeFileId 
    ? files.find(file => file.id === activeFileId) || null 
    : null;

  const refreshFileSystem = async () => {
    if (!isInitialized) return;
    
    setIsLoading(true);
    try {
      const [allFolders, allFiles, appState] = await Promise.all([
        getAllFolders(),
        getAllFiles(),
        getAppState()
      ]);
      
      setFolders(allFolders);
      setFiles(allFiles);
      setActiveFileId(appState.activeFileId);
      setActiveFolderId(appState.activeFolderId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load file system'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      refreshFileSystem();
    }
  }, [isInitialized]);

  const createNewFolder = async (name: string, parentId: string | null = 'root') => {
    const id = await createFolder(name, parentId);
    await refreshFileSystem();
    return id;
  };

  const createNewFile = async (name: string, folderId: string, content: string = '') => {
    const id = await createFile(name, folderId, content);
    await refreshFileSystem();
    return id;
  };

  const updateFolderName = async (id: string, name: string) => {
    await updateFolder(id, { name });
    await refreshFileSystem();
  };

  const updateFileContent = async (id: string, content: string) => {
    await updateFile(id, { content });
    // Don't refresh the entire file system for content updates
    // Just update the local state
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === id 
          ? { ...file, content, updatedAt: Date.now() } 
          : file
      )
    );
  };

  const updateFileName = async (id: string, name: string) => {
    await updateFile(id, { name });
    await refreshFileSystem();
  };

  const removeFolder = async (id: string, recursive: boolean) => {
    await deleteFolder(id, recursive);
    await refreshFileSystem();
  };

  const removeFile = async (id: string) => {
    await deleteFile(id);
    if (activeFileId === id) {
      await setActiveFile(null);
    }
    await refreshFileSystem();
  };

  const setActiveFileById = async (id: string | null) => {
    await setActiveFile(id);
    setActiveFileId(id);
  };

  const setActiveFolderById = async (id: string | null) => {
    await setActiveFolder(id);
    setActiveFolderId(id);
  };

  return (
    <FileSystemContext.Provider
      value={{
        folders,
        files,
        activeFileId,
        activeFolderId,
        activeFile,
        isLoading,
        error,
        refreshFileSystem,
        createNewFolder,
        createNewFile,
        updateFolderName,
        updateFileContent,
        updateFileName,
        removeFolder,
        removeFile,
        setActiveFileById,
        setActiveFolderById,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = (): FileSystemContextType => {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};