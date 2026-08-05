import React, { useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useSqlStore } from '../store/useSqlStore';
import { Clipboard, Eraser, Play, Redo2, Save, Sparkles, Undo2, X } from 'lucide-react';
import api from '../utils/api';
import { toast } from '../store/useToastStore';

export const Editor: React.FC = () => {
  const { 
    tabs, 
    activeTabId, 
    currentQuery, 
    setCurrentQuery, 
    setQueryResult, 
    setIsExecuting, 
    isExecuting,
    setActiveTab,
    removeTab,
    selectedDatabase,
    setSelectedDatabase,
    databases,
    fetchDatabases,
    fetchSchema
  } = useSqlStore();
  
  const [limit, setLimit] = React.useState('100');
  const [executionMode, setExecutionMode] = React.useState('Auto Commit');
  const [editorRef, setEditorRef] = React.useState<any>(null);

  const activeTab = tabs.find(t => t.id === activeTabId);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExecute();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuery, activeTabId]);

  useEffect(() => {
    fetchDatabases();
  }, []);

  const handleExecute = async () => {
    if (!currentQuery.trim()) return;
    setIsExecuting(true);
    setQueryResult(null);
    try {
      const queryBase64 = btoa(unescape(encodeURIComponent(currentQuery)));
      const { data } = await api.post('/sql/execute', { queryBase64, database: selectedDatabase });
      setQueryResult(data);
      
      // Auto-refresh schema/databases if it looks like a DDL/DML query
      const upper = currentQuery.toUpperCase();
      if (upper.includes('CREATE ') || upper.includes('DROP ') || upper.includes('ALTER ')) {
        fetchDatabases();
        fetchSchema();
      }
    } catch (error: any) {
      const responseData = error.response?.data;
      setQueryResult({ 
        success: false, 
        error: responseData?.error || { message: error.message }
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSave = async () => {
    if (!activeTab) return;
    const title = prompt('Enter a title for this query:', activeTab.title);
    if (!title) return;
    try {
      await api.post('/saved-queries', { title, query: currentQuery, collection: 'Playground Drafts' });
      // TODO: Replace with Toast
      alert('Query saved successfully!');
      useSqlStore.getState().updateTabStatus(activeTab.id, { isDirty: false, title });
    } catch (error: any) {
      alert('Failed to save: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleFormat = () => {
    setCurrentQuery(currentQuery.replace(/\b(select|from|where|join|inner join|left join|group by|order by|limit)\b/gi, value => value.toUpperCase()));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(currentQuery);
      toast.success('Query copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleUndo = () => {
    editorRef?.trigger('keyboard', 'undo', null);
  };

  const handleRedo = () => {
    editorRef?.trigger('keyboard', 'redo', null);
  };

  const handleClear = () => {
    setCurrentQuery('');
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.isDirty) {
      if (!window.confirm('You have unsaved changes. Close anyway?')) {
        return;
      }
    }
    removeTab(tabId);
  };

  return (
    <div className="flex h-full flex-col border-b border-vscode-border bg-[#071019]">
      {/* Tabs Header */}
      <div className="flex items-center border-b border-vscode-border bg-[#0d1a28] overflow-x-auto custom-scrollbar">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex min-w-[120px] max-w-[200px] cursor-pointer items-center justify-between border-r border-vscode-border px-3 py-2 text-xs transition-colors ${
              tab.id === activeTabId 
                ? 'bg-[#071019] text-white border-t-2 border-t-vscode-accent' 
                : 'text-vscode-text/60 hover:bg-[#112233] border-t-2 border-t-transparent'
            }`}
          >
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="truncate">{tab.title}</span>
              {tab.isDirty && <span className="text-vscode-accent">●</span>}
            </div>
            <button 
              onClick={(e) => handleCloseTab(e, tab.id)}
              className="ml-2 rounded-sm p-0.5 opacity-50 hover:bg-white/10 hover:opacity-100"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-b border-vscode-border bg-[#0d1a28] p-2 text-vscode-text">
        <div className="flex items-center gap-3 text-sm">
          <button type="button" onClick={handleUndo} className="icon-button p-1.5" title="Undo"><Undo2 size={15} /></button>
          <button type="button" onClick={handleRedo} className="icon-button p-1.5" title="Redo"><Redo2 size={15} /></button>
          <button type="button" onClick={handleFormat} className="secondary-action flex items-center gap-1" title="Format SQL (Ctrl+Shift+F)"><Sparkles size={14} /> Format SQL</button>
          <button type="button" onClick={handleCopy} className="icon-button p-1.5" title="Copy"><Clipboard size={15} /></button>
          <button type="button" onClick={handleClear} className="icon-button p-1.5" title="Clear"><Eraser size={15} /></button>
        </div>
        <div className="flex space-x-2">
          <button 
            type="button"
            onClick={handleExecute}
            disabled={isExecuting}
            className="primary-action flex items-center"
            title="Run Query (Ctrl+Enter)"
          >
            <Play size={14} className="mr-1" /> {isExecuting ? 'Running...' : 'Run'}
          </button>
          <button 
            type="button"
            onClick={handleSave}
            className="secondary-action flex items-center"
            title="Save Query (Ctrl+S)"
          >
            <Save size={14} className="mr-1" /> Save
          </button>
        </div>
      </div>
      <div className="flex items-center gap-6 border-b border-vscode-border bg-[#091421] px-3 py-2 text-xs shadow-sm">
        <label className="flex items-center gap-2 text-vscode-text/70 font-medium">
          Current Schema
          <select value={selectedDatabase} onChange={e => setSelectedDatabase(e.target.value)} className="rounded-md border border-vscode-border bg-[#071019] px-2 py-1 text-white outline-none focus:border-vscode-accent hover:border-vscode-accent/50 cursor-pointer transition-colors">
            {databases.map(db => <option key={db} value={db}>{db}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-vscode-text/70 font-medium">
          Rows Limit
          <input value={limit} onChange={e => setLimit(e.target.value)} className="w-20 rounded-md border border-vscode-border bg-[#071019] px-2 py-1 text-white outline-none focus:border-vscode-accent hover:border-vscode-accent/50 transition-colors" type="number" min="1" max="1000" />
        </label>
        <label className="flex items-center gap-2 text-vscode-text/70 font-medium">
          Execution Mode
          <select value={executionMode} onChange={e => setExecutionMode(e.target.value)} className="rounded-md border border-vscode-border bg-[#071019] px-2 py-1 text-white outline-none focus:border-vscode-accent hover:border-vscode-accent/50 cursor-pointer transition-colors">
            <option>Auto Commit</option>
            <option>Transaction</option>
          </select>
        </label>
      </div>
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language="sql"
          theme="vs-dark"
          value={currentQuery}
          onMount={(editor) => setEditorRef(editor)}
          onChange={(val) => setCurrentQuery(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
};
