import { create } from 'zustand';

interface AuthState {
  user: { id: number; username: string; email: string; full_name?: string; university?: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: any, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<{ full_name: string; university: string }>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  login: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (data) => set((state) => ({
    user: state.user ? { ...state.user, ...data } : null
  })),
}));
