import React, { useState } from 'react';
import { Plus, FolderPlus, FilePlus } from 'lucide-react';
import FolderItem from './FolderItem';
import { useFileSystem } from '../../contexts/FileSystemContext';
import Spinner from '../common/Spinner';

const FolderTree: React.FC = () => {
  const { 
    folders, 
    files, 
    activeFolderId, 
    isLoading, 
    createNewFolder, 
    createNewFile 
  } = useFileSystem();
  
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemParentId, setNewItemParentId] = useState<string | null>(null);
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file');
  
  if (isLoading) {
    return <div className="p-4"><Spinner /></div>;
  }
  
  // Build folder hierarchy
  const folderMap = new Map(folders.map(folder => [folder.id, folder]));
  const folderChildrenMap = new Map<string, string[]>();
  const fileChildrenMap = new Map<string, string[]>();
  
  // Initialize empty arrays for each folder
  folders.forEach(folder => {
    folderChildrenMap.set(folder.id, []);
    fileChildrenMap.set(folder.id, []);
  });
  
  // Populate child folders
  folders.forEach(folder => {
    if (folder.parentId !== null) {
      const children = folderChildrenMap.get(folder.parentId) || [];
      children.push(folder.id);
      folderChildrenMap.set(folder.parentId, children);
    }
  });
  
  // Populate child files
  files.forEach(file => {
    const children = fileChildrenMap.get(file.folderId) || [];
    children.push(file.id);
    fileChildrenMap.set(file.folderId, children);
  });
  
  // Get root folders
  const rootFolders = folders.filter(folder => folder.parentId === null);
  
  const handleCreateFolder = (parentId: string) => {
    setNewItemType('folder');
    setNewItemParentId(parentId);
    setNewItemName('');
    setIsCreatingFolder(true);
  };
  
  const handleCreateFile = (folderId: string) => {
    setNewItemType('file');
    setNewItemParentId(folderId);
    setNewItemName('');
    setIsCreatingFile(true);
  };
  
  const handleCreateNewItem = async () => {
    if (!newItemName.trim()) return;
    
    try {
      if (newItemType === 'folder' && newItemParentId !== null) {
        await createNewFolder(newItemName.trim(), newItemParentId);
      } else if (newItemType === 'file' && newItemParentId !== null) {
        await createNewFile(newItemName.trim(), newItemParentId);
      }
    } catch (error) {
      alert(`Failed to create ${newItemType}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsCreatingFolder(false);
      setIsCreatingFile(false);
    }
  };
  
  const renderFolderTree = (folderId: string, level: number = 0) => {
    const folder = folderMap.get(folderId);
    if (!folder) return null;
    
    const childFolderIds = folderChildrenMap.get(folderId) || [];
    const childFileIds = fileChildrenMap.get(folderId) || [];
    
    const childFolders = childFolderIds
      .map(id => folderMap.get(id))
      .filter((f): f is NonNullable<typeof f> => f !== undefined)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    const childFiles = childFileIds
      .map(id => files.find(f => f.id === id))
      .filter((f): f is NonNullable<typeof f> => f !== undefined)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return (
      <FolderItem
        key={folder.id}
        folder={folder}
        level={level}
        childFolders={childFolders}
        childFiles={childFiles}
        isActive={activeFolderId === folder.id}
        onCreateFile={handleCreateFile}
        onCreateFolder={handleCreateFolder}
      />
    );
  };
  
  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between p-2 border-b dark:border-gray-700">
        <h2 className="font-semibold">Explorer</h2>
        <div className="flex space-x-1">
          <button
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            onClick={() => handleCreateFile('root')}
            title="New File"
          >
            <FilePlus size={16} />
          </button>
          <button
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            onClick={() => handleCreateFolder('root')}
            title="New Folder"
          >
            <FolderPlus size={16} />
          </button>
        </div>
      </div>
      
      <div className="py-2">
        {rootFolders.map(folder => renderFolderTree(folder.id))}
      </div>
      
      {/* Create New Folder Modal */}
      {isCreatingFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            <input
              type="text"
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              placeholder="Folder name"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
                onClick={() => setIsCreatingFolder(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleCreateNewItem}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Create New File Modal */}
      {isCreatingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Create New File</h3>
            <input
              type="text"
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              placeholder="File name"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
                onClick={() => setIsCreatingFile(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleCreateNewItem}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderTree;