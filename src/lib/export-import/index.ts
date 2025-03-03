import { v4 as uuidv4 } from 'uuid';
import { 
  getAllFolders, 
  getAllFiles, 
  createFolder, 
  createFile,
  getFolder,
  getFile,
  updateFolder,
  updateFile
} from '../db';
import { ExportData, MergeStrategy, ImportResult, FolderData, FileData } from '../../types';

// Export functionality
export const exportToJSON = async (): Promise<ExportData> => {
  const folders = await getAllFolders();
  const files = await getAllFiles();
  
  const exportData: ExportData = {
    version: '1.0',
    exportedAt: Date.now(),
    folders,
    files,
  };
  
  return exportData;
};

export const downloadExport = async (): Promise<void> => {
  const exportData = await exportToJSON();
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportFileName = `markdown-editor-export-${new Date().toISOString().slice(0, 10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileName);
  linkElement.click();
};

// Import functionality
export const validateImportData = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  if (!data.version || !data.exportedAt) return false;
  if (!Array.isArray(data.folders) || !Array.isArray(data.files)) return false;
  
  // Basic validation of folders and files
  for (const folder of data.folders) {
    if (!folder.id || !folder.name || folder.parentId === undefined) return false;
  }
  
  for (const file of data.files) {
    if (!file.id || !file.name || !file.folderId || file.content === undefined) return false;
  }
  
  return true;
};

export const importFromJSON = async (
  data: ExportData, 
  mergeStrategy: MergeStrategy
): Promise<ImportResult> => {
  if (!validateImportData(data)) {
    return {
      success: false,
      foldersImported: 0,
      filesImported: 0,
      errors: ['Invalid import data format'],
    };
  }
  
  const result: ImportResult = {
    success: true,
    foldersImported: 0,
    filesImported: 0,
    errors: [],
  };
  
  // Create a map for ID remapping
  const idMap: Record<string, string> = {};
  
  // Import folders first (maintaining hierarchy)
  const rootFolders = data.folders.filter(f => f.parentId === null);
  const nonRootFolders = data.folders.filter(f => f.parentId !== null);
  
  // Process root folders
  for (const folder of rootFolders) {
    try {
      await importFolder(folder, null, mergeStrategy, idMap);
      result.foldersImported++;
    } catch (error) {
      result.errors.push(`Failed to import folder ${folder.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Process non-root folders (may need multiple passes for hierarchy)
  let remainingFolders = [...nonRootFolders];
  let lastLength = -1;
  
  while (remainingFolders.length > 0 && remainingFolders.length !== lastLength) {
    lastLength = remainingFolders.length;
    const stillRemaining: FolderData[] = [];
    
    for (const folder of remainingFolders) {
      const parentId = folder.parentId as string;
      const mappedParentId = idMap[parentId];
      
      if (mappedParentId) {
        try {
          await importFolder(folder, mappedParentId, mergeStrategy, idMap);
          result.foldersImported++;
        } catch (error) {
          result.errors.push(`Failed to import folder ${folder.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        stillRemaining.push(folder);
      }
    }
    
    remainingFolders = stillRemaining;
  }
  
  // Import files
  for (const file of data.files) {
    const mappedFolderId = idMap[file.folderId];
    
    if (mappedFolderId) {
      try {
        await importFile(file, mappedFolderId, mergeStrategy);
        result.filesImported++;
      } catch (error) {
        result.errors.push(`Failed to import file ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      result.errors.push(`Failed to import file ${file.name}: Parent folder not found`);
    }
  }
  
  result.success = result.errors.length === 0;
  return result;
};

const importFolder = async (
  folder: FolderData,
  parentId: string | null,
  mergeStrategy: MergeStrategy,
  idMap: Record<string, string>
): Promise<void> => {
  // Check if a folder with the same name already exists in the parent
  const existingFolders = await getAllFolders();
  const existingFolder = existingFolders.find(
    f => f.name === folder.name && f.parentId === parentId
  );
  
  let newId: string;
  
  if (existingFolder) {
    if (mergeStrategy === 'skip') {
      // Skip and use existing folder ID for mapping
      idMap[folder.id] = existingFolder.id;
      return;
    } else if (mergeStrategy === 'overwrite') {
      // Update existing folder
      await updateFolder(existingFolder.id, {
        name: folder.name,
        updatedAt: Date.now(),
      });
      newId = existingFolder.id;
    } else {
      // For 'prompt' strategy, we'll default to creating a new folder with a modified name
      const newName = `${folder.name} (imported)`;
      newId = await createFolder(newName, parentId);
    }
  } else {
    // Create new folder
    newId = await createFolder(folder.name, parentId);
  }
  
  // Map the old ID to the new ID
  idMap[folder.id] = newId;
};

const importFile = async (
  file: FileData,
  folderId: string,
  mergeStrategy: MergeStrategy
): Promise<void> => {
  // Check if a file with the same name already exists in the folder
  const existingFiles = await getAllFiles();
  const existingFile = existingFiles.find(
    f => f.name === file.name && f.folderId === folderId
  );
  
  if (existingFile) {
    if (mergeStrategy === 'skip') {
      return;
    } else if (mergeStrategy === 'overwrite') {
      // Update existing file
      await updateFile(existingFile.id, {
        content: file.content,
        updatedAt: Date.now(),
      });
    } else {
      // For 'prompt' strategy, create a new file with a modified name
      const newName = `${file.name} (imported)`;
      await createFile(newName, folderId, file.content);
    }
  } else {
    // Create new file
    await createFile(file.name, folderId, file.content);
  }
};