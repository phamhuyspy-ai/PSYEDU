import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';
export type Language = 'vi' | 'en';

interface AppState {
  theme: Theme;
  language: Language;
  isChatOpen: boolean;
  chatContext: string;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleTheme: () => void;
  setChatOpen: (isOpen: boolean) => void;
  setChatContext: (context: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'vi',
      isChatOpen: false,
      chatContext: '',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
      setChatContext: (context) => set({ chatContext: context }),
    }),
    {
      name: 'psyedu-app-settings',
    }
  )
);
