import React from 'react';
import { Sidebar } from '../components/Sidebar';

const stats = [
  { label: 'Queries Today', value: '152' },
  { label: 'Saved Queries', value: '48' },
  { label: 'Challenges Solved', value: '35' },
  { label: 'Current Streak', value: '12 Days' },
  { label: 'XP', value: '1200' },
];

const dailyActivity = [
  { label: 'Mon', value: 22 },
  { label: 'Tue', value: 72 },
  { label: 'Wed', value: 88 },
  { label: 'Thu', value: 36 },
  { label: 'Fri', value: 64 },
  { label: 'Sat', value: 51 },
  { label: 'Sun', value: 78 },
];
const difficultyDistribution = [
  { label: 'Easy', value: 75, color: 'bg-green-400' },
  { label: 'Medium', value: 58, color: 'bg-yellow-300' },
  { label: 'Hard', value: 22, color: 'bg-red-300' },
];
const queryTypes = [
  { label: 'SELECT', value: 45 },
  { label: 'JOIN', value: 20 },
  { label: 'GROUP BY', value: 15 },
  { label: 'INSERT', value: 10 },
  { label: 'Others', value: 10 },
];
const mostUsedTables = [
  { label: 'employee', value: 42 },
  { label: 'orders', value: 37 },
  { label: 'customers', value: 29 },
];
const recentQueries = ['Interview.sql', 'Practice.sql', 'Favorites.sql'];
const recentChallenges = ['JOIN Basics', 'Average Salary', 'Salary Ranking'];

export const Analytics: React.FC = () => {
  return (
    <div className="flex h-screen bg-vscode-bg text-vscode-text">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-vscode-text/65">Query activity, saved work, challenge progress, and learning momentum.</p>

          <div className="mt-6 grid grid-cols-5 gap-4">
            {stats.map(stat => (
              <div key={stat.label} className="rounded border border-vscode-border bg-vscode-sidebar p-4">
                <div className="text-xs uppercase tracking-wide text-vscode-text/55">{stat.label}</div>
                <div className="mt-3 text-2xl font-semibold text-white">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <section className="rounded border border-vscode-border bg-[#202020] p-5">
              <h2 className="font-semibold text-white">Query Activity</h2>
              <div className="mt-6 flex h-52 items-end gap-4">
                {dailyActivity.map(item => (
                  <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-t bg-vscode-accent" style={{ height: `${item.value}%` }} />
                    <span className="text-xs text-vscode-text/55">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded border border-vscode-border bg-[#202020] p-5">
              <h2 className="font-semibold text-white">Most Used Tables</h2>
              <div className="mt-6 space-y-5">
                {mostUsedTables.map(item => (
                  <div key={item.label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="h-3 rounded bg-vscode-bg">
                      <div className="h-3 rounded bg-purple-400" style={{ width: `${item.value * 2}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded border border-vscode-border bg-[#202020] p-5">
              <h2 className="font-semibold text-white">Difficulty Distribution</h2>
              <div className="mt-6 space-y-5">
                {difficultyDistribution.map(item => (
                  <div key={item.label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="h-3 rounded bg-vscode-bg">
                      <div className={`h-3 rounded ${item.color}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded border border-vscode-border bg-[#202020] p-5">
              <h2 className="font-semibold text-white">Recent Challenges</h2>
              <div className="mt-4 space-y-3">
                {recentChallenges.map((item, index) => (
                  <div key={item} className="flex items-center justify-between rounded border border-vscode-border bg-vscode-bg p-3 text-sm">
                    <span>{item}</span>
                    <span className={index === 0 ? 'text-yellow-300' : index === 1 ? 'text-green-300' : 'text-red-300'}>{index === 0 ? 'Medium' : index === 1 ? 'Easy' : 'Hard'}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded border border-vscode-border bg-[#202020] p-5">
              <h2 className="font-semibold text-white">Recent Queries</h2>
              <div className="mt-4 space-y-2">
                {recentQueries.map(item => <div key={item} className="rounded border border-vscode-border bg-vscode-bg p-3 text-sm">{item}</div>)}
              </div>
            </section>

            <section className="rounded border border-vscode-border bg-[#202020] p-5">
              <h2 className="font-semibold text-white">Continue Learning</h2>
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-sm"><span>JOIN Basics</span><span>72%</span></div>
                <div className="h-3 rounded bg-vscode-bg"><div className="h-3 rounded bg-vscode-accent" style={{ width: '72%' }} /></div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div><div className="text-xs text-vscode-text/50">XP</div><div className="text-white">1200</div></div>
                  <div><div className="text-xs text-vscode-text/50">Ranking</div><div className="text-white">21</div></div>
                  <div><div className="text-xs text-vscode-text/50">Streak</div><div className="text-white">18 Days</div></div>
                </div>
              </div>
            </section>

            <section className="rounded border border-vscode-border bg-[#202020] p-5 col-span-2">
              <h2 className="font-semibold text-white">Query Types</h2>
              <div className="mt-5 grid grid-cols-5 gap-4">
                {queryTypes.map(item => (
                  <div key={item.label} className="rounded border border-vscode-border bg-vscode-bg p-4">
                    <div className="mb-3 text-sm text-white">{item.label}</div>
                    <div className="h-2 rounded bg-vscode-sidebar">
                      <div className="h-2 rounded bg-purple-400" style={{ width: `${item.value}%` }} />
                    </div>
                    <div className="mt-2 text-xs text-vscode-text/55">{item.value}%</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
