import React, { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import api from '../../utils/api';

interface ResetDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResetDatabaseModal: React.FC<ResetDatabaseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = async () => {
    setIsResetting(true);
    setError(null);
    try {
      await api.post('/sql/reset');
      onSuccess(); // Close will be handled by parent along with refresh actions
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to reset database.');
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="workbench-panel flex w-[400px] flex-col overflow-hidden rounded-lg border border-red-500/30 bg-[#0a1521] shadow-2xl">
        <div className="flex items-center justify-between border-b border-vscode-border bg-red-500/10 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-red-400">
            <AlertTriangle size={18} />
            Reset Practice Database?
          </h2>
          <button onClick={onClose} disabled={isResetting} className="rounded p-1 text-red-400 hover:bg-red-500/20">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5 text-sm leading-relaxed text-vscode-text/80">
          <p>
            This will remove your changes to the practice database and restore the original SQLLab practice tables and sample data.
          </p>
          <p className="mt-3 text-red-300">
            This action is destructive and cannot be undone.
          </p>
          {error && (
            <div className="mt-3 rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-vscode-border bg-[#0d1a28] px-5 py-4">
          <button 
            onClick={onClose} 
            disabled={isResetting}
            className="rounded border border-vscode-border px-4 py-2 text-sm font-medium transition hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleReset} 
            disabled={isResetting}
            className="flex items-center gap-2 rounded bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            {isResetting ? <><Loader2 size={16} className="animate-spin" /> Resetting...</> : 'Reset Database'}
          </button>
        </div>
      </div>
    </div>
  );
};
