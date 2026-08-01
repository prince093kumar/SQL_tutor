import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useSqlStore } from '../store/useSqlStore';
import { Play, Save } from 'lucide-react';
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

  return (
    <div className="flex flex-col h-full bg-vscode-bg border-b border-vscode-border">
      <div className="flex items-center justify-between p-2 bg-vscode-sidebar border-b border-vscode-border text-vscode-text">
        <div className="text-sm">query.sql</div>
        <div className="flex space-x-2">
          <button 
            onClick={handleSave}
            className="flex items-center px-3 py-1 text-xs bg-vscode-bg hover:bg-white/10 rounded transition-colors"
          >
            <Save size={14} className="mr-1" /> Save
          </button>
          <button 
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center px-3 py-1 text-xs bg-vscode-accent hover:bg-vscode-accent/80 text-white rounded transition-colors disabled:opacity-50"
          >
            <Play size={14} className="mr-1" /> {isExecuting ? 'Running...' : 'Run Query'}
          </button>
        </div>
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
