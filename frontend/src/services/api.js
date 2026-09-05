const DEFAULT_CLOUD_BACKEND = 'https://ledgerpilot-production-7adb.up.railway.app';
const BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '') 
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '' : DEFAULT_CLOUD_BACKEND);

const API_BASE = `${BASE}/api`;

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  // Reconciliation
  async triggerReconciliation(tolerance = 10.0, forceRegenerate = false) {
    const res = await fetch(`${API_BASE}/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tolerance, force_regenerate: forceRegenerate })
    });
    if (!res.ok) throw new Error('Reconciliation execution failed');
    return res.json();
  },

  // Summary Metrics
  async getSummary(runId = null) {
    const url = runId ? `${API_BASE}/summary?run_id=${encodeURIComponent(runId)}` : `${API_BASE}/summary`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch summary metrics');
    return res.json();
  },

  // Transactions
  async getTransactions(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.runId) searchParams.append('run_id', params.runId);
    if (params.status && params.status !== 'ALL') searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);
    if (params.minAmount !== undefined && params.minAmount !== '') searchParams.append('min_amount', params.minAmount);
    if (params.maxAmount !== undefined && params.maxAmount !== '') searchParams.append('max_amount', params.maxAmount);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.offset) searchParams.append('offset', params.offset);

    const res = await fetch(`${API_BASE}/transactions?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async getTransaction(identifier, runId = null) {
    const url = runId 
      ? `${API_BASE}/transactions/${encodeURIComponent(identifier)}?run_id=${encodeURIComponent(runId)}`
      : `${API_BASE}/transactions/${encodeURIComponent(identifier)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Transaction ${identifier} not found`);
    return res.json();
  },

  // Exceptions
  async getExceptions(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.runId) searchParams.append('run_id', params.runId);
    if (params.exceptionType && params.exceptionType !== 'ALL') searchParams.append('exception_type', params.exceptionType);
    if (params.severity && params.severity !== 'ALL') searchParams.append('severity', params.severity);
    if (params.resolutionStatus && params.resolutionStatus !== 'ALL') searchParams.append('resolution_status', params.resolutionStatus);
    if (params.search) searchParams.append('search', params.search);
    if (params.limit) searchParams.append('limit', params.limit);

    const res = await fetch(`${API_BASE}/exceptions?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch exceptions');
    return res.json();
  },

  async resolveException(exceptionId, { action, note, operatorName = 'FinOps Lead' }) {
    const res = await fetch(`${API_BASE}/exceptions/${encodeURIComponent(exceptionId)}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note, operator_name: operatorName })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to resolve exception');
    }
    return res.json();
  },

  async bulkResolveExceptions({ action = 'FEE_ADJUSTMENT', exceptionType = 'AMOUNT_MISMATCH', maxVariance = null, operatorName = 'FinOps Lead' } = {}) {
    const res = await fetch(`${API_BASE}/exceptions/bulk-resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        exception_type: exceptionType,
        max_variance: maxVariance,
        operator_name: operatorName,
        note: `Bulk auto-remediated via FinOps batch operations`
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to bulk resolve exceptions');
    }
    return res.json();
  },

  // AI Investigation
  async investigateTransactionAI(identifier) {
    const res = await fetch(`${API_BASE}/ai/investigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: identifier })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'AI investigation failed');
    }
    return res.json();
  },

  // AI Dispute Generator
  async draftDisputeLetter(identifier, recipientType = 'bank', customInstructions = '') {
    const res = await fetch(`${API_BASE}/ai/draft-dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction_id: identifier,
        recipient_type: recipientType,
        custom_instructions: customInstructions
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to draft dispute notice');
    }
    return res.json();
  },

  // AI Copilot Chat
  async askCopilot(message, runId = null) {
    const res = await fetch(`${API_BASE}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, run_id: runId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Copilot query failed');
    }
    return res.json();
  },

  // Custom File Ingestion & Upload
  async uploadCustomBatch({ ordersFile, paymentsFile, settlementsFile, groundTruthFile, tolerance = 10.0 }) {
    const formData = new FormData();
    formData.append('orders_file', ordersFile);
    formData.append('payments_file', paymentsFile);
    formData.append('settlements_file', settlementsFile);
    if (groundTruthFile) {
      formData.append('ground_truth_file', groundTruthFile);
    }
    formData.append('tolerance', tolerance);

    const res = await fetch(`${API_BASE}/reconcile/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to upload and reconcile custom batch');
    }
    return res.json();
  },

  // Reports
  async getReport(runId = null) {
    const url = runId ? `${API_BASE}/report?run_id=${encodeURIComponent(runId)}` : `${API_BASE}/report`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch executive report');
    return res.json();
  },

  // Runs
  async getRuns(limit = 15) {
    const res = await fetch(`${API_BASE}/runs?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch reconciliation history');
    return res.json();
  }
};

