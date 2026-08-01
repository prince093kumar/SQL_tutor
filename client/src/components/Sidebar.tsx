import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Award,
  BarChart3,
  ChevronDown,
  Clock,
  Code,
  Database,
  FileCode2,
  Folder,
  FunctionSquare,
  LayoutDashboard,
  RefreshCw,
  Save,
  Table2,
  Target,
  Trophy,
  UserCircle,
} from 'lucide-react';
import { useSqlStore } from '../store/useSqlStore';
import api from '../utils/api';

type SchemaColumn = {
  name: string;
  type?: string;
  key?: string;
};

type SchemaTable = {
  name: string;
  columns: SchemaColumn[];
};

type DatabaseSchema = {
  database: string;
  tables: SchemaTable[];
  views?: string[];
};

const fallbackObjects = {
  tables: ['employee', 'department', 'orders', 'customers', 'products'],
  views: ['employee_summary', 'monthly_sales'],
  procedures: ['calculate_salary()'],
  functions: ['getDepartment()'],
  queries: ['Interview.sql', 'Practice.sql', 'Favorites.sql'],
};

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { history, savedQueries, setCurrentQuery, setHistory, setSavedQueries } = useSqlStore();
  const [activeTab, setActiveTab] = React.useState<'playground' | 'history' | 'saved'>('playground');
  const [schema, setSchema] = React.useState<DatabaseSchema | null>(null);
  const [selectedTable, setSelectedTable] = React.useState<string>('');
  const [schemaError, setSchemaError] = React.useState('');
  const [isResetting, setIsResetting] = React.useState(false);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/sql/history');
      setHistory(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSaved = async () => {
    try {
      const { data } = await api.get('/sql/saved');
      setSavedQueries(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSchema = async () => {
    try {
      setSchemaError('');
      const { data } = await api.get('/sql/schema');
      setSchema(data);
      setSelectedTable(current => data.tables?.some((table: SchemaTable) => table.name === current) ? current : data.tables?.[0]?.name || '');
    } catch (error: any) {
      setSchemaError(error.response?.data?.error?.message || error.response?.data?.error || error.message);
    }
  };

  const resetDatabase = async () => {
    setIsResetting(true);
    try {
      const { data } = await api.post('/sql/reset');
      setSchema(data);
      setSelectedTable(data.tables?.[0]?.name || '');
      setSchemaError('');
    } catch (error: any) {
      setSchemaError(error.response?.data?.error?.message || error.response?.data?.error || error.message);
    } finally {
      setIsResetting(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'history') fetchHistory();
    if (activeTab === 'saved') fetchSaved();
    if (activeTab === 'playground') {
      fetchSchema();
      fetchSaved();
    }
  }, [activeTab]);

  const currentTable = schema?.tables.find(table => table.name === selectedTable);

  return (
    <div className="w-64 bg-vscode-sidebar border-r border-vscode-border flex flex-col h-full overflow-hidden text-sm">
      {/* Global Navigation */}
      <div className="flex flex-wrap gap-1 bg-vscode-bg border-b border-vscode-border p-2">
        <button className={`p-2 rounded hover:bg-white/10 ${location.pathname === '/' ? 'text-vscode-accent' : 'text-vscode-text'}`} onClick={() => navigate('/')} title="Playground"><Code size={18} /></button>
        <button className={`p-2 rounded hover:bg-white/10 ${location.pathname === '/challenges' ? 'text-vscode-accent' : 'text-vscode-text'}`} onClick={() => navigate('/challenges')} title="Challenges"><Target size={18} /></button>
        <button className={`p-2 rounded hover:bg-white/10 ${location.pathname === '/leaderboard' ? 'text-vscode-accent' : 'text-vscode-text'}`} onClick={() => navigate('/leaderboard')} title="Leaderboard"><Trophy size={18} /></button>
        <button className={`p-2 rounded hover:bg-white/10 ${location.pathname === '/analytics' ? 'text-vscode-accent' : 'text-vscode-text'}`} onClick={() => navigate('/analytics')} title="Analytics"><LayoutDashboard size={18} /></button>
        <button className={`p-2 rounded hover:bg-white/10 ${location.pathname === '/progress' ? 'text-vscode-accent' : 'text-vscode-text'}`} onClick={() => navigate('/progress')} title="Progress"><BarChart3 size={18} /></button>
        <button className={`p-2 rounded hover:bg-white/10 ${location.pathname === '/achievements' ? 'text-vscode-accent' : 'text-vscode-text'}`} onClick={() => navigate('/achievements')} title="Achievements"><Award size={18} /></button>
        <button className={`p-2 rounded hover:bg-white/10 ${location.pathname === '/saved-queries' ? 'text-vscode-accent' : 'text-vscode-text'}`} onClick={() => navigate('/saved-queries')} title="Saved Queries"><FileCode2 size={18} /></button>
        <button className={`p-2 rounded hover:bg-white/10 ${location.pathname === '/profile' ? 'text-vscode-accent' : 'text-vscode-text'}`} onClick={() => navigate('/profile')} title="Profile"><UserCircle size={18} /></button>
      </div>

      {/* Activity Bar for Playground */}
      {location.pathname === '/' && (
        <div className="flex bg-[#252526] border-b border-vscode-border p-2 space-x-4">
          <button 
            className={`p-2 rounded hover:bg-white/10 ${activeTab === 'playground' ? 'text-vscode-accent' : 'text-vscode-text'}`}
            onClick={() => setActiveTab('playground')}
            title="Explorer"
          >
            <Database size={18} />
          </button>
        <button 
          className={`p-2 rounded hover:bg-white/10 ${activeTab === 'saved' ? 'text-vscode-accent' : 'text-vscode-text'}`}
          onClick={() => setActiveTab('saved')}
          title="Saved Queries"
        >
          <Save size={20} />
        </button>
        <button 
          className={`p-2 rounded hover:bg-white/10 ${activeTab === 'history' ? 'text-vscode-accent' : 'text-vscode-text'}`}
          onClick={() => setActiveTab('history')}
          title="History"
        >
          <Clock size={20} />
        </button>
      </div>
      )}

      {/* Explorer Content */}
      <div className="flex-1 overflow-y-auto p-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-vscode-text mb-4">
          {activeTab === 'playground' ? 'EXPLORER' : activeTab === 'saved' ? 'SAVED QUERIES' : 'HISTORY'}
        </h2>
        
        {activeTab === 'playground' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-vscode-text">
              <div className="flex min-w-0 items-center">
                <Database size={16} className="mr-2 shrink-0" />
                <span className="truncate">{schema?.database || 'practice_db'}</span>
              </div>
              <button
                onClick={resetDatabase}
                disabled={isResetting}
                className="rounded p-1 text-vscode-text/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
                title="Reset practice database"
              >
                <RefreshCw size={14} className={isResetting ? 'animate-spin' : ''} />
              </button>
            </div>
            {schemaError && <div className="rounded border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">{schemaError}</div>}
            <div>
              <div className="mb-2 flex items-center text-xs font-semibold uppercase text-vscode-text/70">
                <ChevronDown size={14} className="mr-1" /> Tables ({schema?.tables.length || 15})
              </div>
              <div className="space-y-1">
                {(schema?.tables.length ? schema.tables : fallbackObjects.tables.map(name => ({
                  name,
                  columns: name === 'employee'
                    ? [{ name: 'id', type: 'int', key: 'PRI' }, { name: 'name', type: 'varchar' }, { name: 'salary', type: 'decimal' }, { name: 'department_id', type: 'int' }]
                    : [],
                }))).map(table => {
                  const isActive = selectedTable === table.name || (!selectedTable && table.name === 'employee');
                  return (
                    <div key={table.name}>
                      <button
                        onClick={() => setSelectedTable(table.name)}
                        className={`flex w-full items-center rounded px-2 py-1 text-left hover:bg-white/10 ${isActive ? 'bg-vscode-accent/20 text-white' : 'text-vscode-text/80'}`}
                      >
                        <Table2 size={14} className="mr-2" />
                        {table.name}
                      </button>
                      {isActive && (
                        <div className="ml-6 mt-1 space-y-1 border-l border-vscode-border pl-3">
                          <div className="flex items-center text-[11px] font-semibold uppercase text-vscode-text/55"><ChevronDown size={12} className="mr-1" /> Columns</div>
                          {(table.columns.length ? table.columns : [{ name: 'id' }, { name: 'name' }, { name: 'salary' }, { name: 'department_id' }]).map(column => (
                            <div key={column.name} className="flex justify-between gap-2 rounded px-1 py-0.5 text-xs text-vscode-text/75">
                              <span>{column.name}</span>
                              {column.key && <span className="text-green-300">{column.key}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center text-xs font-semibold uppercase text-vscode-text/70">
                <ChevronDown size={14} className="mr-1" /> Views ({schema?.views?.length || 2})
              </div>
              {(schema?.views?.length ? schema.views : fallbackObjects.views).map(view => (
                <div key={view} className="flex items-center rounded px-2 py-1 text-vscode-text/80 hover:bg-white/10"><Folder size={13} className="mr-2 text-purple-300" />{view}</div>
              ))}
            </div>
            <div>
              <div className="mb-2 flex items-center text-xs font-semibold uppercase text-vscode-text/70">
                <ChevronDown size={14} className="mr-1" /> Stored Procedures
              </div>
              {fallbackObjects.procedures.map(item => <div key={item} className="flex items-center rounded px-2 py-1 text-vscode-text/80 hover:bg-white/10"><FunctionSquare size={13} className="mr-2 text-yellow-300" />{item}</div>)}
            </div>
            <div>
              <div className="mb-2 flex items-center text-xs font-semibold uppercase text-vscode-text/70">
                <ChevronDown size={14} className="mr-1" /> Functions
              </div>
              {fallbackObjects.functions.map(item => <div key={item} className="flex items-center rounded px-2 py-1 text-vscode-text/80 hover:bg-white/10"><FunctionSquare size={13} className="mr-2 text-green-300" />{item}</div>)}
            </div>
            <div>
              <div className="mb-2 flex items-center text-xs font-semibold uppercase text-vscode-text/70">
                <ChevronDown size={14} className="mr-1" /> Saved Queries
              </div>
              {(savedQueries.length ? savedQueries : fallbackObjects.queries.map((title, index) => ({ id: index, title, query_text: `-- ${title}` }))).map(query => (
                <button
                  key={query.id}
                  onClick={() => setCurrentQuery(query.query_text)}
                  className="block w-full rounded px-2 py-1 text-left text-vscode-text/80 hover:bg-white/10"
                >
                  {query.title}
                </button>
              ))}
            </div>
            <div className="rounded border border-vscode-border bg-vscode-bg p-3">
              <div className="mb-2 text-xs font-semibold uppercase text-vscode-text/70">Columns</div>
              <div className="space-y-1">
                {currentTable?.columns.map(column => (
                  <div key={column.name} className="flex justify-between gap-2 text-xs text-vscode-text/80">
                    <span>{column.name}</span>
                    <span className="text-vscode-text/45">{column.type}</span>
                  </div>
                ))}
                {!currentTable && <p className="text-xs text-vscode-text/50">Select a table.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-2">
            {savedQueries.length === 0 ? (
              <p className="text-vscode-text opacity-50 text-xs">No saved queries found.</p>
            ) : (
              savedQueries.map(q => (
                <div 
                  key={q.id} 
                  className="p-2 bg-vscode-bg rounded cursor-pointer hover:bg-vscode-accent/20 truncate"
                  onClick={() => setCurrentQuery(q.query_text)}
                >
                  <p className="font-semibold">{q.title}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-vscode-text opacity-50 text-xs">No query history found.</p>
            ) : (
              history.map(h => (
                <div 
                  key={h.id} 
                  className="p-2 bg-vscode-bg rounded cursor-pointer hover:bg-vscode-accent/20 border-l-2"
                  style={{ borderColor: h.status === 'success' ? '#4ade80' : '#f87171' }}
                  onClick={() => setCurrentQuery(h.query_text)}
                >
                  <p className="truncate text-xs">{h.query_text}</p>
                  <p className="text-[10px] opacity-50 mt-1">{new Date(h.executed_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
