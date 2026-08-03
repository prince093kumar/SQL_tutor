import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useSqlStore } from '../store/useSqlStore';
import { Clipboard, Eraser, Play, Redo2, Save, Sparkles, Undo2 } from 'lucide-react';
import api from '../utils/api';

export const Editor: React.FC = () => {
  const { currentQuery, setCurrentQuery, setQueryResult, setIsExecuting, isExecuting } = useSqlStore();
  const [schema, setSchema] = React.useState('practice_db');
  const [limit, setLimit] = React.useState('100');
  const [executionMode, setExecutionMode] = React.useState('Auto Commit');

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
    <div className="flex h-full flex-col border-b border-vscode-border bg-[#071019]">
      <div className="flex items-center justify-between border-b border-vscode-border bg-[#0d1a28] p-2 text-vscode-text">
        <div className="flex items-center gap-3 text-sm">
          <span className="rounded-md border border-vscode-accent/30 bg-vscode-accent/10 px-2 py-1 text-white">query.sql</span>
          <button className="icon-button p-1.5" title="Undo"><Undo2 size={15} /></button>
          <button className="icon-button p-1.5" title="Redo"><Redo2 size={15} /></button>
          <button onClick={handleFormat} className="secondary-action flex items-center gap-1" title="Format SQL"><Sparkles size={14} /> Format SQL</button>
          <button onClick={handleCopy} className="icon-button p-1.5" title="Copy"><Clipboard size={15} /></button>
          <button onClick={handleClear} className="icon-button p-1.5" title="Clear"><Eraser size={15} /></button>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleExecute}
            disabled={isExecuting}
            className="primary-action flex items-center"
          >
            <Play size={14} className="mr-1" /> {isExecuting ? 'Running...' : 'Run'}
          </button>
          <button 
            onClick={handleSave}
            className="secondary-action flex items-center"
          >
            <Save size={14} className="mr-1" /> Save
          </button>
        </div>
      </div>
      <div className="flex items-center gap-6 border-b border-vscode-border bg-[#091421] px-3 py-2 text-xs shadow-sm">
        <label className="flex items-center gap-2 text-vscode-text/70 font-medium">
          Current Schema
          <select value={schema} onChange={e => setSchema(e.target.value)} className="rounded-md border border-vscode-border bg-[#071019] px-2 py-1 text-white outline-none focus:border-vscode-accent hover:border-vscode-accent/50 cursor-pointer transition-colors">
            <option>practice_db</option>
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
