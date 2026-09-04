import React from 'react';
import { 
  Play, 
  RotateCw, 
  Sliders, 
  UploadCloud, 
  Sun, 
  Moon, 
  BookOpen,
  RotateCcw,
  Download,
  Printer,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  PanelLeftOpen,
  PanelLeftClose
} from 'lucide-react';

const PAGE_TITLES = {
  dashboard: { title: 'Executive Dashboard', subtitle: 'Deterministic 3-way multi-source reconciliation metrics' },
  reconciliation: { title: 'Reconciliation Ledger', subtitle: 'Granular line-item matching across orders, payments & settlements' },
  exceptions: { title: 'Exception Operations Center', subtitle: 'Root-cause analysis, variance scoring & AI dispute remediation' },
  copilot: { title: 'AI Financial Copilot', subtitle: 'Natural language settlement Q&A powered by Groq LLaMA-3.3-70b' },
  reports: { title: 'Reconciliation Audit Report', subtitle: 'Executive compliance summary, variance breakdown & sign-off' },
  history: { title: 'Run History', subtitle: 'Persistent SQLite audit trail of past reconciliation batches' },
  guide: { title: 'Platform Guide & How to Use', subtitle: 'Complete 5-step workflow, exception taxonomy & keyboard shortcuts' }
};

export function Header({ 
  activeTab,
  onRunReconciliation, 
  isReconciling, 
  summary, 
  tolerance, 
  health,
  theme = 'dark',
  onToggleTheme,
  onOpenTolerance,
  onOpenUpload,
  onRegenerate,
  onOpenGuide,
  isSidebarCollapsed = false,
  onToggleSidebar
}) {
  const pageMeta = PAGE_TITLES[activeTab] || PAGE_TITLES.dashboard;

  return (
    <header className="h-16 bg-white/95 dark:bg-[#0d1322]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20 transition-all shrink-0 print:hidden">
      
      {/* Dynamic Page Title & Batch Badge */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Quick Sidebar Toggle Trigger if collapsed */}
        {isSidebarCollapsed && (
          <button
            onClick={onToggleSidebar}
            title="Expand sidebar (Press '[')"
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition shadow-2xs shrink-0"
          >
            <PanelLeftOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </button>
        )}

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
              {pageMeta.title}
            </h1>
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
            {summary?.run_id ? `${pageMeta.subtitle} • Batch: ${summary.run_id}` : pageMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Unified Action Toolbar */}
      <div className="flex items-center gap-2.5 shrink-0">
        
        {/* Upload Custom Dataset */}
        <button
          onClick={onOpenUpload}
          title="Upload custom Orders, Payments & Settlements CSV files (Press 'U')"
          className="h-9 flex items-center gap-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-750 transition shadow-2xs active:scale-95"
        >
          <UploadCloud className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="hidden md:inline">Upload CSV</span>
        </button>

        {/* Tolerance Trigger */}
        <button
          onClick={onOpenTolerance}
          title="Adjust deterministic amount tolerance threshold (Press 'T')"
          className="h-9 flex items-center gap-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-750 transition shadow-2xs active:scale-95"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <span className="hidden md:inline">Tolerance:</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            ₹{Number(tolerance).toFixed(2)}
          </span>
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 hidden sm:block" />

        {/* Icon Action Group */}
        <div className="flex items-center gap-0.5 bg-slate-100/80 dark:bg-slate-900/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800">
          
          {/* Guide / How to Use */}
          <button
            onClick={onOpenGuide}
            title="User Guide & Keyboard Shortcuts (Press '?')"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>

          {/* Regenerate Synthetic Dataset */}
          <button
            onClick={onRegenerate}
            disabled={isReconciling}
            title="Regenerate clean 120-record demo dataset"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
            )}
          </button>
        </div>

        {/* Primary Action Button: Run Reconciliation */}
        <button
          onClick={() => onRunReconciliation(tolerance, false)}
          disabled={isReconciling}
          className="h-9 flex items-center gap-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-normal transition-all shadow-sm hover:shadow-md hover:shadow-emerald-500/20 border border-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shrink-0"
        >
          {isReconciling ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Reconciling...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span>Run Reconciliation</span>
            </>
          )}
        </button>

      </div>
    </header>
  );
}
