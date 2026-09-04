import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  AlertOctagon, 
  Bot, 
  FileText, 
  History, 
  Cpu, 
  Sliders, 
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

import { Logo } from './Logo';

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  health, 
  onOpenTolerance, 
  tolerance = 10.0, 
  isCollapsed = false,
  onToggleCollapse
}) {
  const isGroqActive = Boolean(health?.groq_configured);
  const activeModel = health?.groq_model || 'openai/gpt-oss-120b';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reconciliation', label: 'Reconciliation', icon: Layers },
    { id: 'exceptions', label: 'Exceptions', icon: AlertOctagon },
    { id: 'copilot', label: 'AI Copilot', icon: Bot, badge: isGroqActive ? 'Groq Live' : 'Fallback' },
    { id: 'reports', label: 'Audit Reports', icon: FileText },
    { id: 'history', label: 'Run History', icon: History },
    { id: 'guide', label: 'How to Use', icon: BookOpen, badge: 'Guide' }
  ];

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-18' : 'w-64'
      } bg-white dark:bg-[#0d1322] border-r border-slate-200/90 dark:border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out print:hidden select-none z-30`}
    >
      <div>
        {/* Logo & Collapse Toggle (Aligned with Header at 64px / h-16) */}
        <div className={`h-16 border-b border-slate-200/90 dark:border-slate-800/80 flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          <Logo 
            variant="emerald"
            size="md"
            isCollapsed={isCollapsed}
            showSubtitle={true}
            onClick={() => setActiveTab('dashboard')}
          />

          {/* Minimize / Expand Button */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand sidebar (Press '[')" : "Minimize sidebar (Press '[')"}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className={`p-2.5 space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? `${item.label}${item.badge ? ` (${item.badge})` : ''}` : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 font-bold border-l-2 border-emerald-500 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                    isGroqActive
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/20'
                      : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-500/20'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status & Settings Footer */}
      <div className={`border-t border-slate-200/90 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0a0f1b]/60 transition-all ${isCollapsed ? 'p-2 space-y-2 flex flex-col items-center' : 'p-3.5 space-y-2.5'}`}>
        
        {/* Tolerance Trigger */}
        <button
          onClick={onOpenTolerance}
          title={`Tolerance Rules: ₹${Number(tolerance).toFixed(2)} (Press 'T')`}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'} rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 transition shadow-xs`}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            {!isCollapsed && <span>Tolerance Rules</span>}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">₹{Number(tolerance).toFixed(2)}</span>
          )}
        </button>

        {/* Dynamic Model & API Status Card */}
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> 
                <span>AI Engine</span>
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                isGroqActive 
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30' 
                  : 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
              }`}>
                {isGroqActive ? '● API Live' : '○ Heuristic'}
              </span>
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono truncate">
              {activeModel}
            </div>
          </div>
        ) : (
          <div 
            title={`AI Engine: ${activeModel} (${isGroqActive ? 'Groq API Live' : 'Heuristic'})`}
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-center cursor-pointer"
          >
            <div className="relative">
              <Cpu className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span className={`w-2 h-2 rounded-full absolute -top-1 -right-1 border-2 border-white dark:border-slate-900 ${isGroqActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </div>
          </div>
        )}

        {!isCollapsed && (
          <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 font-mono">
            <span>Razorpay Buildathon</span>
            <span className="text-slate-600 dark:text-slate-400 font-semibold">Track 04</span>
          </div>
        )}
      </div>
    </aside>
  );
}
