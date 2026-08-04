import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Challenge, Difficulty, ChallengeState, difficultyStyles
} from '../../types/challenge';
import api from '../../utils/api';
import { useResizablePanels } from '../../hooks/useResizablePanels';
import { ResizeHandle } from '../layout/ResizeHandle';
import { ChallengeFilters } from './ChallengeFilters';
import { ChallengeList } from './ChallengeList';
import { ChallengeProblem } from './ChallengeProblem';
import { ChallengeEditor } from './ChallengeEditor';
import { ChallengeBottomPanel } from './ChallengeBottomPanel';
import { Settings2, RotateCcw, PanelLeftClose, PanelRightClose } from 'lucide-react';

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
*/\n\n`;
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

export const ChallengeWorkspace: React.FC = () => {
  const { challengeId: slugFromUrl } = useParams<{ challengeId?: string }>();
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const topHalfRef = useRef<HTMLDivElement>(null);
  
  // Resizable Panels Setup
  const { 
    sizes: hSizes, 
    collapsed: hCollapsed,
    startResize: startHResize, 
    resetLayout: resetHLayout,
    toggleCollapse
  } = useResizablePanels('sqllab.challenge.layout.h', [
    { id: 'filters', defaultSize: 240, minSize: 200, maxSize: 400, collapsible: true },
    { id: 'list', defaultSize: 300, minSize: 280, maxSize: 500, collapsible: true },
    { id: 'problem', defaultSize: 400, minSize: 320 },
    { id: 'editor', defaultSize: 600, minSize: 400 } // Flexible remaining space
  ], 'horizontal', topHalfRef);

  const { 
    sizes: vSizes, 
    startResize: startVResize,
    resetLayout: resetVLayout
  } = useResizablePanels('sqllab.challenge.layout.v', [
    { id: 'top', defaultSize: 65, minSize: 40 }, // percentages roughly
    { id: 'bottom', defaultSize: 35, minSize: 20 }
  ], 'vertical', containerRef);

  // Challenge State
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [difficultyFilters, setDifficultyFilters] = useState<Difficulty[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [operationFilters, setOperationFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<ChallengeState[]>([]);
  
  // Execution State
  const [activePanel, setActivePanel] = useState<'tests' | 'output' | 'console'>('tests');
  const [result, setResult] = useState<any>(null);
  const [lastRun, setLastRun] = useState<{ challengeId: number; query: string; success: boolean } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const selectedIndex = Math.max(0, challenges.findIndex(challenge => challenge.id === selectedId));
  const selectedChallenge = challenges[selectedIndex];
  const canSubmit = Boolean(selectedChallenge && lastRun?.challengeId === selectedChallenge.id && lastRun.query === query && lastRun.success);

  const loadChallenges = useCallback(async () => {
    const params: Record<string, string> = {};
    if (search.trim()) params.search = search.trim();
    if (difficultyFilters.length) params.difficulty = difficultyFilters.join(',');
    if (categoryFilters.length) params.category = categoryFilters.map(normalizeParam).join(',');
    if (operationFilters.length) params.operation = operationFilters.map(normalizeParam).join(',');
    if (statusFilters.length) params.status = statusFilters.map(normalizeParam).join(',');

    const { data } = await api.get('/challenges', { params });
    const nextChallenges = (data.data || []).map(normalizeChallenge);
    setChallenges(nextChallenges);
  }, [search, difficultyFilters, categoryFilters, operationFilters, statusFilters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadChallenges().catch(() => setChallenges([]));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [loadChallenges]);

  // Sync selectedId with URL slug
  useEffect(() => {
    if (challenges.length > 0) {
      if (slugFromUrl) {
        const found = challenges.find(c => c.slug === slugFromUrl || String(c.id) === slugFromUrl);
        if (found) {
          setSelectedId(found.id);
        } else {
          // Fallback to first if slug not found
          setSelectedId(challenges[0].id);
          navigate(`/challenges/${challenges[0].slug || challenges[0].id}`, { replace: true });
        }
      } else {
        // No slug in URL, select first challenge
        setSelectedId(challenges[0].id);
        navigate(`/challenges/${challenges[0].slug || challenges[0].id}`, { replace: true });
      }
    }
  }, [challenges, slugFromUrl, navigate]);

  // Load default context when challenge changes
  useEffect(() => {
    if (selectedChallenge && selectedChallenge.id !== lastRun?.challengeId) {
      setQuery(buildEditorContext(selectedChallenge));
      setResult(null);
      setActivePanel('tests');
      setLastRun(null);
    }
  }, [selectedChallenge?.id]);

  const toggleDifficulty = (val: Difficulty) => setDifficultyFilters(curr => curr.includes(val) ? curr.filter(i => i !== val) : [...curr, val]);
  const toggleCategory = (val: string) => setCategoryFilters(curr => curr.includes(val) ? curr.filter(i => i !== val) : [...curr, val]);
  const toggleOperation = (val: string) => setOperationFilters(curr => curr.includes(val) ? curr.filter(i => i !== val) : [...curr, val]);
  const toggleStatus = (val: ChallengeState) => setStatusFilters(curr => curr.includes(val) ? curr.filter(i => i !== val) : [...curr, val]);

  const selectChallenge = (challenge: Challenge) => {
    navigate(`/challenges/${challenge.slug || challenge.id}`);
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
      // Execute against practice data, do not update challenge progress
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
      // Evaluate against hidden test cases
      const { data } = await api.post('/challenges/submit', { challengeId: selectedChallenge.id, queryText: query });
      setResult({ mode: 'submit', ...data.data });
      setActivePanel('tests');
      await loadChallenges(); // refresh statuses
    } catch (error: any) {
      setResult({ mode: 'submit', isCorrect: false, error: error.response?.data?.error || error.message, hiddenTests: [{ name: 'Hidden Case 1', status: 'failed' }] });
      setActivePanel('console');
    }
  };

  const toggleBookmarkForSelected = async (event: React.MouseEvent, challenge: Challenge) => {
    event.stopPropagation();
    await api.post(`/challenges/${challenge.id}/bookmark`);
    await loadChallenges();
  };

  return (
    <div ref={containerRef} className="flex min-h-0 flex-1 flex-col overflow-hidden text-vscode-text">
      <section className="grid grid-cols-[1.1fr_repeat(5,1fr)_auto] gap-4 border-b border-vscode-border bg-[#08111c]/75 p-4">
        <div className="metric-card">
          <div className="text-xs uppercase text-vscode-text/55">Continue Learning</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-3 flex-1 rounded-full bg-[#142131]"><div className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300" style={{ width: '72%' }} /></div>
            <span className="text-sm text-white">72%</span>
          </div>
        </div>
        <div className="metric-card p-3"><div className="text-xs text-vscode-text/50">Questions</div><div className="mt-1 text-sm text-white">{challenges.length}</div></div>
        <div className="metric-card p-3"><div className="text-xs text-vscode-text/50">Current</div><div className="mt-1 truncate text-sm text-white">{selectedChallenge?.title || 'Loading'}</div></div>
        <div className="metric-card p-3"><div className="text-xs text-vscode-text/50">Difficulty</div><div className={`mt-1 text-sm capitalize ${selectedChallenge ? difficultyStyles[selectedChallenge.difficulty] : ''}`}>{selectedChallenge?.difficulty || '-'}</div></div>
        <div className="metric-card p-3"><div className="text-xs text-vscode-text/50">Operation</div><div className="mt-1 text-sm text-white">{selectedChallenge?.operation || '-'}</div></div>
        <div className="metric-card p-3"><div className="text-xs text-vscode-text/50">Status</div><div className="mt-1 text-sm text-white">{selectedChallenge?.status || '-'}</div></div>
        
        {/* Layout Settings Menu */}
        <div className="relative flex items-center">
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
            className="rounded p-2 text-vscode-text/60 hover:bg-white/10 hover:text-white"
            title="Layout Settings"
          >
            <Settings2 size={18} />
          </button>
          {isSettingsOpen && (
            <div className="absolute right-0 top-12 z-50 w-48 rounded-md border border-vscode-border bg-[#0a1521] py-1 shadow-xl">
              <button onClick={() => { toggleCollapse('filters'); setIsSettingsOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-vscode-accent/20">
                <PanelLeftClose size={14} /> {hCollapsed.filters ? 'Show Filters' : 'Collapse Filters'}
              </button>
              <button onClick={() => { toggleCollapse('list'); setIsSettingsOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-vscode-accent/20">
                <PanelRightClose size={14} /> {hCollapsed.list ? 'Show List' : 'Collapse List'}
              </button>
              <div className="my-1 border-t border-vscode-border"></div>
              <button onClick={() => { resetHLayout(); resetVLayout(); setIsSettingsOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10">
                <RotateCcw size={14} /> Reset Layout
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Top half: Filters | List | Problem | Editor */}
      <div 
        ref={topHalfRef}
        className="flex min-h-0 border-b border-vscode-border" 
        style={{ height: `${vSizes.top || 65}%` }}
      >
        {!hCollapsed.filters && (
          <div className="h-full overflow-y-auto custom-scrollbar" style={{ width: hSizes.filters, flexShrink: 0 }}>
            <ChallengeFilters 
              search={search} setSearch={setSearch}
              difficultyFilters={difficultyFilters} toggleDifficulty={toggleDifficulty}
              statusFilters={statusFilters} toggleStatus={toggleStatus}
              categoryFilters={categoryFilters} toggleCategory={toggleCategory}
              operationFilters={operationFilters} toggleOperation={toggleOperation}
            />
          </div>
        )}
        
        {!hCollapsed.filters && <ResizeHandle id="filters" onPointerDown={(e) => startHResize(e, 'filters', 'list', 0)} />}
        
        {!hCollapsed.list && (
          <div className="h-full overflow-y-auto custom-scrollbar" style={{ width: hSizes.list, flexShrink: 0 }}>
            <ChallengeList 
              challenges={challenges} 
              selectedChallengeId={selectedId} 
              onSelect={selectChallenge} 
              onToggleBookmark={toggleBookmarkForSelected} 
            />
          </div>
        )}
        
        {!hCollapsed.list && <ResizeHandle id="list" onPointerDown={(e) => startHResize(e, 'list', 'problem', 1)} />}
        
        <div className="h-full overflow-y-auto custom-scrollbar" style={{ width: hSizes.problem, flexShrink: 0 }}>
          <ChallengeProblem 
            challenge={selectedChallenge}
            totalChallenges={challenges.length}
            currentIndex={selectedIndex}
            onPrevious={() => selectChallenge(challenges[selectedIndex - 1])}
            onNext={() => selectChallenge(challenges[selectedIndex + 1])}
          />
        </div>
        
        <ResizeHandle id="problem" onPointerDown={(e) => startHResize(e, 'problem', 'editor', 2)} />
        
        {/* Editor fills remaining space */}
        <div className="h-full min-w-[400px] flex-1 overflow-hidden">
          <ChallengeEditor 
            challenge={selectedChallenge}
            query={query}
            setQuery={setQuery}
            canSubmit={canSubmit}
            onRun={runChallenge}
            onSubmit={submitChallenge}
          />
        </div>
      </div>
      
      <ResizeHandle id="top" direction="vertical" onPointerDown={(e) => startVResize(e, 'top', 'bottom', 0)} />

      {/* Bottom half: Tests | Output | Console */}
      <div style={{ height: `${vSizes.bottom || 35}%` }}>
        <ChallengeBottomPanel 
          activePanel={activePanel} 
          setActivePanel={setActivePanel} 
          result={result} 
        />
      </div>
    </div>
  );
};
