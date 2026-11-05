import React from 'react';
import {
  Sparkles,
  Calculator,
  BookOpen,
  Landmark,
  Atom,
  FlaskConical,
  Dna,
  Globe2,
  Code2,
  Languages,
} from 'lucide-react';
import { SubjectType, ThemeMode } from '../types';
import { SUBJECTS } from '../data/subjects';

interface SubjectSelectorProps {
  selectedSubject: SubjectType;
  onSelectSubject: (subject: SubjectType) => void;
  theme: ThemeMode;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  selectedSubject,
  onSelectSubject,
  theme,
}) => {
  const isDark = theme === 'dark';

  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Calculator':
        return <Calculator className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Landmark':
        return <Landmark className={className} />;
      case 'Atom':
        return <Atom className={className} />;
      case 'FlaskConical':
        return <FlaskConical className={className} />;
      case 'Dna':
        return <Dna className={className} />;
      case 'Globe2':
        return <Globe2 className={className} />;
      case 'Code2':
        return <Code2 className={className} />;
      case 'Languages':
        return <Languages className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <div className="w-full px-4 py-2">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
        {SUBJECTS.map((sub) => {
          const isSelected = selectedSubject === sub.id;

          return (
            <button
              key={sub.id}
              onClick={() => onSelectSubject(sub.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs ${
                isSelected
                  ? isDark
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-900/40 ring-2 ring-violet-400/30'
                    : 'bg-violet-600 text-white shadow-md shadow-violet-200 ring-2 ring-violet-300'
                  : isDark
                  ? 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
                  : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-violet-50/80 border border-slate-200'
              }`}
            >
              {renderIcon(
                sub.icon,
                `w-3.5 h-3.5 ${
                  isSelected
                    ? 'text-white'
                    : isDark
                    ? 'text-violet-400'
                    : 'text-violet-600'
                }`
              )}
              <span>{sub.shortName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
