import React from 'react';
import { Edit3 } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { useAuthStore } from '../store/useAuthStore';
import api from '../utils/api';

type DifficultyProgress = {
  difficulty: 'easy' | 'medium' | 'hard';
  solved: number;
  total: number;
};

type Skill = {
  topic: string;
  strength: number;
};

type ActivityDay = {
  date: string;
  solved: number;
  queries: number;
};

type RecentSubmission = {
  challenge: string;
  status: string;
  runtime: string;
};

const fallbackStats = {
  solved: 42,
  xp: 1240,
  accuracy: 87,
  ranking: 21,
  streak: 18,
  difficulties: [
    { difficulty: 'easy', solved: 21, total: 25 },
    { difficulty: 'medium', solved: 14, total: 25 },
    { difficulty: 'hard', solved: 4, total: 10 },
  ] as DifficultyProgress[],
  skills: [
    { topic: 'SELECT', strength: 95 },
    { topic: 'WHERE', strength: 90 },
    { topic: 'JOIN', strength: 78 },
    { topic: 'GROUP BY', strength: 82 },
    { topic: 'Subqueries', strength: 65 },
    { topic: 'Window Functions', strength: 48 },
    { topic: 'CTE', strength: 40 },
  ] as Skill[],
  activity: [] as ActivityDay[],
  recentSubmissions: [
    { challenge: 'JOIN Basics', status: 'Accepted', runtime: '21ms' },
    { challenge: 'Average Salary', status: 'Accepted', runtime: '18ms' },
    { challenge: 'Third Highest Salary', status: 'Failed', runtime: '32ms' },
    { challenge: 'CTE Basics', status: 'Accepted', runtime: '25ms' },
  ] as RecentSubmission[],
};

const buildHeatmap = (activity: ActivityDay[]) => {
  const activityByDate = new Map(activity.map(day => [String(day.date).slice(0, 10), day]));
  return Array.from({ length: 84 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (83 - index));
    const key = date.toISOString().slice(0, 10);
    const value = activityByDate.get(key);
    return { date: key, count: (value?.solved || 0) + (value?.queries || 0) };
  });
};

const intensityClass = (count: number) => {
  if (count >= 8) return 'bg-green-400';
  if (count >= 4) return 'bg-green-500/70';
  if (count >= 1) return 'bg-green-700/60';
  return 'bg-vscode-sidebar';
};

export const Profile: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const [stats, setStats] = React.useState(fallbackStats);

  React.useEffect(() => {
    api.get('/challenges/profile-stats')
      .then(({ data }) => setStats({ ...fallbackStats, ...data.data }))
      .catch(() => setStats(fallbackStats));
  }, []);

  const username = user?.username || 'prince';
  const displayName = username === 'prince' ? 'Prince Kumar' : username;
  const initials = displayName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  const heatmap = buildHeatmap(stats.activity);

  return (
    <div className="flex h-screen bg-vscode-bg text-vscode-text">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl">
          <section className="rounded border border-vscode-border bg-vscode-sidebar p-6">
            <div className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded bg-vscode-accent text-xl font-semibold text-white">{initials}</div>
                <div>
                  <h1 className="text-2xl font-semibold text-white">{displayName}</h1>
                  <p className="mt-1 text-sm text-vscode-text/65">@{username}</p>
                  <p className="mt-1 text-sm text-vscode-text/80">SQL Learner</p>
                </div>
              </div>
              <button className="flex items-center gap-2 rounded border border-vscode-border px-3 py-2 text-sm hover:bg-white/5"><Edit3 size={15} /> Edit Profile</button>
            </div>
          </section>

          <div className="mt-5 grid grid-cols-4 gap-4">
            {[
              { label: 'Solved', value: stats.solved },
              { label: 'Accuracy', value: `${stats.accuracy}%` },
              { label: 'Ranking', value: `#${stats.ranking}` },
              { label: 'Streak', value: `${stats.streak} days` },
            ].map(stat => (
              <section key={stat.label} className="rounded border border-vscode-border bg-[#202020] p-5">
                <div className="text-xs uppercase tracking-wide text-vscode-text/55">{stat.label}</div>
                <div className="mt-3 text-2xl font-semibold text-white">{stat.value}</div>
              </section>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-[1.1fr_0.9fr] gap-5">
            <section className="rounded border border-vscode-border bg-[#202020] p-5">
              <h2 className="font-semibold text-white">Problem Solving</h2>
              <div className="mt-5 space-y-5">
                {stats.difficulties.map(item => {
                  const percentage = item.total ? Math.round((item.solved / item.total) * 100) : 0;
                  return (
                    <div key={item.difficulty}>
                      <div className="mb-2 flex justify-between text-sm capitalize">
                        <span>{item.difficulty}</span>
                        <span>{item.solved} / {item.total}</span>
                      </div>
                      <div className="h-3 rounded bg-vscode-bg">
                        <div className="h-3 rounded bg-vscode-accent" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded border border-vscode-border bg-[#202020] p-5">
              <h2 className="font-semibold text-white">SQL Skills</h2>
              <div className="mt-5 space-y-4">
                {stats.skills.slice(0, 8).map(skill => (
                  <div key={skill.topic}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{skill.topic}</span>
                      <span>{skill.strength}%</span>
                    </div>
                    <div className="h-2 rounded bg-vscode-bg">
                      <div className="h-2 rounded bg-green-400" style={{ width: `${skill.strength}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-5 rounded border border-vscode-border bg-[#202020] p-5">
            <h2 className="font-semibold text-white">Activity</h2>
            <div className="mt-5 grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto">
              {heatmap.map(day => (
                <div key={day.date} title={`${day.date}: ${day.count} activities`} className={`h-3 w-3 rounded-sm border border-black/20 ${intensityClass(day.count)}`} />
              ))}
            </div>
          </section>

          <section className="mt-5 rounded border border-vscode-border bg-[#202020] p-5">
            <h2 className="font-semibold text-white">Recent Submissions</h2>
            <div className="mt-4 overflow-hidden rounded border border-vscode-border">
              <div className="grid grid-cols-[1fr_140px_100px] bg-vscode-sidebar px-4 py-2 text-xs uppercase text-vscode-text/55">
                <span>Challenge</span>
                <span>Status</span>
                <span>Runtime</span>
              </div>
              {stats.recentSubmissions.map(item => (
                <div key={`${item.challenge}-${item.runtime}`} className="grid grid-cols-[1fr_140px_100px] border-t border-vscode-border px-4 py-3 text-sm">
                  <span className="text-white">{item.challenge}</span>
                  <span className={item.status === 'Accepted' ? 'text-green-400' : 'text-red-300'}>{item.status}</span>
                  <span>{item.runtime}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
