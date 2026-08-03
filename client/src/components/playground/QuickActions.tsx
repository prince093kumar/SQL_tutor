import React, { useState } from 'react';
import { Plus, FolderOpen, RotateCcw } from 'lucide-react';
import { useSqlStore } from '../../store/useSqlStore';
import { SavedQueryModal } from './SavedQueryModal';
import { ResetDatabaseModal } from './ResetDatabaseModal';
import { ImportSQLButton } from './ImportSQLButton';
import { SavedQuery } from '../../hooks/useSavedQueries';
import { toast } from '../../store/useToastStore';

export const QuickActions: React.FC = () => {
  const { createNewQuery, addTab } = useSqlStore();
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleNewQuery = () => {
    createNewQuery();
  };

  const handleImport = (filename: string, content: string) => {
    addTab({
      title: filename,
      query: content,
      source: 'imported'
    });
    toast.success(`${filename} imported successfully.`);
  };

  const handleSelectSaved = (query: SavedQuery) => {
    addTab({
      title: query.title,
      query: query.query,
      savedQueryId: query.id,
      source: 'saved'
    });
    setIsSavedModalOpen(false);
  };

  const handleResetSuccess = () => {
    setIsResetModalOpen(false);
    toast.success('practice_db restored successfully.');
    // Add logic here or in a global event to refresh explorer/schema cache.
    // A simple page reload is robust for resetting all client-side state after DB reset
    setTimeout(() => {
      window.location.reload(); 
    }, 1500);
  };

  return (
    <>
      <div className="fixed bottom-10 right-5 z-20 flex flex-col gap-2">
        <button type="button" onClick={handleNewQuery} className="primary-action flex items-center gap-2 px-3 py-2 shadow-lg">
          <Plus size={14} /> New Query
        </button>
        <button type="button" onClick={() => setIsSavedModalOpen(true)} className="secondary-action flex items-center gap-2 bg-vscode-sidebar/95 px-3 py-2 shadow-lg">
          <FolderOpen size={14} /> Open Saved Query
        </button>
        <ImportSQLButton onImport={handleImport} />
        <button 
          type="button"
          onClick={() => setIsResetModalOpen(true)}
          className="flex items-center gap-2 rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200 shadow-lg transition hover:bg-red-500/20"
        >
          <RotateCcw size={14} /> Reset Database
        </button>
      </div>

      <SavedQueryModal 
        isOpen={isSavedModalOpen} 
        onClose={() => setIsSavedModalOpen(false)} 
        onSelect={handleSelectSaved}
      />
      
      <ResetDatabaseModal 
        isOpen={isResetModalOpen} 
        onClose={() => setIsResetModalOpen(false)} 
        onSuccess={handleResetSuccess}
      />
    </>
  );
};
