import React from 'react';
import { Database, Clock, Save, Code } from 'lucide-react';
import { useSqlStore } from '../store/useSqlStore';
import api from '../utils/api';

export const Sidebar: React.FC = () => {
  const { history, savedQueries, setCurrentQuery, setHistory, setSavedQueries } = useSqlStore();
  const [activeTab, setActiveTab] = React.useState<'playground' | 'history' | 'saved'>('playground');

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/sql/history');
      setHistory(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSaved = async () => {
    try {
      const { data } = await api.get('/sql/saved');
      setSavedQueries(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'history') fetchHistory();
    if (activeTab === 'saved') fetchSaved();
  }, [activeTab]);

  return (
    <div className="w-64 bg-vscode-sidebar border-r border-vscode-border flex flex-col h-full overflow-hidden text-sm">
      {/* Activity Bar */}
      <div className="flex bg-vscode-bg border-b border-vscode-border p-2 space-x-4">
        <button 
          className={`p-2 rounded hover:bg-white/10 ${activeTab === 'playground' ? 'text-vscode-accent' : 'text-vscode-text'}`}
          onClick={() => setActiveTab('playground')}
          title="Playground"
        >
          <Code size={20} />
        </button>
        <button 
          className={`p-2 rounded hover:bg-white/10 ${activeTab === 'saved' ? 'text-vscode-accent' : 'text-vscode-text'}`}
          onClick={() => setActiveTab('saved')}
          title="Saved Queries"
        >
          <Save size={20} />
        </button>
        <button 
          className={`p-2 rounded hover:bg-white/10 ${activeTab === 'history' ? 'text-vscode-accent' : 'text-vscode-text'}`}
          onClick={() => setActiveTab('history')}
          title="History"
        >
          <Clock size={20} />
        </button>
      </div>

      {/* Explorer Content */}
      <div className="flex-1 overflow-y-auto p-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-vscode-text mb-4">
          {activeTab === 'playground' ? 'EXPLORER' : activeTab === 'saved' ? 'SAVED QUERIES' : 'HISTORY'}
        </h2>
        
        {activeTab === 'playground' && (
          <div className="space-y-2">
            <div className="flex items-center text-vscode-text opacity-70">
              <Database size={16} className="mr-2" />
              <span>sqllab_practice</span>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-2">
            {savedQueries.length === 0 ? (
              <p className="text-vscode-text opacity-50 text-xs">No saved queries found.</p>
            ) : (
              savedQueries.map(q => (
                <div 
                  key={q.id} 
                  className="p-2 bg-vscode-bg rounded cursor-pointer hover:bg-vscode-accent/20 truncate"
                  onClick={() => setCurrentQuery(q.query_text)}
                >
                  <p className="font-semibold">{q.title}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-vscode-text opacity-50 text-xs">No query history found.</p>
            ) : (
              history.map(h => (
                <div 
                  key={h.id} 
                  className="p-2 bg-vscode-bg rounded cursor-pointer hover:bg-vscode-accent/20 border-l-2"
                  style={{ borderColor: h.status === 'success' ? '#4ade80' : '#f87171' }}
                  onClick={() => setCurrentQuery(h.query_text)}
                >
                  <p className="truncate text-xs">{h.query_text}</p>
                  <p className="text-[10px] opacity-50 mt-1">{new Date(h.executed_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
