import { useContext } from "react";
import { FileSystemContext } from "../contexts/FileSystemContext";
import { FileSystemContextType } from "../types";

export const useFileSystem = (): FileSystemContextType => {
    const context = useContext(FileSystemContext);
    if (context === undefined) {
      throw new Error('useFileSystem must be used within a FileSystemProvider');
    }
    return context;
  };