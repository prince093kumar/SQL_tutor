import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useSqlStore } from '../store/useSqlStore';
import { Clipboard, Eraser, Play, Redo2, Save, Sparkles, Undo2 } from 'lucide-react';
import api from '../utils/api';

export const Editor: React.FC = () => {
  const { currentQuery, setCurrentQuery, setQueryResult, setIsExecuting, isExecuting } = useSqlStore();

  const handleExecute = async () => {
    setIsExecuting(true);
    setQueryResult(null);
    try {
      const { data } = await api.post('/sql/execute', { query: currentQuery });
      setQueryResult(data);
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
    const title = prompt('Enter a title for this query:');
    if (!title) return;
    try {
      await api.post('/sql/save', { title, query: currentQuery });
      alert('Query saved successfully!');
    } catch (error: any) {
      alert('Failed to save: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleFormat = () => {
    setCurrentQuery(currentQuery.replace(/\b(select|from|where|join|inner join|left join|group by|order by|limit)\b/gi, value => value.toUpperCase()));
  };

  const handleCopy = async () => {
    await navigator.clipboard?.writeText(currentQuery);
  };

  const handleClear = () => {
    setCurrentQuery('');
  };

  return (
    <div className="flex flex-col h-full bg-vscode-bg border-b border-vscode-border">
      <div className="flex items-center justify-between p-2 bg-vscode-sidebar border-b border-vscode-border text-vscode-text">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-white">query.sql</span>
          <button className="rounded p-1 text-vscode-text/65 hover:bg-white/10 hover:text-white" title="Undo"><Undo2 size={15} /></button>
          <button className="rounded p-1 text-vscode-text/65 hover:bg-white/10 hover:text-white" title="Redo"><Redo2 size={15} /></button>
          <button onClick={handleFormat} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-vscode-text/80 hover:bg-white/10 hover:text-white" title="Format SQL"><Sparkles size={14} /> Format SQL</button>
          <button onClick={handleCopy} className="rounded p-1 text-vscode-text/65 hover:bg-white/10 hover:text-white" title="Copy"><Clipboard size={15} /></button>
          <button onClick={handleClear} className="rounded p-1 text-vscode-text/65 hover:bg-white/10 hover:text-white" title="Clear"><Eraser size={15} /></button>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center px-3 py-1 text-xs bg-vscode-accent hover:bg-vscode-accent/80 text-white rounded transition-colors disabled:opacity-50"
          >
            <Play size={14} className="mr-1" /> {isExecuting ? 'Running...' : 'Run'}
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center px-3 py-1 text-xs bg-vscode-bg hover:bg-white/10 rounded transition-colors"
          >
            <Save size={14} className="mr-1" /> Save
          </button>
        </div>
      </div>
      <div className="flex items-center gap-6 border-b border-vscode-border bg-[#202020] px-3 py-2 text-xs">
        <label className="flex items-center gap-2 text-vscode-text/70">Current Schema<select className="rounded border border-vscode-border bg-vscode-bg px-2 py-1 text-white outline-none"><option>practice_db</option></select></label>
        <label className="flex items-center gap-2 text-vscode-text/70">Rows Limit<input className="w-20 rounded border border-vscode-border bg-vscode-bg px-2 py-1 text-white outline-none" defaultValue="100" /></label>
        <label className="flex items-center gap-2 text-vscode-text/70">Execution Mode<select className="rounded border border-vscode-border bg-vscode-bg px-2 py-1 text-white outline-none"><option>Auto Commit</option><option>Transaction</option></select></label>
      </div>
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language="sql"
          theme="vs-dark"
          value={currentQuery}
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
