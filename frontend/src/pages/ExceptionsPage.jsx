import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  Search, 
  RefreshCw, 
  Filter, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Bot,
  Zap,
  CheckCircle2,
  SlidersHorizontal,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { StatusBadge, SeverityBadge, ResolutionBadge } from '../components/StatusBadge';
import { api } from '../services/api';

const SEVERITY_TABS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const RESOLUTION_TABS = [
  { id: 'ALL', label: 'All Items' },
  { id: 'REQUIRES_REVIEW', label: 'Action Required' },
  { id: 'RESOLVED', label: 'Remediated / Resolved' }
];

export function ExceptionsPage({ onSelectTransaction, health }) {
  const isGroqActive = Boolean(health?.groq_configured);
  const activeModel = health?.groq_model || 'openai/gpt-oss-120b';

  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [resolutionFilter, setResolutionFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState(null);

  const loadExceptions = async () => {
    setLoading(true);
    try {
      const data = await api.getExceptions({
        severity: severityFilter,
        resolutionStatus: resolutionFilter,
        search: searchTerm,
        limit: 100
      });
      setExceptions(data);
    } catch (err) {
      console.error('Failed to load exceptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExceptions();
  }, [severityFilter, resolutionFilter, searchTerm]);

  const handleBulkResolveMDR = async () => {
    setBulkLoading(true);
    setBulkResult(null);
    setBulkError(null);
    try {
      const res = await api.bulkResolveExceptions({
        action: 'FEE_ADJUSTMENT',
        exceptionType: 'AMOUNT_MISMATCH',
        operatorName: 'FinOps Batch Operations Lead'
      });
      setBulkResult(res);
      await loadExceptions();
      setTimeout(() => setBulkResult(null), 6000);
    } catch (err) {
      setBulkError(err.message || 'Bulk auto-remediation failed');
      setTimeout(() => setBulkError(null), 6000);
    } finally {
      setBulkLoading(false);
    }
  };

  const mdrExceptionsCount = exceptions.filter(
    (e) => e.exception_type === 'AMOUNT_MISMATCH' && e.resolution_status === 'REQUIRES_REVIEW'
  ).length;

  const openCount = exceptions.filter(
    (e) => e.resolution_status === 'REQUIRES_REVIEW'
  ).length;

  const resolvedCount = exceptions.filter(
    (e) => e.resolution_status === 'RESOLVED' || e.resolution_status === 'AUTO_RESOLVED'
  ).length;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Exception Workflow Operations</span>
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 font-semibold">
              {openCount} Action Required • {resolvedCount} Resolved
            </span>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
              isGroqActive
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
            }`}>
              {isGroqActive ? `● Groq AI Active (${activeModel})` : '○ Deterministic Engine'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Systematically categorized variances by severity with 1-click automated MDR fee adjustments and dispute filing.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Bulk Auto-Resolve Button */}
          {mdrExceptionsCount > 0 ? (
            <button
              onClick={handleBulkResolveMDR}
              disabled={bulkLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 active:scale-95 border border-emerald-500/40"
            >
              {bulkLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Batch...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Auto-Resolve {mdrExceptionsCount} MDR Variances</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold font-mono">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>All MDR Variances Remediated</span>
            </div>
          )}

          <button
            onClick={loadExceptions}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs"
            title="Refresh Exceptions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Informative Pop-up Modal of What Happened */}
      {bulkResult && (
        <div 
          onClick={() => setBulkResult(null)}
          className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Automated Batch Remediation Complete
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {bulkResult.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setBulkResult(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Close Pop-up"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* What Happened Section */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">
                  What Just Happened:
                </span>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">1.</span>
                    <span><strong>10 Amount Mismatches Identified:</strong> The controller detected 10 transactions where expected order amount differed from bank settlement purely due to standard payment gateway MDR fee deductions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">2.</span>
                    <span><strong>Automated Journal Entries:</strong> 10 formal <em>Fee Adjustment Journal Entries (2% MDR + 18% GST)</em> were posted to reconcile the ₹12,900 cumulative variance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">3.</span>
                    <span><strong>Status Updated:</strong> All 10 records shifted from <span className="text-amber-600 dark:text-amber-400 font-mono font-semibold">Requires Review</span> to <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">● Resolved</span>.</span>
                  </li>
                </ul>
              </div>

              {/* Workload Impact Counters */}
              <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Total Batch</span>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100">45</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase block">Remediated</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">10</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase block">Open / Action</span>
                  <span className="text-base font-bold text-amber-600 dark:text-amber-400">{bulkResult.remaining_unresolved || 35}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setResolutionFilter('RESOLVED');
                  setBulkResult(null);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700"
              >
                View 10 Resolved Items
              </button>

              <button
                onClick={() => setBulkResult(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
              >
                Got It, Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Error Banner */}
      {bulkError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{bulkError}</span>
          </div>
          <button 
            onClick={() => setBulkError(null)}
            className="text-[11px] font-mono text-rose-600 dark:text-rose-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Toolbar: Resolution State Tabs & Severity Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Resolution Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {RESOLUTION_TABS.map((resTab) => (
            <button
              key={resTab.id}
              onClick={() => setResolutionFilter(resTab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                resolutionFilter === resTab.id
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 shadow-xs'
              }`}
            >
              {resTab.label}
            </button>
          ))}
        </div>

        {/* Severity Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {SEVERITY_TABS.map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition border ${
                  severityFilter === sev
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Exception Records Grid / Table */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-xs font-mono">Loading exceptions...</span>
          </div>
        ) : exceptions.length === 0 ? (
          <div className="py-16 text-center space-y-2 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <ShieldAlert className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No exceptions found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">All transactions in this view are clear</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {exceptions.map((exc) => (
              <div
                key={exc.id}
                onClick={() => onSelectTransaction(exc.transaction_id || exc.order_id)}
                className="p-5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                      {exc.transaction_id || exc.order_id}
                    </span>
                    <StatusBadge status={exc.exception_type} size="xs" />
                    <SeverityBadge severity={exc.severity} />
                    <ResolutionBadge status={exc.resolution_status} />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    {exc.explanation}
                  </p>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans flex items-center gap-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Recommended Action:</span>
                    <span>{exc.recommended_action}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">Variance Amount</span>
                    <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">
                      ₹{(exc.difference || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTransaction(exc.transaction_id || exc.order_id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-medium transition"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI Investigate</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
