import React from 'react';
import { Sidebar } from '../components/Sidebar';

import api from '../utils/api';

type LeaderboardEntry = {
  rank: number;
  username: string;
  full_name?: string;
  university?: string;
  challenges_completed: number;
  total_score: number;
  rankingScore: number;
};

export const Leaderboard: React.FC = () => {
  const [data, setData] = React.useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api.get('/challenges/leaderboard')
      .then(res => {
        setData(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load leaderboard', err);
        setLoading(false);
      });
  }, []);

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
          </div>

          <div className="overflow-hidden rounded border border-vscode-border">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-vscode-sidebar text-left text-xs uppercase tracking-wide text-vscode-text/65">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">University</th>
                  <th className="px-4 py-3">Solved</th>
                  <th className="px-4 py-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-vscode-text/60">Loading leaderboard...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-vscode-text/60">No users found.</td></tr>
                ) : (
                  data.map(row => (
                    <tr key={row.rank} className="border-t border-vscode-border bg-[#202020] hover:bg-white/5">
                      <td className="px-4 py-4 font-semibold text-white">#{row.rank}</td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-white">{row.full_name || row.username}</div>
                        <div className="text-xs text-vscode-text/60">@{row.username}</div>
                      </td>
                      <td className="px-4 py-4">{row.university || '-'}</td>
                      <td className="px-4 py-4">{row.challenges_completed || 0}</td>
                      <td className="px-4 py-4 text-right font-semibold text-white">{row.rankingScore || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
