import React from 'react';
import { Sidebar } from '../components/Sidebar';

const profileStats = [
  { label: 'XP', value: '1240' },
  { label: 'Badges', value: '8' },
  { label: 'Solved', value: '42' },
  { label: 'Ranking', value: '21' },
  { label: 'Current Streak', value: '18 Days' },
];

export const Profile: React.FC = () => {
  return (
    <div className="flex h-screen bg-vscode-bg text-vscode-text">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl">
          <section className="rounded border border-vscode-border bg-vscode-sidebar p-6">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded bg-vscode-accent text-xl font-semibold text-white">PK</div>
              <div>
                <h1 className="text-2xl font-semibold text-white">Prince Kumar</h1>
                <p className="mt-1 text-sm text-vscode-text/65">Level 14 SQL Challenger</p>
              </div>
            </div>
            <div className="mt-6 h-3 rounded bg-vscode-bg">
              <div className="h-3 rounded bg-vscode-accent" style={{ width: '68%' }} />
            </div>
          </section>

          <div className="mt-5 grid grid-cols-5 gap-4">
            {profileStats.map(stat => (
              <section key={stat.label} className="rounded border border-vscode-border bg-[#202020] p-5">
                <div className="text-xs uppercase tracking-wide text-vscode-text/55">{stat.label}</div>
                <div className="mt-3 text-2xl font-semibold text-white">{stat.value}</div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
