import React from 'react';
import { Sidebar } from '../components/Sidebar';

const achievements = [
  { icon: 'SQL', title: 'SQL Beginner', status: 'Unlocked', description: 'Solved your first 10 SQL challenges.' },
  { icon: 'JOIN', title: 'JOIN Master', status: 'Locked', description: 'Complete 15 JOIN challenges with 90% accuracy.' },
  { icon: 'AGG', title: 'Aggregation Expert', status: 'Unlocked', description: 'Mastered GROUP BY, COUNT, AVG, and HAVING.' },
  { icon: '30', title: '30-Day Streak', status: 'Locked', description: 'Practice SQL for 30 consecutive days.' },
];

export const Achievements: React.FC = () => {
  return (
    <div className="flex h-screen bg-vscode-bg text-vscode-text">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-semibold text-white">Achievements</h1>
          <p className="mt-1 text-sm text-vscode-text/65">Badges unlocked through consistency and topic mastery.</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {achievements.map(item => (
              <section key={item.title} className="rounded border border-vscode-border bg-vscode-sidebar p-5">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded border text-xs font-semibold ${item.status === 'Unlocked' ? 'border-vscode-accent bg-vscode-accent/20 text-white' : 'border-vscode-border bg-vscode-bg text-vscode-text/60'}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">{item.title}</h2>
                    <p className={`mt-1 text-sm ${item.status === 'Unlocked' ? 'text-green-400' : 'text-vscode-text/55'}`}>{item.status}</p>
                    <p className="mt-3 text-sm text-vscode-text/70">{item.description}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
