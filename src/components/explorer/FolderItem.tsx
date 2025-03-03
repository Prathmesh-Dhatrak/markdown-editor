import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File, Plus, MoreVertical, Trash2, Edit } from 'lucide-react';
import { FolderData, FileData } from '../../types';
import { useFileSystem } from '../../contexts/FileSystemContext';

interface FolderItemProps {
  folder: FolderData;
  level: number;
  childFolders: FolderData[];
  childFiles: FileData[];
  isActive: boolean;
  onCreateFile: (folderId: string) => void;
  onCreateFolder: (parentId: string) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  level,
  childFolders,
  childFiles,
  isActive,
  onCreateFile,
  onCreateFolder,
}) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  
  const { setActiveFolderById, updateFolderName, removeFolder } = useFileSystem();
  
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  const handleFolderClick = () => {
    setActiveFolderById(folder.id);
    if (!isExpanded && (childFolders.length > 0 || childFiles.length > 0)) {
      setIsExpanded(true);
    }
  };
  
  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
    setIsMenuOpen(false);
  };
  
  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    
    if (confirm(`Are you sure you want to delete the folder "${folder.name}" and all its contents?`)) {
      try {
        await removeFolder(folder.id, true);
      } catch (error) {
        alert(`Failed to delete folder: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };
  
  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newName !== folder.name) {
      try {
        await updateFolderName(folder.id, newName.trim());
      } catch (error) {
        alert(`Failed to rename folder: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    setIsRenaming(false);
  };
  
  const handleCreateFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onCreateFile(folder.id);
  };
  
  const handleCreateFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onCreateFolder(folder.id);
  };
  
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };
  
  const indentation = `pl-${level * 4}`;
  const hasChildren = childFolders.length > 0 || childFiles.length > 0;
  
  return (
    <div>
      <div 
        className={`flex items-center py-1 px-2 ${indentation} ${
          isActive ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        } cursor-pointer group`}
        onClick={handleFolderClick}
      >
        <div className="mr-1" onClick={handleToggleExpand}>
          {hasChildren ? (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : (
            <span className="w-4"></span>
          )}
        </div>
        
        <div className="mr-1">
          {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
        </div>
        
        {isRenaming ? (
          <form onSubmit={handleRenameSubmit} className="flex-1" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
              onBlur={handleRenameSubmit}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-1 py-0 text-sm"
            />
          </form>
        ) : (
          <span className="flex-1 truncate">{folder.name}</span>
        )}
        
        <div className="flex items-center opacity-0 group-hover:opacity-100">
          <button 
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            onClick={handleCreateFile}
            title="New File"
          >
            <File size={14} />
          </button>
          
          <button 
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            onClick={handleCreateFolder}
            title="New Folder"
          >
            <Plus size={14} />
          </button>
          
          <div className="relative">
            <button 
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              onClick={toggleMenu}
              title="More Options"
            >
              <MoreVertical size={14} />
            </button>
            
            {isMenuOpen && (
              <div 
                className="absolute right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 w-40"
                onClick={e => e.stopPropagation()}
              >
                <button 
                  className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleRenameClick}
                >
                  <Edit size={14} className="mr-2" />
                  Rename
                </button>
                
                {folder.id !== 'root' && (
                  <button 
                    className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div>
          {childFolders.map(childFolder => (
            <FolderItem
              key={childFolder.id}
              folder={childFolder}
              level={level + 1}
              childFolders={[]}  // These will be populated by the FolderTree component
              childFiles={[]}    // These will be populated by the FolderTree component
              isActive={false}   // This will be determined by the FolderTree component
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
            />
          ))}
          
          {childFiles.map(file => (
            <FileItem 
              key={file.id} 
              file={file} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface FileItemProps {
  file: FileData;
  level: number;
}

const FileItem: React.FC<FileItemProps> = ({ file, level }) => {
  const { activeFileId, setActiveFileById, updateFileName, removeFile } = useFileSystem();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  
  const isActive = activeFileId === file.id;
  const indentation = `pl-${level * 4 + 4}`;
  
  const handleFileClick = () => {
    setActiveFileById(file.id);
  };
  
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
    setIsMenuOpen(false);
  };
  
  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    
    if (confirm(`Are you sure you want to delete the file "${file.name}"?`)) {
      try {
        await removeFile(file.id);
      } catch (error) {
        alert(`Failed to delete file: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };
  
  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newName !== file.name) {
      try {
        await updateFileName(file.id, newName.trim());
      } catch (error) {
        alert(`Failed to rename file: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    setIsRenaming(false);
  };
  
  return (
    <div 
      className={`flex items-center py-1 px-2 ${indentation} ${
        isActive ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      } cursor-pointer group`}
      onClick={handleFileClick}
    >
      <div className="mr-1">
        <File size={16} />
      </div>
      
      {isRenaming ? (
        <form onSubmit={handleRenameSubmit} className="flex-1" onClick={e => e.stopPropagation()}>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
            onBlur={handleRenameSubmit}
            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-1 py-0 text-sm"
          />
        </form>
      ) : (
        <span className="flex-1 truncate">{file.name}</span>
      )}
      
      <div className="flex items-center opacity-0 group-hover:opacity-100">
        <div className="relative">
          <button 
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            onClick={toggleMenu}
            title="More Options"
          >
            <MoreVertical size={14} />
          </button>
          
          {isMenuOpen && (
            <div 
              className="absolute right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 w-40"
              onClick={e => e.stopPropagation()}
            >
              <button 
                className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleRenameClick}
              >
                <Edit size={14} className="mr-2" />
                Rename
              </button>
              
              <button 
                className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleDeleteClick}
              >
                <Trash2 size={14} className="mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderItem;
export { FileItem };