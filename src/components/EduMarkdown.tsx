import React, { useState } from 'react';
import { Check, Copy, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';
import { ThemeMode } from '../types';

interface EduMarkdownProps {
  content: string;
  onExplorePrompt?: (prompt: string) => void;
  theme?: ThemeMode;
}

export const EduMarkdown: React.FC<EduMarkdownProps> = ({
  content,
  onExplorePrompt,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';
  let codeBlockCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block check
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.trim().replace('```', '') || 'code';
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        const codeText = codeBuffer.join('\n');
        const currentIndex = codeBlockCounter++;
        elements.push(
          <div
            key={`code-${currentIndex}`}
            className="my-3 rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900 shadow-md"
          >
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-mono uppercase tracking-wider text-violet-300 font-bold">
                {codeLanguage || 'ԲԱՆԱՁԵՎ / ԿՈԴ'}
              </span>
              <button
                onClick={() => copyToClipboard(codeText, currentIndex)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Պատճենել"
              >
                {copiedCodeIndex === currentIndex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-semibold">Պատճենված է</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Պատճենել</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-sm text-purple-100 font-mono leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Step Header Detection (e.g., ### 📌 Քայլ 1, Քայլ 1:, Step 1)
    if (/^###?\s+(📌|🔢|🎯|✅|🏆|💡)?\s*(Քայլ\s*\d+|Step\s*\d+|Կանոն\s*\d+|Փուլ\s*\d+)/i.test(line)) {
      elements.push(
        <div
          key={`step-header-${i}`}
          className={`mt-5 mb-2.5 flex items-center gap-2.5 p-2 px-3.5 rounded-xl border-l-4 border-violet-500 shadow-xs ${
            isDark
              ? 'bg-gradient-to-r from-violet-950/60 via-indigo-950/40 to-transparent text-violet-200'
              : 'bg-gradient-to-r from-violet-100 via-indigo-50/70 to-transparent text-violet-950'
          }`}
        >
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold shadow-xs">
            ★
          </span>
          <span className="font-bold text-base">
            {line.replace(/^###?\s+/, '')}
          </span>
        </div>
      );
      continue;
    }

    // General Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className={`text-base font-bold mt-4 mb-2 flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {formatInline(line.replace('### ', ''), isDark)}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className={`text-lg font-bold mt-5 mb-2 pb-1 border-b ${
            isDark
              ? 'text-violet-300 border-slate-800'
              : 'text-violet-900 border-slate-200'
          }`}
        >
          {formatInline(line.replace('## ', ''), isDark)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1
          key={`h1-${i}`}
          className={`text-xl font-extrabold mt-6 mb-3 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {formatInline(line.replace('# ', ''), isDark)}
        </h1>
      );
      continue;
    }

    // Divider
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(
        <hr
          key={`hr-${i}`}
          className={`my-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
        />
      );
      continue;
    }

    // Blockquote or Tip callout (> 💡)
    if (line.startsWith('>')) {
      const quoteText = line.replace(/^>\s?/, '');
      elements.push(
        <div
          key={`quote-${i}`}
          className={`my-3 p-3 rounded-2xl border text-sm italic flex items-start gap-2.5 leading-relaxed ${
            isDark
              ? 'bg-violet-950/40 border-violet-800/40 text-violet-200'
              : 'bg-violet-50/90 border-violet-200 text-violet-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
          <div className="flex-1 font-medium">{formatInline(quoteText, isDark)}</div>
        </div>
      );
      continue;
    }

    // Interactive practice prompt suggestion at the end (e.g. 🎯 Փորձիր ինքդ)
    if (line.includes('🎯') && line.includes('Փորձի')) {
      elements.push(
        <div
          key={`practice-${i}`}
          className={`my-4 p-4 rounded-2xl border text-sm shadow-xs ${
            isDark
              ? 'bg-gradient-to-r from-violet-950/50 via-slate-900/80 to-violet-950/50 border-violet-700/50 text-slate-200'
              : 'bg-gradient-to-r from-violet-50 via-indigo-50/40 to-purple-50 border-violet-200/90 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1.5 text-violet-500">
            <HelpCircle className="w-4 h-4" />
            <span>Ամրապնդման առաջադրանք</span>
          </div>
          <p className="leading-relaxed mb-3">
            {formatInline(line, isDark)}
          </p>
          {onExplorePrompt && (
            <button
              onClick={() => onExplorePrompt(line.replace(/^[🎯✨*\s]+/, ''))}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-sm transition-all duration-150 cursor-pointer active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Լուծել միասին
            </button>
          )}
        </div>
      );
      continue;
    }

    // Unordered List
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletText = line.trim().replace(/^[-*]\s+/, '');
      elements.push(
        <li
          key={`li-${i}`}
          className={`ml-5 list-disc my-1 leading-relaxed text-[15px] ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}
        >
          {formatInline(bulletText, isDark)}
        </li>
      );
      continue;
    }

    // Numbered list (e.g., 1. or 2.)
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div
          key={`num-${i}`}
          className={`flex items-start gap-2.5 my-1.5 ml-1 text-[15px] leading-relaxed ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}
        >
          <span
            className={`shrink-0 w-5 h-5 rounded-md font-mono text-xs flex items-center justify-center font-bold border ${
              isDark
                ? 'bg-slate-800 text-violet-300 border-slate-700'
                : 'bg-slate-100 text-violet-700 border-slate-200'
            }`}
          >
            {numMatch[1]}
          </span>
          <div className="flex-1">{formatInline(numMatch[2], isDark)}</div>
        </div>
      );
      continue;
    }

    // Final answer highlight
    if (line.includes('✅') || line.toLowerCase().includes('վերջնական պատասխան')) {
      elements.push(
        <div
          key={`answer-${i}`}
          className={`my-3 p-3.5 rounded-2xl border text-sm flex items-start gap-2.5 font-medium ${
            isDark
              ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
          <div className="flex-1 font-semibold">{formatInline(line, isDark)}</div>
        </div>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Standard paragraph
    elements.push(
      <p
        key={`p-${i}`}
        className={`leading-relaxed text-[15px] my-1.5 ${
          isDark ? 'text-slate-200' : 'text-slate-800'
        }`}
      >
        {formatInline(line, isDark)}
      </p>
    );
  }

  return <div className="space-y-1 font-sans">{elements}</div>;
};

// Inline Markdown Parser helper
function formatInline(text: string, isDark: boolean = false): React.ReactNode {
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const codeContent = part.slice(1, -1);
      return (
        <code
          key={`code-inline-${index}`}
          className={`px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-[13px] font-semibold border ${
            isDark
              ? 'bg-slate-800 text-violet-300 border-violet-800/40'
              : 'bg-violet-100/80 text-violet-900 border-violet-200'
          }`}
        >
          {codeContent}
        </code>
      );
    }

    // Handle **bold**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={`bold-wrap-${index}`}>
        {boldParts.map((bPart, bIndex) => {
          if (bPart.startsWith('**') && bPart.endsWith('**') && bPart.length > 4) {
            const boldContent = bPart.slice(2, -2);
            return (
              <strong
                key={`b-${bIndex}`}
                className={`font-bold tracking-wide ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {boldContent}
              </strong>
            );
          }

          // Handle *italic*
          const italicParts = bPart.split(/(\*[^*]+\*)/g);
          return (
            <span key={`i-wrap-${bIndex}`}>
              {italicParts.map((iPart, iIndex) => {
                if (iPart.startsWith('*') && iPart.endsWith('*') && iPart.length > 2) {
                  return (
                    <em
                      key={`i-${iIndex}`}
                      className={`italic ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                    >
                      {iPart.slice(1, -1)}
                    </em>
                  );
                }
                return iPart;
              })}
            </span>
          );
        })}
      </span>
    );
  });
}
