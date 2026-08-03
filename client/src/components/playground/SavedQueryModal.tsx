import React, { useEffect, useState } from 'react';
import { Search, FolderOpen, Clock, Loader2, X, Trash2 } from 'lucide-react';
import { useSavedQueries, SavedQuery } from '../../hooks/useSavedQueries';

interface SavedQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (query: SavedQuery) => void;
}

export const SavedQueryModal: React.FC<SavedQueryModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { queries, isLoading, fetchQueries, deleteQuery } = useSavedQueries();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchQueries();
    }
  }, [isOpen, fetchQueries]);

  if (!isOpen) return null;

  const filteredQueries = queries.filter(q => 
    q.title?.toLowerCase().includes(search.toLowerCase()) || 
    q.collection?.toLowerCase().includes(search.toLowerCase())
  );

  const queriesByCollection = filteredQueries.reduce((acc, query) => {
    const col = query.collection || 'Uncategorized';
    if (!acc[col]) acc[col] = [];
    acc[col].push(query);
    return acc;
  }, {} as Record<string, SavedQuery[]>);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this saved query?')) {
      setDeletingId(id);
      try {
        await deleteQuery(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="workbench-panel flex max-h-[80vh] w-[600px] flex-col rounded-lg border border-vscode-border bg-[#0a1521] shadow-2xl">
        <div className="flex items-center justify-between border-b border-vscode-border px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <FolderOpen size={18} className="text-vscode-accent" />
            Saved Queries
          </h2>
          <button onClick={onClose} className="rounded p-1 text-vscode-text/60 hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>
        
        <div className="border-b border-vscode-border p-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-2.5 text-vscode-text/50" />
            <input 
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or collection..." 
              className="w-full rounded-md border border-vscode-border bg-[#06101a] py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-vscode-accent" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading && queries.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-vscode-text/60">
              <Loader2 size={24} className="animate-spin text-vscode-accent" />
            </div>
          ) : filteredQueries.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-vscode-text/60">
              No saved queries found.
            </div>
          ) : (
            Object.entries(queriesByCollection).map(([collection, qs]) => (
              <div key={collection} className="mb-4">
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-vscode-text/50">
                  {collection}
                </h3>
                <div className="space-y-1">
                  {qs.map(q => (
                    <button
                      key={q.id}
                      onClick={() => onSelect(q)}
                      className="group flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-vscode-accent/10 hover:text-white"
                    >
                      <div>
                        <div className="text-sm font-medium">{q.title}</div>
                        <div className="flex items-center gap-1 text-[11px] text-vscode-text/60">
                          <Clock size={10} />
                          {new Date(q.updated_at || q.created_at).toLocaleDateString()}
                          {q.challenge_id && <span className="ml-2 rounded bg-purple-500/20 px-1 py-0.5 text-[9px] text-purple-300">Challenge</span>}
                        </div>
                      </div>
                      <div className="opacity-0 transition-opacity group-hover:opacity-100">
                        <span 
                          onClick={(e) => handleDelete(e, q.id)}
                          className="flex h-7 w-7 items-center justify-center rounded text-red-400 hover:bg-red-500/20"
                          title="Delete Query"
                        >
                          {deletingId === q.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
