import React from 'react';
import {
  X,
  Settings,
  Sparkles,
  Shield,
  Trash2,
  CheckCircle2,
  Clock,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { ThemeMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  startCleanOnVisit: boolean;
  onToggleStartClean: (value: boolean) => void;
  incognitoMode: boolean;
  onToggleIncognito: (value: boolean) => void;
  totalSessionsCount: number;
  onClearAllHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  startCleanOnVisit,
  onToggleStartClean,
  incognitoMode,
  onToggleIncognito,
  totalSessionsCount,
  onClearAllHistory,
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl border flex flex-col overflow-hidden max-h-[90vh] transition-colors ${
          isDark
            ? 'bg-[#1e1e1e] border-[#333] text-[#ececec]'
            : 'bg-white border-slate-200 text-[#0d0d0d]'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'border-[#303030]' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-500">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-snug">
                Կարգավորումներ և Գաղտնիություն
              </h2>
              <p className="text-[11px] text-slate-400">
                Կառավարեք զրույցների պահպանման և տեսանելիության ռեժիմը
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'hover:bg-[#2e2e2e] text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
            title="Փակել"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Quick status banner */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-3 ${
              startCleanOnVisit
                ? isDark
                  ? 'bg-emerald-950/25 border-emerald-800/40 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : isDark
                ? 'bg-amber-950/25 border-amber-800/40 text-amber-300'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold">
                {startCleanOnVisit
                  ? 'Ակտիվացված է մաքուր էջի ռեժիմը:'
                  : 'Պահպանվում է նախորդ չատի բացված վիճակը:'}
              </span>{' '}
              {startCleanOnVisit
                ? 'Ամեն անգամ մտնելիս նախորդ չատը չի երևա էկրանին, Դուք կտեսնեք նոր մաքուր էջ:'
                : 'Մտնելիս կբացվի վերջին օգտագործված զրույցը:'}
            </div>
          </div>

          {/* Setting 1: Start clean on visit */}
          <div
            className={`p-4 rounded-xl border transition-colors ${
              isDark ? 'bg-[#252525] border-[#383838]' : 'bg-slate-50/80 border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw className="w-4 h-4 text-violet-500 shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm">
                    Ամեն անգամ մտնելիս սկսել մաքուր էջից
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-500/15 text-violet-500">
                    Առաջարկվող
                  </span>
                </div>
                <p className="text-[12px] text-slate-400 leading-relaxed">
                  Երբ միացված է, հավելված բացելիս կամ էջը թարմացնելիս նախորդ զրույցները չեն
                  բացվում էկրանին, անմիջապես բացվում է նոր դատարկ չատ («Ինչո՞վ կարող եմ օգնել
                  այսօր»):
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={startCleanOnVisit}
                onClick={() => onToggleStartClean(!startCleanOnVisit)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  startCleanOnVisit ? 'bg-violet-600' : isDark ? 'bg-neutral-700' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    startCleanOnVisit ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Setting 2: Incognito Mode (Do not save history) */}
          <div
            className={`p-4 rounded-xl border transition-colors ${
              isDark ? 'bg-[#252525] border-[#383838]' : 'bg-slate-50/80 border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <EyeOff className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm">
                    Գաղտնի (Ինկոգնիտո) ռեժիմ
                  </span>
                </div>
                <p className="text-[12px] text-slate-400 leading-relaxed">
                  Զրույցները ընդհանրապես չեն պահպանվի բրաուզերի հիշողության մեջ: Էջը փակելիս կամ
                  թարմացնելիս բոլոր չատերը լիովին կջնջվեն:
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={incognitoMode}
                onClick={() => onToggleIncognito(!incognitoMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  incognitoMode ? 'bg-amber-600' : isDark ? 'bg-neutral-700' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    incognitoMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Setting 3: Clear all history */}
          <div
            className={`p-4 rounded-xl border transition-colors ${
              isDark ? 'bg-[#252525] border-[#383838]' : 'bg-slate-50/80 border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm">
                    Մաքրել բոլոր նախորդ զրույցները
                  </span>
                </div>
                <p className="text-[12px] text-slate-400">
                  Պահպանված է {totalSessionsCount} զրույց: Կարող եք ջնջել դրանք միանգամից:
                </p>
              </div>

              <button
                onClick={() => {
                  onClearAllHistory();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 transition-colors cursor-pointer shrink-0"
              >
                Ջնջել բոլորը
              </button>
            </div>
          </div>

          {/* Explanation Card */}
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
              isDark ? 'bg-[#181818] border-[#2c2c2c] text-slate-300' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 text-violet-500">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ինչպե՞ս է աշխատում.</span>
            </div>
            <p>
              1. <strong>Ամեն մուտքի ժամանակ</strong> Ձեր էկրանին միշտ բացվում է թարմ, մաքուր չատ։
            </p>
            <p>
              2. <strong>Նախորդ զրույցները</strong> ապահով պահվում են միայն ձախ կողային մենյուում (Sidebar),
              որտեղից կարող եք դրանք բացել միայն ըստ ցանկության։
            </p>
            <p>
              3. Եթե ցանկանում եք, որ նախորդ զրույցներն ընդհանրապես չպահպանվեն նաև մենյուում,
              միացրեք <strong>«Գաղտնի (Ինկոգնիտո) ռեժիմը»</strong> կամ սեղմեք <strong>«Ջնջել բոլորը»</strong>։
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3.5 border-t flex items-center justify-end ${
            isDark ? 'border-[#303030] bg-[#1a1a1a]' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white transition-colors cursor-pointer"
          >
            Պահպանել և Փակել
          </button>
        </div>
      </div>
    </div>
  );
};
