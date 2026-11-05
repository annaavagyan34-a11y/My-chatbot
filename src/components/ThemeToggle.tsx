import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../types';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  className = '',
}) => {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex items-center gap-1.5 p-2 rounded-xl transition-all duration-200 cursor-pointer ${
        isDark
          ? 'bg-slate-800/90 text-amber-300 hover:bg-slate-700 border border-slate-700/80 shadow-xs'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200/90 border border-slate-200/90 shadow-2xs'
      } ${className}`}
      title={isDark ? 'Անցնել լուսավոր ռեժիմի' : 'Անցնել մուգ ռեժիմի'}
      aria-label="Toggle Theme"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 text-violet-300 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-0 scale-100" />
        )}
      </div>
      <span className="text-xs font-semibold hidden sm:inline">
        {isDark ? 'Մուգ' : 'Լուսավոր'}
      </span>
    </button>
  );
};
