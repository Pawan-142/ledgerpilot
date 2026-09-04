import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Layers, 
  AlertOctagon, 
  Bot, 
  FileText, 
  UploadCloud, 
  Sliders, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  Cpu, 
  Database, 
  RefreshCw, 
  Mail, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Zap,
  Lock,
  Keyboard,
  Command
} from 'lucide-react';

export function GuidePage({ onNavigateTab, onRunReconciliation, onOpenUpload }) {
  const [activeGuideTab, setActiveGuideTab] = useState('overview');

  const steps = [
    {
      num: '01',
      title: 'Upload or Generate Ledger Datasets',
      icon: UploadCloud,
      desc: 'Load Internal Transactions (ERP/Order DB) and Bank Statements (CSV/JSON). LedgerPilot comes pre-loaded with realistic 120+ transaction test vectors, or you can upload custom enterprise files.',
      actionLabel: 'Open Upload Center',
      actionTab: 'upload',
      tips: ['Supports standard CSV headers: Transaction ID, Amount, Timestamp, Order ID, Status.', 'New realistic datasets are also stored in Downloads/ledgerpilot_sample_data.']
    },
    {
      num: '02',
      title: 'Run Deterministic 3-Way Reconciliation',
      icon: Layers,
      desc: 'The multi-stage deterministic engine matches transactions across 3 axes: Transaction ID, Reference Hash, and Date-Time windows within your configurable rupee tolerance (e.g. ₹10.00).',
      actionLabel: 'View Reconciliation',
      actionTab: 'reconciliation',
      tips: ['Adjust tolerance via the Tolerance Rules modal anytime.', 'Match categories: Exact Match, Tolerance Match, Missing in Bank, Fee Discrepancy.']
    },
    {
      num: '03',
      title: 'Analyze Exceptions with Groq AI',
      icon: AlertOctagon,
      desc: 'Deep-dive into mismatched records with 1-click AI Root-Cause Analysis. Groq LLaMA-3.3-70b inspects fee structures, gateway latency, and timing gaps to explain discrepancies.',
      actionLabel: 'Inspect Exceptions',
      actionTab: 'exceptions',
      tips: ['Generate automated vendor dispute emails with pre-filled ledger evidence.', 'Use "1-Click Resolve All" for immediate bulk auto-remediation.']
    },
    {
      num: '04',
      title: 'Chat with the AI Financial Copilot',
      icon: Bot,
      desc: 'Ask complex finance questions in plain English: "What caused the highest variance?", "Draft a board summary for today’s payout gap", or "Summarize Razorpay fee anomalies".',
      actionLabel: 'Launch Copilot',
      actionTab: 'copilot',
      tips: ['Full markdown tables and actionable resolution cards rendered in real-time.', 'Context-aware prompts powered by live SQLite database queries.']
    },
    {
      num: '05',
      title: 'Export Audit Reports & Compliance Logs',
      icon: FileText,
      desc: 'Review complete resolution audit logs with timestamped actions. Export clean, filtered CSV balance sheets or compliance summaries for finance controllers and statutory audits.',
      actionLabel: 'View Reports',
      actionTab: 'reports',
      tips: ['Instant CSV downloads directly from the Audit Reports screen.', '100% auditable chain of custody with user and AI resolution records.']
    }
  ];

  const exceptionTypes = [
    {
      type: 'FEE_MISMATCH',
      name: 'Gateway / Bank Fee Variance',
      color: 'amber',
      cause: 'Payment gateway deducted higher processing fee or GST surcharge than anticipated in internal records.',
      remedy: 'AI calculates exact fee delta and drafts an automated dispute ticket with attached settlement IDs.'
    },
    {
      type: 'MISSING_IN_BANK',
      name: 'Uncredited Bank Deposit',
      color: 'rose',
      cause: 'Internal transaction marked as captured, but no matching credit appears in bank statement within 48h settlement cycle.',
      remedy: 'AI flags settlement batch number and initiates bank payout trace inquiry.'
    },
    {
      type: 'TIMING_DIFFERENCE',
      name: 'Settlement Window Lag (T+1/T+2)',
      color: 'blue',
      cause: 'Transaction occurred before midnight cut-off but credited by banking partner on the next business day.',
      remedy: 'Auto-reconciled under accrual timing rule once date shift is verified.'
    },
    {
      type: 'AMOUNT_MISMATCH',
      name: 'Currency / Partial Capture Delta',
      color: 'purple',
      cause: 'Partial refund, chargeback deduction, or cross-border currency conversion rate fluctuation.',
      remedy: 'AI checks chargeback logs and auto-posts ledger adjustment journal.'
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 border border-indigo-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-8 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Platform Documentation & User Guide</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Autonomous 3-Way Financial Reconciliation & AI Controller
          </h1>
          
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            <strong>LedgerPilot</strong> bridges internal ERP ledgers, payment gateways, and banking statements with high-speed deterministic matching, real-time Groq AI root-cause analysis, and 1-click dispute remediation.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
            >
              <span>Go to Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onRunReconciliation()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 backdrop-blur-sm transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Run Instant Demo Reconciliation</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Matching Speed</span>
            <span className="font-bold text-white text-sm">~150ms / 1,000 txns</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">AI Intelligence</span>
            <span className="font-bold text-emerald-300 text-sm">Groq LLaMA-3.3 70B</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Database Engine</span>
            <span className="font-bold text-white text-sm">SQLite + SQLAlchemy</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Built For</span>
            <span className="font-bold text-indigo-300 text-sm">Razorpay Buildathon Track 04</span>
          </div>
        </div>
      </div>

      {/* Guide Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'How to Use (5-Step Guide)', icon: BookOpen },
          { id: 'exceptions', label: 'Exception Types & Remedies', icon: AlertOctagon },
          { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
          { id: 'architecture', label: 'System & Security Architecture', icon: Database },
          { id: 'faq', label: 'Frequently Asked Questions', icon: HelpCircle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeGuideTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveGuideTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: 5-Step Guide */}
      {activeGuideTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-6 shadow-sm hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                        {step.num}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                          {step.desc}
                        </p>

                        <div className="pt-2 flex flex-wrap gap-2">
                          {step.tips.map((tip, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>{tip}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 self-end md:self-start">
                      <button
                        onClick={() => {
                          if (step.actionTab === 'upload') {
                            onOpenUpload?.();
                          } else {
                            onNavigateTab(step.actionTab);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/15 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition"
                      >
                        <span>{step.actionLabel}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Exception Types */}
      {activeGuideTab === 'exceptions' && (
        <div className="space-y-6">
          <div className="bg-slate-100 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong className="text-slate-900 dark:text-slate-100">How Discrepancy Classification Works:</strong> When LedgerPilot reconciles transactions, any item failing strict equality or falling outside configured ₹ tolerance is categorized with a reason code and fed into the AI investigation pipeline.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exceptionTypes.map((item) => (
              <div
                key={item.type}
                className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    {item.type}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Auto-Resolvable
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.name}</h4>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Root Cause:</span>
                    <p className="text-slate-600 dark:text-slate-300">{item.cause}</p>
                  </div>
                  <div>
                    <span className="text-emerald-600 dark:text-emerald-400 block text-[10px] font-semibold uppercase tracking-wider">Automated Action:</span>
                    <p className="text-slate-700 dark:text-slate-200 font-medium">{item.remedy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Keyboard Shortcuts */}
      {activeGuideTab === 'shortcuts' && (
        <div className="space-y-6">
          <div className="bg-slate-100 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong className="text-slate-900 dark:text-slate-100">Speed up your workflow:</strong> LedgerPilot includes global keyboard hotkeys that let you close modals, jump across ledger views, and configure parameters in milliseconds.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: 'Esc',
                title: 'Close / Minimize Popups',
                desc: 'Instantly dismiss the Investigation Drawer, Tolerance Modal, or Custom Upload Modal.',
                category: 'Modals & Overlays'
              },
              {
                key: '[',
                title: 'Toggle / Minimize Sidebar',
                desc: 'Collapse the left navigation panel into a compact icon rail for distraction-free data view.',
                category: 'Layout'
              },
              {
                key: 'T',
                title: 'Toggle Tolerance Rules',
                desc: 'Quickly open or close the Amount Tolerance adjustment dialog.',
                category: 'Configuration'
              },
              {
                key: 'U',
                title: 'Open Upload Batch Center',
                desc: 'Open the custom financial dataset upload modal to ingest new CSVs.',
                category: 'Data Management'
              },
              {
                key: 'D',
                title: 'Go to Dashboard',
                desc: 'Jump directly to the main executive reconciliation metrics overview.',
                category: 'Navigation'
              },
              {
                key: 'R',
                title: 'Go to Reconciliation Table',
                desc: 'Jump to the granular 3-way line item match and tolerance grid.',
                category: 'Navigation'
              },
              {
                key: 'E',
                title: 'Go to Exceptions Center',
                desc: 'Jump to mismatched transactions requiring investigation or dispute.',
                category: 'Navigation'
              },
              {
                key: 'C',
                title: 'Go to AI Copilot',
                desc: 'Launch the interactive Groq LLaMA-3.3-70b finance conversation page.',
                category: 'Navigation'
              },
              {
                key: 'A',
                title: 'Go to Audit Reports',
                desc: 'Open the compliance audit log and exportable balance sheets.',
                category: 'Navigation'
              },
              {
                key: '?',
                title: 'Open Guide & Help',
                desc: 'Access this complete documentation and playbook anytime.',
                category: 'Help'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>

                <kbd className="shrink-0 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold shadow-sm">
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Architecture & Tech Stack */}
      {activeGuideTab === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Tech 1 */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Deterministic Core (FastAPI + SQLite)</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Reconciliation matching logic is 100% deterministic and runs in Python backend. All transactions, match indexes, and audit logs are persisted in local SQLite (<code className="text-emerald-600 dark:text-emerald-400 font-mono">backend/ledgerpilot.db</code>).
              </p>
            </div>

            {/* Tech 2 */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Groq Cloud AI Copilot</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Powered by Groq's high-throughput LPU inference running <code className="text-indigo-600 dark:text-indigo-400 font-mono">llama-3.3-70b-versatile</code>. Automatically falls back to deterministic heuristics if offline.
              </p>
            </div>

            {/* Tech 3 */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Financial Security & Privacy</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Zero data leakage. Raw bank account numbers are never transmitted to external APIs; only anonymized transaction hashes, amounts, and metadata are sent for analysis.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              3-Way Matching Data Flow
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-center">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-800 dark:text-slate-100 mb-1">Layer 1: Internal ERP</div>
                <div className="text-slate-500 text-[11px]">Orders, Invoices, Refunds</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-500/30">
                <div className="font-bold text-emerald-700 dark:text-emerald-400 mb-1">⚡ LedgerPilot Engine</div>
                <div className="text-slate-500 text-[11px]">Tolerance Matching & Scoring</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-800 dark:text-slate-100 mb-1">Layer 2: Bank Statement</div>
                <div className="text-slate-500 text-[11px]">UTR, Credits, Surcharges</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FAQ */}
      {activeGuideTab === 'faq' && (
        <div className="space-y-4">
          {[
            {
              q: 'Can I upload custom CSV or Excel files with my own column names?',
              a: 'Yes! Click "Upload Batch" in the top header. The upload processor automatically normalizes common column aliases (e.g. "Amount", "txn_amount", "Total", "Transaction ID", "UTR", "Date").'
            },
            {
              q: 'How do I change the discrepancy tolerance limit?',
              a: 'Click "Tolerance Rules" in the top header or sidebar. You can set the tolerance threshold (e.g., ₹5.00, ₹10.00, ₹50.00). LedgerPilot will re-evaluate all delta matches in real-time.'
            },
            {
              q: 'What happens when I click "1-Click Resolve All"?',
              a: 'LedgerPilot triggers bulk automated remediation across all eligible open exceptions (posting fee adjustment entries, queuing bank settlement inquiries, or marking timing gaps as verified), updating your net health score immediately.'
            },
            {
              q: 'How does the AI Financial Copilot get its context?',
              a: 'The Copilot queries the active SQLite database for current reconciliation run statistics, uncredited totals, fee variance sum, and historical patterns before sending concise prompts to Groq LLaMA-3.3-70b.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2"
            >
              <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0">
                  ?
                </span>
                <span>{item.q}</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
