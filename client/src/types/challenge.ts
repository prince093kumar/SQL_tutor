export type Difficulty = 'easy' | 'medium' | 'hard';
export type ChallengeState = 'Unsolved' | 'Attempted' | 'Solved' | 'Bookmarked';

export type Challenge = {
  id: number;
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  operation: string;
  topic: string;
  xp: number;
  estimated_time?: string;
  tables: string[];
  constraints: string[];
  expectedOutput: string[];
  sampleInput: string;
  successRate: number;
  submissions: number;
  status: ChallengeState;
};

export type CategoryGroup = {
  name: string;
  topics: string[];
};

export const categoryTree: CategoryGroup[] = [
  { name: 'Basics', topics: ['SELECT', 'WHERE', 'DISTINCT'] },
  { name: 'Sorting', topics: ['ORDER BY', 'LIMIT'] },
  { name: 'Aggregate', topics: ['COUNT', 'SUM', 'AVG', 'MIN/MAX'] },
  { name: 'Grouping', topics: ['GROUP BY', 'HAVING'] },
  { name: 'Joins', topics: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN'] },
  { name: 'Subquery', topics: ['Scalar', 'Nested'] },
  { name: 'Views', topics: ['CREATE VIEW'] },
  { name: 'Window', topics: ['ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LAG', 'LEAD'] },
  { name: 'CTE', topics: ['WITH', 'Recursive CTE'] },
  { name: 'Advanced', topics: ['CASE', 'UNION'] },
];

export const difficultyStyles: Record<Difficulty, string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-300',
  hard: 'text-red-300',
};
