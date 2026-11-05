import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  BookOpenCheck,
  X,
  Maximize2,
} from 'lucide-react';
import { Message, ThemeMode } from '../types';
import { EduMarkdown } from './EduMarkdown';
import { SpeechService } from '../utils/speech';

interface ChatMessageProps {
  message: Message;
  turnNumber?: number;
  onQuickAction?: (actionPrompt: string) => void;
  onRegenerate?: () => void;
  isLastAssistantMessage?: boolean;
  theme?: ThemeMode;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  turnNumber,
  onQuickAction,
  onRegenerate,
  isLastAssistantMessage = false,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      SpeechService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      SpeechService.speak(
        message.content,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  // ChatGPT USER MESSAGE: right-aligned clean bubble with optional attached image
  if (isUser) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-3 flex justify-end">
        <div className="flex flex-col items-end max-w-[85%] md:max-w-[75%]">
          {/* Attached image preview inside user message */}
          {message.image && (
            <div className="relative mb-2 group/msgimg cursor-pointer">
              <img
                src={message.image}
                alt="Կցված նկար"
                onClick={() => setIsImageModalOpen(true)}
                className="max-h-60 max-w-full rounded-2xl object-cover border border-slate-300 dark:border-slate-700 shadow-xs hover:opacity-95 transition-opacity"
              />
              <button
                type="button"
                onClick={() => setIsImageModalOpen(true)}
                className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover/msgimg:opacity-100 transition-opacity"
                title="Մեծացնել նկարը"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* User Text Bubble */}
          {message.content && (
            <div
              className={`rounded-[22px] px-4.5 py-2.5 text-[15px] leading-relaxed shadow-2xs font-sans whitespace-pre-wrap break-words ${
                isDark
                  ? 'bg-[#2f2f2f] text-[#ececec]'
                  : 'bg-[#f4f4f4] text-[#0d0d0d]'
              }`}
            >
              {message.content}
            </div>
          )}

          {turnNumber !== undefined && (
            <span
              className={`text-[10px] mt-1 mr-2 font-medium ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Հարց #{turnNumber}
            </span>
          )}
        </div>

        {/* Modal for full screen image view */}
        {isImageModalOpen && message.image && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setIsImageModalOpen(false)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={message.image}
                alt="Full preview"
                className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
              />
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                title="Փակել"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ChatGPT ASSISTANT MESSAGE
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4 group">
      <div className="flex items-start gap-3 md:gap-4">
        {/* ChatGPT Style EduAI Avatar */}
        <div className="shrink-0 mt-0.5">
          <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Message body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`font-bold text-sm tracking-tight ${
                isDark ? 'text-[#ececec]' : 'text-[#0d0d0d]'
              }`}
            >
              EduAI
            </span>
            {turnNumber !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${
                  isDark
                    ? 'bg-[#2f2f2f] text-slate-400'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                #{turnNumber}
              </span>
            )}
          </div>

          {/* Assistant content */}
          <div
            className={`leading-relaxed text-[15px] font-sans ${
              isDark ? 'text-[#ececec]' : 'text-[#0d0d0d]'
            }`}
          >
            <EduMarkdown
              content={message.content}
              onExplorePrompt={onQuickAction}
              theme={theme}
            />

            {message.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-violet-500 animate-pulse rounded-xs align-middle" />
            )}
          </div>

          {/* ChatGPT Action Buttons Bar */}
          {!message.isStreaming && message.content && (
            <div className="mt-3 pt-1 flex flex-wrap items-center justify-between gap-2">
              {/* Quick continuation pills */}
              {isLastAssistantMessage && onQuickAction && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button
                    onClick={() =>
                      onQuickAction('Խնդրում եմ բացատրիր սա ավելի պարզ և մատչելի լեզվով։')
                    }
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      isDark
                        ? 'border-[#383838] bg-[#212121] text-slate-300 hover:bg-[#2f2f2f]'
                        : 'border-[#e5e5e5] bg-white text-slate-600 hover:bg-[#f4f4f4]'
                    }`}
                  >
                    💡 Ավելի պարզ
                  </button>
                  <button
                    onClick={() =>
                      onQuickAction('Տո՛ւր ևս մեկ նմանատիպ օրինակ կամ խնդիր՝ լուծումով։')
                    }
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      isDark
                        ? 'border-[#383838] bg-[#212121] text-slate-300 hover:bg-[#2f2f2f]'
                        : 'border-[#e5e5e5] bg-white text-slate-600 hover:bg-[#f4f4f4]'
                    }`}
                  >
                    📝 Նոր օրինակ
                  </button>
                  <button
                    onClick={() =>
                      onQuickAction('Կազմիր 3 ստուգիչ հարց այս թեմայից, որպեսզի ստուգեմ գիտելիքներս։')
                    }
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                      isDark
                        ? 'border-[#383838] bg-[#212121] text-slate-300 hover:bg-[#2f2f2f]'
                        : 'border-[#e5e5e5] bg-white text-slate-600 hover:bg-[#f4f4f4]'
                    }`}
                  >
                    <BookOpenCheck className="w-3 h-3 text-violet-500" />
                    Ստուգիչ թեստ
                  </button>
                </div>
              )}

              {/* Utility buttons */}
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={handleSpeak}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isSpeaking
                      ? 'text-violet-500 bg-violet-500/10'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-[#2f2f2f]'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title={isSpeaking ? 'Դադարեցնել' : 'Կարդալ բարձրաձայն'}
                >
                  {isSpeaking ? (
                    <VolumeX className="w-3.5 h-3.5 text-violet-500 animate-pulse" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={handleCopy}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-[#2f2f2f]'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Պատճենել"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {onRegenerate && isLastAssistantMessage && (
                  <button
                    onClick={onRegenerate}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-[#2f2f2f]'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Վերաշարադրել"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    feedback === 'up'
                      ? 'text-emerald-500'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-[#2f2f2f]'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Լավ պատասխան"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    feedback === 'down'
                      ? 'text-rose-500'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-[#2f2f2f]'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Վատ պատասխան"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
