import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  /** Tailwind spacing classes for the content block (e.g. "space-y-1") */
  contentClassName?: string;
  children: React.ReactNode;
}

/**
 * Shared collapsible section used by the parameter panels.
 * Renders the card shell, clickable header with chevron, and content body.
 */
export const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  isOpen,
  onToggle,
  contentClassName = 'space-y-2',
  children,
}) => {
  return (
    <div className="bg-slate-950/40 rounded border border-white/5 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full px-3 py-2 flex items-center justify-between text-xs font-sans font-medium text-slate-200 hover:text-white hover:bg-slate-800/40 transition-colors"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>
      {isOpen && (
        <div className={`px-3 pb-3 pt-1 border-t border-white/5 ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};
