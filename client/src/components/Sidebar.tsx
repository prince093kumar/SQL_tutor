import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Clock,
  Code,
  Database,
  FileCode2,
  Folder,
  FunctionSquare,
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
    <div className="flex h-full w-64 flex-col overflow-hidden border-r border-vscode-border bg-[#091421]/95 text-sm">
      {/* Global Navigation */}
      <div className="grid grid-cols-5 gap-1 border-b border-vscode-border bg-[#07111d] p-2">
        <button className={`rounded-md p-2 transition hover:bg-white/10 ${location.pathname === '/' ? 'bg-vscode-accent/15 text-vscode-accent shadow-[inset_0_-2px_0_#2f8cff]' : 'text-vscode-text'}`} onClick={() => navigate('/')} title="Playground"><Code size={18} /></button>
        <button className={`rounded-md p-2 transition hover:bg-white/10 ${location.pathname === '/challenges' ? 'bg-vscode-accent/15 text-vscode-accent shadow-[inset_0_-2px_0_#2f8cff]' : 'text-vscode-text'}`} onClick={() => navigate('/challenges')} title="Challenges"><Target size={18} /></button>
        <button className={`rounded-md p-2 transition hover:bg-white/10 ${location.pathname === '/leaderboard' ? 'bg-vscode-accent/15 text-vscode-accent shadow-[inset_0_-2px_0_#2f8cff]' : 'text-vscode-text'}`} onClick={() => navigate('/leaderboard')} title="Leaderboard"><Trophy size={18} /></button>
        <button className={`rounded-md p-2 transition hover:bg-white/10 ${location.pathname === '/saved-queries' ? 'bg-vscode-accent/15 text-vscode-accent shadow-[inset_0_-2px_0_#2f8cff]' : 'text-vscode-text'}`} onClick={() => navigate('/saved-queries')} title="Saved Queries"><FileCode2 size={18} /></button>
        <button className={`rounded-md p-2 transition hover:bg-white/10 ${location.pathname === '/profile' ? 'bg-vscode-accent/15 text-vscode-accent shadow-[inset_0_-2px_0_#2f8cff]' : 'text-vscode-text'}`} onClick={() => navigate('/profile')} title="Profile"><UserCircle size={18} /></button>
      </div>

      {/* Activity Bar for Playground */}
      {location.pathname === '/' && (
        <div className="flex space-x-4 border-b border-vscode-border bg-[#0d1a28] p-2">
          <button 
            className={`rounded-md p-2 transition hover:bg-white/10 ${activeTab === 'playground' ? 'bg-vscode-accent/15 text-vscode-accent' : 'text-vscode-text'}`}
            onClick={() => setActiveTab('playground')}
            title="Explorer"
          >
            <Database size={18} />
          </button>
        <button 
          className={`rounded-md p-2 transition hover:bg-white/10 ${activeTab === 'saved' ? 'bg-vscode-accent/15 text-vscode-accent' : 'text-vscode-text'}`}
          onClick={() => setActiveTab('saved')}
          title="Saved Queries"
        >
          <Save size={20} />
        </button>
        <button 
          className={`rounded-md p-2 transition hover:bg-white/10 ${activeTab === 'history' ? 'bg-vscode-accent/15 text-vscode-accent' : 'text-vscode-text'}`}
          onClick={() => setActiveTab('history')}
          title="History"
        >
          <Clock size={20} />
        </button>
      </div>
      )}

      {/* Explorer Content */}
      <div className="flex-1 overflow-y-auto p-3">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-vscode-text/70">
          {activeTab === 'playground' ? 'EXPLORER' : activeTab === 'saved' ? 'SAVED QUERIES' : 'HISTORY'}
        </h2>
        
        {activeTab === 'playground' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-vscode-text">
              <div className="flex min-w-0 items-center text-white">
                <Database size={16} className="mr-2 shrink-0" />
                <span className="truncate">{schema?.database || 'practice_db'}</span>
              </div>
              <button
                onClick={resetDatabase}
                disabled={isResetting}
                className="rounded-md p-1 text-vscode-text/70 hover:bg-white/10 hover:text-white disabled:opacity-50"
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
                        className={`flex w-full items-center rounded-md px-3 py-2 text-left transition hover:bg-white/[0.08] ${isActive ? 'bg-gradient-to-r from-vscode-accent/20 to-violet-500/10 text-white shadow-sm' : 'text-vscode-text/90'}`}
                      >
                        <Table2 size={16} className="mr-2 text-blue-400" />
                        {table.name}
                      </button>
                      {isActive && (
                        <div className="ml-6 mt-1 space-y-1 border-l border-vscode-border pl-3">
                          <div className="flex items-center text-[11px] font-semibold uppercase text-vscode-text/55"><ChevronDown size={12} className="mr-1" /> Columns</div>
                          {(table.columns.length ? table.columns : [{ name: 'id' }, { name: 'name' }, { name: 'salary' }, { name: 'department_id' }]).map(column => (
                            <div key={column.name} className="flex justify-between gap-2 rounded px-1 py-0.5 text-xs text-vscode-text/75 hover:bg-white/[0.04]">
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
                <div key={view} className="flex items-center rounded-md px-3 py-2 text-vscode-text/90 hover:bg-white/[0.08] cursor-pointer transition-colors"><Folder size={15} className="mr-2 text-purple-300" />{view}</div>
              ))}
            </div>
            <div>
              <div className="mb-2 flex items-center text-xs font-semibold uppercase text-vscode-text/70">
                <ChevronDown size={14} className="mr-1" /> Stored Procedures
              </div>
              {fallbackObjects.procedures.map(item => <div key={item} className="flex items-center rounded-md px-3 py-2 text-vscode-text/90 hover:bg-white/[0.08] cursor-pointer transition-colors"><FunctionSquare size={15} className="mr-2 text-yellow-300" />{item}</div>)}
            </div>
            <div>
              <div className="mb-2 flex items-center text-xs font-semibold uppercase text-vscode-text/70">
                <ChevronDown size={14} className="mr-1" /> Functions
              </div>
              {fallbackObjects.functions.map(item => <div key={item} className="flex items-center rounded-md px-3 py-2 text-vscode-text/90 hover:bg-white/[0.08] cursor-pointer transition-colors"><FunctionSquare size={15} className="mr-2 text-green-300" />{item}</div>)}
            </div>
            <div>
              <div className="mb-2 flex items-center text-xs font-semibold uppercase text-vscode-text/70">
                <ChevronDown size={14} className="mr-1" /> Saved Queries
              </div>
              {(savedQueries.length ? savedQueries : fallbackObjects.queries.map((title, index) => ({ id: index, title, query_text: `-- ${title}` }))).map(query => (
                <button
                  key={query.id}
                  onClick={() => setCurrentQuery(query.query_text)}
                  className="block w-full rounded-md px-3 py-2 text-left text-vscode-text/90 hover:bg-white/[0.08] transition-colors"
                >
                  {query.title}
                </button>
              ))}
            </div>
            <div className="rounded-lg border border-vscode-border bg-[#07111d] p-3">
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
