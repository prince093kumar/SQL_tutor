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
  FolderOpen,
  KeyRound,
  LogOut,
  Plus,
  RotateCcw,
  Search,
  Server,
  User,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useSqlStore } from '../store/useSqlStore';

const recentQueries = ['Interview.sql', 'Practice Joins.sql', 'Top Customers.sql'];
const recentChallenges = ['JOIN Basics', 'Aggregate Salary', 'Window Ranking'];
const popularChallenges = ['JOIN Employee', 'GROUP BY Sales', 'Subquery Practice'];
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
  const [mode, setMode] = React.useState<'playground' | 'learning'>('playground');
  const [showWelcome, setShowWelcome] = React.useState(true);
  const [showShortcuts, setShowShortcuts] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNewQuery = () => {
    setCurrentQuery('-- New query\nSELECT * FROM employee LIMIT 100;');
    setShowWelcome(false);
  };

  return (
    <div className="flex flex-col h-screen bg-vscode-bg font-sans text-vscode-text overflow-hidden">
      <header className="border-b border-vscode-border bg-[#2b2b2b] select-none">
        <div className="flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-5">
            <span className="font-semibold text-sm tracking-wider text-white">SQLLab</span>
            <button
              onClick={() => setMode(current => current === 'playground' ? 'learning' : 'playground')}
              className="flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white hover:border-vscode-accent/60"
              title="Switch SQLLab mode"
            >
              {mode === 'playground' ? 'Playground' : 'Learning'} <ChevronDown size={14} />
            </button>
          </div>

          <div className="flex w-[360px] items-center rounded border border-vscode-border bg-vscode-bg px-3 py-1.5 text-xs text-vscode-text/70 focus-within:border-vscode-accent">
            <Search size={14} className="mr-2 text-vscode-text/50" />
            <input className="w-full bg-transparent outline-none" placeholder="Search tables, views, queries..." />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button className="rounded p-1.5 text-vscode-text/75 hover:bg-white/10 hover:text-white" title="Notifications">
              <Bell size={16} />
            </button>
            <button onClick={() => setShowShortcuts(true)} className="rounded p-1.5 text-vscode-text/75 hover:bg-white/10 hover:text-white" title="Keyboard shortcuts">
              <CircleHelp size={16} />
            </button>
            <div className="flex items-center text-gray-300">
              <User size={14} className="mr-2" />
              {user?.username || 'Prince'}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <LogOut size={14} className="mr-1" /> Logout
            </button>
          </div>
        </div>
        <div className="flex h-9 items-center gap-8 border-t border-[#202020] bg-[#252526] px-4 text-xs">
          <span className="flex items-center gap-2"><Database size={14} className="text-vscode-accent" /> Database: <strong className="font-medium text-white">practice_db</strong></span>
          <span className="flex items-center gap-2"><Server size={14} className="text-purple-300" /> Connection: <strong className="font-medium text-white">MySQL 8.0</strong></span>
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-400" /> Connected</span>
        </div>
      </header>

      {showWelcome && (
        <section className="border-b border-vscode-border bg-[#1b1b1b] p-4">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-4">
            <div className="rounded border border-vscode-border bg-vscode-sidebar p-4">
              <div className="text-xs uppercase text-vscode-text/55">Continue Last Session</div>
              <h1 className="mt-2 text-lg font-semibold text-white">practice_db exploration</h1>
              <p className="mt-1 text-sm text-vscode-text/65">Resume JOIN Basics with recent employee and department queries.</p>
              <button onClick={() => setShowWelcome(false)} className="mt-4 rounded bg-vscode-accent px-3 py-1.5 text-sm text-white hover:bg-vscode-accent/80">Continue</button>
            </div>
            <div className="rounded border border-vscode-border bg-vscode-sidebar p-4">
              <div className="text-xs uppercase text-vscode-text/55">Recent Queries</div>
              <div className="mt-3 space-y-2 text-sm">{recentQueries.map(item => <button key={item} onClick={() => setShowWelcome(false)} className="block w-full rounded px-2 py-1 text-left hover:bg-white/10">{item}</button>)}</div>
            </div>
            <div className="rounded border border-vscode-border bg-vscode-sidebar p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs uppercase text-vscode-text/55">Quick Start</div><button onClick={handleNewQuery} className="mt-2 text-vscode-accent">New query</button></div>
                <div><div className="text-xs uppercase text-vscode-text/55">Tips</div><p className="mt-2 text-vscode-text/70">Use Ctrl + Enter to run.</p></div>
                <div><div className="text-xs uppercase text-vscode-text/55">Challenges</div><p className="mt-2">{recentChallenges[0]}</p></div>
                <div><div className="text-xs uppercase text-vscode-text/55">Databases</div><p className="mt-2">practice_db</p></div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-3/5 border-b border-vscode-border">
            <Editor />
          </div>
          
          <div className="h-2/5">
            <ResultTable />
          </div>
        </div>

        <aside className="hidden w-72 shrink-0 border-l border-vscode-border bg-vscode-sidebar p-4 xl:block">
          <div className="text-xs font-semibold uppercase text-vscode-text/55">Table Information</div>
          <h2 className="mt-3 text-lg font-semibold text-white">employee</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded border border-vscode-border bg-vscode-bg p-3"><div className="text-xs text-vscode-text/50">Rows</div><div className="mt-1 text-white">250</div></div>
            <div className="rounded border border-vscode-border bg-vscode-bg p-3"><div className="text-xs text-vscode-text/50">Primary Key</div><div className="mt-1 text-white">id</div></div>
            <div className="rounded border border-vscode-border bg-vscode-bg p-3"><div className="text-xs text-vscode-text/50">Indexes</div><div className="mt-1 text-white">2</div></div>
            <div className="rounded border border-vscode-border bg-vscode-bg p-3"><div className="text-xs text-vscode-text/50">Last Updated</div><div className="mt-1 text-white">Today</div></div>
          </div>
          <div className="mt-6 text-xs font-semibold uppercase text-vscode-text/55">Recent Challenges</div>
          <div className="mt-3 space-y-2 text-sm">
            {popularChallenges.map(item => <button key={item} onClick={() => navigate('/challenges')} className="block w-full rounded border border-vscode-border bg-vscode-bg p-2 text-left hover:border-vscode-accent/60">{item}</button>)}
          </div>
        </aside>
      </div>

      <div className="fixed bottom-10 right-5 z-20 flex flex-col gap-2">
        <button onClick={handleNewQuery} className="flex items-center gap-2 rounded bg-vscode-accent px-3 py-2 text-xs text-white shadow-lg hover:bg-vscode-accent/85"><Plus size={14} /> New Query</button>
        <button className="flex items-center gap-2 rounded border border-vscode-border bg-vscode-sidebar px-3 py-2 text-xs shadow-lg hover:bg-white/10"><FolderOpen size={14} /> Open Saved Query</button>
        <button className="flex items-center gap-2 rounded border border-vscode-border bg-vscode-sidebar px-3 py-2 text-xs shadow-lg hover:bg-white/10"><FileInput size={14} /> Import SQL</button>
        <button className="flex items-center gap-2 rounded border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200 shadow-lg hover:bg-red-500/20"><RotateCcw size={14} /> Reset Database</button>
      </div>

      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[460px] rounded border border-vscode-border bg-vscode-sidebar p-5 shadow-xl">
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
      
      <footer className="h-6 bg-[#007acc] text-white flex items-center px-2 text-[11px]">
        <span>Ready</span>
        <div className="flex-1"></div>
        <span className="mr-4">MySQL 8.0</span>
        <span>UTF-8</span>
      </footer>
    </div>
  );
};
