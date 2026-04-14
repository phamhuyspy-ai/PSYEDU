import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'manager';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        // Mock login logic - in real app, this would call GAS
        if (email === 'phamhuyspy@gmail.com' && password === 'admin123') {
          set({
            user: { id: '1', email, name: 'Super Admin', role: 'super_admin' },
            isAuthenticated: true,
          });
        } else if (email === 'manager@psyedu.vn' && password === 'manager123') {
          set({
            user: { id: '2', email, name: 'Manager', role: 'manager' },
            isAuthenticated: true,
          });
        } else {
          throw new Error('Email hoặc mật khẩu không đúng');
        }
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
    }),
    {
      name: 'psyedu-auth',
    }
  )
);
