import React from 'react';
import { Search } from 'lucide-react';
import { 
  Difficulty, 
  ChallengeState, 
  categoryTree, 
  difficultyStyles 
} from '../../types/challenge';

interface ChallengeFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  difficultyFilters: Difficulty[];
  toggleDifficulty: (val: Difficulty) => void;
  statusFilters: ChallengeState[];
  toggleStatus: (val: ChallengeState) => void;
  categoryFilters: string[];
  toggleCategory: (val: string) => void;
  operationFilters: string[];
  toggleOperation: (val: string) => void;
}

export const ChallengeFilters: React.FC<ChallengeFiltersProps> = ({
  search,
  setSearch,
  difficultyFilters,
  toggleDifficulty,
  statusFilters,
  toggleStatus,
  categoryFilters,
  toggleCategory,
  operationFilters,
  toggleOperation
}) => {
  return (
    <aside className="h-full w-full overflow-y-auto bg-[#091421]/95 p-4">
      <h1 className="text-lg font-semibold text-white">SQL Challenges</h1>
      <div className="relative mt-4">
        <Search size={15} className="absolute left-3 top-2.5 text-vscode-text/50" />
        <input 
          value={search} 
          onChange={event => setSearch(event.target.value)} 
          placeholder="Search challenges" 
          className="w-full rounded-md border border-vscode-border bg-[#06101a] py-2 pl-9 pr-3 text-sm outline-none focus:border-vscode-accent text-white placeholder-vscode-text/50" 
        />
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
        <h2 className="mb-2 text-xs font-semibold uppercase text-vscode-text/60">Status</h2>
        {(['Solved', 'Attempted', 'Unsolved', 'Bookmarked'] as ChallengeState[]).map(status => (
          <label key={status} className="mb-2 flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={statusFilters.includes(status)} onChange={() => toggleStatus(status)} />
            {status}
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
                    <input type="checkbox" checked={operationFilters.includes(topic)} onChange={() => toggleOperation(topic)} />
                    {topic}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
};
