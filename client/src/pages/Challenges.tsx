import React from 'react';
import { Sidebar } from '../components/Sidebar';

export const Challenges: React.FC = () => {
  return (
    <div className="flex h-screen bg-[#1e1e1e] text-[#d4d4d4]">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl mb-4">SQL Challenges</h1>
        <p>Phase 2A - Gamified Learning Experience. Challenges will be listed here.</p>
      </div>
    </div>
  );
};
