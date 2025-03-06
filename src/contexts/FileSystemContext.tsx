import React, { createContext, useState, useEffect, useRef, ReactNode } from 'react';
import { 
  getAllFolders, 
  getAllFiles,
  getFile,
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
import { FolderData, FileData, FileSystemContextType } from '../types';
import { useDatabase } from '../hooks/useDatabase';

export const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const FileSystemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isInitialized } = useDatabase();
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>('root');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use a ref to track whether a full refresh is in progress
  const isRefreshingRef = useRef(false);

  // This is a more robust way to get the active file
  const activeFile = React.useMemo(() => {
    return activeFileId 
      ? files.find(file => file.id === activeFileId) || null 
      : null;
  }, [activeFileId, files]);

  const refreshFileSystem = async () => {
    if (!isInitialized) return;
    
    // Prevent concurrent refreshes
    if (isRefreshingRef.current) {
      console.log("Refresh already in progress, skipping");
      return;
    }
    
    isRefreshingRef.current = true;
    setIsLoading(true);
    
    try {
      console.log("Starting file system refresh");
      const [allFolders, allFiles, appState] = await Promise.all([
        getAllFolders(),
        getAllFiles(),
        getAppState()
      ]);
      
      console.log(`Loaded ${allFolders.length} folders and ${allFiles.length} files`);
      
      setFolders(allFolders);
      setFiles(allFiles);
      setActiveFileId(appState.activeFileId);
      setActiveFolderId(appState.activeFolderId);
    } catch (err) {
      console.error("Error refreshing file system:", err);
      setError(err instanceof Error ? err : new Error('Failed to load file system'));
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false;
    }
  };

  useEffect(() => {
    if (isInitialized) {
      refreshFileSystem();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    try {
      // First check if the file exists in our current state
      const fileInState = files.find(file => file.id === id);
      
      if (!fileInState) {
        console.log(`File with id ${id} not found in context state, checking database directly`);
        
        // If not in state, try to get it directly from the database
        const fileFromDB = await getFile(id);
        
        if (!fileFromDB) {
          console.error(`File with id ${id} not found in database either`);
          throw new Error(`File with id ${id} not found`);
        }
        
        // If we found it in the database but not in state, add it to state
        console.log(`Found file ${id} in database, adding to state`);
        setFiles(prevFiles => [...prevFiles, fileFromDB]);
      }
      
      // Now update in database
      await updateFile(id, { content });
      console.log(`File ${id} updated in database`);
      
      // Update local state without triggering a full refresh
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.id === id 
            ? { ...file, content, updatedAt: Date.now() } 
            : file
        )
      );
      
      console.log(`File ${id} updated in state`);
    } catch (error) {
      console.error('Error updating file content:', error);
      throw error;
    }
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
      setActiveFileId(null);
    }
    await refreshFileSystem();
  };

  const setActiveFileById = async (id: string | null) => {
    try {
      console.log(`Setting active file to: ${id || 'null'}`);
      
      // Update in the database
      await setActiveFile(id);
      
      // Update local state
      setActiveFileId(id);
      
      // If setting a file as active, ensure it exists in our local state
      if (id && !files.some(file => file.id === id)) {
        console.log(`Active file ${id} not in state yet, fetching`);
        
        try {
          const file = await getFile(id);
          if (file) {
            console.log(`Found file ${id}, adding to state`);
            setFiles(prevFiles => [...prevFiles, file]);
          } else {
            console.error(`Could not find file ${id} in database`);
          }
        } catch (err) {
          console.error(`Error fetching file ${id}:`, err);
        }
      }
    } catch (err) {
      console.error(`Error setting active file to ${id}:`, err);
      throw err;
    }
  };

  const setActiveFolderById = async (id: string | null) => {
    await setActiveFolder(id);
    setActiveFolderId(id);
  };

  // Provide debug information about active file status
  useEffect(() => {
    if (activeFileId) {
      const fileExists = files.some(f => f.id === activeFileId);
      console.log(`Active file ${activeFileId} exists in state: ${fileExists}`);
      
      if (!fileExists) {
        console.log('Files in state:', files.map(f => ({ id: f.id, name: f.name })));
      }
    }
  }, [activeFileId, files]);

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

