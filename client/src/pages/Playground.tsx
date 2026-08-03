import React, { useRef, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Editor } from '../components/Editor';
import { ResultTable } from '../components/ResultTable';
import { AppNavbar } from '../components/layout/AppNavbar';
import { QuickActions } from '../components/playground/QuickActions';
import { useResizablePanels } from '../hooks/useResizablePanels';
import { ResizeHandle } from '../components/layout/ResizeHandle';
import { useSqlStore } from '../store/useSqlStore';
import { PanelBottom } from 'lucide-react';

export const Playground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isExecuting } = useSqlStore();
  
  const { 
    sizes, 
    collapsed,
    startResize, 
    toggleCollapse,
    setCollapsed
  } = useResizablePanels('sqllab.playground.layout.v', [
    { id: 'editor', defaultSize: 60, minSize: 20 },
    { id: 'results', defaultSize: 40, minSize: 15, collapsible: true }
  ], 'vertical', containerRef);

  // Auto-open results panel when query starts executing
  useEffect(() => {
    if (isExecuting && collapsed.results) {
      setCollapsed(prev => ({ ...prev, results: false }));
    }
  }, [isExecuting, collapsed.results, setCollapsed]);

  return (
    <div className="app-shell flex h-screen flex-col overflow-hidden font-sans text-vscode-text">
      <AppNavbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div ref={containerRef} className="flex min-w-0 flex-1 flex-col">
          <div style={{ height: collapsed.results ? '100%' : `${sizes.editor}%` }} className="border-b border-vscode-border min-h-0 flex-1">
            <Editor />
          </div>

          {!collapsed.results && (
            <ResizeHandle 
              id="editor" 
              direction="vertical" 
              onPointerDown={(e) => startResize(e, 'editor', 'results', 0)} 
            />
          )}

          {!collapsed.results && (
            <div style={{ height: `${sizes.results}%` }} className="min-h-0">
              <ResultTable onClose={() => toggleCollapse('results')} />
            </div>
          )}
        </div>

        <aside className="hidden w-72 shrink-0 border-l border-vscode-border bg-[#0a1521]/95 p-4 xl:block">
          <div className="text-xs font-semibold uppercase text-vscode-text/55">Table Information</div>
          <h2 className="mt-3 text-lg font-semibold text-white">employee</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="metric-card p-3"><div className="text-xs text-vscode-text/50">Rows</div><div className="mt-1 text-white">250</div></div>
            <div className="metric-card p-3"><div className="text-xs text-vscode-text/50">Primary Key</div><div className="mt-1 text-white">id</div></div>
            <div className="metric-card p-3"><div className="text-xs text-vscode-text/50">Indexes</div><div className="mt-1 text-white">2</div></div>
            <div className="metric-card p-3"><div className="text-xs text-vscode-text/50">Last Updated</div><div className="mt-1 text-white">Today</div></div>
          </div>
        </aside>
      </div>

      <QuickActions />

      <footer className="flex h-6 items-center bg-[#071c2f] px-3 text-[11px] text-vscode-text">
        <span className="flex items-center gap-2"><span className="status-dot" /> Ready</span>
        <div className="flex-1 flex justify-center">
          {collapsed.results && (
            <button 
              onClick={() => toggleCollapse('results')}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors"
              title="Show Results Panel"
            >
              <PanelBottom size={12} /> Show Results
            </button>
          )}
        </div>
        <span className="mr-4">MySQL 8.0</span>
        <span>UTF-8</span>
      </footer>
    </div>
  );
};
