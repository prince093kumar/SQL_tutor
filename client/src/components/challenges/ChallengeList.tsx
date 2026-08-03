import React from 'react';
import { CheckCircle2, Circle, Bookmark, Star } from 'lucide-react';
import { Challenge, difficultyStyles } from '../../types/challenge';

interface ChallengeListProps {
  challenges: Challenge[];
  selectedChallengeId: number | null;
  onSelect: (challenge: Challenge) => void;
  onToggleBookmark: (event: React.MouseEvent, challenge: Challenge) => void;
}

export const ChallengeList: React.FC<ChallengeListProps> = ({
  challenges,
  selectedChallengeId,
  onSelect,
  onToggleBookmark
}) => {
  return (
    <aside className="h-full w-full overflow-y-auto bg-[#0d1723]/95 p-3">
      <div className="mb-3 text-sm text-vscode-text/70">{challenges.length} Challenges Found</div>
      <div className="space-y-3">
        {challenges.map(challenge => (
          <button 
            key={challenge.id} 
            onClick={() => onSelect(challenge)} 
            className={`group w-full rounded-lg border p-3 text-left transition hover:bg-vscode-accent/10 ${
              selectedChallengeId === challenge.id 
                ? 'border-vscode-accent bg-vscode-accent/15 shadow-[0_0_22px_rgba(47,140,255,0.12)]' 
                : 'border-vscode-border bg-white/[0.03]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                {challenge.status === 'Solved' ? <CheckCircle2 size={16} className="text-green-400" /> : <Circle size={16} className="text-vscode-text/40" />}
                <h2 className="truncate font-semibold text-white">{challenge.title}</h2>
              </div>
              <span 
                onClick={event => onToggleBookmark(event, challenge)} 
                className="rounded p-1 hover:bg-white/10" 
                title="Toggle bookmark"
              >
                <Bookmark size={15} className={challenge.status === 'Bookmarked' ? 'fill-vscode-accent text-vscode-accent' : 'text-vscode-text/45'} />
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className={difficultyStyles[challenge.difficulty]}>{challenge.difficulty}</span>
              <span className="flex items-center gap-0.5 text-yellow-300">
                <Star size={12} /><Star size={12} /><Star size={12} />
              </span>
              <span>{challenge.status}</span>
              <span className="flex items-center gap-1 text-yellow-300">
                <Star size={12} /> {challenge.xp} Points
              </span>
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
  );
};
