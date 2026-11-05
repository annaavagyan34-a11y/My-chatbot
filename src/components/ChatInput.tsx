import React, { useRef, useEffect, useState } from 'react';
import {
  ArrowUp,
  Square,
  ChevronDown,
  Paperclip,
  Compass,
  X,
  Mic,
  MicOff,
  Check,
  AlertCircle,
  Globe,
  RotateCcw,
} from 'lucide-react';
import { SubjectType, ThemeMode } from '../types';
import { SUBJECTS } from '../data/subjects';
import { DictaphoneService } from '../utils/dictaphone';

interface ChatInputProps {
  onSend: (message: string, subject: SubjectType, image?: string) => void;
  onStop?: () => void;
  isLoading: boolean;
  selectedSubject: SubjectType;
  onSelectSubject: (subject: SubjectType) => void;
  disabled?: boolean;
  theme?: ThemeMode;
}

const DICT_LANGUAGES = [
  { code: 'hy-AM', label: 'Հայերեն', flag: '🇦🇲' },
  { code: 'en-US', label: 'English', flag: '🇬🇧' },
  { code: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onStop,
  isLoading,
  selectedSubject,
  onSelectSubject,
  disabled = false,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [dictLang, setDictLang] = useState('hy-AM');

  // Dictaphone recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [dictError, setDictError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const dictaphoneRef = useRef<DictaphoneService | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const baseInputRef = useRef<string>('');

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowSubjectMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize Dictaphone service
  useEffect(() => {
    dictaphoneRef.current = new DictaphoneService();
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      dictaphoneRef.current?.cancel();
    };
  }, []);

  // Handle timer for recording
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setRecordingSeconds(0);
      setAudioLevel(0);
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  const startDictation = async (clearExisting = true) => {
    setDictError(null);

    // If starting a new dictation, clear previous input so new speech starts fresh
    if (clearExisting) {
      setInput('');
      baseInputRef.current = '';
    } else {
      baseInputRef.current = input.trim();
    }

    if (!dictaphoneRef.current) {
      dictaphoneRef.current = new DictaphoneService();
    }

    const success = await dictaphoneRef.current.start(
      {
        onStart: () => {
          setIsRecording(true);
        },
        onTranscript: (transcript) => {
          if (baseInputRef.current) {
            setInput(`${baseInputRef.current} ${transcript}`);
          } else {
            setInput(transcript);
          }
        },
        onAudioLevel: (lvl) => {
          setAudioLevel(lvl);
        },
        onError: (errMsg) => {
          setDictError(errMsg);
          setIsRecording(false);
        },
        onEnd: () => {
          setIsRecording(false);
        },
      },
      dictLang
    );

    if (!success) {
      setIsRecording(false);
    }
  };

  const stopDictation = () => {
    dictaphoneRef.current?.stop();
    setIsRecording(false);
  };

  const cancelDictation = () => {
    dictaphoneRef.current?.cancel();
    setIsRecording(false);
    setInput('');
    baseInputRef.current = '';
  };

  const restartDictation = () => {
    dictaphoneRef.current?.cancel();
    setIsRecording(false);
    setRecordingSeconds(0);
    setInput('');
    baseInputRef.current = '';
    setTimeout(() => {
      startDictation(true);
    }, 120);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopDictation();
    } else {
      // Start a completely fresh voice recording
      startDictation(true);
    }
  };

  // Handle image paste from clipboard (e.g. screenshot)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setAttachedImage(event.target.result as string);
            }
          };
          reader.readAsDataURL(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isRecording) {
      stopDictation();
    }
    if ((!input.trim() && !attachedImage) || isLoading || disabled) return;
    onSend(input.trim(), selectedSubject, attachedImage || undefined);
    setInput('');
    baseInputRef.current = '';
    setAttachedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSubjectObj =
    SUBJECTS.find((s) => s.id === selectedSubject) || SUBJECTS[0];
  const activeLangObj =
    DICT_LANGUAGES.find((l) => l.code === dictLang) || DICT_LANGUAGES[0];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Dictaphone error toast notification */}
      {dictError && (
        <div
          className={`mb-2 px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 border animate-fadeIn ${
            isDark
              ? 'bg-rose-950/40 text-rose-200 border-rose-800/60'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{dictError}</span>
          </div>
          <button
            type="button"
            onClick={() => setDictError(null)}
            className="p-1 rounded-full hover:bg-rose-200/40 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ChatGPT Floating Pill Capsule Input */}
      <div
        className={`relative rounded-[26px] border shadow-xs transition-all duration-200 ${
          isRecording
            ? isDark
              ? 'bg-[#29222c] border-rose-500/60 ring-2 ring-rose-500/20'
              : 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-400/20'
            : isDark
            ? 'bg-[#2f2f2f] border-[#383838] focus-within:border-slate-500'
            : 'bg-[#f4f4f4] border-[#e5e5e5] focus-within:border-slate-400 focus-within:bg-white'
        }`}
      >
        {/* Attached Image Preview Thumbnail */}
        {attachedImage && (
          <div className="px-4 pt-3 flex items-center gap-2">
            <div className="relative group/img inline-block">
              <img
                src={attachedImage}
                alt="Attached homework"
                className="w-16 h-16 object-cover rounded-xl border border-slate-300 dark:border-slate-600 shadow-xs"
              />
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer shadow-sm"
                title="Հեռացնել նկարը"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="text-xs text-slate-500">
              <span className="font-semibold block text-slate-700 dark:text-slate-300">
                Կցված նկար
              </span>
              <span>EduAI-ն կվերլուծի այն</span>
            </div>
          </div>
        )}

        {/* Live Dictaphone Recording Banner when active */}
        {isRecording && (
          <div
            className={`mx-3 mt-2.5 px-3 py-2 rounded-xl flex items-center justify-between border ${
              isDark
                ? 'bg-[#1e1b24] border-rose-900/50 text-rose-200'
                : 'bg-white border-rose-200 text-rose-900 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Blinking red recording dot */}
              <div className="relative flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute opacity-75" />
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 relative" />
              </div>

              {/* Status and timer */}
              <div className="text-xs flex items-center gap-2 font-medium">
                <span className="font-semibold">Դիկտոֆոն՝ խոսեք</span>
                <span className="font-mono bg-rose-500/10 dark:bg-rose-500/20 px-1.5 py-0.5 rounded text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  {formatTimer(recordingSeconds)}
                </span>
              </div>

              {/* Dynamic Sound Wave Bars */}
              <div className="flex items-end gap-0.5 h-4 px-1">
                {[0.4, 0.9, 0.6, 1.0, 0.7, 0.5, 0.8, 0.3].map((multiplier, idx) => {
                  const dynamicHeight = Math.max(
                    3,
                    Math.min(16, (audioLevel * 16 * multiplier) + 3)
                  );
                  return (
                    <span
                      key={idx}
                      className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                      style={{ height: `${dynamicHeight}px` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Dictaphone Action buttons: Restart, Cancel, Finish */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={restartDictation}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg hover:bg-rose-500/10 text-slate-500 dark:text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                title="Սկսել նորից (մաքրել և ձայնագրել)"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Նորից</span>
              </button>
              <button
                type="button"
                onClick={cancelDictation}
                className="px-2 py-1 text-xs rounded-lg hover:bg-rose-500/10 text-slate-500 dark:text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                title="Չեղարկել ձայնագրությունը"
              >
                Չեղարկել
              </button>
              <button
                type="button"
                onClick={stopDictation}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-xs transition-colors"
                title="Ավարտել և պահպանել տեքստը"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Ավարտել</span>
              </button>
            </div>
          </div>
        )}

        {/* Input Textarea Area */}
        <div className="pt-3 px-4 pb-2 relative flex items-start">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              isRecording
                ? 'Խոսեք, EduAI-ն գրի է առնում Ձեր ձայնը...'
                : attachedImage
                ? 'Ավելացրու հարցդ կցված նկարի վերաբերյալ (կամ սեղմիր Ուղարկել)...'
                : selectedSubject === 'all'
                ? 'Հարցրու EduAI-ին, միացրու դիկտոֆոնը կամ կցիր նկար...'
                : `${currentSubjectObj.name}՝ գրիր հարցդ, խոսիր կամ կցիր նկար...`
            }
            disabled={disabled}
            className={`w-full bg-transparent text-[15px] resize-none outline-none leading-relaxed max-h-48 font-sans ${
              input.length > 0 && !isRecording ? 'pr-7' : ''
            } ${
              isDark
                ? 'text-[#ececec] placeholder-slate-400'
                : 'text-[#0d0d0d] placeholder-slate-500'
            }`}
          />
          {input.length > 0 && !isRecording && (
            <button
              type="button"
              onClick={() => {
                setInput('');
                baseInputRef.current = '';
                if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto';
                }
              }}
              className="absolute right-3.5 top-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
              title="Մաքրել տեքստը"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Bottom toolbar inside ChatGPT capsule */}
        <div className="px-3 pb-2.5 flex items-center justify-between gap-2">
          {/* Left tools: Attach Image + Subject selector + Language */}
          <div className="relative flex items-center gap-1.5" ref={menuRef}>
            {/* Paperclip Button for attaching photos/homework */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-1.5 rounded-full border transition-colors cursor-pointer flex items-center justify-center ${
                attachedImage
                  ? 'bg-violet-600 text-white border-violet-600'
                  : isDark
                  ? 'bg-[#212121] hover:bg-[#383838] text-slate-300 border-[#3c3c3c]'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-[#e0e0e0]'
              }`}
              title="Կցել նկար (դասագիրք, տետր, խնդիր)"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </button>

            {/* Subject Selector Capsule */}
            <button
              type="button"
              onClick={() => setShowSubjectMenu(!showSubjectMenu)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#212121] hover:bg-[#383838] text-slate-300 border-[#3c3c3c]'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-[#e0e0e0]'
              }`}
              title="Փոխել առարկայական շեշտադրումը"
            >
              <Compass className="w-3.5 h-3.5 text-violet-500" />
              <span>{currentSubjectObj.shortName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {/* Voice Dictaphone Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-[#212121] hover:bg-[#383838] text-slate-300 border-[#3c3c3c]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-[#e0e0e0]'
                }`}
                title="Դիկտոֆոնի լեզուն"
              >
                <span>{activeLangObj.flag}</span>
                <span className="hidden sm:inline text-[11px]">{activeLangObj.label}</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>

              {showLangMenu && (
                <div
                  className={`absolute left-0 bottom-full mb-2 w-44 rounded-2xl shadow-xl z-50 py-1.5 border backdrop-blur-md ${
                    isDark
                      ? 'bg-[#212121] border-[#383838] text-slate-200'
                      : 'bg-white border-[#e5e5e5] text-slate-800'
                  }`}
                >
                  <div
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Խոսափողի լեզու
                  </div>
                  {DICT_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setDictLang(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        dictLang === lang.code
                          ? isDark
                            ? 'text-rose-300 bg-rose-950/40 font-bold'
                            : 'text-rose-900 bg-rose-50 font-bold'
                          : isDark
                          ? 'text-slate-300 hover:bg-[#2f2f2f]'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {dictLang === lang.code && (
                        <span className="text-rose-500 text-xs font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subject Selector Dropdown */}
            {showSubjectMenu && (
              <div
                className={`absolute left-0 bottom-full mb-2 w-64 rounded-2xl shadow-xl z-50 py-1.5 border backdrop-blur-md max-h-72 overflow-y-auto ${
                  isDark
                    ? 'bg-[#212121] border-[#383838] text-slate-200'
                    : 'bg-white border-[#e5e5e5] text-slate-800'
                }`}
              >
                <div
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Ընտրիր առարկան
                </div>
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      onSelectSubject(sub.id);
                      setShowSubjectMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      selectedSubject === sub.id
                        ? isDark
                          ? 'text-violet-300 bg-violet-950/40 font-bold'
                          : 'text-violet-900 bg-violet-50 font-bold'
                        : isDark
                        ? 'text-slate-300 hover:bg-[#2f2f2f]'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{sub.name}</span>
                    {selectedSubject === sub.id && (
                      <span className="text-violet-500 text-xs font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action: Dictaphone Button + Send/Stop Button */}
          <div className="flex items-center gap-1.5">
            {/* Dictaphone Microphone Trigger Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 cursor-pointer shadow-xs ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400 shadow-md scale-105'
                  : isDark
                  ? 'bg-[#212121] text-slate-300 hover:text-white hover:bg-[#383838] border border-[#3c3c3c]'
                  : 'bg-white text-slate-700 hover:text-black hover:bg-slate-100 border border-[#e0e0e0]'
              }`}
              title={
                isRecording
                  ? 'Անջատել դիկտոֆոնը'
                  : `Դիկտոֆոն (ձայնագրիչ)՝ խոսել ${activeLangObj.label}ով`
              }
            >
              {isRecording ? (
                <Square className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* ChatGPT Send Circle Button */}
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-transform active:scale-95 cursor-pointer shadow-xs ${
                  isDark
                    ? 'bg-white text-black hover:opacity-90'
                    : 'bg-black text-white hover:opacity-85'
                }`}
                title="Դադարեցնել"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={(!input.trim() && !attachedImage) || disabled}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150 cursor-pointer shadow-xs ${
                  (input.trim() || attachedImage) && !disabled
                    ? isDark
                      ? 'bg-white text-black hover:opacity-90 active:scale-95'
                      : 'bg-black text-white hover:opacity-85 active:scale-95'
                    : isDark
                    ? 'bg-[#383838] text-slate-500 cursor-not-allowed'
                    : 'bg-[#e5e5e5] text-slate-400 cursor-not-allowed'
                }`}
                title="Ուղարկել"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ChatGPT Signature Fine-print Disclaimer */}
      <div
        className={`text-center mt-2.5 text-[11px] font-normal flex items-center justify-center gap-1.5 ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}
      >
        <span>EduAI-ն կարող է թույլ տալ սխալներ։ Ստուգեք կարևոր տեղեկությունները։</span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline text-violet-600 dark:text-violet-400 font-medium">
          🎙️ Դիկտոֆոնն ակտիվ է
        </span>
      </div>
    </div>
  );
};
