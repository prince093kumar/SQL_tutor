import { create } from 'zustand';

interface SqlState {
  currentQuery: string;
  queryResult: any | null;
  history: any[];
  savedQueries: any[];
  isExecuting: boolean;
  setCurrentQuery: (query: string) => void;
  setQueryResult: (result: any) => void;
  setHistory: (history: any[]) => void;
  setSavedQueries: (queries: any[]) => void;
  setIsExecuting: (isExecuting: boolean) => void;
}

export const useSqlStore = create<SqlState>((set) => ({
  currentQuery: '-- Write your SQL query here\nSELECT VERSION();',
  queryResult: null,
  history: [],
  savedQueries: [],
  isExecuting: false,
  setCurrentQuery: (currentQuery) => set({ currentQuery }),
  setQueryResult: (queryResult) => set({ queryResult }),
  setHistory: (history) => set({ history }),
  setSavedQueries: (savedQueries) => set({ savedQueries }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),
}));
