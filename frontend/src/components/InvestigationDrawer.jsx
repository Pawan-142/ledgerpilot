import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowDown, 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Copy, 
  Building2, 
  CreditCard, 
  ShoppingCart,
  Loader2,
  Cpu,
  Send,
  SlidersHorizontal,
  Check,
  Percent,
  RefreshCw,
  Mail
} from 'lucide-react';
import { StatusBadge, SeverityBadge, ResolutionBadge } from './StatusBadge';
import { api } from '../services/api';

export function InvestigationDrawer({ transaction, isOpen, onClose, onResolveSuccess, health }) {
  const isGroqActive = Boolean(health?.groq_configured);
  const defaultModel = health?.groq_model || 'openai/gpt-oss-120b';

  const [activeTab, setActiveTab] = useState('investigation'); // 'investigation' | 'dispute'
  const [aiData, setAiData] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Remediation action states
  const [actionLoading, setActionLoading] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Dispute generator states
  const [recipientType, setRecipientType] = useState('bank');
  const [customInstructions, setCustomInstructions] = useState('');
  const [disputeData, setDisputeData] = useState(null);
  const [loadingDispute, setLoadingDispute] = useState(false);
  const [disputeError, setDisputeError] = useState(null);

  useEffect(() => {
    if (transaction) {
      if (transaction.exception?.ai_investigation) {
        setAiData(transaction.exception.ai_investigation);
      } else {
        setAiData(null);
      }
      setAiError(null);
      setActionSuccessMsg(null);
      setActionError(null);
      setDisputeData(null);
      setDisputeError(null);
    }
  }, [transaction]);

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

  if (!isOpen || !transaction) return null;

  const handleTriggerAI = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const res = await api.investigateTransactionAI(transaction.transaction_id || transaction.order_id);
      setAiData(res);
    } catch (err) {
      setAiError(err.message || 'AI Investigation service failed');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleExecuteRemediation = async (actionType, actionLabel) => {
    const excId = transaction.exception?.id || transaction.transaction_id || transaction.order_id;
    setActionLoading(actionType);
    setActionError(null);
    setActionSuccessMsg(null);

    try {
      const updated = await api.resolveException(excId, {
        action: actionType,
        note: `Automated remediation action executed via Controller UI: ${actionLabel}`,
        operatorName: 'FinOps Controller Lead'
      });
      setActionSuccessMsg(`Successfully executed: ${actionLabel}`);
      if (onResolveSuccess) {
        onResolveSuccess(updated);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to execute resolution action');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDraftDispute = async () => {
    setLoadingDispute(true);
    setDisputeError(null);
    try {
      const res = await api.draftDisputeLetter(
        transaction.transaction_id || transaction.order_id,
        recipientType,
        customInstructions
      );
      setDisputeData(res);
    } catch (err) {
      setDisputeError(err.message || 'Failed to generate dispute notice');
    } finally {
      setLoadingDispute(false);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const expAmt = transaction.expected_amount || 0.0;
  const paidAmt = transaction.paid_amount;
  const settledAmt = transaction.settled_amount;
  const diff = transaction.difference || 0.0;

  // MDR Breakdown calculations (Standard Razorpay: 2% + 18% GST = 2.36%)
  const expectedMdr = Number((expAmt * 0.0236).toFixed(2));
  const isMdrMatch = diff > 0 && Math.abs(diff - expectedMdr) <= 2.0;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 dark:bg-slate-950/75 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-[#0d1322] border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl overflow-y-auto animate-slide-in-right"
      >
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-[#0d1322]/95 backdrop-blur z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {transaction.transaction_id || transaction.order_id}
                  </h2>
                  <StatusBadge status={transaction.status} size="sm" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Customer: <span className="text-slate-700 dark:text-slate-300 font-medium">{transaction.customer_name || 'Anonymous Customer'}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
            <button
              onClick={() => setActiveTab('investigation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'investigation'
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Investigation & Remediation</span>
            </button>
            <button
              onClick={() => setActiveTab('dispute')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'dispute'
                  ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>AI Partner Dispute Generator</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {activeTab === 'investigation' ? (
            <>
              {/* 3-Way Visual Lifecycle Flow */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    3-Way Lifecycle Audit Trail
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    Order ➔ Payment ➔ Settlement
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Step 1: Order */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 relative space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>1. Order Book</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 font-mono font-medium">
                        Internal
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono block">
                        ₹{expAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono block truncate">
                        ID: {transaction.order_id || 'N/A'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {transaction.order_date || 'Date Recorded'}
                      </span>
                    </div>
                  </div>

                  {/* Step 2: Payment */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 relative space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-semibold">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>2. Gateway</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 font-mono font-medium">
                        Webhook
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono block">
                        {paidAmt !== null && paidAmt !== undefined ? `₹${paidAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono block truncate">
                        ID: {transaction.transaction_id || 'DROPPED'}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Method: {transaction.payment_method || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Step 3: Settlement */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 relative space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>3. Bank Nodal</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-mono font-medium">
                        Settled
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono block">
                        {settledAmt !== null && settledAmt !== undefined ? `₹${settledAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono block truncate">
                        ID: {transaction.settlement_id || 'PENDING'}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        Ref: {transaction.bank_reference || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Variance Summary Callout */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-400">Total Measured Rupee Discrepancy:</span>
                    <span className={`font-mono font-bold ${diff > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      ₹{diff.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {diff <= 10.0 && diff > 0 && (
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono font-medium">
                      (Within ₹10.00 tolerance)
                    </span>
                  )}
                </div>

                {/* Smart Razorpay MDR Breakdown Card */}
                {isMdrMatch && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-amber-900 dark:text-amber-300">Smart MDR Fee Match Identified</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-mono font-medium">
                          2% + 18% GST (2.36%)
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        Variance of <strong className="text-amber-900 dark:text-amber-200 font-mono">₹{diff.toFixed(2)}</strong> matches standard Razorpay MDR deduction formula on ₹{expAmt.toLocaleString('en-IN')}.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 1-Click Actionable Remediation Section */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-gradient-to-r dark:from-slate-900/90 dark:to-indigo-950/40 border border-slate-200 dark:border-slate-700/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      1-Click Operational Remediation
                    </h3>
                  </div>
                  {transaction.auto_resolved && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                      RESOLVED
                    </span>
                  )}
                </div>

                {actionSuccessMsg && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{actionSuccessMsg}</span>
                  </div>
                )}

                {actionError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{actionError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={actionLoading !== null}
                    onClick={() => handleExecuteRemediation('FEE_ADJUSTMENT', 'Fee Adjustment Journal Entry')}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 text-left space-y-1 transition disabled:opacity-50 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>Post Fee Adj</span>
                      {actionLoading === 'FEE_ADJUSTMENT' && <Loader2 className="w-3 h-3 animate-spin" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Reconcile legitimate MDR gateway variance
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading !== null}
                    onClick={() => handleExecuteRemediation('GATEWAY_RESYNC', 'Gateway Webhook Re-sync')}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 text-left space-y-1 transition disabled:opacity-50 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                      <span>Gateway Resync</span>
                      {actionLoading === 'GATEWAY_RESYNC' && <Loader2 className="w-3 h-3 animate-spin" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Re-poll webhook for dropped transaction
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading !== null}
                    onClick={() => handleExecuteRemediation('MANUAL_WAIVER', 'Manager Manual Waiver')}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 text-left space-y-1 transition disabled:opacity-50 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                      <span>Manual Waiver</span>
                      {actionLoading === 'MANUAL_WAIVER' && <Loader2 className="w-3 h-3 animate-spin" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Approve variance with audit trail
                    </p>
                  </button>
                </div>
              </div>

              {/* AI Structured Investigation Section */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Groq AI Investigation Layer
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      aiData?.is_ai_generated !== false && isGroqActive
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                        : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                    }`}>
                      {aiData?.is_ai_generated !== false && isGroqActive ? `● Live Groq API (${aiData?.model_used || defaultModel})` : '⚙️ Deterministic Logic'}
                    </span>

                    {!aiData && (
                      <button
                        onClick={handleTriggerAI}
                        disabled={loadingAi}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        {loadingAi ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Investigating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Run AI Investigation</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {aiError && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                )}

                {aiData && !loadingAi && (
                  <div className="space-y-4 pt-1">
                    {/* Summary */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950/80 border border-indigo-200 dark:border-indigo-500/30 space-y-1.5 shadow-sm">
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider block">
                        Controller Summary
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                        {aiData.summary}
                      </p>
                    </div>

                    {/* Evidence Points */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Supplied Evidence Points
                      </span>
                      <div className="space-y-1">
                        {aiData.evidence?.map((ev, i) => (
                          <div key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span>{ev}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Likely Cause & Action */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider block">
                          Likely Cause
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {aiData.likely_cause}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider block">
                          Recommended Action
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {aiData.recommended_action}
                        </p>
                      </div>
                    </div>

                    {/* AI Model & Confidence Footer */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                        <span>Source: <strong className="font-mono text-slate-800 dark:text-slate-200">{aiData.is_ai_generated ? 'Groq Cloud LLM' : 'Deterministic Logic'}</strong></span>
                        <span>•</span>
                        <span>Model: <span className="font-mono text-slate-800 dark:text-slate-300">{aiData.model_used || defaultModel}</span></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>Confidence: <strong className="text-slate-900 dark:text-slate-200 font-mono">{Math.round((aiData.confidence || 0.9) * 100)}%</strong></span>
                        {aiData.requires_human_review && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                            Human Review Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* AI Partner Dispute Generator Tab */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Generate Evidence-Backed Partner Notice</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Auto-drafts a formal reconciliation inquiry or dispute letter with exact transaction citations.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30">
                    {isGroqActive ? `Groq LLM (${defaultModel})` : 'Deterministic Generator'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Recipient Entity
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'bank', label: 'Bank Nodal Desk' },
                        { id: 'gateway', label: 'Razorpay Support' },
                        { id: 'internal', label: 'Internal Treasury' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setRecipientType(item.id)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                            recipientType === item.id
                              ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-400 dark:border-blue-500 text-blue-700 dark:text-blue-300 font-semibold'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Additional Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Request UTR trace for missing settlement batch"
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleDraftDispute}
                    disabled={loadingDispute}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {loadingDispute ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Formal Notice with Groq AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Partner Dispute Letter</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {disputeError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{disputeError}</span>
                </div>
              )}

              {disputeData && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-950/90 border border-blue-200 dark:border-blue-500/30 space-y-3 shadow-md">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                        Subject Line
                      </span>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-mono">
                        {disputeData.subject}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(disputeData.subject, 'subject')}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1 transition"
                    >
                      {copiedField === 'subject' ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'subject' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Notice Body
                      </span>
                      <button
                        onClick={() => copyToClipboard(disputeData.body, 'body')}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1 transition"
                      >
                        {copiedField === 'body' ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'body' ? 'Copied Body' : 'Copy All'}</span>
                      </button>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                      {disputeData.body}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1322] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>LedgerPilot Controller Audit Layer</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium transition"
          >
            Close Investigation
          </button>
        </div>
      </div>
    </div>
  );
}
