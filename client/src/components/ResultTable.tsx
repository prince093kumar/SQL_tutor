import React from 'react';
import { useSqlStore } from '../store/useSqlStore';
import { AlertCircle, CheckCircle2, Clipboard, Clock, Download, FileDown, Search } from 'lucide-react';

export const ResultTable: React.FC = () => {
  const { queryResult, isExecuting } = useSqlStore();
  const [activeTab, setActiveTab] = React.useState<'result' | 'messages' | 'console' | 'plan' | 'history'>('result');
  const [search, setSearch] = React.useState('');
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [sortField, setSortField] = React.useState<string>('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  if (isExecuting) {
    return (
      <div className="flex items-center justify-center h-full text-vscode-text opacity-70">
        <div className="animate-pulse">Executing query...</div>
      </div>
    );
  }

  if (!queryResult) {
    return (
      <div className="flex items-center justify-center h-full text-vscode-text opacity-50">
        Run a query to see results here
      </div>
    );
  }

  if (!queryResult.success) {
    const errorMessage = typeof queryResult.error === 'string' ? queryResult.error : queryResult.error?.message;
    const errorHint = typeof queryResult.error === 'object' ? queryResult.error?.hint : null;

    return (
      <div className="p-4 text-red-400 font-mono text-sm">
        <div className="flex items-center mb-2 font-bold">
          <AlertCircle size={16} className="mr-2" /> Error
        </div>
        <div>{errorMessage}</div>
        {errorHint && <div className="mt-2 text-vscode-text opacity-70">{errorHint}</div>}
      </div>
    );
  }

  const rows = queryResult.rows || queryResult.data?.rows || [];
  const fields = queryResult.fields || queryResult.data?.fields || [];
  const executionTimeMs = queryResult.executionTimeMs || queryResult.executionTime || queryResult.data?.executionTimeMs || 0;
  const rowCount = queryResult.rowCount ?? queryResult.data?.rowCount ?? rows.length;
  const affectedRows = queryResult.affectedRows ?? queryResult.data?.affectedRows;
  const filteredRows = React.useMemo(() => {
    const rowList = Array.isArray(rows) ? rows : [];
    const searched = search
      ? rowList.filter(row => Object.values(row).some(value => String(value ?? '').toLowerCase().includes(search.toLowerCase())))
      : rowList;

    if (!sortField) return searched;
    return [...searched].sort((first, second) => {
      const firstValue = String(first[sortField] ?? '');
      const secondValue = String(second[sortField] ?? '');
      return sortDirection === 'asc' ? firstValue.localeCompare(secondValue) : secondValue.localeCompare(firstValue);
    });
  }, [rows, search, sortDirection, sortField]);

  const visibleRows = filteredRows.slice(0, rowsPerPage);
  const columnCount = fields.length || (visibleRows[0] ? Object.keys(visibleRows[0]).length : 0);

  const sortByField = (fieldName: string) => {
    if (sortField === fieldName) {
      setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
      return;
    }
    setSortField(fieldName);
    setSortDirection('asc');
  };

  const copyCell = async (value: unknown) => {
    await navigator.clipboard?.writeText(value === null || value === undefined ? '' : String(value));
  };

  return (
    <div className="flex flex-col h-full bg-vscode-bg">
      <div className="flex border-b border-vscode-border bg-[#181818] text-xs">
        {(['result', 'messages', 'console', 'plan', 'history'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 capitalize ${activeTab === tab ? 'border-b-2 border-vscode-accent text-white' : 'text-vscode-text/55 hover:text-white'}`}>
            {tab === 'plan' ? 'Execution Plan' : tab}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-vscode-border bg-[#1a1a1a] p-2 text-xs text-vscode-text">
        <span className="flex items-center gap-1 text-green-300"><CheckCircle2 size={14} /> Success</span>
        <span className="flex items-center gap-1"><Clock size={14} className="opacity-50" /> Execution Time <strong className="font-medium text-white">{executionTimeMs} ms</strong></span>
        <span>Rows <strong className="text-white">{rowCount}</strong></span>
        <span>Columns <strong className="text-white">{columnCount}</strong></span>
        <span>Database <strong className="text-white">practice_db</strong></span>
        <span>Memory <strong className="text-white">1.2 MB</strong></span>
        {affectedRows > 0 && <span>{affectedRows} affected</span>}
        <div className="ml-auto flex gap-2">
          <button className="flex items-center gap-1 rounded border border-vscode-border px-2 py-1 hover:bg-white/10"><FileDown size={13} /> Export CSV</button>
          <button className="flex items-center gap-1 rounded border border-vscode-border px-2 py-1 hover:bg-white/10"><FileDown size={13} /> Export Excel</button>
          <button className="flex items-center gap-1 rounded border border-vscode-border px-2 py-1 hover:bg-white/10"><Clipboard size={13} /> Copy JSON</button>
          <button className="flex items-center gap-1 rounded border border-vscode-border px-2 py-1 hover:bg-white/10"><Download size={13} /> Download SQL</button>
        </div>
      </div>

      {activeTab !== 'result' ? (
        <div className="flex-1 overflow-auto p-4 text-sm text-vscode-text/75">
          {activeTab === 'messages' && <div><span className="text-green-300">Success</span> - Rows: {rowCount}, Runtime: {executionTimeMs} ms</div>}
          {activeTab === 'console' && <pre className="rounded border border-vscode-border bg-[#161616] p-3">Query completed on practice_db.</pre>}
          {activeTab === 'plan' && <div className="rounded border border-vscode-border bg-[#161616] p-3">Seq Scan employee - cost 0.00..12.50 - rows {rowCount}</div>}
          {activeTab === 'history' && <div>Latest query completed successfully in {executionTimeMs} ms.</div>}
        </div>
      ) : (
      <div className="flex-1 overflow-auto">
        <div className="flex flex-wrap items-center gap-3 border-b border-vscode-border bg-[#202020] p-2 text-xs">
          <div className="relative w-64">
            <Search size={14} className="absolute left-2 top-2 text-vscode-text/45" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search results..." className="w-full rounded border border-vscode-border bg-vscode-bg py-1.5 pl-8 pr-2 outline-none focus:border-vscode-accent" />
          </div>
          <label className="flex items-center gap-2">Rows per page<select value={rowsPerPage} onChange={event => setRowsPerPage(Number(event.target.value))} className="rounded border border-vscode-border bg-vscode-bg px-2 py-1 outline-none"><option>25</option><option>50</option><option>100</option></select></label>
          <span className="ml-auto text-vscode-text/65">Showing {visibleRows.length ? 1 : 0}-{visibleRows.length} of {filteredRows.length}</span>
        </div>
        {!Array.isArray(rows) || rows.length === 0 ? (
          <div className="p-4 text-vscode-text opacity-70 text-sm">
            Query completed successfully. No rows returned.
          </div>
        ) : (
          <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
            <thead className="bg-[#2a2d2e] text-vscode-text sticky top-0 z-10 shadow">
              <tr>
                {fields.map((f: any, i: number) => (
                  <th key={i} className="min-w-32 resize-x overflow-hidden border-r border-[#3e3e42] px-4 py-2 font-semibold">
                    <button onClick={() => sortByField(f.name)} className="flex w-full items-center justify-between gap-3 text-left hover:text-white">
                      {f.name}
                      <span className="text-[10px] text-vscode-text/45">{sortField === f.name ? sortDirection.toUpperCase() : 'SORT'}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row: any, i: number) => (
                <tr key={i} className="border-b border-[#3e3e42] hover:bg-white/5 transition-colors">
                  {fields.map((f: any, j: number) => (
                    <td key={j} onDoubleClick={() => copyCell(row[f.name])} title="Double-click to copy cell" className="border-r border-[#3e3e42] px-4 py-2 text-vscode-text">
                      {row[f.name] !== null ? String(row[f.name]) : <span className="opacity-40 italic">NULL</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      )}
    </div>
  );
};
