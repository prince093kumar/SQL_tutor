import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Challenge, difficultyStyles } from '../../types/challenge';

interface ChallengeProblemProps {
  challenge: Challenge | null;
  totalChallenges: number;
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const ChallengeProblem: React.FC<ChallengeProblemProps> = ({
  challenge,
  totalChallenges,
  currentIndex,
  onPrevious,
  onNext
}) => {
  if (!challenge) {
    return (
      <main className="flex h-full w-full items-center justify-center overflow-y-auto bg-[#071019]/45 p-5">
        <div className="workbench-panel p-5 text-sm text-vscode-text/70">
          No challenges match the current filters.
        </div>
      </main>
    );
  }

  return (
    <main className="h-full w-full overflow-y-auto bg-[#071019]/45 p-5">
      <div className="mb-4 flex items-center justify-between">
        <button 
          disabled={currentIndex === 0} 
          onClick={onPrevious} 
          className="secondary-action flex items-center gap-1 px-2 py-1 disabled:opacity-40"
        >
          <ChevronLeft size={14} /> Previous
        </button>
        <span className="text-xs text-vscode-text/60">
          Challenge {currentIndex + 1} / {totalChallenges}
        </span>
        <button 
          disabled={currentIndex === totalChallenges - 1} 
          onClick={onNext} 
          className="secondary-action flex items-center gap-1 px-2 py-1 disabled:opacity-40"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
      
      <h2 className="text-xl font-semibold text-white">{challenge.title}</h2>
      
      <div className="mt-2 flex gap-3 text-sm">
        <span className={difficultyStyles[challenge.difficulty]}>{challenge.difficulty}</span>
        <span>{challenge.category}</span>
        <span>{challenge.operation}</span>
        <span>{challenge.xp} Points</span>
      </div>
      
      <section className="mt-5 space-y-5 text-sm leading-6">
        <p>{challenge.description}</p>
        <div>
          <h3 className="font-semibold text-white">Tables</h3>
          <p>{challenge.tables.join(', ')}</p>
        </div>
        <div>
          <h3 className="font-semibold text-white">Constraints</h3>
          <ul className="list-disc pl-5">
            {challenge.constraints.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-white">Expected Columns</h3>
          <p>{challenge.expectedOutput.join(', ') || 'Match the expected result set.'}</p>
        </div>
        <div>
          <h3 className="font-semibold text-white">Context</h3>
          <pre className="mt-2 rounded-md border border-vscode-border bg-[#06101a] p-3 text-xs">
            {challenge.sampleInput}
          </pre>
        </div>
      </section>
    </main>
  );
};
