import { create } from 'zustand';

export interface EditorTab {
  id: string;
  title: string;
  query: string;
  savedQueryId?: number;
  isDirty: boolean;
  source: 'new' | 'saved' | 'imported';
}

interface SqlState {
  tabs: EditorTab[];
  activeTabId: string;
  queryResult: any | null;
  history: any[];
  savedQueries: any[];
  isExecuting: boolean;
  
  // Keep for backwards compatibility during refactor, maps to active tab query
  currentQuery: string; 

  setCurrentQuery: (query: string) => void;
  setQueryResult: (result: any) => void;
  setHistory: (history: any[]) => void;
  setSavedQueries: (queries: any[]) => void;
  setIsExecuting: (isExecuting: boolean) => void;
  resetEditor: (query?: string) => void;

  // Tab management
  addTab: (tab: Partial<EditorTab>) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  createNewQuery: () => void;
  updateTabStatus: (id: string, updates: Partial<EditorTab>) => void;
}

const DEFAULT_QUERY = '-- Write your SQL query here\n';

const generateTabId = () => Math.random().toString(36).substr(2, 9);

const createDefaultTab = (index: number): EditorTab => ({
  id: generateTabId(),
  title: `query-${index}.sql`,
  query: DEFAULT_QUERY,
  isDirty: false,
  source: 'new'
});

export const useSqlStore = create<SqlState>((set, get) => {
  const initialTab = createDefaultTab(1);
  
  return {
    tabs: [initialTab],
    activeTabId: initialTab.id,
    currentQuery: initialTab.query,
    queryResult: null,
    history: [],
    savedQueries: [],
    isExecuting: false,
    
    setCurrentQuery: (query) => set((state) => {
      const updatedTabs = state.tabs.map(tab => 
        tab.id === state.activeTabId 
          ? { ...tab, query, isDirty: true }
          : tab
      );
      return { 
        tabs: updatedTabs, 
        currentQuery: query 
      };
    }),
    
    setQueryResult: (queryResult) => set({ queryResult }),
    setHistory: (history) => set({ history }),
    setSavedQueries: (savedQueries) => set({ savedQueries }),
    setIsExecuting: (isExecuting) => set({ isExecuting }),
    
    resetEditor: (query = DEFAULT_QUERY) => set((state) => {
      // Just resets the current tab's query and clears results
      const updatedTabs = state.tabs.map(tab => 
        tab.id === state.activeTabId 
          ? { ...tab, query, isDirty: false }
          : tab
      );
      return {
        tabs: updatedTabs,
        currentQuery: query,
        queryResult: null,
      };
    }),

    addTab: (tab) => set((state) => {
      const newTab: EditorTab = {
        id: generateTabId(),
        title: `query-${state.tabs.length + 1}.sql`,
        query: DEFAULT_QUERY,
        isDirty: false,
        source: 'new',
        ...tab
      };
      return {
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id,
        currentQuery: newTab.query,
        queryResult: null
      };
    }),

    removeTab: (id) => set((state) => {
      const tabToRemove = state.tabs.find(t => t.id === id);
      if (!tabToRemove) return state;

      const newTabs = state.tabs.filter(t => t.id !== id);
      
      // If closing the last tab, create a new one
      if (newTabs.length === 0) {
        const fallbackTab = createDefaultTab(1);
        return {
          tabs: [fallbackTab],
          activeTabId: fallbackTab.id,
          currentQuery: fallbackTab.query,
          queryResult: null
        };
      }

      // If closing active tab, switch to the last available one
      if (id === state.activeTabId) {
        const nextActive = newTabs[newTabs.length - 1];
        return {
          tabs: newTabs,
          activeTabId: nextActive.id,
          currentQuery: nextActive.query,
          queryResult: null
        };
      }

      return { tabs: newTabs };
    }),

    setActiveTab: (id) => set((state) => {
      const tab = state.tabs.find(t => t.id === id);
      if (!tab) return state;
      return {
        activeTabId: id,
        currentQuery: tab.query,
        queryResult: null // optional: reset result when switching tabs, or keep per-tab
      };
    }),

    createNewQuery: () => {
      const state = get();
      state.addTab({ source: 'new' });
    },

    updateTabStatus: (id, updates) => set((state) => ({
      tabs: state.tabs.map(tab => 
        tab.id === id ? { ...tab, ...updates } : tab
      )
    }))
  };
});
