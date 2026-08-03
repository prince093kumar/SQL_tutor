import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Editor } from '../components/Editor';
import { ResultTable } from '../components/ResultTable';
import {
  Bell,
  ChevronDown,
  CircleHelp,
  Database,
  FileInput,
  Flame,
  FolderOpen,
  KeyRound,
  LogOut,
  Plus,
  RotateCcw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useSqlStore } from '../store/useSqlStore';

const shortcuts = [
  ['Ctrl + Enter', 'Run Query'],
  ['Ctrl + S', 'Save Query'],
  ['Ctrl + Shift + F', 'Format SQL'],
  ['Ctrl + /', 'Comment Line'],
  ['F1', 'Command Palette'],
];

export const Playground: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { setCurrentQuery } = useSqlStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showShortcuts, setShowShortcuts] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNewQuery = () => {
    setCurrentQuery('-- New query\nSELECT * FROM employee LIMIT 100;');
  };

  const displayName = user?.username || 'Prince';

  return (
    <div className="app-shell flex h-screen flex-col overflow-hidden font-sans text-vscode-text">
      <header className="select-none border-b border-vscode-border bg-[#08111c]/95 backdrop-blur">
        <div className="flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-black">S</span>
              SQLLab
            </span>
          </div>

          <div className="flex w-[min(46vw,520px)] items-center rounded-md border border-vscode-border bg-[#06101a] px-3 py-1.5 text-xs text-vscode-text/70 shadow-inner shadow-black/30 focus-within:border-vscode-accent">
            <Search size={14} className="mr-2 text-vscode-text/50" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-white" 
              placeholder="Search tables, views, queries..." 
            />
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-vscode-text/55">⌘ K</kbd>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button onClick={() => setShowShortcuts(true)} className="icon-button" title="Keyboard shortcuts">
              <CircleHelp size={16} />
            </button>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-gray-200">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-[10px] font-bold">{displayName.slice(0, 2).toUpperCase()}</span>
              <User size={14} />
              {displayName}
            </div>
            <button onClick={handleLogout} className="flex items-center text-gray-400 transition-colors hover:text-white">
              <LogOut size={14} className="mr-1" /> Logout
            </button>
          </div>
        </div>
        <div className="flex h-9 items-center gap-8 border-t border-vscode-border bg-[#0a1521] px-4 text-xs">
          <span className="flex items-center gap-2"><Database size={14} className="text-vscode-accent" /> Database: <strong className="font-medium text-white">practice_db</strong></span>
          <span className="flex items-center gap-2"><Server size={14} className="text-purple-300" /> Connection: <strong className="font-medium text-white">MySQL 8.0</strong></span>
          <span className="flex items-center gap-2"><span className="status-dot" /> Connected</span>
          <div className="ml-auto flex items-center gap-2">
            <button className="secondary-action flex items-center gap-1"><FileInput size={13} /> Import SQL</button>
            <button onClick={handleNewQuery} className="primary-action flex items-center gap-1"><Plus size={13} /> New Query</button>
          </div>
        </div>
      </header>



      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="h-[70%] border-b border-vscode-border">
            <Editor />
          </div>

          <div className="h-[30%]">
            <ResultTable />
          </div>
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

      <div className="fixed bottom-10 right-5 z-20 flex flex-col gap-2">
        <button onClick={handleNewQuery} className="primary-action flex items-center gap-2 px-3 py-2"><Plus size={14} /> New Query</button>
        <button className="secondary-action flex items-center gap-2 bg-vscode-sidebar/95 px-3 py-2 shadow-lg"><FolderOpen size={14} /> Open Saved Query</button>
        <button className="secondary-action flex items-center gap-2 bg-vscode-sidebar/95 px-3 py-2 shadow-lg"><FileInput size={14} /> Import SQL</button>
        <button className="flex items-center gap-2 rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200 shadow-lg transition hover:bg-red-500/20"><RotateCcw size={14} /> Reset Database</button>
      </div>

      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="workbench-panel w-[460px] p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><KeyRound size={18} /> Keyboard Shortcuts</h2>
              <button onClick={() => setShowShortcuts(false)} className="rounded px-2 py-1 text-sm hover:bg-white/10">Close</button>
            </div>
            <div className="mt-4 overflow-hidden rounded border border-vscode-border">
              {shortcuts.map(([shortcut, action]) => (
                <div key={shortcut} className="grid grid-cols-[170px_1fr] border-b border-vscode-border px-3 py-2 text-sm last:border-b-0">
                  <kbd className="font-mono text-vscode-accent">{shortcut}</kbd>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="flex h-6 items-center bg-[#071c2f] px-3 text-[11px] text-vscode-text">
        <span className="flex items-center gap-2"><span className="status-dot" /> Ready</span>
        <div className="flex-1"></div>
        <span className="mr-4">MySQL 8.0</span>
        <span>UTF-8</span>
      </footer>
    </div>
  );
};
