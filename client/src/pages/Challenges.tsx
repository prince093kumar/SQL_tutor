import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Bookmark, CheckCircle2, ChevronLeft, ChevronRight, Circle, Play, Save, Search, Send, Star } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import api from '../utils/api';

type Difficulty = 'easy' | 'medium' | 'hard';
type ChallengeState = 'Not Attempted' | 'Attempted' | 'Solved' | 'Bookmarked';

type Challenge = {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  topic: string;
  xp: number;
  estimated_time?: string;
  tables: string[];
  constraints: string[];
  expectedOutput: string[];
  sampleInput: string;
  sampleOutput: string;
  successRate: number;
  submissions: number;
  status: ChallengeState;
};

const editorPlaceholder = `/*
Write your SQL query below.

Available Tables:
employee

Columns:
id
name
salary
department_id
*/`;

const fallbackChallenges: Challenge[] = [
  {
    id: 1,
    title: 'Select Basics',
    description: 'Return employee names and salaries from the employee table. Write the full query yourself.',
    difficulty: 'easy',
    category: 'Basics',
    topic: 'SELECT',
    xp: 10,
    tables: ['employee'],
    constraints: ['Use the employee table.', 'Return only name and salary.', 'Sort by id for deterministic output.'],
    expectedOutput: ['name', 'salary'],
    sampleInput: 'employee(id, name, department, department_id, salary)',
    sampleOutput: 'Prince | 50000.00',
    successRate: 92,
    submissions: 1842,
    status: 'Solved',
  },
  {
    id: 2,
    title: 'Employee Department Join',
    description: 'Return employee names with their department names.',
    difficulty: 'medium',
    category: 'JOINS',
    topic: 'INNER JOIN',
    xp: 20,
    tables: ['employee', 'department'],
    constraints: ['Use INNER JOIN.', 'Join employee.department_id to department.id.'],
    expectedOutput: ['name', 'department_name'],
    sampleInput: 'employee, department',
    sampleOutput: 'Prince | IT',
    successRate: 69,
    submissions: 1264,
    status: 'Bookmarked',
  },
  {
    id: 3,
    title: 'Average Salary',
    description: 'Calculate average salary for each department.',
    difficulty: 'medium',
    category: 'Functions',
    topic: 'AVG',
    xp: 20,
    tables: ['employee'],
    constraints: ['Use AVG and GROUP BY.', 'Alias the result as average_salary.'],
    expectedOutput: ['department', 'average_salary'],
    sampleInput: 'employee(department, salary)',
    sampleOutput: 'IT | 61000.00',
    successRate: 71,
    submissions: 918,
    status: 'Attempted',
  },
  {
    id: 4,
    title: 'Salary Ranking',
    description: 'Rank employees by salary within each department.',
    difficulty: 'hard',
    category: 'Window Functions',
    topic: 'RANK',
    xp: 30,
    tables: ['employee'],
    constraints: ['Use a window function.', 'Partition by department.'],
    expectedOutput: ['department', 'name', 'salary_rank'],
    sampleInput: 'employee(department, name, salary)',
    sampleOutput: 'IT | Neha | 1',
    successRate: 43,
    submissions: 512,
    status: 'Not Attempted',
  },
];

const categoryTree = [
  { name: 'Basics', topics: ['SELECT', 'WHERE', 'DISTINCT'] },
  { name: 'Sorting', topics: ['ORDER BY', 'LIMIT'] },
  { name: 'Functions', topics: ['COUNT', 'AVG', 'SUM'] },
  { name: 'GROUPING', topics: ['GROUP BY', 'HAVING'] },
  { name: 'JOINS', topics: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN'] },
  { name: 'Subqueries', topics: ['Subquery'] },
  { name: 'Views', topics: ['Views'] },
  { name: 'Window Functions', topics: ['RANK', 'ROW_NUMBER'] },
  { name: 'CTE', topics: ['WITH'] },
  { name: 'Advanced', topics: ['CASE', 'UNION'] },
];

const difficultyStyles: Record<Difficulty, string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-300',
  hard: 'text-red-300',
};

const normalizeChallenge = (challenge: any): Challenge => ({
  id: challenge.id,
  title: challenge.title,
  description: challenge.description,
  difficulty: String(challenge.difficulty || 'easy').toLowerCase() as Difficulty,
  category: challenge.category || 'Basics',
  topic: challenge.topic || 'SELECT',
  xp: challenge.xp || 10,
  estimated_time: challenge.estimated_time,
  tables: challenge.tables || ['employee'],
  constraints: challenge.constraints || ['Match the expected result set.'],
  expectedOutput: challenge.expectedOutput || [],
  sampleInput: challenge.sampleInput || 'practice_db',
  sampleOutput: challenge.sampleOutput || 'Run to preview output.',
  successRate: challenge.successRate || 80,
  submissions: challenge.submissions || 100,
  status: challenge.status || 'Not Attempted',
});

export const Challenges: React.FC = () => {
  const [challenges, setChallenges] = React.useState<Challenge[]>(fallbackChallenges);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [query, setQuery] = React.useState(editorPlaceholder);
  const [search, setSearch] = React.useState('');
  const [difficultyFilters, setDifficultyFilters] = React.useState<Difficulty[]>([]);
  const [categoryFilters, setCategoryFilters] = React.useState<string[]>([]);
  const [activePanel, setActivePanel] = React.useState<'tests' | 'output' | 'console'>('tests');
  const [result, setResult] = React.useState<any>(null);
  const [isSaveOpen, setIsSaveOpen] = React.useState(false);
  const [saveForm, setSaveForm] = React.useState({ name: 'Select Employee Salary', collection: 'Practice', notes: '' });

  React.useEffect(() => {
    api.get('/challenges')
      .then(({ data }) => setChallenges((data.data || fallbackChallenges).map(normalizeChallenge)))
      .catch(() => setChallenges(fallbackChallenges));
  }, []);

  const selectedChallenge = challenges[selectedIndex] || fallbackChallenges[0];
  const filteredChallenges = challenges.filter(challenge => {
    const text = `${challenge.title} ${challenge.topic} ${challenge.category} ${challenge.tables.join(' ')}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesDifficulty = difficultyFilters.length === 0 || difficultyFilters.includes(challenge.difficulty);
    const matchesCategory = categoryFilters.length === 0 || categoryFilters.includes(challenge.category) || categoryFilters.includes(challenge.topic);
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const toggleDifficulty = (difficulty: Difficulty) => {
    setDifficultyFilters(current => current.includes(difficulty) ? current.filter(item => item !== difficulty) : [...current, difficulty]);
  };

  const toggleCategory = (category: string) => {
    setCategoryFilters(current => current.includes(category) ? current.filter(item => item !== category) : [...current, category]);
  };

  const selectChallenge = (challenge: Challenge) => {
    setSelectedIndex(challenges.findIndex(item => item.id === challenge.id));
    setQuery(editorPlaceholder);
    setResult(null);
    setActivePanel('tests');
  };

  const runChallenge = async () => {
    try {
      const { data } = await api.post('/challenges/run', { challengeId: selectedChallenge.id, queryText: query });
      setResult({ mode: 'run', ...data.data });
    } catch (error: any) {
      setResult({ mode: 'run', success: false, error: error.response?.data?.error || error.message, sampleTests: [{ name: 'Sample Case 1', status: 'failed' }] });
    }
  };

  const submitChallenge = async () => {
    try {
      const { data } = await api.post('/challenges/submit', { challengeId: selectedChallenge.id, queryText: query });
      setResult({ mode: 'submit', ...data.data });
    } catch (error: any) {
      setResult({ mode: 'submit', isCorrect: false, error: error.response?.data?.error || error.message, hiddenTests: [{ name: 'Hidden Case 1', status: 'failed' }] });
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

  return (
    <div className="flex h-screen bg-vscode-bg text-vscode-text">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <section className="grid grid-cols-[1.1fr_repeat(5,1fr)] gap-4 border-b border-vscode-border bg-[#1b1b1b] p-4">
          <div>
            <div className="text-xs uppercase text-vscode-text/55">Continue Learning</div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-3 flex-1 rounded bg-vscode-sidebar"><div className="h-3 rounded bg-vscode-accent" style={{ width: '72%' }} /></div>
              <span className="text-sm text-white">72%</span>
            </div>
          </div>
          <div className="rounded border border-vscode-border bg-vscode-sidebar p-3"><div className="text-xs text-vscode-text/50">Current Challenge</div><div className="mt-1 text-sm text-white">JOIN Basics</div></div>
          <div className="rounded border border-vscode-border bg-vscode-sidebar p-3"><div className="text-xs text-vscode-text/50">Difficulty</div><div className="mt-1 text-sm text-yellow-300">Medium</div></div>
          <div className="rounded border border-vscode-border bg-vscode-sidebar p-3"><div className="text-xs text-vscode-text/50">XP</div><div className="mt-1 text-sm text-white">1200</div></div>
          <div className="rounded border border-vscode-border bg-vscode-sidebar p-3"><div className="text-xs text-vscode-text/50">Ranking</div><div className="mt-1 text-sm text-white">21</div></div>
          <div className="rounded border border-vscode-border bg-vscode-sidebar p-3"><div className="text-xs text-vscode-text/50">Streak</div><div className="mt-1 text-sm text-white">18 Days</div></div>
        </section>

        <div className="grid h-[58%] min-h-0 grid-cols-[280px_320px_1fr_1.05fr] border-b border-vscode-border">
          <aside className="overflow-y-auto border-r border-vscode-border bg-[#202020] p-4">
            <h1 className="text-lg font-semibold text-white">SQL Challenges</h1>
            <div className="relative mt-4">
              <Search size={15} className="absolute left-3 top-2.5 text-vscode-text/50" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search..." className="w-full rounded border border-vscode-border bg-vscode-bg py-2 pl-9 pr-3 text-sm outline-none focus:border-vscode-accent" />
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
                          <input type="checkbox" checked={categoryFilters.includes(topic)} onChange={() => toggleCategory(topic)} />
                          {topic}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <aside className="overflow-y-auto border-r border-vscode-border bg-vscode-sidebar p-3">
            <div className="mb-3 text-sm text-vscode-text/70">{filteredChallenges.length} Challenges Found</div>
            <div className="space-y-3">
              {filteredChallenges.map(challenge => (
                <button key={challenge.id} onClick={() => selectChallenge(challenge)} className={`group w-full rounded border p-3 text-left hover:bg-white/5 ${selectedChallenge.id === challenge.id ? 'border-vscode-accent bg-vscode-accent/10' : 'border-vscode-border bg-[#202020]'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {challenge.status === 'Solved' ? <CheckCircle2 size={16} className="text-green-400" /> : <Circle size={16} className="text-vscode-text/40" />}
                      <h2 className="truncate font-semibold text-white">{challenge.title}</h2>
                    </div>
                    <Bookmark size={15} className={challenge.status === 'Bookmarked' ? 'fill-vscode-accent text-vscode-accent' : 'text-vscode-text/45'} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className={difficultyStyles[challenge.difficulty]}>{challenge.difficulty}</span>
                    <span className="flex items-center gap-0.5 text-yellow-300"><Star size={12} /><Star size={12} /><Star size={12} /></span>
                    <span>{challenge.status}</span>
                    <span className="flex items-center gap-1 text-yellow-300"><Star size={12} /> {challenge.xp} XP</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-vscode-text/60">
                    <span>{challenge.successRate}% Solved</span>
                    <span>{challenge.submissions.toLocaleString()} Submissions</span>
                    <span>{challenge.topic}</span>
                  </div>
                  <div className="mt-3 hidden rounded border border-vscode-border bg-vscode-bg p-2 text-[11px] text-vscode-text/65 group-hover:block">
                    <div>Estimated Time: {challenge.estimated_time || '15 Minutes'}</div>
                    <div>Tables: {challenge.tables.join(', ')}</div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="overflow-y-auto border-r border-vscode-border p-5">
            <div className="mb-4 flex items-center justify-between">
              <button disabled={selectedIndex === 0} onClick={() => selectChallenge(challenges[selectedIndex - 1])} className="flex items-center gap-1 rounded border border-vscode-border px-2 py-1 text-xs disabled:opacity-40"><ChevronLeft size={14} /> Previous</button>
              <span className="text-xs text-vscode-text/60">Challenge {selectedIndex + 1} / {challenges.length}</span>
              <button disabled={selectedIndex === challenges.length - 1} onClick={() => selectChallenge(challenges[selectedIndex + 1])} className="flex items-center gap-1 rounded border border-vscode-border px-2 py-1 text-xs disabled:opacity-40">Next <ChevronRight size={14} /></button>
            </div>
            <h2 className="text-xl font-semibold text-white">{selectedChallenge.title}</h2>
            <div className="mt-2 flex gap-3 text-sm">
              <span className={difficultyStyles[selectedChallenge.difficulty]}>{selectedChallenge.difficulty}</span>
              <span>{selectedChallenge.topic}</span>
              <span>{selectedChallenge.xp} XP</span>
            </div>
            <section className="mt-5 space-y-5 text-sm leading-6">
              <p>{selectedChallenge.description}</p>
              <div><h3 className="font-semibold text-white">Tables</h3><p>{selectedChallenge.tables.join(', ')}</p></div>
              <div><h3 className="font-semibold text-white">Constraints</h3><ul className="list-disc pl-5">{selectedChallenge.constraints.map(item => <li key={item}>{item}</li>)}</ul></div>
              <div><h3 className="font-semibold text-white">Expected Output</h3><p>{selectedChallenge.expectedOutput.join(', ') || 'Match the expected result set.'}</p></div>
              <div><h3 className="font-semibold text-white">Sample Input</h3><pre className="mt-2 rounded border border-vscode-border bg-[#161616] p-3 text-xs">{selectedChallenge.sampleInput}</pre></div>
              <div><h3 className="font-semibold text-white">Sample Output</h3><pre className="mt-2 rounded border border-vscode-border bg-[#161616] p-3 text-xs">{selectedChallenge.sampleOutput}</pre></div>
            </section>
          </main>

          <section className="flex min-w-0 flex-col">
            <div className="flex items-center justify-between border-b border-vscode-border bg-vscode-sidebar px-3 py-2">
              <span className="text-sm">solution.sql</span>
              <div className="flex gap-2">
                <button onClick={runChallenge} className="flex items-center gap-1 rounded bg-vscode-bg px-3 py-1 text-xs hover:bg-white/10"><Play size={14} /> Run</button>
                <button onClick={() => setIsSaveOpen(true)} className="flex items-center gap-1 rounded bg-vscode-bg px-3 py-1 text-xs hover:bg-white/10"><Save size={14} /> Save</button>
                <button onClick={submitChallenge} className="flex items-center gap-1 rounded bg-vscode-accent px-3 py-1 text-xs text-white hover:bg-vscode-accent/80"><Send size={14} /> Submit</button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <MonacoEditor height="100%" language="sql" theme="vs-dark" value={query} onChange={value => setQuery(value || '')} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 }, scrollBeyondLastLine: false }} />
            </div>
          </section>
        </div>

        <section className="flex-1 overflow-hidden bg-[#181818]">
          <div className="flex border-b border-vscode-border text-sm">
            {(['tests', 'output', 'console'] as const).map(panel => (
              <button key={panel} onClick={() => setActivePanel(panel)} className={`px-4 py-2 capitalize ${activePanel === panel ? 'text-white' : 'text-vscode-text/55'}`}>{panel === 'tests' ? 'Test Cases' : panel}</button>
            ))}
          </div>
          <div className="h-full overflow-auto p-4">
            {activePanel === 'tests' && (
              <div className="space-y-2">
                <h3 className="font-semibold text-white">{result?.mode === 'submit' ? 'Hidden Test Cases' : 'Sample Test Cases'}</h3>
                {(result?.hiddenTests || result?.sampleTests || [{ name: 'Sample Case 1', status: 'waiting' }]).map((test: any) => (
                  <div key={test.name} className="rounded border border-vscode-border bg-vscode-bg p-3 text-sm">
                    {test.status === 'passed' ? 'Passed' : test.status === 'failed' ? 'Failed' : 'Waiting'} - {test.name}
                  </div>
                ))}
              </div>
            )}
            {activePanel === 'output' && <pre className="text-sm">{JSON.stringify(result?.rows || result || 'Run a query to preview output.', null, 2)}</pre>}
            {activePanel === 'console' && <p className="text-sm text-vscode-text/70">{result?.error || (result?.mode === 'submit' ? `XP Earned: ${result.xpEarned || 0}` : 'Console ready.')}</p>}
          </div>
        </section>
      </div>

      {isSaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[420px] rounded border border-vscode-border bg-vscode-sidebar p-5 shadow-xl">
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
