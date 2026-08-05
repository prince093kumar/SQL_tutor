import { create } from 'zustand';
import { useSqlStore } from './useSqlStore';
interface AuthState {
  user: { id: number; username: string; email: string; full_name?: string; university?: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: any, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<{ full_name: string; university: string }>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  login: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Clear out old workspace for the new user or relogin
    localStorage.removeItem('sqllab-workspace-storage');
    useSqlStore.getState().resetWorkspace();

    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear out workspace on logout
    localStorage.removeItem('sqllab-workspace-storage');
    useSqlStore.getState().resetWorkspace();

    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (data) => set((state) => {
    const newUser = state.user ? { ...state.user, ...data } : null;
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    }
    return { user: newUser };
  }),
}));
