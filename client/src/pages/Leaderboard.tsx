import React from 'react';
import { Sidebar } from '../components/Sidebar';

const leaderboardData = {
  Weekly: [
    { rank: 1, user: 'Prince', solved: 45, accuracy: '98%', score: 1420 },
    { rank: 2, user: 'Rahul', solved: 42, accuracy: '95%', score: 1370 },
    { rank: 3, user: 'Aman', solved: 38, accuracy: '93%', score: 1320 },
    { rank: 4, user: 'Neha', solved: 34, accuracy: '91%', score: 1250 },
  ],
  Monthly: [
    { rank: 1, user: 'Prince', solved: 158, accuracy: '96%', score: 4820 },
    { rank: 2, user: 'Aman', solved: 146, accuracy: '94%', score: 4610 },
    { rank: 3, user: 'Rahul', solved: 139, accuracy: '92%', score: 4380 },
    { rank: 4, user: 'Sana', solved: 121, accuracy: '89%', score: 3970 },
  ],
  'All Time': [
    { rank: 1, user: 'Prince', solved: 412, accuracy: '95%', score: 12420 },
    { rank: 2, user: 'Rahul', solved: 389, accuracy: '93%', score: 11870 },
    { rank: 3, user: 'Aman', solved: 351, accuracy: '91%', score: 11120 },
    { rank: 4, user: 'Neha', solved: 310, accuracy: '90%', score: 10460 },
  ],
};

export const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<keyof typeof leaderboardData>('Weekly');

  return (
    <div className="flex h-screen bg-vscode-bg text-vscode-text">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Leaderboard</h1>
              <p className="mt-1 text-sm text-vscode-text/65">Top SQLLab performers by solved challenges, accuracy, and score.</p>
            </div>
            <div className="flex rounded border border-vscode-border bg-vscode-sidebar p-1">
              {(Object.keys(leaderboardData) as Array<keyof typeof leaderboardData>).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded px-3 py-1.5 text-sm ${activeTab === tab ? 'bg-vscode-accent text-white' : 'hover:bg-white/5'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded border border-vscode-border">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-vscode-sidebar text-left text-xs uppercase tracking-wide text-vscode-text/65">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Solved</th>
                  <th className="px-4 py-3">Accuracy</th>
                  <th className="px-4 py-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData[activeTab].map(row => (
                  <tr key={`${activeTab}-${row.rank}`} className="border-t border-vscode-border bg-[#202020] hover:bg-white/5">
                    <td className="px-4 py-4 font-semibold text-white">{row.rank}</td>
                    <td className="px-4 py-4">{row.user}</td>
                    <td className="px-4 py-4">{row.solved}</td>
                    <td className="px-4 py-4">{row.accuracy}</td>
                    <td className="px-4 py-4 text-right font-semibold text-white">{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
