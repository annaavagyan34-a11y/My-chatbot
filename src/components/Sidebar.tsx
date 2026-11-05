import React, { useState } from 'react';
import {
  SquarePen,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Search,
  User,
  PanelLeftClose,
  Settings,
} from 'lucide-react';
import { ChatSession, SubjectType, ThemeMode, UserProfile } from '../types';
import { SUBJECTS } from '../data/subjects';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onClearAll: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onClearAll,
  isOpenMobile,
  onCloseMobile,
  theme,
  currentUser,
  onOpenAuth,
  onOpenSettings,
}) => {
  const isDark = theme === 'dark';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<SubjectType>('all');

  const startEditing = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveEditing = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const filteredSessions = sessions
    .filter((s) => {
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = filterSubject === 'all' || s.subject === filterSubject;
      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const todaySessions = filteredSessions.filter((s) => now - s.updatedAt < oneDayMs);
  const yesterdaySessions = filteredSessions.filter(
    (s) => now - s.updatedAt >= oneDayMs && now - s.updatedAt < 2 * oneDayMs
  );
  const olderSessions = filteredSessions.filter((s) => now - s.updatedAt >= 2 * oneDayMs);

  const renderSessionGroup = (title: string, groupSessions: ChatSession[]) => {
    if (groupSessions.length === 0) return null;

    return (
      <div className="mb-4">
        <div
          className={`px-3 py-1.5 text-[11px] font-bold ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {title}
        </div>
        <div className="space-y-0.5">
          {groupSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const isEditing = session.id === editingId;
            const questionCount = session.messages.filter((m) => m.role === 'user').length;

            return (
              <div
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id);
                  onCloseMobile();
                }}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                  isActive
                    ? isDark
                      ? 'bg-[#212121] text-[#ececec] font-semibold'
                      : 'bg-[#ececec] text-[#0d0d0d] font-semibold'
                    : isDark
                    ? 'text-slate-300 hover:bg-[#212121]/80 hover:text-white'
                    : 'text-slate-700 hover:bg-[#ececec]/80 hover:text-black'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-1">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />

                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditing(session.id, e);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className={`rounded px-1.5 py-0.5 text-xs outline-none w-full border ${
                        isDark
                          ? 'bg-[#171717] text-white border-violet-500'
                          : 'bg-white text-black border-violet-500'
                      }`}
                    />
                  ) : (
                    <span className="truncate">{session.title}</span>
                  )}
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isEditing ? (
                    <>
                      <button
                        onClick={(e) => saveEditing(session.id, e)}
                        className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded cursor-pointer"
                        title="Պահպանել"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 text-slate-400 hover:bg-slate-500/10 rounded cursor-pointer"
                        title="Չեղարկել"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => startEditing(session, e)}
                        className="p-1 text-slate-400 hover:text-slate-200 rounded cursor-pointer"
                        title="Խմբագրել"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                        title="Ջնջել"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* ChatGPT Style Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 border-r flex flex-col transition-all duration-200 ease-in-out ${
          isDark
            ? 'bg-[#171717] border-[#303030] text-[#ececec]'
            : 'bg-[#f9f9f9] border-[#e5e5e5] text-[#0d0d0d]'
        } ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header in Sidebar */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight">EduAI</span>
          </div>

          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'hover:bg-[#212121] text-slate-300 hover:text-white'
                : 'hover:bg-[#ececec] text-slate-700 hover:text-black'
            }`}
            title="Նոր զրույց"
          >
            <SquarePen className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Փնտրել..."
              className={`w-full rounded-lg pl-8 pr-2.5 py-1 text-xs outline-none transition-colors border ${
                isDark
                  ? 'bg-[#212121] border-[#303030] text-slate-200 placeholder-slate-500 focus:border-slate-500'
                  : 'bg-white border-[#e5e5e5] text-slate-800 placeholder-slate-400 focus:border-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="px-3 pb-2 border-b border-inherit">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {SUBJECTS.slice(0, 6).map((s) => (
              <button
                key={s.id}
                onClick={() => setFilterSubject(s.id)}
                className={`shrink-0 px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                  filterSubject === s.id
                    ? isDark
                      ? 'bg-[#2f2f2f] text-white font-bold'
                      : 'bg-[#e5e5e5] text-black font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                {s.shortName}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-none">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              {searchQuery ? 'Զրույցներ չեն գտնվել' : 'Զրույցների պատմությունը դատարկ է'}
            </div>
          ) : (
            <>
              {renderSessionGroup('Այսօր', todaySessions)}
              {renderSessionGroup('Երեկ', yesterdaySessions)}
              {renderSessionGroup('Ավելի վաղ', olderSessions)}
            </>
          )}
        </div>

        {/* ChatGPT Style User Footer */}
        <div
          className={`p-2.5 border-t flex items-center justify-between text-xs ${
            isDark ? 'border-[#303030]' : 'border-[#e5e5e5]'
          }`}
        >
          {currentUser ? (
            <div
              onClick={onOpenAuth}
              className={`flex-1 flex items-center gap-2.5 p-1.5 rounded-xl cursor-pointer transition-colors min-w-0 mr-1.5 ${
                isDark ? 'hover:bg-[#252525]' : 'hover:bg-slate-200/60'
              }`}
              title="Կառավարել հաշիվը"
            >
              <div
                className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${
                  currentUser.avatarColor || 'from-violet-600 to-indigo-600'
                } flex items-center justify-center text-sm shadow-xs shrink-0`}
              >
                {currentUser.avatar}
              </div>
              <div className="truncate min-w-0 flex-1">
                <div className="font-bold text-xs truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser.grade || 'Դպրոցական'}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`flex-1 flex items-center gap-2 p-1.5 rounded-xl cursor-pointer transition-colors min-w-0 mr-1.5 ${
                isDark ? 'hover:bg-[#252525]' : 'hover:bg-slate-200/60'
              }`}
              title="Մուտք գործել կամ ակտիվացնել հաշիվը"
            >
              <div className="w-7 h-7 rounded-xl bg-slate-300 dark:bg-[#2e2e2e] flex items-center justify-center text-slate-500 shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="truncate text-left">
                <div className="font-bold text-xs text-violet-500">Մուտք / Ակտիվացնել</div>
                <div className="text-[10px] text-slate-400 truncate">
                  Հյուրի ռեժիմ
                </div>
              </div>
            </button>
          )}

          <div className="flex items-center gap-1 shrink-0">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-400 hover:text-violet-400 hover:bg-[#252525]'
                    : 'text-slate-500 hover:text-violet-600 hover:bg-slate-200/60'
                }`}
                title="Կարգավորումներ և Գաղտնիություն"
                aria-label="Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}

            {sessions.length > 0 && (
              <button
                onClick={onClearAll}
                className={`text-[11px] font-medium px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-400 hover:text-rose-400 hover:bg-[#252525]'
                    : 'text-slate-500 hover:text-rose-600 hover:bg-slate-200/60'
                }`}
                title="Մաքրել բոլոր զրույցների պատմությունը"
              >
                Մաքրել
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
