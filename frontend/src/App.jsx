import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ReconciliationLoader } from './components/ReconciliationLoader';
import { ToleranceModal } from './components/ToleranceModal';
import { UploadModal } from './components/UploadModal';
import { InvestigationDrawer } from './components/InvestigationDrawer';
import { PageLoader, TopProgressBar } from './components/PageLoader';
import { Dashboard } from './pages/Dashboard';
import { ReconciliationPage } from './pages/ReconciliationPage';
import { ExceptionsPage } from './pages/ExceptionsPage';
import { CopilotPage } from './pages/CopilotPage';
import { ReportsPage } from './pages/ReportsPage';
import { HistoryPage } from './pages/HistoryPage';
import { GuidePage } from './pages/GuidePage';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [health, setHealth] = useState(null);
  const [tolerance, setTolerance] = useState(10.0);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('ledgerpilot_sidebar_collapsed') === 'true';
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ledgerpilot_theme') || 'dark';
  });
  
  // Modals & Drawers
  const [isReconciling, setIsReconciling] = useState(false);
  const [showToleranceModal, setShowToleranceModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [activeReconFilter, setActiveReconFilter] = useState('ALL');

  // Sync theme with root HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ledgerpilot_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('ledgerpilot_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Load initial summary and health on mount
  useEffect(() => {
    loadHealth();
    loadSummary();
  }, []);

  const loadHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch (err) {
      console.error('Health check error:', err);
    }
  };

  const loadSummary = async (runId = null) => {
    try {
      const data = await api.getSummary(runId);
      setSummary(data);
      if (data?.tolerance !== undefined) {
        setTolerance(data.tolerance);
      }
    } catch (err) {
      console.error('Summary error, using initial fallback dataset:', err);
      // Fallback demo summary state for immediate visual readiness
      setSummary({
        run_id: 'REC-DEMO-BATCH',
        created_at: new Date().toISOString(),
        tolerance: 10.0,
        total_records: 120,
        matched_records: 75,
        tolerance_matches: 0,
        amount_mismatches: 10,
        missing_payments: 15,
        missing_settlements: 12,
        duplicates: 8,
        date_mismatches: 0,
        unresolved_records: 45,
        total_unresolved_variance: 227686.0,
        match_rate: 62.5,
        exception_rate: 37.5,
        accuracy: 94.2,
        precision: 91.8,
        recall: 96.5,
        f1_score: 94.1,
        exception_recall: 98.2,
        auto_resolution_rate: 22.2,
        processing_time_ms: 184.2,
        throughput_rps: 651.4,
        categories: {
          MATCHED: { count: 75, total_variance: 0.0 },
          AMOUNT_MISMATCH: { count: 10, total_variance: 12900.0 },
          MISSING_PAYMENT: { count: 15, total_variance: 112787.0 },
          MISSING_SETTLEMENT: { count: 12, total_variance: 87099.0 },
          DUPLICATE: { count: 8, total_variance: 14900.0 }
        }
      });
    }
  };

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    setIsPageLoading(true);
    setActiveTab(newTab);
    setTimeout(() => {
      setIsPageLoading(false);
    }, 200);
  };

  // Global Keyboard Shortcuts: Esc to close, D/R/E/C/T/U/? for quick navigation, [ to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape closes any open modal or drawer
      if (e.key === 'Escape') {
        if (selectedTxn) setSelectedTxn(null);
        if (showToleranceModal) setShowToleranceModal(false);
        if (showUploadModal) setShowUploadModal(false);
        return;
      }

      // Ignore single-key shortcuts when typing in inputs/textareas
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || document.activeElement?.isContentEditable) {
        return;
      }

      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === 'd' || e.key === 'D') {
          handleTabChange('dashboard');
        } else if (e.key === 'r' || e.key === 'R') {
          handleTabChange('reconciliation');
        } else if (e.key === 'e' || e.key === 'E') {
          handleTabChange('exceptions');
        } else if (e.key === 'c' || e.key === 'C') {
          handleTabChange('copilot');
        } else if (e.key === 'a' || e.key === 'A') {
          handleTabChange('reports');
        } else if (e.key === 't' || e.key === 'T') {
          setShowToleranceModal(prev => !prev);
        } else if (e.key === 'u' || e.key === 'U') {
          setShowUploadModal(prev => !prev);
        } else if (e.key === '[' || e.key === ']') {
          toggleSidebar();
        } else if (e.key === '?' || e.key === 'g' || e.key === 'G') {
          handleTabChange('guide');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTxn, showToleranceModal, showUploadModal, activeTab]);

  const handleRunReconciliation = async (tol = tolerance, forceRegenerate = false) => {
    setIsReconciling(true);
    try {
      const startTime = Date.now();
      const result = await api.triggerReconciliation(tol, forceRegenerate);
      
      const elapsed = Date.now() - startTime;
      const minDisplayTime = 1800; // Keep loader visible briefly so the user sees all verification stages
      
      if (elapsed < minDisplayTime) {
        setTimeout(() => {
          setSummary(result);
          setIsReconciling(false);
          loadHealth();
        }, minDisplayTime - elapsed);
      } else {
        setSummary(result);
        setIsReconciling(false);
        loadHealth();
      }
    } catch (err) {
      console.error('Reconciliation execution error:', err);
      setIsReconciling(false);
    }
  };

  const handleSelectTransaction = async (identifier) => {
    try {
      const txn = await api.getTransaction(identifier, summary?.run_id);
      setSelectedTxn(txn);
    } catch (err) {
      console.error('Failed to load transaction details:', err);
    }
  };

  const handleFilterCategory = (category) => {
    setActiveReconFilter(category);
    handleTabChange('reconciliation');
  };

  const handleApplyTolerance = (newTol) => {
    setTolerance(newTol);
    handleRunReconciliation(newTol, false);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
      {/* Top Transition Progress Bar */}
      <TopProgressBar loading={isPageLoading || isReconciling} />

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        health={health}
        tolerance={tolerance}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenTolerance={() => setShowToleranceModal(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Header
          activeTab={activeTab}
          onRunReconciliation={handleRunReconciliation}
          isReconciling={isReconciling}
          summary={summary}
          tolerance={tolerance}
          health={health}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenTolerance={() => setShowToleranceModal(true)}
          onOpenUpload={() => setShowUploadModal(true)}
          onRegenerate={() => handleRunReconciliation(tolerance, true)}
          onOpenGuide={() => handleTabChange('guide')}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />

        <main className="flex-1 bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-200">
          {!summary && !isReconciling ? (
            <PageLoader
              text="Initializing LedgerPilot Finance Controller..."
              subtitle="Loading 3-way reconciliation batch & Groq AI layer"
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  summary={summary}
                  onRunReconciliation={handleRunReconciliation}
                  onSelectTransaction={handleSelectTransaction}
                  onNavigateTab={handleTabChange}
                  onFilterCategory={handleFilterCategory}
                />
              )}

              {activeTab === 'reconciliation' && (
                <ReconciliationPage
                  onSelectTransaction={handleSelectTransaction}
                  activeFilter={activeReconFilter}
                />
              )}

              {activeTab === 'exceptions' && (
                <ExceptionsPage
                  onSelectTransaction={handleSelectTransaction}
                  health={health}
                />
              )}

              {activeTab === 'copilot' && (
                <CopilotPage
                  summary={summary}
                  health={health}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsPage
                  summary={summary}
                  onSelectTransaction={handleSelectTransaction}
                />
              )}

              {activeTab === 'history' && (
                <HistoryPage
                  onSelectRun={(runId) => {
                    loadSummary(runId);
                    handleTabChange('dashboard');
                  }}
                />
              )}

              {activeTab === 'guide' && (
                <GuidePage
                  onNavigateTab={handleTabChange}
                  onRunReconciliation={handleRunReconciliation}
                  onOpenUpload={() => setShowUploadModal(true)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Investigation Drawer Modal */}
      <InvestigationDrawer
        transaction={selectedTxn}
        isOpen={Boolean(selectedTxn)}
        health={health}
        onClose={() => setSelectedTxn(null)}
        onResolveSuccess={(updatedException) => {
          loadSummary();
          if (selectedTxn) {
            setSelectedTxn((prev) => ({
              ...prev,
              auto_resolved: true,
              exception: updatedException
            }));
          }
        }}
      />

      {/* Custom Batch Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={(newSummary) => {
          setSummary(newSummary);
          loadHealth();
          handleTabChange('dashboard');
        }}
      />

      {/* Multi-Stage Reconciliation Loader */}
      <ReconciliationLoader
        isOpen={isReconciling}
      />

      {/* Tolerance Config Modal */}
      <ToleranceModal
        isOpen={showToleranceModal}
        onClose={() => setShowToleranceModal(false)}
        currentTolerance={tolerance}
        onApplyTolerance={handleApplyTolerance}
      />
    </div>
  );
}
