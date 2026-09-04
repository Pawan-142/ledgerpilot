import React, { useState, useEffect } from 'react';
import { History, RefreshCw, CheckCircle2, Clock, Zap, Target } from 'lucide-react';
import { api } from '../services/api';

export function HistoryPage({ onSelectRun }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRuns = async () => {
    setLoading(true);
    try {
      const data = await api.getRuns(20);
      setRuns(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Reconciliation Run History</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit trail of past reconciliation batches persisted in SQLite database.
          </p>
        </div>

        <button
          onClick={loadRuns}
          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-mono">Loading history...</span>
          </div>
        ) : runs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs">
            No previous runs recorded. Run reconciliation to create an audit record.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                  <th className="py-3 px-4">Batch ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-center">Tolerance</th>
                  <th className="py-3 px-4 text-right">Records</th>
                  <th className="py-3 px-4 text-right">Match Rate</th>
                  <th className="py-3 px-4 text-right">Accuracy</th>
                  <th className="py-3 px-4 text-right">Throughput</th>
                  <th className="py-3 px-4 text-right">Runtime</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {runs.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => onSelectRun && onSelectRun(r.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {r.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-sans">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                      ₹{r.tolerance.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300">
                      {r.total_records}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                      {r.match_rate}%
                    </td>
                    <td className="py-3.5 px-4 text-right text-blue-600 dark:text-blue-400 font-bold">
                      {r.accuracy}%
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300">
                      {r.throughput_rps} /s
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 dark:text-slate-400">
                      {r.processing_time_ms} ms
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
