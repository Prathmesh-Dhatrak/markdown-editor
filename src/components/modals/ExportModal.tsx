import React, { useState } from 'react';
import { downloadExport } from '../../lib/export-import';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  
  if (!isOpen) return null;
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadExport();
      onClose();
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">Export Files</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          This will export all your folders and files as a JSON file that you can later import back.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            className="px-3 py-1 md:px-4 md:py-2 bg-gray-200 dark:bg-gray-700 rounded text-sm md:text-base"
            onClick={onClose}
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 md:px-4 md:py-2 bg-blue-500 text-white rounded flex items-center text-sm md:text-base"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              'Export'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};