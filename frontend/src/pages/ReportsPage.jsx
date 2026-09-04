import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { PageLoader } from '../components/PageLoader';
import { Logo } from '../components/Logo';
import { api } from '../services/api';

export function ReportsPage({ summary, onSelectTransaction }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await api.getReport(summary?.run_id);
      setReport(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [summary]);

  const handleDownloadCsv = () => {
    const url = summary?.run_id ? `/api/report/export/csv?run_id=${summary.run_id}` : '/api/report/export/csv';
    window.open(url, '_blank');
  };

  const handleDownloadJson = () => {
    if (!report) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ledgerpilot_report_${report.batch_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <PageLoader
        text="Generating Executive Audit Report..."
        subtitle="Synthesizing deterministic metrics & compliance sign-off"
      />
    );
  }

  if (!report) return null;

  return (
    <div className="p-8 max-w-5xl mx-auto print:p-0 print:max-w-none">
      
      {/* Printable Audit Document Container */}
      <div className="printable-document p-8 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm print:p-0 print:m-0 print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Document Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 print:border-slate-300 gap-4">
          <div>
            <Logo size="lg" variant="emerald" showSubtitle={false} />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 print:text-slate-700">
              Deterministic Multi-Source Financial Reconciliation Audit • Batch: <strong className="font-mono text-slate-800 dark:text-slate-200 print:text-black">{report.batch_id}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden shrink-0">
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition border border-slate-200 dark:border-slate-700 shadow-2xs active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition border border-slate-200 dark:border-slate-700 shadow-2xs active:scale-95"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-sm active:scale-95 border border-emerald-500/40"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 print:bg-slate-100 print:border-slate-300 space-y-1.5">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 print:text-black uppercase tracking-wider">
            Executive Summary
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 print:text-slate-900 leading-relaxed font-sans">
            {report.executive_summary}
          </p>
        </div>

        {/* Key Benchmark Metrics Table */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 print:text-black uppercase tracking-wider">
            Batch Performance & Evaluation Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 print:border-slate-300 text-xs">
              <span className="text-slate-500 block text-[11px]">Total Records</span>
              <strong className="text-base font-mono text-slate-900 dark:text-slate-100 print:text-black">{report.metrics.total_records}</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 print:border-slate-300 text-xs">
              <span className="text-slate-500 block text-[11px]">Match Rate</span>
              <strong className="text-base font-mono text-emerald-600 dark:text-emerald-400 print:text-black">{report.metrics.match_rate}%</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 print:border-slate-300 text-xs">
              <span className="text-slate-500 block text-[11px]">Ground-Truth Accuracy</span>
              <strong className="text-base font-mono text-blue-600 dark:text-blue-400 print:text-black">{report.metrics.accuracy}%</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 print:border-slate-300 text-xs">
              <span className="text-slate-500 block text-[11px]">Exception Recall</span>
              <strong className="text-base font-mono text-purple-600 dark:text-purple-400 print:text-black">{report.metrics.exception_recall}%</strong>
            </div>
          </div>
        </div>

        {/* High Value Unresolved Transactions Table */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 print:text-black uppercase tracking-wider">
            Highest-Value Unresolved / Discrepant Transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono text-[10px] bg-slate-50 dark:bg-transparent print:bg-slate-100">
                  <th className="py-2.5 px-3">Transaction</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3 text-right">Expected</th>
                  <th className="py-2.5 px-3 text-right">Settled</th>
                  <th className="py-2.5 px-3 text-right">Variance</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {report.high_value_unresolved?.map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => onSelectTransaction(item.transaction_id || item.order_id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-850/50 cursor-pointer"
                  >
                    <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                      {item.transaction_id || item.order_id}
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-500 dark:text-slate-400 print:text-black">
                      {item.customer_name || '—'}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300 print:text-black">
                      ₹{(item.expected_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300 print:text-black">
                      {item.settled_amount !== null ? `₹${item.settled_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-amber-600 dark:text-amber-400 print:text-black">
                      ₹{(item.difference || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-center font-sans">
                      <StatusBadge status={item.status} size="xs" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 print:border-slate-300">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 print:text-black uppercase tracking-wider">
            Operational Remediation Priorities
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 print:text-slate-900 font-sans">
            {report.actionable_recommendations?.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">[{i + 1}]</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Signoff / Disclaimer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 print:border-slate-300 text-[11px] text-slate-500 print:text-slate-600 font-sans flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LedgerPilot AI Finance Controller — Auditable Deterministic Truth</span>
          <span className="font-mono">Certified Non-Inventive AI Layer</span>
        </div>

      </div>
    </div>
  );
}
