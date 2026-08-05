import React from 'react';
import { Copy, Edit3, Play, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useSqlStore } from '../store/useSqlStore';
import api from '../utils/api';

type SavedQuery = {
  id: number;
  title: string;
  query_text: string;
  collection?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

// No fallback queries - we only show real saved queries.

export const SavedQueries: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentQuery } = useSqlStore();
  const [queries, setQueries] = React.useState<SavedQuery[]>([]);
  const [activeCollection, setActiveCollection] = React.useState('Interview');

  const fetchQueries = React.useCallback(() => {
    api.get('/saved-queries')
      .then(({ data }) => setQueries(data.data || []))
      .catch(() => setQueries([]));
  }, []);

  React.useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const collections = Array.from(new Set(queries.map(q => q.collection || 'Practice')));

  React.useEffect(() => {
    if (collections.length > 0 && !collections.includes(activeCollection)) {
      setActiveCollection(collections[0]);
    }
  }, [queries]);

  const openQuery = (query: SavedQuery) => {
    setCurrentQuery(query.query_text);
    navigate('/');
  };

  const executeQuery = (query: SavedQuery) => {
    setCurrentQuery(query.query_text);
    navigate('/');
  };

  const duplicateQuery = async (query: SavedQuery) => {
    await api.post('/saved-queries', {
      title: `${query.title} Copy`,
      query: query.query_text,
      collection: query.collection || activeCollection,
      notes: query.notes || '',
    });
    fetchQueries();
  };

  const deleteQuery = async (query: SavedQuery) => {
    await api.delete(`/saved-queries/${query.id}`);
    fetchQueries();
  };

  const filteredQueries = queries.filter(query => (query.collection || 'Practice') === activeCollection);

  return (
    <div className="flex h-screen bg-vscode-bg text-vscode-text">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Saved Queries</h1>
              <p className="mt-1 text-sm text-vscode-text/65">Organize reusable SQL by collection, notes, tags, and usage.</p>
            </div>
            <div className="flex rounded border border-vscode-border bg-vscode-sidebar p-1">
              {collections.map(collection => (
                <button key={collection} onClick={() => setActiveCollection(collection)} className={`rounded px-3 py-1.5 text-sm ${activeCollection === collection ? 'bg-vscode-accent text-white' : 'hover:bg-white/5'}`}>
                  {collection}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredQueries.map(query => (
              <section key={query.id} className="rounded border border-vscode-border bg-vscode-sidebar p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-white">{query.title}</h2>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-vscode-text/60">
                      <span>Created {query.created_at ? new Date(query.created_at).toLocaleDateString() : 'Today'}</span>
                      <span>Last Used {query.updated_at ? new Date(query.updated_at).toLocaleDateString() : 'Today'}</span>
                      <span>Table Used {query.query_text.match(/from\s+([a-z_]+)/i)?.[1] || 'Multiple'}</span>
                      <span>Tags {query.collection || activeCollection}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openQuery(query)} title="Open" className="rounded border border-vscode-border p-2 hover:bg-white/10"><Edit3 size={15} /></button>
                    <button onClick={() => executeQuery(query)} title="Execute" className="rounded border border-vscode-border p-2 hover:bg-white/10"><Play size={15} /></button>
                    <button onClick={() => duplicateQuery(query)} title="Duplicate" className="rounded border border-vscode-border p-2 hover:bg-white/10"><Copy size={15} /></button>
                    <button onClick={() => deleteQuery(query)} title="Delete" className="rounded border border-red-500/40 p-2 text-red-300 hover:bg-red-500/10"><Trash2 size={15} /></button>
                  </div>
                </div>
                <pre className="mt-4 overflow-x-auto rounded border border-vscode-border bg-[#161616] p-4 text-sm text-vscode-text/80">{query.query_text}</pre>
                {query.notes && <p className="mt-3 text-sm text-vscode-text/65">{query.notes}</p>}
              </section>
            ))}
            {filteredQueries.length === 0 && <div className="rounded border border-vscode-border bg-vscode-sidebar p-6 text-sm text-vscode-text/60">No saved queries in {activeCollection}.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
