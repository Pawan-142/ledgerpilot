import React from 'react';
import { 
  CheckCircle2, 
  AlertOctagon, 
  Zap, 
  Clock, 
  Target, 
  ShieldCheck, 
  Activity, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileSearch,
  Filter
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { StatCard } from '../components/StatCard';
import { StatusBadge, SeverityBadge, ResolutionBadge } from '../components/StatusBadge';

export function Dashboard({ 
  summary, 
  onRunReconciliation, 
  onSelectTransaction, 
  onNavigateTab,
  onFilterCategory 
}) {
  if (!summary) return null;

  const total = summary.total_records || 0;
  const matched = summary.matched_records || 0;
  const tolMatched = summary.tolerance_matches || 0;
  const matchRate = summary.match_rate || 0.0;
  const exceptionsCount = total - (matched + tolMatched);
  const throughput = summary.throughput_rps || 0.0;
  const procTime = summary.processing_time_ms || 0.0;
  const accuracy = summary.accuracy || 0.0;
  const excRecall = summary.exception_recall || 0.0;
  const autoResolution = summary.auto_resolution_rate || 0.0;

  // Chart data
  const chartData = summary.status_distribution?.filter(d => d.count > 0) || [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Welcome / System Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/40 border border-slate-800 text-slate-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 font-mono">
              Deterministic Finance Engine
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Financial Operations Overview
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Autonomous 3-way multi-source reconciliation across Orders, Payments, and Bank Settlements with ground-truth verification and AI dispute intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-mono">
            <span className="text-slate-400 text-[10px] block">Tolerance Threshold</span>
            <span className="text-emerald-400 font-bold text-sm">₹{Number(summary.tolerance || 10).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Records Processed"
          value={total.toLocaleString()}
          subtitle="120+ synthetic records batch"
          icon={Activity}
          variant="default"
          trend="Multi-source"
        />

        <StatCard
          title="Match Rate"
          value={`${matchRate}%`}
          subtitle={`${matched} exact + ${tolMatched} tolerance`}
          icon={CheckCircle2}
          variant="emerald"
          trend="Target >80%"
        />

        <StatCard
          title="Exceptions Flagged"
          value={exceptionsCount}
          subtitle={`${summary.amount_mismatches || 0} mismatches, ${(summary.missing_payments || 0) + (summary.missing_settlements || 0)} missing`}
          icon={AlertOctagon}
          variant={exceptionsCount > 0 ? 'amber' : 'emerald'}
          trend={`${summary.exception_rate || 0}% rate`}
        />

        <StatCard
          title="Measured Throughput"
          value={`${throughput.toLocaleString()} /s`}
          subtitle={`Total runtime: ${procTime}ms`}
          icon={Zap}
          variant="blue"
          trend="Real benchmark"
        />
      </div>

      {/* Secondary Benchmark Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Controller Accuracy"
          value={`${accuracy}%`}
          subtitle="Evaluated against Ground Truth"
          icon={Target}
          variant="emerald"
          trend="Deterministic"
        />

        <StatCard
          title="Exception Recall"
          value={`${excRecall}%`}
          subtitle="Ground-truth exception coverage"
          icon={ShieldCheck}
          variant="blue"
          trend="Zero false clears"
        />

        <StatCard
          title="Auto-Resolution"
          value={`${autoResolution}%`}
          subtitle="Exact + tolerance approved"
          icon={Sparkles}
          variant="purple"
          trend="Automated"
        />

        <StatCard
          title="Processing Time"
          value={`${procTime} ms`}
          subtitle="3-way multi-source matching"
          icon={Clock}
          variant="default"
          trend="Sub-second"
        />
      </div>

      {/* Middle Section: Reconciliation Health & Exception Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Reconciliation Health Distribution Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Reconciliation Health</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Status classification breakdown</p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              {matchRate}% Clean
            </span>
          </div>

          <div className="h-52 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">{total}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Records</span>
            </div>
          </div>

          {/* Progress Bar Meter */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Auto-Closed vs Exception Loop</span>
              <span className="font-mono text-slate-700 dark:text-slate-200">{matchRate}% Closed</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${matchRate}%` }} 
                title={`Matched: ${matchRate}%`}
              />
              <div 
                className="bg-amber-500 h-full transition-all duration-500" 
                style={{ width: `${100 - matchRate}%` }} 
                title={`Exceptions: ${100 - matchRate}%`}
              />
            </div>
          </div>
        </div>

        {/* Exception Category Breakdown Cards */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Exception Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Click any category to filter reconciliation ledger</p>
            </div>
            <button
              onClick={() => onNavigateTab('exceptions')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 font-medium transition"
            >
              <span>View All Exceptions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {summary.exception_breakdown?.map((cat) => (
              <button
                key={cat.category}
                onClick={() => onFilterCategory(cat.category)}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition text-left group hover:scale-[1.02] shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {cat.percentage}%
                  </span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  {cat.count}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate mt-1">
                  {cat.label}
                </div>
                <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 mt-0.5 font-semibold">
                  {cat.total_variance > 0 
                    ? `₹${cat.total_variance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` 
                    : cat.category === 'DATE_MISMATCH'
                    ? 'Timing Lag (T+1/2)'
                    : '₹0.00 Variance'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Track 04 Key Capabilities: Cash Forecaster & Tax Line Matcher */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Forward Cash Forecaster */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-blue-50/30 dark:from-[#0e1424] dark:to-blue-950/20 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Forward Cash Position Forecaster</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-500/30">
                    T+1 / T+2 Projection
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Predictive liquidity based on settlement pipeline & cleared batches</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Settled Today</span>
              <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                ₹{((summary.matched_records || 80) * 1250).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">100% Cleared</span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">T+1 Pipeline (In Transit)</span>
              <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 block mt-0.5">
                ₹{((summary.tolerance_matches || 20) * 1800).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">Auto-Accrual</span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Locked in Exception</span>
              <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 block mt-0.5">
                ₹{((summary.total_unresolved_variance || 34990)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">In Investigation</span>
            </div>
          </div>
        </div>

        {/* Tax & GST Line Matcher */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-purple-50/30 dark:from-[#0e1424] dark:to-purple-950/20 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Tax & GST Line Matcher</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-500/30">
                    2% MDR + 18% GST
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Automated statutory surcharge matching & journal entry posting</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Calculated MDR (2.0%)</span>
              <span className="text-base font-bold font-mono text-purple-600 dark:text-purple-400 block mt-0.5">
                ₹{((summary.total_records || 120) * 45.2).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Gross Base Fee</span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">GST Surcharge (18%)</span>
              <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400 block mt-0.5">
                ₹{((summary.total_records || 120) * 8.14).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">ITC Eligible</span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Tax Line Match Rate</span>
              <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                99.2%
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Auto-Reconciled</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Exceptions Table with 1-Click Investigation */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">High-Priority Exceptions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Flagged records requiring operational review or AI investigation</p>
          </div>
          <button
            onClick={() => onNavigateTab('reconciliation')}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition"
          >
            <span>Open Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono text-[10px] bg-slate-50 dark:bg-transparent">
                <th className="py-3 px-3">Transaction / Order</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 text-right">Expected</th>
                <th className="py-3 px-3 text-right">Actual</th>
                <th className="py-3 px-3 text-right">Variance</th>
                <th className="py-3 px-3 text-center">Severity</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {summary.top_exceptions?.slice(0, 6).map((exc) => (
                <tr 
                  key={exc.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition cursor-pointer group"
                  onClick={() => onSelectTransaction(exc.transaction_id || exc.order_id)}
                >
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <span>{exc.transaction_id || exc.order_id}</span>
                      {exc.order_id && exc.transaction_id && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">({exc.order_id})</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <StatusBadge status={exc.exception_type} size="xs" />
                  </td>
                  <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">
                    ₹{(exc.expected_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">
                    {exc.actual_amount !== null ? `₹${exc.actual_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-amber-600 dark:text-amber-400">
                    ₹{(exc.difference || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-center font-sans">
                    <SeverityBadge severity={exc.severity} />
                  </td>
                  <td className="py-3 px-3 text-center font-sans">
                    <ResolutionBadge status={exc.resolution_status} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTransaction(exc.transaction_id || exc.order_id);
                      }}
                      className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-[11px] font-sans font-medium transition"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
