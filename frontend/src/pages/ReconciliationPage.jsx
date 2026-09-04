import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileSearch, 
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { StatusBadge, ResolutionBadge } from '../components/StatusBadge';
import { api } from '../services/api';

const FILTER_TABS = [
  { id: 'ALL', label: 'All Records' },
  { id: 'EXCEPTIONS', label: 'Exceptions Only' },
  { id: 'MATCHED', label: 'Exact Matches' },
  { id: 'MATCHED_WITH_TOLERANCE', label: 'Tolerance' },
  { id: 'AMOUNT_MISMATCH', label: 'Amount Mismatches' },
  { id: 'MISSING_PAYMENT', label: 'Missing Payment' },
  { id: 'MISSING_SETTLEMENT', label: 'Missing Settlement' },
  { id: 'DUPLICATE', label: 'Duplicates' },
  { id: 'DATE_MISMATCH', label: 'Date Mismatch' },
  { id: 'UNRESOLVED', label: 'Unresolved' },
];

export function ReconciliationPage({ onSelectTransaction, activeFilter = 'ALL' }) {
  const [selectedStatus, setSelectedStatus] = useState(activeFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('difference');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    setSelectedStatus(activeFilter);
  }, [activeFilter]);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTransactions({
        status: selectedStatus,
        search: searchTerm,
        limit: 150
      });
      setTransactions(data);
    } catch (err) {
      setError(err.message || 'Failed to load ledger transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedStatus, searchTerm]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default descending for amounts/variances
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (valA === null || valA === undefined) valA = sortAsc ? Infinity : -Infinity;
    if (valB === null || valB === undefined) valB = sortAsc ? Infinity : -Infinity;

    if (typeof valA === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  const handleExportCSV = () => {
    if (!sortedTransactions.length) return;
    const headers = [
      'Transaction ID',
      'Order ID',
      'Customer',
      'Expected Amount (INR)',
      'Paid Amount (INR)',
      'Settled Amount (INR)',
      'Discrepancy Variance (INR)',
      'Reconciliation Status',
      'Auto Resolved'
    ];

    const rows = sortedTransactions.map(tx => [
      `"${tx.transaction_id || ''}"`,
      `"${tx.order_id || ''}"`,
      `"${(tx.customer_name || '').replace(/"/g, '""')}"`,
      tx.expected_amount ?? 0,
      tx.paid_amount ?? 0,
      tx.settled_amount ?? 0,
      tx.difference ?? 0,
      `"${tx.status || ''}"`,
      tx.auto_resolved ? 'YES' : 'NO'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filterTag = selectedStatus.toLowerCase();
    link.setAttribute('href', url);
    link.setAttribute('download', `ledgerpilot_reconciliation_${filterTag}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-50 group-hover:opacity-100 transition inline ml-1" />;
    }
    return (
      <span className="text-emerald-600 dark:text-emerald-400 font-bold inline ml-1 font-mono">
        {sortAsc ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                selectedStatus === tab.id
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 shadow-xs'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Actions: Export CSV & Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            disabled={sortedTransactions.length === 0}
            title="Download active filtered view as CSV"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={loadTransactions}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-xs"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by Transaction ID, Order ID, Settlement ID, or Customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-xs font-mono"
        />
      </div>

      {/* Ledger Table Container */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 dark:text-emerald-400" />
            <span className="text-xs font-mono">Loading reconciliation ledger...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 dark:text-rose-400 text-xs">
            {error}
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <FileSearch className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No records match the selected filter</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Try changing your search term or status filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                  <th onClick={() => handleSort('transaction_id')} className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition group">
                    <span>Transaction ID</span>
                    {renderSortIndicator('transaction_id')}
                  </th>
                  <th onClick={() => handleSort('order_id')} className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition group">
                    <span>Order ID</span>
                    {renderSortIndicator('order_id')}
                  </th>
                  <th onClick={() => handleSort('customer_name')} className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition group">
                    <span>Customer</span>
                    {renderSortIndicator('customer_name')}
                  </th>
                  <th onClick={() => handleSort('expected_amount')} className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition group">
                    <span>Expected</span>
                    {renderSortIndicator('expected_amount')}
                  </th>
                  <th onClick={() => handleSort('paid_amount')} className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition group">
                    <span>Paid</span>
                    {renderSortIndicator('paid_amount')}
                  </th>
                  <th onClick={() => handleSort('settled_amount')} className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition group">
                    <span>Settled</span>
                    {renderSortIndicator('settled_amount')}
                  </th>
                  <th onClick={() => handleSort('difference')} className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition group">
                    <span>Variance</span>
                    {renderSortIndicator('difference')}
                  </th>
                  <th onClick={() => handleSort('status')} className="py-3 px-4 text-center cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition group">
                    <span>Status</span>
                    {renderSortIndicator('status')}
                  </th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {sortedTransactions.map((tx) => {
                  const hasVariance = tx.difference > 0;
                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx.transaction_id || tx.order_id)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-200">
                        {tx.transaction_id || (
                          <span className="text-slate-400 dark:text-slate-500 italic">No Payment TXN</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        {tx.order_id}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-800 dark:text-slate-300 font-medium">
                        {tx.customer_name || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-900 dark:text-slate-300 font-semibold">
                        ₹{(tx.expected_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300">
                        {tx.paid_amount !== null ? `₹${tx.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300">
                        {tx.settled_amount !== null ? `₹${tx.settled_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold ${hasVariance ? (tx.difference > 10.0 ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400') : 'text-slate-400 dark:text-slate-500'}`}>
                        {hasVariance ? `₹${tx.difference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <StatusBadge status={tx.status} size="xs" />
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTransaction(tx.transaction_id || tx.order_id);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition shadow-sm"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
