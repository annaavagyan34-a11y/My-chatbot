import React from 'react';
import {
  PanelLeft,
  SquarePen,
  ChevronDown,
  Sparkles,
  User,
  LogIn,
  Settings,
} from 'lucide-react';
import { SubjectType, ThemeMode, UserProfile } from '../types';
import { SUBJECTS } from '../data/subjects';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  chatTitle: string;
  subject: SubjectType;
  theme: ThemeMode;
  onToggleTheme: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNewChat,
  chatTitle,
  subject,
  theme,
  onToggleTheme,
  currentUser,
  onOpenAuth,
  onOpenSettings,
}) => {
  const isDark = theme === 'dark';
  const currentSubjectObj =
    SUBJECTS.find((s) => s.id === subject) || SUBJECTS[0];

  return (
    <header
      className={`h-14 border-b px-3.5 flex items-center justify-between sticky top-0 z-30 transition-colors duration-150 ${
        isDark
          ? 'bg-[#212121] border-[#303030] text-[#ececec]'
          : 'bg-white border-[#f0f0f0] text-[#0d0d0d]'
      }`}
    >
      {/* Left: Sidebar toggle button and Model Badge */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isDark
              ? 'hover:bg-[#2f2f2f] text-slate-300'
              : 'hover:bg-[#f4f4f4] text-slate-700'
          }`}
          title="Բացել/փակել կողային պանելը"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        {/* ChatGPT Model Selector Pill */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
            isDark ? 'hover:bg-[#2f2f2f]' : 'hover:bg-[#f4f4f4]'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-violet-500" />
          <span>EduAI</span>
          <span
            className={`text-xs font-normal ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            3.8
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        </div>

        {/* Optional Chat Title truncate on desktop */}
        {chatTitle && chatTitle !== 'Նոր զրույց' && (
          <span
            className={`hidden lg:inline text-xs truncate max-w-xs ml-2 font-medium ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            · {chatTitle}
          </span>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'hover:bg-[#2f2f2f] text-slate-300 hover:text-white'
                : 'hover:bg-[#f4f4f4] text-slate-700 hover:text-black'
            }`}
            title="Կարգավորումներ և Գաղտնիություն"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onNewChat}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isDark
              ? 'hover:bg-[#2f2f2f] text-slate-300 hover:text-white'
              : 'hover:bg-[#f4f4f4] text-slate-700 hover:text-black'
          }`}
          title="Նոր զրույց"
        >
          <SquarePen className="w-5 h-5" />
        </button>

        {/* User Account / Profile Button */}
        {currentUser ? (
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all border cursor-pointer ${
              isDark
                ? 'bg-[#262626] border-[#383838] hover:border-violet-500/50 hover:bg-[#2a2a2a]'
                : 'bg-slate-50 border-slate-200 hover:border-violet-300 hover:bg-slate-100'
            }`}
            title="Իմ հաշիվը / Կարգավորումներ"
          >
            <div
              className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${
                currentUser.avatarColor || 'from-violet-600 to-indigo-600'
              } flex items-center justify-center text-sm shadow-xs shrink-0`}
            >
              {currentUser.avatar}
            </div>
            <span className="text-xs font-semibold max-w-[90px] truncate hidden sm:inline">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors cursor-pointer shadow-xs"
            title="Մուտք գործել կամ ակտիվացնել Ձեր հաշիվը"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Մուտք / Ակտիվացնել</span>
          </button>
        )}
      </div>
    </header>
  );
};
