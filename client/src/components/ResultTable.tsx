import React from 'react';
import { useSqlStore } from '../store/useSqlStore';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export const ResultTable: React.FC = () => {
  const { queryResult, isExecuting } = useSqlStore();

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

  return (
    <div className="flex flex-col h-full bg-vscode-bg">
      <div className="flex items-center p-2 text-xs text-vscode-text border-b border-vscode-border bg-[#1a1a1a]">
        <CheckCircle2 size={14} className="text-green-400 mr-2" />
        <span className="mr-4">Success</span>
        <Clock size={14} className="mr-1 opacity-50" />
        <span className="opacity-70">{executionTimeMs} ms</span>
        <span className="ml-4 opacity-70">{rowCount} rows</span>
        {affectedRows > 0 && <span className="ml-4 opacity-70">{affectedRows} affected</span>}
      </div>
      
      <div className="flex-1 overflow-auto">
        {!Array.isArray(rows) || rows.length === 0 ? (
          <div className="p-4 text-vscode-text opacity-70 text-sm">
            Query completed successfully. No rows returned.
          </div>
        ) : (
          <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
            <thead className="bg-[#2a2d2e] text-vscode-text sticky top-0 z-10 shadow">
              <tr>
                {fields.map((f: any, i: number) => (
                  <th key={i} className="px-4 py-2 border-r border-[#3e3e42] font-semibold">
                    {f.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, i: number) => (
                <tr key={i} className="border-b border-[#3e3e42] hover:bg-white/5 transition-colors">
                  {fields.map((f: any, j: number) => (
                    <td key={j} className="px-4 py-2 border-r border-[#3e3e42] text-vscode-text">
                      {row[f.name] !== null ? String(row[f.name]) : <span className="opacity-40 italic">NULL</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
