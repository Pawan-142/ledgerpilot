import React from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  CalendarClock, 
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';

const STATUS_CONFIGS = {
  MATCHED: {
    label: 'Matched',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    icon: CheckCircle2
  },
  MATCHED_WITH_TOLERANCE: {
    label: 'Tolerance Match',
    bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
    icon: HelpCircle
  },
  AMOUNT_MISMATCH: {
    label: 'Amount Mismatch',
    bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
    icon: AlertTriangle
  },
  MISSING_PAYMENT: {
    label: 'Missing Payment',
    bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-500',
    icon: XCircle
  },
  MISSING_SETTLEMENT: {
    label: 'Missing Settlement',
    bg: 'bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-500/30 text-pink-700 dark:text-pink-400',
    dot: 'bg-pink-500',
    icon: Clock
  },
  DUPLICATE: {
    label: 'Duplicate Charge',
    bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400',
    dot: 'bg-purple-500',
    icon: Copy
  },
  DATE_MISMATCH: {
    label: 'Timing Delta',
    bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400',
    dot: 'bg-indigo-500',
    icon: CalendarClock
  },
  UNRESOLVED: {
    label: 'Unresolved',
    bg: 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    icon: ShieldAlert
  }
};

const SEVERITY_CONFIGS = {
  LOW: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  MEDIUM: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  HIGH: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30',
  CRITICAL: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/40'
};

export function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIGS[status] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-400',
    icon: HelpCircle
  };
  
  const Icon = config.icon;
  const sizeClasses = size === 'xs' 
    ? 'text-[10px] px-2 py-0.5 gap-1 font-semibold' 
    : size === 'lg' 
    ? 'text-sm px-3.5 py-1.5 gap-2 font-bold' 
    : 'text-xs px-2.5 py-1 gap-1.5 font-semibold';

  return (
    <span className={`inline-flex items-center rounded-full border shadow-2xs font-mono transition-colors ${config.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0 animate-pulse`} />
      <Icon className={size === 'xs' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span className="truncate">{config.label}</span>
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const sev = (severity || 'MEDIUM').toUpperCase();
  const style = SEVERITY_CONFIGS[sev] || SEVERITY_CONFIGS.MEDIUM;

  return (
    <span className={`inline-flex items-center text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md border shadow-2xs ${style}`}>
      {sev}
    </span>
  );
}

export function ResolutionBadge({ status }) {
  if (status === 'RESOLVED') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
        <span>Resolved</span>
      </span>
    );
  }
  
  if (status === 'AUTO_RESOLVED') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30">
        <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
        <span>Auto-Resolved</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
      <span>Requires Review</span>
    </span>
  );
}
