import React, { useState, useRef } from 'react';
import {
  X,
  User,
  GraduationCap,
  Mail,
  School,
  Sparkles,
  Check,
  Plus,
  LogOut,
  Upload,
  Download,
  Users,
  Settings,
  ArrowLeft,
  Trash2,
  Search,
  LogIn,
  KeyRound,
} from 'lucide-react';
import { UserProfile, ThemeMode } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  profiles: UserProfile[];
  onSelectUser: (user: UserProfile | null) => void;
  onSaveProfile: (profile: UserProfile) => void;
  onDeleteProfile: (id: string) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  theme: ThemeMode;
  totalChatsCount: number;
  onOpenSettings?: () => void;
}

const AVATAR_OPTIONS = [
  { emoji: '🎓', label: 'Ուսանող / Աշակերտ', color: 'from-blue-500 to-indigo-600' },
  { emoji: '🦉', label: 'Իմաստուն բու', color: 'from-amber-500 to-orange-600' },
  { emoji: '🚀', label: 'Հետազոտող', color: 'from-purple-500 to-pink-600' },
  { emoji: '🔬', label: 'Գիտնական', color: 'from-emerald-500 to-teal-600' },
  { emoji: '🎨', label: 'Արվեստագետ', color: 'from-rose-500 to-red-600' },
  { emoji: '💡', label: 'Գյուտարար', color: 'from-yellow-400 to-amber-500' },
  { emoji: '🦁', label: 'Քաջառյուծ', color: 'from-orange-500 to-amber-600' },
  { emoji: '🌟', label: 'Աստղ', color: 'from-cyan-500 to-blue-600' },
];

const GRADE_OPTIONS = [
  '1-4 դասարան (Կրտսեր դպրոց)',
  '5-9 դասարան (Միջին դպրոց)',
  '10-12 դասարան (Ավագ դպրոց)',
  'Ուսանող (ԲՈՒՀ / Քոլեջ)',
  'Ուսուցիչ / Դասախոս',
  'Ծնող / Ինքնակրթություն',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  profiles,
  onSelectUser,
  onSaveProfile,
  onDeleteProfile,
  onExportData,
  onImportData,
  theme,
  totalChatsCount,
  onOpenSettings,
}) => {
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  type ViewMode = 'view' | 'switch' | 'edit' | 'create';
  const [view, setView] = useState<ViewMode>(currentUser ? 'view' : 'switch');

  // Quick lookup / activate state
  const [searchQuery, setSearchQuery] = useState('');
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    grade: GRADE_OPTIONS[1],
    school: '',
    avatar: '🎓',
    avatarColor: 'from-blue-500 to-indigo-600',
  });

  if (!isOpen) return null;

  const handleStartCreate = (prefill?: { name?: string; email?: string }) => {
    setFormData({
      id: `user-${Date.now()}`,
      name: prefill?.name || '',
      email: prefill?.email || '',
      grade: GRADE_OPTIONS[1],
      school: '',
      avatar: '🎓',
      avatarColor: 'from-purple-500 to-pink-600',
      createdAt: Date.now(),
    });
    setView('create');
  };

  const handleStartEdit = () => {
    if (!currentUser) return;
    setFormData({ ...currentUser });
    setView('edit');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const profileToSave: UserProfile = {
      id: formData.id || `user-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email?.trim() || '',
      grade: formData.grade || GRADE_OPTIONS[1],
      school: formData.school?.trim() || '',
      avatar: formData.avatar || '🎓',
      avatarColor: formData.avatarColor || 'from-blue-500 to-indigo-600',
      createdAt: formData.createdAt || Date.now(),
    };

    onSaveProfile(profileToSave);
    onSelectUser(profileToSave);
    setView('view');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
      e.target.value = '';
    }
  };

  // Quick activate by email or name input
  const handleQuickActivate = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const matched = profiles.find(
      (p) =>
        (p.email && p.email.toLowerCase() === query) ||
        p.name.toLowerCase().includes(query) ||
        p.id.toLowerCase() === query
    );

    if (matched) {
      onSelectUser(matched);
      onClose();
    } else {
      setLookupMessage(
        `«${searchQuery}» տվյալներով հաշիվ չգտնվեց։ Ցանկանու՞մ եք ստեղծել նոր հաշիվ։`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-colors duration-150 ${
          isDark
            ? 'bg-[#1e1e1e] border-[#333333] text-[#ececec]'
            : 'bg-white border-[#e5e5e5] text-[#0d0d0d]'
        }`}
      >
        {/* Modal Top Bar */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-[#303030]' : 'border-[#f0f0f0]'
          }`}
        >
          <div className="flex items-center gap-2">
            {view !== 'view' && currentUser && (
              <button
                onClick={() => setView('view')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer mr-1 ${
                  isDark ? 'hover:bg-[#2d2d2d]' : 'hover:bg-[#f3f4f6]'
                }`}
                title="Վերադառնալ"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-violet-600/15 flex items-center justify-center text-violet-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">
                {view === 'view' && 'Իմ հաշիվը'}
                {view === 'switch' &&
                  (currentUser ? 'Փոխել հաշիվը' : 'Մուտք / Ակտիվացնել հաշիվը')}
                {view === 'create' && 'Ստեղծել նոր հաշիվ'}
                {view === 'edit' && 'Խմբագրել պրոֆիլը'}
              </h3>
              <p className="text-[11px] text-slate-400">EduAI ուսումնական համակարգ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'hover:bg-[#2d2d2d] text-slate-400 hover:text-white'
                : 'hover:bg-[#f3f4f6] text-slate-500'
            }`}
            title="Փակել"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto scrollbar-none">
          {/* VIEW: Active Profile Details */}
          {view === 'view' && currentUser && (
            <div className="space-y-5">
              {/* Profile Card */}
              <div
                className={`p-4 rounded-xl border flex items-center gap-4 ${
                  isDark ? 'bg-[#262626] border-[#383838]' : 'bg-[#f9fafb] border-[#e5e7eb]'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${
                    currentUser.avatarColor || 'from-violet-600 to-indigo-600'
                  } flex items-center justify-center text-2xl shadow-md shrink-0`}
                >
                  {currentUser.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base truncate">{currentUser.name}</h4>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-500/15 text-violet-500">
                      Ակտիվ
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span className="truncate">{currentUser.grade || 'Դպրոցական'}</span>
                  </div>
                  {currentUser.email && (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{currentUser.email}</span>
                    </div>
                  )}
                  {currentUser.school && (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                      <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{currentUser.school}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats & Info */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div
                  className={`p-3 rounded-xl border ${
                    isDark ? 'bg-[#252525] border-[#333]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-lg font-bold text-violet-500">{totalChatsCount}</div>
                  <div className="text-[11px] text-slate-400">Պահպանված զրույցներ</div>
                </div>
                <div
                  className={`p-3 rounded-xl border ${
                    isDark ? 'bg-[#252525] border-[#333]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-lg font-bold text-emerald-500">Անվտանգ</div>
                  <div className="text-[11px] text-slate-400">Անձնական պատմություն</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleStartEdit}
                  className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-[#383838] hover:bg-[#282828] text-slate-200'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Խմբագրել պրոֆիլի տվյալները
                </button>

                {onOpenSettings && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSettings();
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
                      isDark
                        ? 'border-violet-500/30 bg-violet-950/20 hover:bg-violet-950/40 text-violet-300'
                        : 'border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-800'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-violet-500" />
                    Չատի կարգավորումներ և Գաղտնիություն
                  </button>
                )}

                <button
                  onClick={() => setView('switch')}
                  className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-[#383838] hover:bg-[#282828] text-slate-200'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Users className="w-4 h-4 text-violet-500" />
                  Փոխել կամ ակտիվացնել այլ հաշիվ ({profiles.length})
                </button>

                {/* Export & Import */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={onExportData}
                    className={`py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                      isDark
                        ? 'border-[#333] hover:bg-[#262626] text-slate-300'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                    title="Ներբեռնել պատմությունը JSON ֆորմատով"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Արտահանել
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                      isDark
                        ? 'border-[#333] hover:bg-[#262626] text-slate-300'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                    title="Վերականգնել պատմությունը JSON ֆայլից"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Ներմուծել
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Sign out */}
                <button
                  onClick={() => {
                    onSelectUser(null);
                    onClose();
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer mt-3 ${
                    isDark
                      ? 'text-rose-400 hover:bg-rose-950/30'
                      : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Դուրս գալ հաշվից (Հյուրի ռեժիմ)
                </button>
              </div>
            </div>
          )}

          {/* SWITCH / ACTIVATE: Pick existing profile, search by email/name, or create new */}
          {view === 'switch' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Մուտք գործեք Ձեր էլ․ հասցեով կամ ընտրեք հաշիվը ցանկից՝ անձնական դասերի պատմությունն ակտիվացնելու համար։
              </p>

              {/* Quick Email / Name Activation Input */}
              <form onSubmit={handleQuickActivate} className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Արագ մուտք / Ակտիվացում
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setLookupMessage(null);
                      }}
                      placeholder="Մուտքագրեք էլ. հասցեն կամ անունը..."
                      className={`w-full rounded-xl pl-8 pr-3 py-2 text-xs border outline-none transition-colors ${
                        isDark
                          ? 'bg-[#252525] border-[#383838] text-white focus:border-violet-500'
                          : 'bg-white border-slate-300 text-slate-900 focus:border-violet-600'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white cursor-pointer shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Ակտիվացնել</span>
                  </button>
                </div>

                {lookupMessage && (
                  <div className="p-2.5 rounded-xl text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex flex-col gap-1.5">
                    <span>{lookupMessage}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const isEmail = searchQuery.includes('@');
                        handleStartCreate({
                          name: isEmail ? '' : searchQuery,
                          email: isEmail ? searchQuery : '',
                        });
                      }}
                      className="text-left font-bold underline hover:opacity-80"
                    >
                      + Ստեղծել նոր հաշիվ «{searchQuery}» տվյալով
                    </button>
                  </div>
                )}
              </form>

              {/* Profiles List Header */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Առկա հաշիվներ ({profiles.length})
                </div>

                {/* Profiles List */}
                <div className="space-y-2">
                  {profiles.map((p) => {
                    const isCurrent = currentUser?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          isCurrent
                            ? isDark
                              ? 'bg-violet-950/20 border-violet-500/50 ring-1 ring-violet-500/30'
                              : 'bg-violet-50 border-violet-300 ring-1 ring-violet-300'
                            : isDark
                            ? 'bg-[#252525] border-[#383838] hover:border-slate-600'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div
                          onClick={() => {
                            onSelectUser(p);
                            onClose();
                          }}
                          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                        >
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${
                              p.avatarColor || 'from-blue-500 to-indigo-600'
                            } flex items-center justify-center text-xl shadow-xs shrink-0`}
                          >
                            {p.avatar}
                          </div>
                          <div className="truncate flex-1 min-w-0">
                            <div className="font-bold text-xs flex items-center gap-1.5">
                              <span className="truncate">{p.name}</span>
                              {isCurrent && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {p.email ? `${p.email} · ` : ''}
                              {p.grade || 'Դպրոցական'}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isCurrent ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-500 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Ակտիվ է</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectUser(p);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white cursor-pointer shadow-xs transition-colors flex items-center gap-1"
                              title="Ակտիվացնել այս հաշիվը"
                            >
                              <LogIn className="w-3 h-3" />
                              <span>Ակտիվացնել</span>
                            </button>
                          )}

                          {!isCurrent && profiles.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    `Իսկապե՞ս ցանկանում եք ջնջել «${p.name}» հաշիվը:`
                                  )
                                ) {
                                  onDeleteProfile(p.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                              title="Ջնջել հաշիվը"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add New Profile Button */}
              <button
                onClick={() => handleStartCreate()}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md hover:from-violet-700 hover:to-indigo-700 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Ստեղծել նոր աշակերտական հաշիվ
              </button>

              {/* Guest mode option */}
              <button
                onClick={() => {
                  onSelectUser(null);
                  onClose();
                }}
                className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs text-center border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-[#333] hover:bg-[#262626] text-slate-400 hover:text-slate-200'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                Շարունակել որպես հյուր (առանց հաշվի)
              </button>
            </div>
          )}

          {/* CREATE / EDIT FORM */}
          {(view === 'create' || view === 'edit') && (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold mb-2">
                  Ընտրեք Ձեր ավատարը
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_OPTIONS.map((av) => {
                    const isSelected = formData.avatar === av.emoji;
                    return (
                      <button
                        type="button"
                        key={av.emoji}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            avatar: av.emoji,
                            avatarColor: av.color,
                          })
                        }
                        className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-violet-500 border-violet-500 scale-105 bg-violet-500/10'
                            : isDark
                            ? 'border-[#333] hover:bg-[#272727]'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-2xl">{av.emoji}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-full">
                          {av.emoji === '🎓'
                            ? 'Գիտունիկ'
                            : av.emoji === '🦉'
                            ? 'Բու'
                            : av.emoji === '🚀'
                            ? 'Տիեզերք'
                            : av.emoji === '🔬'
                            ? 'Գիտություն'
                            : av.emoji === '🎨'
                            ? 'Արվեստ'
                            : av.emoji === '💡'
                            ? 'Գաղափար'
                            : av.emoji === '🦁'
                            ? 'Առյուծ'
                            : 'Աստղ'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Անուն և Ազգանուն <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="օր. Աննա Ավագյան"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border outline-none transition-colors ${
                    isDark
                      ? 'bg-[#252525] border-[#383838] text-white focus:border-violet-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-violet-600'
                  }`}
                />
              </div>

              {/* Grade */}
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Դասարան / Կարգավիճակ
                </label>
                <select
                  value={formData.grade || GRADE_OPTIONS[1]}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border outline-none transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-[#252525] border-[#383838] text-white focus:border-violet-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-violet-600'
                  }`}
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option
                      key={g}
                      value={g}
                      className={isDark ? 'bg-[#252525]' : 'bg-white'}
                    >
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Էլ. փոստ
                </label>
                <input
                  type="email"
                  placeholder="annaavagyan34@gmail.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border outline-none transition-colors ${
                    isDark
                      ? 'bg-[#252525] border-[#383838] text-white focus:border-violet-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-violet-600'
                  }`}
                />
              </div>

              {/* School (Optional) */}
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Դպրոց / Ուսումնական հաստատություն (ըստ ցանկության)
                </label>
                <input
                  type="text"
                  placeholder="օր. Երևանի N հիմնական դպրոց"
                  value={formData.school || ''}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border outline-none transition-colors ${
                    isDark
                      ? 'bg-[#252525] border-[#383838] text-white focus:border-violet-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-violet-600'
                  }`}
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView(currentUser ? 'view' : 'switch')}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-xs border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-[#383838] hover:bg-[#282828] text-slate-300'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Չեղարկել
                </button>
                <button
                  type="submit"
                  disabled={!formData.name?.trim()}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-xs bg-violet-600 text-white hover:bg-violet-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {view === 'create' ? 'Ստեղծել և ակտիվացնել' : 'Պահպանել փոփոխությունները'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
