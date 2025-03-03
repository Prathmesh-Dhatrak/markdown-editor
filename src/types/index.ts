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