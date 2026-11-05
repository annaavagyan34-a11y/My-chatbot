import React from 'react';
import { Sparkles, LogIn } from 'lucide-react';
import { SUGGESTED_PROMPTS } from '../data/subjects';
import { SubjectType, ThemeMode, UserProfile } from '../types';

interface WelcomeScreenProps {
  onSelectPrompt: (promptText: string, subjectType: SubjectType) => void;
  selectedSubject?: SubjectType;
  onSelectSubject?: (subject: SubjectType) => void;
  theme: ThemeMode;
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectPrompt,
  selectedSubject = 'all',
  theme,
  currentUser,
  onOpenAuth,
}) => {
  const isDark = theme === 'dark';

  const filteredPrompts =
    selectedSubject && selectedSubject !== 'all'
      ? SUGGESTED_PROMPTS.filter((p) => p.subjectId === selectedSubject)
      : SUGGESTED_PROMPTS.slice(0, 4);

  const displayPrompts =
    filteredPrompts.length > 0 ? filteredPrompts.slice(0, 4) : SUGGESTED_PROMPTS.slice(0, 4);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full text-center">
      {/* ChatGPT Style Centered Logo */}
      <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white mb-4 shadow-sm">
        <Sparkles className="w-6 h-6" />
      </div>

      {/* Account Status / Activation Prompt Banner */}
      {onOpenAuth && (
        <div className="mb-4">
          {currentUser ? (
            <button
              onClick={onOpenAuth}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#252525] hover:bg-[#2b2b2b] border-[#383838] text-slate-200'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <span>Ակտիվ հաշիվ՝</span>
              <span className="font-bold text-violet-500">{currentUser.name}</span>
              <span>{currentUser.avatar}</span>
              <span className="text-[10px] text-slate-400">· Փոխել</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                isDark
                  ? 'bg-violet-950/30 hover:bg-violet-950/50 border-violet-500/40 text-violet-300'
                  : 'bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-violet-500" />
              <span>Մուտք գործել կամ ակտիվացնել Ձեր հաշիվը</span>
              <span className="font-bold text-violet-600 dark:text-violet-400">→</span>
            </button>
          )}
        </div>
      )}

      {/* ChatGPT Headline: "What can I help with today?" */}
      <h1
        className={`text-2xl md:text-3xl font-bold tracking-tight mb-8 font-sans ${
          isDark ? 'text-[#ececec]' : 'text-[#0d0d0d]'
        }`}
      >
        Ինչո՞վ կարող եմ օգնել այսօր:
      </h1>

      {/* ChatGPT 2x2 Compact Prompt Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
        {displayPrompts.map((item) => (
          <button
            key={item.id}
            onClick={() =>
              onSelectPrompt(item.prompt, item.subjectId as SubjectType)
            }
            className={`p-3.5 rounded-2xl border transition-colors text-left flex flex-col justify-between cursor-pointer ${
              isDark
                ? 'bg-[#212121] hover:bg-[#2f2f2f] border-[#383838] text-slate-200'
                : 'bg-white hover:bg-[#f4f4f4] border-[#e5e5e5] text-slate-900'
            }`}
          >
            <div className="font-semibold text-xs mb-1 text-violet-500">
              {item.title}
            </div>
            <div
              className={`text-[12px] line-clamp-2 leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {item.prompt}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
