import React from 'react';
import { Sidebar } from '../components/Sidebar';

export const Analytics: React.FC = () => {
  return (
    <div className="flex h-screen bg-[#1e1e1e] text-[#d4d4d4]">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl mb-4">Analytics Dashboard</h1>
        <p>Phase 2A - Query Stats, Usage, and Performance</p>
      </div>
    </div>
  );
};
