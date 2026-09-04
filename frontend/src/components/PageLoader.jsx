import React from 'react';
import { Loader2, Sparkles, Cpu, Layers } from 'lucide-react';

export function PageLoader({ text = "Loading financial operations data...", subtitle = "Syncing deterministic ledger & AI intelligence layer" }) {
  return (
    <div className="py-24 px-4 flex flex-col items-center justify-center space-y-4 animate-fade-in-up min-h-[400px]">
      <div className="relative flex items-center justify-center">
        {/* Ambient background glow */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 dark:bg-emerald-500/10 blur-xl absolute animate-pulse"></div>
        
        {/* Center Icon Card */}
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-lg relative z-10">
          <Loader2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-spin" />
        </div>
      </div>

      <div className="text-center space-y-1">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-sans tracking-tight">
          {text}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {subtitle}
        </p>
      </div>

      {/* Mini Shimmer Progress Line */}
      <div className="w-48 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative mt-2">
        <div className="w-20 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full absolute animate-[shimmerWave_1.5s_infinite_linear]"></div>
      </div>
    </div>
  );
}

export function TopProgressBar({ loading }) {
  if (!loading) return null;
  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden bg-slate-200 dark:bg-slate-900">
      <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 animate-[shimmerWave_1.2s_infinite_linear] w-full origin-left scale-x-100 transition-all duration-300"></div>
    </div>
  );
}
