import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader2, Sparkles, Database, FileSearch, ShieldAlert, Cpu } from 'lucide-react';

const STAGES = [
  { label: 'Running Finance Controller...', icon: Cpu },
  { label: 'Normalizing records across Orders, Payments & Settlements...', icon: Database },
  { label: 'Matching transactions (3-way deterministic evaluation)...', icon: FileSearch },
  { label: 'Detecting exceptions & evaluating severity...', icon: ShieldAlert },
  { label: 'Calculating ground-truth accuracy & measured throughput...', icon: Sparkles },
  { label: 'Generating reconciliation summary...', icon: CheckCircle },
];

export function ReconciliationLoader({ isOpen, onComplete }) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStage(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 280);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">AI Finance Controller</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Closing reconciliation loop across financial records</p>
          </div>
        </div>

        {/* Stages List */}
        <div className="space-y-3">
          {STAGES.map((st, index) => {
            const Icon = st.icon;
            const isDone = index < currentStage;
            const isCurrent = index === currentStage;
            const isPending = index > currentStage;

            return (
              <div 
                key={index}
                className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs transition-all ${
                  isCurrent 
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium scale-[1.02]' 
                    : isDone 
                    ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400' 
                    : 'bg-transparent border-transparent text-slate-400 dark:text-slate-600'
                }`}
              >
                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                  )}
                </div>
                <span className="truncate">{st.label}</span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out shadow-sm shadow-emerald-500/50"
              style={{ width: `${((currentStage + 1) / STAGES.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span>Stage {currentStage + 1} of {STAGES.length}</span>
            <span>{Math.round(((currentStage + 1) / STAGES.length) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
