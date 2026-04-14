import React from 'react';
import { Moon, Sun, Languages } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';

export default function ThemeLanguageToggle({ className }: { className?: string }) {
  const { theme, toggleTheme, language, setLanguage } = useAppStore();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Language Switcher */}
      <button
        onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
        title="Switch Language"
      >
        <Languages size={18} />
        <span className="text-xs font-bold uppercase">{language}</span>
      </button>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    </div>
  );
}
