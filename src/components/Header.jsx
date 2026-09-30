import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Printer, 
  RotateCcw, 
  Settings, 
  ChevronDown, 
  Moon, 
  Sun,
  Activity,
  Server,
  Database
} from 'lucide-react';
import { SAMPLE_AGREEMENTS } from '../data/sampleAgreements';
import { checkBackendHealth, fetchHistoryAPI } from '../services/apiService';

export default function Header({ 
  onLoadSample, 
  onReset, 
  hasAnalysis, 
  onOpenPrint, 
  onOpenSettings,
  onOpenHistory,
  onOpenInspector,
  darkMode,
  onToggleDarkMode
}) {
  const [sampleMenuOpen, setSampleMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    const updateStats = () => {
      checkBackendHealth().then((res) => {
        setBackendStatus(res && res.status === 'ok' ? "connected" : "offline");
      });
      fetchHistoryAPI().then((list) => {
        setHistoryCount(list.length);
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 12000);
    return () => clearInterval(interval);
  }, [hasAnalysis]);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-200 bg-slate-900/90 border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={onReset}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-bold group-hover:scale-105 transition transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight leading-none text-white">
                Tenant Agreement Explainer
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Live Full-Stack
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block mt-0.5">
              Clear answers before you sign • First-time renters & PG residents
            </p>
          </div>
        </div>

        {/* Center: Live Backend Status Pill (Clickable to open Inspector) */}
        <button
          onClick={onOpenInspector}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 text-xs transition cursor-pointer group"
          title="Click to inspect real Express Backend API metrics & status"
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              backendStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              backendStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
          </span>
          <span className="text-slate-300 font-sans text-xs flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-indigo-400 group-hover:text-emerald-400 transition" />
            {backendStatus === 'connected' ? 'Express API Live :5000' : 'Client Mode'}
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded group-hover:text-white transition">
            Inspect
          </span>
        </button>

        {/* Right Navigation & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Saved Audits History Button */}
          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-750 text-slate-200 text-xs sm:text-sm font-semibold transition shadow-sm"
            title="View saved agreement audits from the backend database"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Saved Audits</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {historyCount}
            </span>
          </button>

          {/* Sample Cases Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSampleMenuOpen(!sampleMenuOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-750 text-slate-200 text-xs sm:text-sm font-semibold transition shadow-sm"
              title="Quickly test with realistic sample agreements"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline">Sample Cases</span>
              <span className="lg:hidden">Samples</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {sampleMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setSampleMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in text-slate-200 backdrop-blur-xl">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select a Test Case
                  </div>
                  {SAMPLE_AGREEMENTS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        onLoadSample(sample);
                        setSampleMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 flex flex-col gap-0.5 transition border-b border-slate-800/60 last:border-none"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {sample.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                          sample.id === 'tricky_pg' 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                            : sample.id === 'standard_flat' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {sample.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                        {sample.description}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export / Print Button */}
          {hasAnalysis && (
            <button
              onClick={onOpenPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-900/30 transition active:scale-98"
              title="Download or Print Summary Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          )}

          {/* Reset Button */}
          {hasAnalysis && (
            <button
              onClick={onReset}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Reset and start new analysis"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Theme Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition"
            title={darkMode ? "Switch to Sunlight Clean Mode" : "Switch to Midnight Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings / API Key */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Backend & AI Engine Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
