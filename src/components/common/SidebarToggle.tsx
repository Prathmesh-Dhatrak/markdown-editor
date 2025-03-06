import React from 'react';
import { ChevronLeft, ChevronRight, FolderOpen } from 'lucide-react';

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({ isCollapsed, onToggle }) => {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className="sidebar-toggle"
      aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
    >
      {isCollapsed ? (
        <div className="flex items-center">
          <FolderOpen size={16} className="mr-1" />
          <ChevronRight size={16} />
        </div>
      ) : (
        <ChevronLeft size={16} />
      )}
    </button>
  );
};

export default SidebarToggle;