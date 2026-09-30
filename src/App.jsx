import React, { useState, useEffect } from 'react';
import DisclaimerBanner from './components/DisclaimerBanner';
import Header from './components/Header';
import InputSection from './components/InputSection';
import LoadingSkeleton from './components/LoadingSkeleton';
import SplitView from './components/SplitView';
import PrintReportModal from './components/PrintReportModal';
import AISettingsModal from './components/AISettingsModal';
import HistoryDrawer from './components/HistoryDrawer';
import BackendInspectorModal from './components/BackendInspectorModal';
import { analyzeAgreementAPI } from './services/apiService';
import { SAMPLE_AGREEMENTS } from './data/sampleAgreements';
import { ShieldCheck, Heart, Info, Scale, ArrowUp, Server, Database } from 'lucide-react';

export default function App() {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showInspectorModal, setShowInspectorModal] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Sync theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('tenant_theme');
    if (savedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.add('light-theme');
    } else {
      setDarkMode(true);
      document.documentElement.classList.remove('light-theme');
    }
  }, []);

  const handleToggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (!nextMode) {
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('tenant_theme', 'light');
    } else {
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('tenant_theme', 'dark');
    }
  };

  // Handle analysis trigger through Express Backend API
  const handleAnalyze = async (textToAnalyze, title = "") => {
    setIsAnalyzing(true);
    setInputText(textToAnalyze);

    try {
      // Call Express Backend API (with automatic client fallback)
      const result = await analyzeAgreementAPI(textToAnalyze, {}, title);
      setTimeout(() => {
        setAnalysisData(result);
        setIsAnalyzing(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1300);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to analyze agreement.");
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = (sample) => {
    setInputText(sample.content);
    handleAnalyze(sample.content, sample.name);
  };

  const handleSelectSavedAudit = (savedAudit) => {
    setAnalysisData(savedAudit);
    setInputText(savedAudit.rawText || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setAnalysisData(null);
    setInputText("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen flex flex-col antialiased transition-colors duration-300 font-sans ${
      darkMode ? 'bg-[#090d16] text-slate-100 aurora-bg' : 'bg-slate-50 text-slate-800 aurora-bg-light'
    }`}>
      {/* 1. Critical Guardrail Disclaimer Banner */}
      <DisclaimerBanner />

      {/* 2. Global Application Header */}
      <Header
        onLoadSample={handleLoadSample}
        onReset={handleReset}
        hasAnalysis={!!analysisData}
        onOpenPrint={() => setShowPrintModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenHistory={() => setShowHistoryDrawer(true)}
        onOpenInspector={() => setShowInspectorModal(true)}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleTheme}
      />

      {/* 3. Main Body */}
      <main className="flex-1">
        {/* Loading State */}
        {isAnalyzing && (
          <LoadingSkeleton onComplete={() => {}} />
        )}

        {/* Input Screen State */}
        {!isAnalyzing && !analysisData && (
          <InputSection
            initialText={inputText}
            onAnalyze={handleAnalyze}
            onLoadSamplePreset={(sample) => setInputText(sample.content)}
          />
        )}

        {/* Results Workspace: Interactive Split View */}
        {!isAnalyzing && analysisData && (
          <div className="animate-fade-in">
            {/* Top Bar with Re-analyze button & engine badge */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-1 flex items-center justify-between">
              <button
                onClick={() => setAnalysisData(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3.5 py-2 rounded-xl border border-indigo-500/30 transition active:scale-95"
              >
                ← Edit / Paste New Agreement
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <button
                  onClick={() => setShowInspectorModal(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 text-xs transition cursor-pointer"
                  title="View Express API server response metrics"
                >
                  <Server className="w-3 h-3 text-emerald-400" />
                  Processed via {analysisData.source === 'backend-express' ? 'Express API :5000' : 'Client Neural Engine'}
                </button>
                <span className="text-[11px] text-slate-500">
                  {analysisData.clauses?.length || 0} clauses analyzed
                </span>
              </div>
            </div>

            <SplitView analysisData={analysisData} />
          </div>
        )}
      </main>

      {/* 4. Global Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 text-xs text-slate-400 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">Tenant Agreement Explainer</span>
            <span className="text-slate-600">•</span>
            <span>Empowering first-time renters & students with legal clarity</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-500">
            <p>
              Educational tool only. Not legal advice. No lawyer-client privilege created.
            </p>
          </div>
        </div>
      </footer>

      {/* 5. Modals & Drawers */}
      <PrintReportModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        analysisData={analysisData}
      />

      <AISettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      <HistoryDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        onSelectAudit={handleSelectSavedAudit}
      />

      <BackendInspectorModal
        isOpen={showInspectorModal}
        onClose={() => setShowInspectorModal(false)}
      />
    </div>
  );
}
