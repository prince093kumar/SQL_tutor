import React from 'react';
import { useSqlStore } from '../store/useSqlStore';
import { AlertCircle, CheckCircle2, Clipboard, Clock, Download, FileDown, Search, X } from 'lucide-react';
import api from '../utils/api';

interface ResultTableProps {
  onClose?: () => void;
}

export const ResultTable: React.FC<ResultTableProps> = ({ onClose }) => {
  const { currentQuery, queryResult, isExecuting } = useSqlStore();
  const [activeTab, setActiveTab] = React.useState<'result' | 'messages' | 'console' | 'plan' | 'history'>('result');
  const [search, setSearch] = React.useState('');
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [sortField, setSortField] = React.useState<string>('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [plan, setPlan] = React.useState<any>(null);
  const [planError, setPlanError] = React.useState('');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const rows = queryResult?.rows || queryResult?.data?.rows || [];
  const fields = queryResult?.fields || queryResult?.data?.fields || [];
  const executionTimeMs = queryResult?.executionTimeMs || queryResult?.executionTime || queryResult?.data?.executionTimeMs || 0;
  const rowCount = queryResult ? (queryResult.rowCount ?? queryResult.data?.rowCount ?? rows.length) : 0;
  const affectedRows = queryResult?.affectedRows ?? queryResult?.data?.affectedRows ?? 0;
  const errorMessage = typeof queryResult?.error === 'string'
    ? queryResult.error
    : queryResult?.error?.message || (queryResult?.error ? JSON.stringify(queryResult.error) : '');
  const errorHint = typeof queryResult?.error === 'object' ? queryResult.error?.hint : null;

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

  React.useEffect(() => {
    setPlan(null);
    setPlanError('');
    setActiveTab(queryResult?.success ? 'result' : 'console');
  }, [queryResult]);

  if (isExecuting) {
    return (
      <div className="flex h-full items-center justify-center bg-[#071019] text-vscode-text opacity-70">
        <div className="animate-pulse">Executing query...</div>
      </div>
    );
  }

  if (!queryResult) {
    return (
      <div className="flex h-full items-center justify-center bg-[#071019] text-vscode-text opacity-50">
        Run a query to see results here
      </div>
    );
  }

  const sortByField = (fieldName: string) => {
    if (sortField === fieldName) {
      setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
      return;
    }
    setSortField(fieldName);
    setSortDirection('asc');
  };

  const copyText = async (value: unknown) => {
    await navigator.clipboard?.writeText(value === null || value === undefined ? '' : String(value));
  };

  const toCsv = () => {
    const headers = fields.map((field: any) => field.name);
    const escapeCsv = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    return [headers.join(','), ...filteredRows.map((row: any) => headers.map((header: string) => escapeCsv(row[header])).join(','))].join('\n');
  };

  const downloadFile = (fileName: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const analyzePlan = async () => {
    setActiveTab('plan');
    setIsAnalyzing(true);
    setPlanError('');
    try {
      const { data } = await api.post('/sql/analyze', { query: currentQuery });
      setPlan(data.data);
    } catch (error: any) {
      setPlan(null);
      const responseError = error.response?.data?.error || error.response?.data?.message;
      setPlanError(typeof responseError === 'string' ? responseError : responseError?.message || error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#071019]">
      <div className="flex border-b border-vscode-border bg-[#0d1a28] text-xs">
        {(['result', 'messages', 'console', 'plan', 'history'] as const).map(tab => (
          <button key={tab} onClick={() => tab === 'plan' ? analyzePlan() : setActiveTab(tab)} className={`px-4 py-2 capitalize transition ${activeTab === tab ? 'border-b-2 border-vscode-accent bg-vscode-accent/10 text-white' : 'text-vscode-text/55 hover:bg-white/[0.04] hover:text-white'}`}>
            {tab === 'plan' ? 'Execution Plan' : tab}
          </button>
        ))}
        {onClose && (
          <button onClick={onClose} className="ml-auto px-3 py-2 text-vscode-text/55 hover:bg-white/10 hover:text-white" title="Close Panel">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-vscode-border bg-[#091421] p-2 text-xs text-vscode-text">
        {queryResult.success ? (
          <span className="flex items-center gap-1 text-green-300"><CheckCircle2 size={14} /> Success</span>
        ) : (
          <span className="flex items-center gap-1 text-red-300"><AlertCircle size={14} /> Failed</span>
        )}
        <span className="flex items-center gap-1"><Clock size={14} className="opacity-50" /> Execution Time <strong className="font-medium text-white">{executionTimeMs} ms</strong></span>
        <span>Rows <strong className="text-white">{rowCount || 0}</strong></span>
        <span>Columns <strong className="text-white">{columnCount}</strong></span>
        <span>Database <strong className="text-white">practice_db</strong></span>
        {affectedRows > 0 && <span>{affectedRows} affected</span>}
        <div className="ml-auto flex gap-2">
          <button onClick={() => downloadFile('query-result.csv', toCsv(), 'text/csv')} disabled={!queryResult.success || !fields.length} className="secondary-action flex items-center gap-1 px-2 py-1"><FileDown size={13} /> CSV</button>
          <button onClick={() => copyText(JSON.stringify(filteredRows, null, 2))} disabled={!queryResult.success} className="secondary-action flex items-center gap-1 px-2 py-1"><Clipboard size={13} /> JSON</button>
          <button onClick={() => downloadFile('query.sql', currentQuery, 'text/sql')} className="secondary-action flex items-center gap-1 px-2 py-1"><Download size={13} /> SQL</button>
        </div>
      </div>

      {activeTab === 'console' && (
        <div className="flex-1 overflow-auto p-4 text-sm">
          {queryResult.success ? (
            <div className="rounded-md border border-emerald-400/30 bg-emerald-400/10 p-3 text-emerald-200">
              Query completed on practice_db in {executionTimeMs} ms.
            </div>
          ) : (
            <div className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-red-200">
              <div className="font-semibold">{errorMessage || 'Query failed.'}</div>
              {errorHint && <div className="mt-2 text-vscode-text/75">{errorHint}</div>}
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="flex-1 overflow-auto p-4 text-sm text-vscode-text/75">
          <div className="workbench-panel p-4">
            <div>Status: <span className={queryResult.success ? 'text-green-300' : 'text-red-300'}>{queryResult.success ? 'Success' : 'Failed'}</span></div>
            <div className="mt-2">Rows: {rowCount || 0}</div>
            <div className="mt-2">Columns: {columnCount}</div>
            <div className="mt-2">Runtime: {executionTimeMs} ms</div>
            {queryResult.cache?.hit && <div className="mt-2">Cache: {queryResult.cache.strategy}</div>}
          </div>
        </div>
      )}

      {activeTab === 'plan' && (
        <div className="flex-1 overflow-auto p-4 text-sm text-vscode-text/75">
          {isAnalyzing && <div className="animate-pulse">Generating execution plan...</div>}
          {planError && <div className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-red-200">{planError}</div>}
          {plan && (
            <div className="space-y-3">
              {plan.suggestions?.map((suggestion: any, index: number) => (
                <div key={index} className="rounded-md border border-amber-300/30 bg-amber-300/10 p-3 text-amber-100">{suggestion.message}</div>
              ))}
              <pre className="rounded-md border border-vscode-border bg-[#06101a] p-3">{JSON.stringify(plan.plan, null, 2)}</pre>
            </div>
          )}
          {!isAnalyzing && !plan && !planError && <div>Execution plan is available for SELECT queries.</div>}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="flex-1 overflow-auto p-4 text-sm text-vscode-text/75">
          Latest query completed in {executionTimeMs} ms. Open the sidebar History tab for saved query history.
        </div>
      )}

      {activeTab === 'result' && (
        <div className="flex-1 overflow-auto">
          <div className="flex flex-wrap items-center gap-3 border-b border-vscode-border bg-[#0b1724] p-2 text-xs">
            <div className="relative w-64">
              <Search size={14} className="absolute left-2 top-2 text-vscode-text/45" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search results..." className="w-full rounded-md border border-vscode-border bg-[#071019] py-1.5 pl-8 pr-2 outline-none focus:border-vscode-accent" />
            </div>
            <label className="flex items-center gap-2">Rows per page<select value={rowsPerPage} onChange={event => setRowsPerPage(Number(event.target.value))} className="rounded-md border border-vscode-border bg-[#071019] px-2 py-1 outline-none focus:border-vscode-accent"><option>25</option><option>50</option><option>100</option></select></label>
            <span className="ml-auto text-vscode-text/65">Showing {visibleRows.length ? 1 : 0}-{visibleRows.length} of {filteredRows.length}</span>
          </div>
          {!queryResult.success ? (
            <div className="p-4 text-sm text-red-300">{errorMessage || 'Query failed.'}</div>
          ) : !Array.isArray(rows) || rows.length === 0 ? (
            <div className="p-4 text-sm text-vscode-text opacity-70">
              Query completed successfully. No rows returned.
            </div>
          ) : (
            <table className="w-full border-collapse whitespace-nowrap text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[#102033] text-vscode-text shadow">
                <tr>
                  {fields.map((field: any, index: number) => (
                    <th key={index} className="min-w-32 resize-x overflow-hidden border-r border-vscode-border px-5 py-3 font-semibold text-gray-200">
                      <button onClick={() => sortByField(field.name)} className="flex w-full items-center justify-between gap-3 text-left hover:text-white">
                        {field.name}
                        <span className="text-[10px] text-vscode-text/45">{sortField === field.name ? sortDirection.toUpperCase() : 'SORT'}</span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row: any, rowIndex: number) => (
                  <tr key={rowIndex} className="border-b border-vscode-border transition-colors odd:bg-white/[0.02] even:bg-transparent hover:bg-vscode-accent/15">
                    {fields.map((field: any, fieldIndex: number) => (
                      <td key={fieldIndex} onDoubleClick={() => copyText(row[field.name])} title="Double-click to copy cell" className="border-r border-vscode-border px-5 py-2.5 text-gray-300">
                        {row[field.name] !== null ? String(row[field.name]) : <span className="italic opacity-40">NULL</span>}
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
