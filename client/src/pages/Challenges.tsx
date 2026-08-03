import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Bookmark, CheckCircle2, ChevronLeft, ChevronRight, Circle, Play, Save, Search, Send, Star } from 'lucide-react';
import api from '../utils/api';

type Difficulty = 'easy' | 'medium' | 'hard';
type ChallengeState = 'Unsolved' | 'Attempted' | 'Solved' | 'Bookmarked';

type Challenge = {
  id: number;
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  operation: string;
  topic: string;
  xp: number;
  estimated_time?: string;
  tables: string[];
  constraints: string[];
  expectedOutput: string[];
  sampleInput: string;
  successRate: number;
  submissions: number;
  status: ChallengeState;
};

type CategoryGroup = {
  name: string;
  topics: string[];
};

const categoryTree: CategoryGroup[] = [
  { name: 'Basics', topics: ['SELECT', 'WHERE', 'DISTINCT'] },
  { name: 'Sorting', topics: ['ORDER BY', 'LIMIT'] },
  { name: 'Aggregate', topics: ['COUNT', 'SUM', 'AVG', 'MIN/MAX'] },
  { name: 'Grouping', topics: ['GROUP BY', 'HAVING'] },
  { name: 'Joins', topics: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN'] },
  { name: 'Subquery', topics: ['Scalar', 'Nested'] },
  { name: 'Views', topics: ['CREATE VIEW'] },
  { name: 'Window', topics: ['ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LAG', 'LEAD'] },
  { name: 'CTE', topics: ['WITH', 'Recursive CTE'] },
  { name: 'Advanced', topics: ['CASE', 'UNION'] },
];

const difficultyStyles: Record<Difficulty, string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-300',
  hard: 'text-red-300',
};

const normalizeParam = (value: string) => value.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_');

const buildEditorContext = (challenge?: Challenge) => {
  const tables = challenge?.tables?.length ? challenge.tables : ['employee'];
  const columnHints: Record<string, string[]> = {
    employee: ['id', 'name', 'salary', 'department_id'],
    department: ['id', 'department_name', 'location'],
    orders: ['id', 'customer_id', 'order_date', 'total_amount'],
    customers: ['id', 'name', 'email', 'country', 'status'],
    products: ['id', 'name', 'category', 'price'],
    order_items: ['id', 'order_id', 'product_id', 'quantity'],
  };
  const columns = tables.flatMap(table => columnHints[table] || []);

  return `/*
Write your SQL query below.

Available Tables:
${tables.join('\n')}

Columns:
${columns.length ? Array.from(new Set(columns)).join('\n') : 'Open the Explorer to inspect columns.'}
*/`;
};

const normalizeChallenge = (challenge: any): Challenge => ({
  id: challenge.id,
  slug: challenge.slug,
  title: challenge.title,
  description: challenge.description,
  difficulty: String(challenge.difficulty || 'easy').toLowerCase() as Difficulty,
  category: challenge.category || 'Basics',
  operation: challenge.operation || challenge.topic || 'SELECT',
  topic: challenge.topic || challenge.operation || 'SELECT',
  xp: challenge.xp || 10,
  estimated_time: challenge.estimated_time,
  tables: challenge.tables || ['employee'],
  constraints: challenge.constraints || ['Match the expected result set.'],
  expectedOutput: challenge.expectedOutput || [],
  sampleInput: challenge.sampleInput || 'practice_db',
  successRate: challenge.successRate || challenge.acceptanceRate || 80,
  submissions: challenge.submissions || challenge.submissionCount || 0,
  status: challenge.status || 'Unsolved',
});

export const Challenges: React.FC = () => {
  const [challenges, setChallenges] = React.useState<Challenge[]>([]);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [query, setQuery] = React.useState(buildEditorContext());
  const [search, setSearch] = React.useState('');
  const [difficultyFilters, setDifficultyFilters] = React.useState<Difficulty[]>([]);
  const [categoryFilters, setCategoryFilters] = React.useState<string[]>([]);
  const [operationFilters, setOperationFilters] = React.useState<string[]>([]);
  const [statusFilters, setStatusFilters] = React.useState<ChallengeState[]>([]);
  const [activePanel, setActivePanel] = React.useState<'tests' | 'output' | 'console'>('tests');
  const [result, setResult] = React.useState<any>(null);
  const [isSaveOpen, setIsSaveOpen] = React.useState(false);
  const [saveForm, setSaveForm] = React.useState({ name: 'SQL Practice Query', collection: 'Practice', notes: '' });
  const [lastRun, setLastRun] = React.useState<{ challengeId: number; query: string; success: boolean } | null>(null);

  const selectedIndex = Math.max(0, challenges.findIndex(challenge => challenge.id === selectedId));
  const selectedChallenge = challenges[selectedIndex];
  const canSubmit = Boolean(selectedChallenge && lastRun?.challengeId === selectedChallenge.id && lastRun.query === query && lastRun.success);
  const resultError = typeof result?.error === 'string'
    ? result.error
    : result?.error?.message || (result?.error ? JSON.stringify(result.error) : '');

  const loadChallenges = React.useCallback(async () => {
    const params: Record<string, string> = {};
    if (search.trim()) params.search = search.trim();
    if (difficultyFilters.length) params.difficulty = difficultyFilters.join(',');
    if (categoryFilters.length) params.category = categoryFilters.map(normalizeParam).join(',');
    if (operationFilters.length) params.operation = operationFilters.map(normalizeParam).join(',');
    if (statusFilters.length) params.status = statusFilters.map(normalizeParam).join(',');

    const { data } = await api.get('/challenges', { params });
    const nextChallenges = (data.data || []).map(normalizeChallenge);
    setChallenges(nextChallenges);
    setSelectedId(current => nextChallenges.some((challenge: Challenge) => challenge.id === current) ? current : nextChallenges[0]?.id || null);
  }, [search, difficultyFilters, categoryFilters, operationFilters, statusFilters]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      loadChallenges().catch(() => setChallenges([]));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadChallenges]);

  React.useEffect(() => {
    if (selectedChallenge) {
      setQuery(buildEditorContext(selectedChallenge));
      setResult(null);
      setActivePanel('tests');
      setLastRun(null);
      setSaveForm(current => ({ ...current, name: `${selectedChallenge.slug || selectedChallenge.title}.sql` }));
    }
  }, [selectedChallenge?.id]);

  const toggleDifficulty = (difficulty: Difficulty) => {
    setDifficultyFilters(current => current.includes(difficulty) ? current.filter(item => item !== difficulty) : [...current, difficulty]);
  };

  const toggleCategory = (category: string) => {
    setCategoryFilters(current => current.includes(category) ? current.filter(item => item !== category) : [...current, category]);
  };

  const toggleOperation = (operation: string) => {
    setOperationFilters(current => current.includes(operation) ? current.filter(item => item !== operation) : [...current, operation]);
  };

  const toggleStatus = (status: ChallengeState) => {
    setStatusFilters(current => current.includes(status) ? current.filter(item => item !== status) : [...current, status]);
  };

  const selectChallenge = (challenge: Challenge) => {
    setSelectedId(challenge.id);
  };

  const runChallenge = async () => {
    if (!selectedChallenge) return;
    const strippedQuery = query.replace(/\/\*[\s\S]*?\*\/|--.*$/gm, '').trim();
    if (!strippedQuery) {
      setResult({ mode: 'run', success: false, error: 'Please write a SQL query before running.', sampleTests: [{ name: 'Sample Case 1', status: 'failed' }] });
      setActivePanel('console');
      return;
    }
    try {
      const { data } = await api.post('/challenges/run', { challengeId: selectedChallenge.id, queryText: query });
      setResult({ mode: 'run', ...data.data });
      setLastRun({ challengeId: selectedChallenge.id, query, success: Boolean(data.data?.success) });
      setActivePanel('tests');
    } catch (error: any) {
      setResult({ mode: 'run', success: false, error: error.response?.data?.error || error.message, sampleTests: [{ name: 'Sample Case 1', status: 'failed' }] });
      setLastRun({ challengeId: selectedChallenge.id, query, success: false });
      setActivePanel('console');
    }
  };

  const submitChallenge = async () => {
    if (!selectedChallenge || !canSubmit) return;
    try {
      const { data } = await api.post('/challenges/submit', { challengeId: selectedChallenge.id, queryText: query });
      setResult({ mode: 'submit', ...data.data });
      setActivePanel('tests');
      await loadChallenges();
    } catch (error: any) {
      setResult({ mode: 'submit', isCorrect: false, error: error.response?.data?.error || error.message, hiddenTests: [{ name: 'Hidden Case 1', status: 'failed' }] });
      setActivePanel('console');
    }
  };

  const saveQuery = async () => {
    await api.post('/saved-queries', {
      title: saveForm.name,
      query,
      collection: saveForm.collection,
      notes: saveForm.notes,
    });
    setIsSaveOpen(false);
  };

  const toggleBookmarkForSelected = async (event: React.MouseEvent, challenge: Challenge) => {
    event.stopPropagation();
    await api.post(`/challenges/${challenge.id}/bookmark`);
    await loadChallenges();
  };

  return (
    <div className="app-shell flex h-screen text-vscode-text">
      <div className="flex flex-1 flex-col overflow-hidden">
        <section className="grid grid-cols-[1.1fr_repeat(5,1fr)] gap-4 border-b border-vscode-border bg-[#08111c]/75 p-4">
          <div className="metric-card">
            <div className="text-xs uppercase text-vscode-text/55">Continue Learning</div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-3 flex-1 rounded-full bg-[#142131]"><div className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300" style={{ width: '72%' }} /></div>
              <span className="text-sm text-white">72%</span>
            </div>
          </div>
          <div className="metric-card p-3"><div className="text-xs text-vscode-text/50">Questions</div><div className="mt-1 text-sm text-white">{challenges.length} / 60</div></div>
          <div className="metric-card p-3"><div className="text-xs text-vscode-text/50">Current</div><div className="mt-1 truncate text-sm text-white">{selectedChallenge?.title || 'Loading'}</div></div>
          <div className="metric-card p-3"><div className="text-xs text-vscode-text/50">Difficulty</div><div className={`mt-1 text-sm capitalize ${selectedChallenge ? difficultyStyles[selectedChallenge.difficulty] : ''}`}>{selectedChallenge?.difficulty || '-'}</div></div>
          <div className="metric-card p-3"><div className="text-xs text-vscode-text/50">Operation</div><div className="mt-1 text-sm text-white">{selectedChallenge?.operation || '-'}</div></div>
          <div className="metric-card p-3"><div className="text-xs text-vscode-text/50">Status</div><div className="mt-1 text-sm text-white">{selectedChallenge?.status || '-'}</div></div>
        </section>

        <div className="grid h-[65%] min-h-0 grid-cols-[240px_300px_1fr_1.5fr] border-b border-vscode-border">
          <aside className="overflow-y-auto border-r border-vscode-border bg-[#091421]/95 p-4">
            <h1 className="text-lg font-semibold text-white">SQL Challenges</h1>
            <div className="relative mt-4">
              <Search size={15} className="absolute left-3 top-2.5 text-vscode-text/50" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search challenges" className="w-full rounded-md border border-vscode-border bg-[#06101a] py-2 pl-9 pr-3 text-sm outline-none focus:border-vscode-accent" />
            </div>
            <section className="mt-5">
              <h2 className="mb-2 text-xs font-semibold uppercase text-vscode-text/60">Difficulty</h2>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(item => (
                <label key={item} className="mb-2 flex cursor-pointer items-center gap-2 text-sm capitalize">
                  <input type="checkbox" checked={difficultyFilters.includes(item)} onChange={() => toggleDifficulty(item)} />
                  <span className={difficultyStyles[item]}>{item}</span>
                </label>
              ))}
            </section>
            <section className="mt-5">
              <h2 className="mb-2 text-xs font-semibold uppercase text-vscode-text/60">Status</h2>
              {(['Solved', 'Attempted', 'Unsolved', 'Bookmarked'] as ChallengeState[]).map(status => (
                <label key={status} className="mb-2 flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={statusFilters.includes(status)} onChange={() => toggleStatus(status)} />
                  {status}
                </label>
              ))}
            </section>
            <section className="mt-5">
              <h2 className="mb-2 text-xs font-semibold uppercase text-vscode-text/60">Categories</h2>
              <div className="space-y-3">
                {categoryTree.map(section => (
                  <div key={section.name}>
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-white">
                      <input type="checkbox" checked={categoryFilters.includes(section.name)} onChange={() => toggleCategory(section.name)} />
                      {section.name}
                    </label>
                    <div className="ml-5 mt-1 space-y-1">
                      {section.topics.map(topic => (
                        <label key={topic} className="flex cursor-pointer items-center gap-2 text-xs text-vscode-text/75">
                          <input type="checkbox" checked={operationFilters.includes(topic)} onChange={() => toggleOperation(topic)} />
                          {topic}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <aside className="overflow-y-auto border-r border-vscode-border bg-[#0d1723]/95 p-3">
            <div className="mb-3 text-sm text-vscode-text/70">{challenges.length} Challenges Found</div>
            <div className="space-y-3">
              {challenges.map(challenge => (
                <button key={challenge.id} onClick={() => selectChallenge(challenge)} className={`group w-full rounded-lg border p-3 text-left transition hover:bg-vscode-accent/10 ${selectedChallenge?.id === challenge.id ? 'border-vscode-accent bg-vscode-accent/15 shadow-[0_0_22px_rgba(47,140,255,0.12)]' : 'border-vscode-border bg-white/[0.03]'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {challenge.status === 'Solved' ? <CheckCircle2 size={16} className="text-green-400" /> : <Circle size={16} className="text-vscode-text/40" />}
                      <h2 className="truncate font-semibold text-white">{challenge.title}</h2>
                    </div>
                    <span onClick={event => toggleBookmarkForSelected(event, challenge)} className="rounded p-1 hover:bg-white/10" title="Toggle bookmark">
                      <Bookmark size={15} className={challenge.status === 'Bookmarked' ? 'fill-vscode-accent text-vscode-accent' : 'text-vscode-text/45'} />
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className={difficultyStyles[challenge.difficulty]}>{challenge.difficulty}</span>
                    <span className="flex items-center gap-0.5 text-yellow-300"><Star size={12} /><Star size={12} /><Star size={12} /></span>
                    <span>{challenge.status}</span>
                    <span className="flex items-center gap-1 text-yellow-300"><Star size={12} /> {challenge.xp} Points</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-vscode-text/60">
                    <span>{challenge.successRate}% Solved</span>
                    <span>{challenge.submissions.toLocaleString()} Submissions</span>
                    <span>{challenge.category}</span>
                    <span>{challenge.operation}</span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="overflow-y-auto border-r border-vscode-border bg-[#071019]/45 p-5">
            {selectedChallenge ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <button disabled={selectedIndex === 0} onClick={() => selectChallenge(challenges[selectedIndex - 1])} className="secondary-action flex items-center gap-1 px-2 py-1 disabled:opacity-40"><ChevronLeft size={14} /> Previous</button>
                  <span className="text-xs text-vscode-text/60">Challenge {selectedIndex + 1} / {challenges.length}</span>
                  <button disabled={selectedIndex === challenges.length - 1} onClick={() => selectChallenge(challenges[selectedIndex + 1])} className="secondary-action flex items-center gap-1 px-2 py-1 disabled:opacity-40">Next <ChevronRight size={14} /></button>
                </div>
                <h2 className="text-xl font-semibold text-white">{selectedChallenge.title}</h2>
                <div className="mt-2 flex gap-3 text-sm">
                  <span className={difficultyStyles[selectedChallenge.difficulty]}>{selectedChallenge.difficulty}</span>
                  <span>{selectedChallenge.category}</span>
                  <span>{selectedChallenge.operation}</span>
                  <span>{selectedChallenge.xp} Points</span>
                </div>
                <section className="mt-5 space-y-5 text-sm leading-6">
                  <p>{selectedChallenge.description}</p>
                  <div><h3 className="font-semibold text-white">Tables</h3><p>{selectedChallenge.tables.join(', ')}</p></div>
                  <div><h3 className="font-semibold text-white">Constraints</h3><ul className="list-disc pl-5">{selectedChallenge.constraints.map(item => <li key={item}>{item}</li>)}</ul></div>
                  <div><h3 className="font-semibold text-white">Expected Columns</h3><p>{selectedChallenge.expectedOutput.join(', ') || 'Match the expected result set.'}</p></div>
                  <div><h3 className="font-semibold text-white">Context</h3><pre className="mt-2 rounded-md border border-vscode-border bg-[#06101a] p-3 text-xs">{selectedChallenge.sampleInput}</pre></div>
                </section>
              </>
            ) : (
              <div className="workbench-panel p-5 text-sm text-vscode-text/70">No challenges match the current filters.</div>
            )}
          </main>

          <section className="flex min-w-0 flex-col">
            <div className="flex items-center justify-between border-b border-vscode-border bg-[#0d1a28] px-3 py-2">
              <span className="text-sm">solution.sql</span>
              <div className="flex gap-2">
                <button onClick={runChallenge} disabled={!selectedChallenge} className="secondary-action flex items-center gap-1 px-3 py-1"><Play size={14} /> Run</button>
                <button onClick={() => setIsSaveOpen(true)} disabled={!selectedChallenge} className="secondary-action flex items-center gap-1 px-3 py-1"><Save size={14} /> Save</button>
                <button onClick={submitChallenge} disabled={!canSubmit} className="primary-action flex items-center gap-1 px-3 py-1"><Send size={14} /> Submit</button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <MonacoEditor height="100%" language="sql" theme="vs-dark" value={query} onChange={value => { setQuery(value || ''); setLastRun(null); }} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 }, scrollBeyondLastLine: false }} />
            </div>
          </section>
        </div>

        <section className="flex-1 overflow-hidden bg-[#071019]">
          <div className="flex border-b border-vscode-border bg-[#0d1a28] text-sm">
            {(['tests', 'output', 'console'] as const).map(panel => (
              <button key={panel} onClick={() => setActivePanel(panel)} className={`px-4 py-2 capitalize ${activePanel === panel ? 'bg-vscode-accent/10 text-white' : 'text-vscode-text/55 hover:text-white'}`}>{panel === 'tests' ? 'Test Cases' : panel}</button>
            ))}
          </div>
          <div className="h-full overflow-auto p-4">
            {activePanel === 'tests' && (
              <div className="space-y-2">
                <h3 className="font-semibold text-white">{result?.mode === 'submit' ? 'Hidden Test Cases' : 'Sample Test Cases'}</h3>
                {(result?.hiddenTests || result?.sampleTests || [{ name: 'Run the current query first', status: 'waiting' }]).map((test: any) => (
                  <div key={test.name} className="rounded-md border border-vscode-border bg-white/[0.03] p-3 text-sm">
                    {test.status === 'passed' ? 'Passed' : test.status === 'failed' ? 'Failed' : 'Waiting'} - {test.name}
                  </div>
                ))}
              </div>
            )}
            {activePanel === 'output' && <pre className="text-sm">{JSON.stringify(result?.rows || result || 'Run a query to preview output.', null, 2)}</pre>}
            {activePanel === 'console' && <p className="text-sm text-vscode-text/70">{resultError || (result?.mode === 'submit' ? `Points Earned: ${result.xpEarned || 0}` : 'Console ready.')}</p>}
          </div>
        </section>
      </div>

      {isSaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="workbench-panel w-[420px] p-5">
            <h2 className="text-lg font-semibold text-white">Save Query</h2>
            <label className="mt-4 block text-sm">Name<input value={saveForm.name} onChange={event => setSaveForm({ ...saveForm, name: event.target.value })} className="mt-1 w-full rounded border border-vscode-border bg-vscode-bg p-2 outline-none" /></label>
            <label className="mt-3 block text-sm">Collection<select value={saveForm.collection} onChange={event => setSaveForm({ ...saveForm, collection: event.target.value })} className="mt-1 w-full rounded border border-vscode-border bg-vscode-bg p-2 outline-none"><option>Interview</option><option>Practice</option><option>Favorites</option><option>Assignments</option></select></label>
            <label className="mt-3 block text-sm">Notes<textarea value={saveForm.notes} onChange={event => setSaveForm({ ...saveForm, notes: event.target.value })} className="mt-1 h-20 w-full rounded border border-vscode-border bg-vscode-bg p-2 outline-none" /></label>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setIsSaveOpen(false)} className="rounded border border-vscode-border px-3 py-1.5 text-sm hover:bg-white/5">Cancel</button>
              <button onClick={saveQuery} className="rounded bg-vscode-accent px-3 py-1.5 text-sm text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
