import React, { useState, useEffect } from 'react';
import { X, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';

export function ToleranceModal({ isOpen, onClose, currentTolerance, onApplyTolerance }) {
  const [val, setVal] = useState(currentTolerance || 10.0);
  const presets = [2.00, 5.00, 10.00, 25.00, 50.00];

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyTolerance(parseFloat(val) || 0.0);
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Configure Amount Tolerance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Deterministic auto-match threshold</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Variance between expected order amount and settled amount within this threshold is classified as <span className="text-blue-600 dark:text-blue-400 font-semibold font-mono">MATCHED_WITH_TOLERANCE</span> and automatically approved.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1.5">
              Tolerance Amount (INR ₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 dark:text-slate-400 font-mono text-sm">₹</span>
              <input
                type="number"
                step="0.5"
                min="0"
                max="1000"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-4 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Quick Presets
            </label>
            <div className="flex items-center gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setVal(p)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-medium border transition ${
                    parseFloat(val) === p 
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40 font-bold' 
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  ₹{p.toFixed(0)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-400">
            <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>Changing tolerance re-evaluates all records dynamically with zero LLM dependence.</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
          >
            Apply & Reconcile
          </button>
        </div>
      </div>
    </div>
  );
}
