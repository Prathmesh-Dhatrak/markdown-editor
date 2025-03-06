import React, { useState, useRef } from 'react';
import { importFromJSON } from '../../lib/export-import';
import { MergeStrategy, ImportResult } from '../../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>('prompt');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!isOpen) return null;
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const fileContent = await file.text();
      const importData = JSON.parse(fileContent);
      const result = await importFromJSON(importData, mergeStrategy);
      setImportResult(result);
      
      if (result.success) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      setImportResult({
        success: false,
        foldersImported: 0,
        filesImported: 0,
        errors: [`Import failed: ${error instanceof Error ? error.message : String(error)}`],
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">Import Files</h2>
        
        {!importResult && (
          <>
            <p className="mb-4 text-gray-600 dark:text-gray-300 text-sm md:text-base">
              Select a JSON file exported from this application to import your folders and files.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Merge Strategy
              </label>
              <select
                value={mergeStrategy}
                onChange={e => setMergeStrategy(e.target.value as MergeStrategy)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                disabled={isImporting}
              >
                <option value="prompt">Create new versions for conflicts</option>
                <option value="overwrite">Overwrite existing files</option>
                <option value="skip">Skip existing files</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Import File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                disabled={isImporting}
                ref={fileInputRef}
              />
            </div>
          </>
        )}
        
        {importResult && (
          <div className={`mb-4 p-3 rounded text-sm md:text-base ${importResult.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
            {importResult.success ? (
              <p>
                Import successful! Imported {importResult.foldersImported} folders and {importResult.filesImported} files.
              </p>
            ) : (
              <>
                <p className="font-semibold">Import failed:</p>
                <ul className="list-disc list-inside mt-1">
                  {importResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            className="px-3 py-1 md:px-4 md:py-2 bg-gray-200 dark:bg-gray-700 rounded text-sm md:text-base"
            onClick={onClose}
            disabled={isImporting}
          >
            {importResult?.success ? 'Close' : 'Cancel'}
          </button>
          
          {!importResult && (
            <button
              className="px-3 py-1 md:px-4 md:py-2 bg-blue-500 text-white rounded flex items-center text-sm md:text-base"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </>
              ) : (
                'Select File'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};