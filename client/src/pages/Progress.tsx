import React from 'react';
import { Sidebar } from '../components/Sidebar';

const progressRows = [
  { label: 'Easy', solved: 18, total: 20, color: 'bg-green-400' },
  { label: 'Medium', solved: 14, total: 25, color: 'bg-yellow-300' },
  { label: 'Hard', solved: 2, total: 10, color: 'bg-red-300' },
];

export const Progress: React.FC = () => {
  return (
    <div className="flex h-screen bg-vscode-bg text-vscode-text">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-semibold text-white">Progress</h1>
          <p className="mt-1 text-sm text-vscode-text/65">Overall completion across SQL challenge difficulty levels.</p>

          <section className="mt-6 rounded border border-vscode-border bg-vscode-sidebar p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-white">Overall Progress</h2>
              <span className="text-xl font-semibold text-white">72%</span>
            </div>
            <div className="h-4 rounded bg-vscode-bg">
              <div className="h-4 rounded bg-vscode-accent" style={{ width: '72%' }} />
            </div>
          </section>

          <div className="mt-5 space-y-4">
            {progressRows.map(row => {
              const percentage = Math.round((row.solved / row.total) * 100);
              return (
                <section key={row.label} className="rounded border border-vscode-border bg-[#202020] p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold text-white">{row.label}</h2>
                    <span>{row.solved} / {row.total}</span>
                  </div>
                  <div className="h-3 rounded bg-vscode-bg">
                    <div className={`h-3 rounded ${row.color}`} style={{ width: `${percentage}%` }} />
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
