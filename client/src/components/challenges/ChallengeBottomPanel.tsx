import React from 'react';

interface ChallengeBottomPanelProps {
  activePanel: 'tests' | 'output' | 'console';
  setActivePanel: (val: 'tests' | 'output' | 'console') => void;
  result: any;
}

export const ChallengeBottomPanel: React.FC<ChallengeBottomPanelProps> = ({
  activePanel,
  setActivePanel,
  result
}) => {
  const resultError = typeof result?.error === 'string'
    ? result.error
    : result?.error?.message || (result?.error ? JSON.stringify(result.error) : '');

  return (
    <section className="flex h-full flex-col overflow-hidden bg-[#071019]">
      <div className="flex shrink-0 border-b border-vscode-border bg-[#0d1a28] text-sm">
        {(['tests', 'output', 'console'] as const).map(panel => (
          <button 
            key={panel} 
            type="button"
            onClick={() => setActivePanel(panel)} 
            className={`px-4 py-2 capitalize ${
              activePanel === panel 
                ? 'bg-vscode-accent/10 text-white' 
                : 'text-vscode-text/55 hover:text-white'
            }`}
          >
            {panel === 'tests' ? 'Test Cases' : panel}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activePanel === 'tests' && (
          <div className="space-y-2">
            <h3 className="font-semibold text-white">
              {result?.mode === 'submit' ? 'Evaluation Result' : 'Sample Test Cases'}
            </h3>
            
            {result?.mode === 'submit' ? (
              <div className="rounded-md border border-vscode-border bg-white/[0.03] p-4 text-sm text-white">
                <div className={`mb-3 text-lg font-semibold ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  Status: {result.isCorrect ? 'Accepted' : 'Wrong Answer'}
                </div>
                <div className="flex flex-col gap-1.5 text-vscode-text/80">
                   <div>Passed {result.hiddenTests?.filter((t:any) => t.status === 'passed').length || 0} / {result.hiddenTests?.length || 0} hidden test cases</div>
                   {result.runtime !== undefined && <div>Runtime: {result.runtime} ms</div>}
                </div>
              </div>
            ) : (
              (result?.sampleTests || [{ name: 'Run the current query first', status: 'waiting' }]).map((test: any, idx: number) => (
                <div key={test.name || idx} className="rounded-md border border-vscode-border bg-white/[0.03] p-3 text-sm text-white">
                  <span className={
                    test.status === 'passed' ? 'text-green-400 font-medium' : 
                    test.status === 'failed' ? 'text-red-400 font-medium' : 'text-vscode-text/70'
                  }>
                    {test.status === 'passed' ? 'Passed' : test.status === 'failed' ? 'Failed' : 'Waiting'}
                  </span>
                  {' - '}
                  {test.name}
                </div>
              ))
            )}
          </div>
        )}
        
        {activePanel === 'output' && (
          <div className="overflow-x-auto text-sm text-vscode-text/80">
            {result?.mode === 'submit' ? (
              <div className="p-3 text-vscode-text/60 italic">Output is hidden during submission to protect hidden test cases.</div>
            ) : result?.rows && result.rows.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-vscode-border">
                    {Object.keys(result.rows[0]).map(key => (
                      <th key={key} className="p-2 font-semibold text-white">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-vscode-border/50 hover:bg-white/[0.02]">
                      {Object.values(row).map((val: any, j: number) => (
                        <td key={j} className="p-2 truncate max-w-[200px]">
                          {val === null ? <span className="text-vscode-text/40 italic">null</span> : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <pre>{JSON.stringify(result?.rows || result || 'Run a query to preview output.', null, 2)}</pre>
            )}
          </div>
        )}
        
        {activePanel === 'console' && (
          <p className={`text-sm ${resultError ? 'text-red-300' : 'text-vscode-text/70'}`}>
            {resultError || (result?.mode === 'submit' ? `Points Earned: ${result.xpEarned || 0}` : 'Console ready.')}
          </p>
        )}
      </div>
    </section>
  );
};
