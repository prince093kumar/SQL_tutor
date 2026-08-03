import React, { useRef } from 'react';
import { FileInput } from 'lucide-react';
import { toast } from '../../store/useToastStore';

interface ImportSQLButtonProps {
  onImport: (filename: string, content: string) => void;
  className?: string;
  iconSize?: number;
}

export const ImportSQLButton: React.FC<ImportSQLButtonProps> = ({ 
  onImport, 
  className = "secondary-action flex items-center gap-2 bg-vscode-sidebar/95 px-3 py-2 shadow-lg",
  iconSize = 14
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size === 0) {
      toast.error('The selected file is empty.');
      e.target.value = '';
      return;
    }

    // Validate extension
    const validExtensions = ['.sql', '.txt'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(extension)) {
      toast.error(`Unsupported file type: ${extension}. Please upload a .sql or .txt file.`);
      e.target.value = ''; // reset
      return;
    }

    // Validate size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 5MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content.trim()) {
         toast.error('The selected file contains no readable text.');
         return;
      }
      onImport(file.name, content);
    };
    reader.onerror = () => {
      toast.error('Failed to read file.');
    };
    reader.readAsText(file);
    
    e.target.value = ''; // reset to allow importing the same file again
  };

  return (
    <>
      <button type="button" onClick={handleClick} className={className}>
        <FileInput size={iconSize} /> Import SQL
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".sql,.txt" 
        className="hidden" 
      />
    </>
  );
};
