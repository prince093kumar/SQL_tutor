import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Editor } from '../components/Editor';
import { ResultTable } from '../components/ResultTable';
import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const Playground: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-vscode-bg font-sans text-vscode-text overflow-hidden">
      {/* Top Navigation */}
      <header className="h-12 bg-[#333333] border-b border-[#252526] flex items-center justify-between px-4 select-none">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-4 font-semibold text-sm tracking-wider">SQLLab</span>
        </div>
        
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center text-gray-300">
            <User size={14} className="mr-2" />
            {user?.username || 'Guest'}
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={14} className="mr-1" /> Logout
          </button>
        </div>
      </header>

      {/* Main Workspace */}
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
      </div>
      
      {/* Status Bar */}
      <footer className="h-6 bg-[#007acc] text-white flex items-center px-2 text-[11px]">
        <span>Ready</span>
        <div className="flex-1"></div>
        <span className="mr-4">MySQL 8.0</span>
        <span>UTF-8</span>
      </footer>
    </div>
  );
};
