import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginAdminGas } from '../services/gasService';
import { useSettingsStore } from './settingsStore';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'manager';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (email: string, password: string, pin: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      login: async (email, password, pin) => {
        const settings = useSettingsStore.getState().settings;
        const result = await loginAdminGas(email, password, pin, settings);
        
        if (result.success && result.user) {
          set({
            user: result.user,
            isAuthenticated: true,
          });
        } else {
          throw new Error(result.message || 'Đăng nhập thất bại');
        }
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'psyedu-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
