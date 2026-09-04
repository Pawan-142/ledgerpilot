import React, { useState, useEffect } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Download, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [ordersFile, setOrdersFile] = useState(null);
  const [paymentsFile, setPaymentsFile] = useState(null);
  const [settlementsFile, setSettlementsFile] = useState(null);
  const [groundTruthFile, setGroundTruthFile] = useState(null);
  const [tolerance, setTolerance] = useState(10.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleDownloadSample = (type) => {
    let csvContent = '';
    let filename = `${type}_sample.csv`;

    if (type === 'orders') {
      csvContent = `order_id,customer_name,order_date,expected_amount,currency,order_status\nORD-2001,Aarav Sharma,2026-09-01 10:00:00,5000.00,INR,COMPLETED\nORD-2002,Priya Patel,2026-09-01 10:15:00,12499.00,INR,COMPLETED\nORD-2003,Rohan Verma,2026-09-01 10:30:00,3499.00,INR,COMPLETED\nORD-2004,Ananya Iyer,2026-09-01 10:45:00,8990.00,INR,COMPLETED`;
    } else if (type === 'payments') {
      csvContent = `transaction_id,order_id,payment_date,paid_amount,payment_status,payment_method\nTXN-3001,ORD-2001,2026-09-01 10:05:00,5000.00,SUCCESS,UPI\nTXN-3002,ORD-2002,2026-09-01 10:18:00,12499.00,SUCCESS,CARD\nTXN-3003,ORD-2003,2026-09-01 10:32:00,3499.00,SUCCESS,NETBANKING\nTXN-3004,ORD-2004,2026-09-01 10:50:00,8990.00,SUCCESS,UPI`;
    } else if (type === 'settlements') {
      csvContent = `settlement_id,transaction_id,settlement_date,settled_amount,settlement_status,bank_reference\nSTL-4001,TXN-3001,2026-09-02 12:00:00,5000.00,SETTLED,HDFC12345678\nSTL-4002,TXN-3002,2026-09-02 12:00:00,12495.00,SETTLED,HDFC12345679\nSTL-4003,TXN-3003,2026-09-02 12:00:00,3499.00,SETTLED,HDFC12345680\nSTL-4004,TXN-3004,2026-09-02 12:00:00,8790.00,SETTLED,HDFC12345681`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ordersFile || !paymentsFile || !settlementsFile) {
      setError('Please provide all three mandatory datasets: Orders, Payments, and Settlements.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const summary = await api.uploadCustomBatch({
        ordersFile,
        paymentsFile,
        settlementsFile,
        groundTruthFile,
        tolerance: parseFloat(tolerance) || 10.0
      });
      setLoading(false);
      onUploadSuccess(summary);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to reconcile custom files');
    }
  };

  const renderFileBox = (label, file, setFile, sampleType, required = true) => (
    <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/70 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          {label} {required && <span className="text-rose-500 dark:text-rose-400">*</span>}
        </span>
        {sampleType && (
          <button
            type="button"
            onClick={() => handleDownloadSample(sampleType)}
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 flex items-center gap-1 transition"
            title="Download CSV sample template"
          >
            <Download className="w-3 h-3" /> Template
          </button>
        )}
      </div>

      <label className={`cursor-pointer border border-dashed rounded-lg p-2.5 flex items-center justify-center gap-2 transition ${
        file 
          ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10' 
          : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-950/40'
      }`}>
        <input
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />
        {file ? (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs truncate">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="font-mono truncate font-medium">{file.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Select .CSV file</span>
          </div>
        )}
      </label>
    </div>
  );

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-5 my-8"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Upload Custom Financial Datasets</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ingest Orders, Payments & Settlements for 3-Way Reconciliation</p>
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

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderFileBox('1. Internal Orders', ordersFile, setOrdersFile, 'orders', true)}
            {renderFileBox('2. Gateway Payments', paymentsFile, setPaymentsFile, 'payments', true)}
            {renderFileBox('3. Bank Settlements', settlementsFile, setSettlementsFile, 'settlements', true)}
            {renderFileBox('4. Ground Truth (Optional)', groundTruthFile, setGroundTruthFile, null, false)}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Reconciliation Tolerance</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Max permissible variance for auto-matching (INR)</span>
            </div>
            <div className="relative w-28">
              <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-xs">₹</span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={tolerance}
                onChange={(e) => setTolerance(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-6 pr-2 py-1.5 text-xs font-mono text-slate-900 dark:text-slate-100 text-right focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Feeds...</span>
                </>
              ) : (
                <>
                  <span>Run 3-Way Reconciliation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
