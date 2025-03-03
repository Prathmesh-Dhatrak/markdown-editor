import { openDB, DBSchema } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { FolderData, FileData, AppStateData, UISettings } from '../../types';

interface MarkdownEditorDB extends DBSchema {
  folders: {
    key: string;
    value: FolderData;
    indexes: { 'by-parent': string | null };
  };
  files: {
    key: string;
    value: FileData;
    indexes: { 'by-folder': string };
  };
  appState: {
    key: string;
    value: AppStateData;
  };
}

const DB_NAME = 'MarkdownEditorDB';
const DB_VERSION = 1;

export const initDB = async () => {
  const db = await openDB<MarkdownEditorDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create folders store
      const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
      folderStore.createIndex('by-parent', 'parentId');

      // Create files store
      const fileStore = db.createObjectStore('files', { keyPath: 'id' });
      fileStore.createIndex('by-folder', 'folderId');

      // Create appState store
      const appStateStore = db.createObjectStore('appState', { keyPath: 'id' });

      // Create default root folder
      const rootFolder: FolderData = {
        id: 'root',
        name: 'My Documents',
        parentId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Create default app state
      const defaultAppState: AppStateData = {
        id: 'current',
        activeFileId: null,
        activeFolderId: 'root',
        uiSettings: {
          sidebarWidth: 250,
          previewEnabled: true,
          darkMode: false,
        },
      };

      folderStore.put(rootFolder);
      appStateStore.put(defaultAppState);
    },
  });

  return db;
};

// Folder operations
export const createFolder = async (name: string, parentId: string | null = 'root'): Promise<string> => {
  const db = await initDB();
  const id = uuidv4();
  const now = Date.now();
  
  const folder: FolderData = {
    id,
    name,
    parentId,
    createdAt: now,
    updatedAt: now,
  };
  
  await db.put('folders', folder);
  return id;
};

export const getFolder = async (id: string): Promise<FolderData | undefined> => {
  const db = await initDB();
  return db.get('folders', id);
};

export const getAllFolders = async (): Promise<FolderData[]> => {
  const db = await initDB();
  return db.getAll('folders');
};

export const getChildFolders = async (parentId: string | null): Promise<FolderData[]> => {
  const db = await initDB();
  return db.getAllFromIndex('folders', 'by-parent', parentId);
};

export const updateFolder = async (id: string, updates: Partial<FolderData>): Promise<void> => {
  const db = await initDB();
  const folder = await db.get('folders', id);
  
  if (!folder) {
    throw new Error(`Folder with id ${id} not found`);
  }
  
  const updatedFolder = {
    ...folder,
    ...updates,
    updatedAt: Date.now(),
  };
  
  await db.put('folders', updatedFolder);
};

export const deleteFolder = async (id: string, recursive: boolean = false): Promise<void> => {
  const db = await initDB();
  
  if (id === 'root') {
    throw new Error('Cannot delete root folder');
  }
  
  if (recursive) {
    // Delete all child folders recursively
    const childFolders = await getChildFolders(id);
    for (const childFolder of childFolders) {
      await deleteFolder(childFolder.id, true);
    }
    
    // Delete all files in this folder
    const files = await getFilesByFolder(id);
    for (const file of files) {
      await deleteFile(file.id);
    }
  } else {
    // Check if folder has children
    const childFolders = await getChildFolders(id);
    const files = await getFilesByFolder(id);
    
    if (childFolders.length > 0 || files.length > 0) {
      throw new Error('Cannot delete non-empty folder. Use recursive delete instead.');
    }
  }
  
  await db.delete('folders', id);
};

// File operations
export const createFile = async (name: string, folderId: string, content: string = ''): Promise<string> => {
  const db = await initDB();
  const id = uuidv4();
  const now = Date.now();
  
  const file: FileData = {
    id,
    name,
    content,
    folderId,
    createdAt: now,
    updatedAt: now,
  };
  
  await db.put('files', file);
  return id;
};

export const getFile = async (id: string): Promise<FileData | undefined> => {
  const db = await initDB();
  return db.get('files', id);
};

export const getAllFiles = async (): Promise<FileData[]> => {
  const db = await initDB();
  return db.getAll('files');
};

export const getFilesByFolder = async (folderId: string): Promise<FileData[]> => {
  const db = await initDB();
  return db.getAllFromIndex('files', 'by-folder', folderId);
};

export const updateFile = async (id: string, updates: Partial<FileData>): Promise<void> => {
  const db = await initDB();
  const file = await db.get('files', id);
  
  if (!file) {
    throw new Error(`File with id ${id} not found`);
  }
  
  const updatedFile = {
    ...file,
    ...updates,
    updatedAt: Date.now(),
  };
  
  await db.put('files', updatedFile);
};

export const deleteFile = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete('files', id);
};

// App state operations
export const getAppState = async (): Promise<AppStateData> => {
  const db = await initDB();
  const state = await db.get('appState', 'current');
  
  if (!state) {
    throw new Error('App state not found');
  }
  
  return state;
};

export const updateAppState = async (updates: Partial<AppStateData>): Promise<void> => {
  const db = await initDB();
  const state = await db.get('appState', 'current');
  
  if (!state) {
    throw new Error('App state not found');
  }
  
  const updatedState = {
    ...state,
    ...updates,
  };
  
  await db.put('appState', updatedState);
};

export const setActiveFile = async (fileId: string | null): Promise<void> => {
  await updateAppState({ activeFileId: fileId });
};

export const setActiveFolder = async (folderId: string | null): Promise<void> => {
  await updateAppState({ activeFolderId: folderId });
};

export const updateUISettings = async (settings: Partial<UISettings>): Promise<void> => {
  const state = await getAppState();
  
  await updateAppState({
    uiSettings: {
      ...state.uiSettings,
      ...settings,
    },
  });
};