import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { CircleHelp, User, LogOut, KeyRound } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const navigation = [
  { label: 'Playground', path: '/' },
  { label: 'Challenges', path: '/challenges' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Profile', path: '/profile' }
];

const shortcuts = [
  ['Ctrl + Enter', 'Run Query'],
  ['Ctrl + S', 'Save Query'],
  ['Ctrl + Shift + F', 'Format SQL'],
  ['Ctrl + /', 'Comment Line'],
  ['F1', 'Command Palette'],
];

export const AppNavbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.username || 'User';
  
  // The Playground route is '/' in App.tsx, but the label is 'Playground'
  const isPlayground = location.pathname === '/' || location.pathname === '/playground';

  return (
    <>
      <header className="select-none border-b border-vscode-border bg-[#08111c]/95 backdrop-blur">
        <div className="flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-black">S</span>
              SQLLab
            </span>
            
            <nav className="flex items-center gap-1">
              {navigation.map((nav) => {
                const isActive = nav.path === '/' 
                  ? isPlayground 
                  : location.pathname.startsWith(nav.path);
                
                return (
                  <NavLink
                    key={nav.path}
                    to={nav.path}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive 
                        ? 'bg-vscode-accent/10 text-vscode-accent' 
                        : 'text-vscode-text/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {nav.label}
                  </NavLink>
                );
              })}
            </nav>
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
      </header>
      
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
    </>
  );
};
