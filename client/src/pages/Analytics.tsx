import React from 'react';
import { Activity, BarChart3, Flame, Search, Sparkles, Target, Trophy } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import api from '../utils/api';
import { useAuthStore } from '../store/useAuthStore';

type SearchResult = {
  challenges: Array<{ id: number; title: string; difficulty: string; category: string; operation: string }>;
  tables: Array<{ name: string; columns: string[] }>;
  savedQueries: Array<{ id: number; title: string; collection?: string }>;
  suggestions: Array<{ label: string; type: string }>;
};

const emptySearch: SearchResult = { challenges: [], tables: [], savedQueries: [], suggestions: [] };

const fallbackStats = {
  solved: 0,
  accuracy: 0,
  ranking: 0,
  streak: 0,
  xp: 0,
  skills: [],
  recentSubmissions: [],
};

const weeklyActivity = [
  { label: 'Mon', value: 36 },
  { label: 'Tue', value: 72 },
  { label: 'Wed', value: 54 },
  { label: 'Thu', value: 88 },
  { label: 'Fri', value: 64 },
  { label: 'Sat', value: 42 },
  { label: 'Sun', value: 58 },
];

export const Analytics: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResult>(emptySearch);
  const [stats, setStats] = React.useState(fallbackStats);
  const [recommended, setRecommended] = React.useState<any[]>([]);
  const [recentQueries, setRecentQueries] = React.useState<any[]>([]);

  React.useEffect(() => {
    api.get('/challenges/profile-stats').then(({ data }) => setStats({ ...fallbackStats, ...data.data })).catch(() => setStats(fallbackStats));
    api.get('/challenges/recommended', { params: { limit: 3 } }).then(({ data }) => setRecommended(data.data || [])).catch(() => setRecommended([]));
    api.get('/sql/history').then(({ data }) => setRecentQueries(data.data || [])).catch(() => setRecentQueries([]));
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!searchTerm.trim()) {
        setSearchResults(emptySearch);
        return;
      }

      api.get('/search', { params: { q: searchTerm.trim() } })
        .then(({ data }) => setSearchResults(data))
        .catch(() => setSearchResults(emptySearch));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const displayName = user?.username || 'User';
  const metrics = [
    { label: 'Solved', value: `${stats.solved} / 60`, icon: Target, accent: 'from-emerald-400 to-green-500' },
    { label: 'Queries', value: recentQueries.length || 284, icon: BarChart3, accent: 'from-sky-400 to-blue-500' },
    { label: 'Accuracy', value: `${stats.accuracy}%`, icon: Activity, accent: 'from-violet-400 to-fuchsia-500' },
    { label: 'Ranking', value: `#${stats.ranking}`, icon: Trophy, accent: 'from-cyan-300 to-teal-400' },
    { label: 'Streak', value: `${stats.streak} days`, icon: Flame, accent: 'from-amber-300 to-orange-500' },
  ];

  return (
    <div className="app-shell flex h-screen text-vscode-text">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl">
          <section className="flex items-start justify-between gap-6 border-b border-vscode-border pb-5">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-vscode-accent/30 bg-vscode-accent/10 px-2.5 py-1 text-xs text-sky-200">
                <Sparkles size={13} /> Learning dashboard
              </div>
              <h1 className="text-2xl font-semibold text-white">Good afternoon, {displayName}</h1>
              <p className="mt-1 text-sm text-vscode-text/65">Track practice, review weak spots, and jump back into SQL challenges.</p>
            </div>
            <div className="relative w-[420px]">
              <Search size={16} className="absolute left-3 top-3 text-vscode-text/50" />
              <input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search SQLLab" className="w-full rounded-md border border-vscode-border bg-[#06101a] py-2.5 pl-9 pr-3 text-sm shadow-inner shadow-black/30 outline-none focus:border-vscode-accent" />
              {searchTerm.trim() && (
                <div className="workbench-panel absolute right-0 top-12 z-20 w-full p-4">
                  <SearchGroup title="Suggestions" items={searchResults.suggestions.map(item => item.label)} />
                  <SearchGroup title="Challenges" items={searchResults.challenges.map(item => `${item.title} - ${item.operation}`)} />
                  <SearchGroup title="Tables" items={searchResults.tables.map(item => `${item.name}${item.columns.length ? ` - ${item.columns.join(', ')}` : ''}`)} />
                  <SearchGroup title="Saved Queries" items={searchResults.savedQueries.map(item => item.title)} />
                </div>
              )}
            </div>
          </section>

          <div className="mt-5 grid grid-cols-5 gap-4">
            {metrics.map(metric => {
              const Icon = metric.icon;
              return (
                <section key={metric.label} className="metric-card">
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-wide text-vscode-text/55">{metric.label}</div>
                    <div className={`rounded-md bg-gradient-to-br ${metric.accent} p-1.5 text-white`}>
                      <Icon size={14} />
                    </div>
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-white">{metric.value}</div>
                </section>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-5">
            <section className="workbench-panel p-5">
              <h2 className="font-semibold text-white">Continue Learning</h2>
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-sm"><span>JOIN Basics</span><span>72%</span></div>
                <div className="h-3 rounded-full bg-[#142131]"><div className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300" style={{ width: '72%' }} /></div>
              </div>
            </section>

            <section className="workbench-panel p-5">
              <h2 className="font-semibold text-white">Recommended for You</h2>
              <div className="mt-4 space-y-3">
                {(recommended.length ? recommended : [{ title: 'Window Functions', difficulty: 'medium', reason: 'Based on your progress' }]).map(item => (
                  <div key={item.id || item.title} className="rounded-md border border-vscode-border bg-white/[0.03] p-3 text-sm transition hover:border-vscode-accent/60 hover:bg-vscode-accent/10">
                    <div className="font-semibold text-white">{item.title}</div>
                    <div className="mt-1 flex gap-3 text-xs text-vscode-text/65"><span>{item.difficulty}</span><span>{item.reason || 'Based on your progress'}</span></div>
                  </div>
                ))}
              </div>
            </section>

            <section className="workbench-panel p-5">
              <h2 className="font-semibold text-white">Weekly Activity</h2>
              <div className="mt-6 flex h-52 items-end gap-4">
                {weeklyActivity.map(item => (
                  <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-t bg-gradient-to-t from-vscode-accent to-cyan-300 shadow-[0_0_18px_rgba(47,140,255,0.22)]" style={{ height: `${item.value}%` }} />
                    <span className="text-xs text-vscode-text/55">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="workbench-panel p-5">
              <h2 className="font-semibold text-white">SQL Skills</h2>
              <div className="mt-5 space-y-4">
                {stats.skills.slice(0, 6).map(skill => (
                  <div key={skill.topic}>
                    <div className="mb-1 flex justify-between text-sm"><span>{skill.topic}</span><span>{skill.strength}%</span></div>
                    <div className="h-2 rounded-full bg-[#142131]"><div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" style={{ width: `${skill.strength}%` }} /></div>
                  </div>
                ))}
              </div>
            </section>

            <section className="workbench-panel p-5">
              <h2 className="font-semibold text-white">Recent Queries</h2>
              <div className="mt-4 space-y-2">
                {(recentQueries.length ? recentQueries.slice(0, 5) : [{ id: 1, query_text: 'SELECT * FROM employee;' }, { id: 2, query_text: 'SELECT name FROM customers;' }]).map(item => (
                  <div key={item.id} className="truncate rounded-md border border-vscode-border bg-white/[0.03] p-3 text-sm hover:border-vscode-accent/50">{item.query_text}</div>
                ))}
              </div>
            </section>

            <section className="workbench-panel p-5">
              <h2 className="font-semibold text-white">Recent Submissions</h2>
              <div className="mt-4 space-y-2">
                {stats.recentSubmissions.slice(0, 5).map(item => (
                  <div key={`${item.challenge}-${item.runtime}`} className="flex justify-between gap-4 rounded-md border border-vscode-border bg-white/[0.03] p-3 text-sm hover:border-vscode-accent/50">
                    <span className="truncate text-white">{item.challenge}</span>
                    <span className={item.status === 'Accepted' ? 'text-green-400' : 'text-red-300'}>{item.status}</span>
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

const SearchGroup = ({ title, items }: { title: string; items: string[] }) => (
  <div className="mb-4 last:mb-0">
    <div className="mb-2 border-b border-vscode-border pb-1 text-xs font-semibold uppercase text-vscode-text/55">{title}</div>
    {items.length ? items.slice(0, 5).map(item => <div key={item} className="rounded px-2 py-1 text-sm text-vscode-text/85 hover:bg-white/[0.04]">{item}</div>) : <div className="py-1 text-xs text-vscode-text/45">No matches</div>}
  </div>
);
