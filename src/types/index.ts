export interface FolderData {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface FileData {
  id: string;
  name: string;
  content: string;
  folderId: string;
  createdAt: number;
  updatedAt: number;
}

export interface UISettings {
  sidebarWidth: number;
  previewEnabled: boolean;
  darkMode: boolean;
}

export interface AppStateData {
  id: string;
  activeFileId: string | null;
  activeFolderId: string | null;
  uiSettings: UISettings;
}

export interface ExportData {
  version: string;
  exportedAt: number;
  folders: FolderData[];
  files: FileData[];
}

export type MergeStrategy = 'overwrite' | 'skip' | 'prompt';

export interface ImportResult {
  success: boolean;
  foldersImported: number;
  filesImported: number;
  errors: string[];
}

export interface DatabaseContextType {
  isLoading: boolean;
  error: Error | null;
  isInitialized: boolean;
}

export interface FileSystemContextType {
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

export interface UIStateContextType {
  sidebarWidth: number;
  previewEnabled: boolean;
  darkMode: boolean;
  isMobileView: boolean; // New property for responsive design
  isLoading: boolean;
  setSidebarWidth: (width: number) => Promise<void>;
  togglePreview: () => Promise<void>;
  toggleDarkMode: () => Promise<void>;
}