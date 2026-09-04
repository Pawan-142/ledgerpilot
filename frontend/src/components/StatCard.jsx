import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default',
  highlight = false,
  onClick
}) {
  const variantStyles = {
    default: 'border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0e1424]/90 text-slate-900 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700',
    emerald: 'border-emerald-200/80 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 hover:border-emerald-400/50',
    blue: 'border-blue-200/80 dark:border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 hover:border-blue-400/50',
    amber: 'border-amber-200/80 dark:border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 hover:border-amber-400/50',
    purple: 'border-purple-200/80 dark:border-purple-500/30 bg-purple-50/40 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 hover:border-purple-400/50',
    rose: 'border-rose-200/80 dark:border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 hover:border-rose-400/50',
  };

  const topGradients = {
    default: 'from-slate-400/40 via-slate-300/20 to-transparent',
    emerald: 'from-emerald-500/60 via-emerald-400/30 to-transparent',
    blue: 'from-blue-500/60 via-blue-400/30 to-transparent',
    amber: 'from-amber-500/60 via-amber-400/30 to-transparent',
    purple: 'from-purple-500/60 via-purple-400/30 to-transparent',
    rose: 'from-rose-500/60 via-rose-400/30 to-transparent',
  };

  const iconStyles = {
    default: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-sm shadow-purple-500/10',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-500/10',
  };

  return (
    <div 
      onClick={onClick}
      className={`p-5 rounded-2xl border ${variantStyles[variant]} backdrop-blur-md transition-all duration-200 relative overflow-hidden group shadow-sm hover:shadow-xl ${onClick ? 'cursor-pointer' : ''} card-lift`}
    >
      {/* Subtle Top Accent Shimmer Line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${topGradients[variant]} opacity-70 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {value}
            </span>
          </div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${iconStyles[variant]} transition-transform duration-200 group-hover:scale-110 shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="truncate font-medium">{subtitle}</span>
        {trend && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 shrink-0 shadow-xs">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
