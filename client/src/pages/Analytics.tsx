import React from 'react';
import { Sidebar } from '../components/Sidebar';

const stats = [
  { label: 'Total Queries', value: '120' },
  { label: 'Challenges Solved', value: '35' },
  { label: 'Accuracy', value: '91%' },
  { label: 'Current Streak', value: '12 Days' },
  { label: 'Average Runtime', value: '43 ms' },
];

const dailyActivity = [48, 82, 34, 62, 74, 51, 91];
const difficultyDistribution = [
  { label: 'Easy', value: 75, color: 'bg-green-400' },
  { label: 'Medium', value: 58, color: 'bg-yellow-300' },
  { label: 'Hard', value: 22, color: 'bg-red-300' },
];
const topicDistribution = [
  { label: 'JOIN', value: 72 },
  { label: 'GROUP BY', value: 63 },
  { label: 'Aggregate', value: 56 },
  { label: 'Window', value: 34 },
  { label: 'Subquery', value: 45 },
];

export const Analytics: React.FC = () => {
  return (
    <div className="flex h-screen bg-vscode-bg text-vscode-text">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl">
          <h1 className="text-2xl font-semibold text-white">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-vscode-text/65">Query performance, challenge activity, and learning momentum.</p>

          <div className="mt-6 grid grid-cols-5 gap-4">
            {stats.map(stat => (
              <div key={stat.label} className="rounded border border-vscode-border bg-vscode-sidebar p-4">
                <div className="text-xs uppercase tracking-wide text-vscode-text/55">{stat.label}</div>
                <div className="mt-3 text-2xl font-semibold text-white">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-[1.4fr_1fr] gap-4">
            <section className="rounded border border-vscode-border bg-[#202020] p-5">
              <h2 className="font-semibold text-white">Daily Activity</h2>
              <div className="mt-6 flex h-52 items-end gap-4">
                {dailyActivity.map((value, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-t bg-vscode-accent" style={{ height: `${value}%` }} />
                    <span className="text-xs text-vscode-text/55">D{index + 1}</span>
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

            <section className="rounded border border-vscode-border bg-[#202020] p-5 col-span-2">
              <h2 className="font-semibold text-white">Topic Distribution</h2>
              <div className="mt-5 grid grid-cols-5 gap-4">
                {topicDistribution.map(item => (
                  <div key={item.label} className="rounded border border-vscode-border bg-vscode-bg p-4">
                    <div className="mb-3 text-sm text-white">{item.label}</div>
                    <div className="h-2 rounded bg-vscode-sidebar">
                      <div className="h-2 rounded bg-vscode-accent" style={{ width: `${item.value}%` }} />
                    </div>
                    <div className="mt-2 text-xs text-vscode-text/55">{item.value}% coverage</div>
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
