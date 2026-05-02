import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  uploadLimit: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  hydrateDone: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setHydrateDone: (done: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hydrateDone: false,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHydrateDone: (done) => set({ hydrateDone: done }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrateDone(true);
        }
      },
    }
  )
);
