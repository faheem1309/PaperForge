import React from 'react';
import { Printer, Code2, Sparkles, BookOpen } from 'lucide-react';

interface TopBarProps {
  activeTab: 'editor' | 'preview' | 'bank';
  onSelectTab: (tab: 'editor' | 'preview' | 'bank') => void;
  onOpenFlutterCode: () => void;
  onPrint: () => void;
  viewportMode: 'desktop' | 'mobile';
  onToggleViewport: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenFlutterCode,
  onPrint,
  viewportMode,
  onToggleViewport,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 w-full bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Zone 1: Single text wordmark */}
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold tracking-tight text-slate-900 font-sans-ui whitespace-nowrap">
          PaperForge Studio™
        </span>
        <button
          type="button"
          onClick={onToggleViewport}
          className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          title="Toggle between Desktop Dual-Pane & Mobile 4-Step Wizard viewports"
        >
          {viewportMode === 'desktop' ? '🖥 Desktop Dual-Pane' : '📱 Mobile Wizard'}
        </button>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-1 sm:gap-4 text-xs font-medium text-slate-600">
        <button
          type="button"
          onClick={() => onSelectTab('editor')}
          className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'editor'
              ? 'text-indigo-600 bg-indigo-50 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          Blueprint Studio
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('bank')}
          className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'bank'
              ? 'text-indigo-600 bg-indigo-50 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          Question Bank
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('preview')}
          className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'preview'
              ? 'text-indigo-600 bg-indigo-50 font-semibold'
              : 'hover:text-slate-900'
          }`}
        >
          A4 Print Engine
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenFlutterCode}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Flutter Code</span>
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / PDF</span>
        </button>
      </div>
    </header>
  );
};
