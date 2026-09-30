import React from 'react';
import { Printer, X, Download, ShieldAlert, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

export default function PrintReportModal({ analysisData, isOpen, onClose }) {
  if (!isOpen || !analysisData) return null;

  const { keyMetrics, healthScore, riskAnalysis, questions, checklist } = analysisData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden animate-fade-in print-container text-slate-200">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 no-print shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Tenant Summary Audit Report
              </h3>
              <p className="text-[11px] text-slate-400">
                Ready to print or save as PDF for your records
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/40 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6">
          {/* Document Header */}
          <div className="border-b border-slate-800 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Tenant Agreement Explainer
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Automated Plain-English Clause Analysis & Pre-Signing Risk Report
                </p>
              </div>
              <div className="text-right text-xs text-slate-400 font-mono">
                <div>Date: {new Date().toLocaleDateString()}</div>
                <div>Status: <strong className="text-emerald-400">{healthScore.status}</strong></div>
              </div>
            </div>

            {/* Mandatory Guardrail Disclaimer */}
            <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs leading-relaxed flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>CRITICAL LEGAL DISCLAIMER:</strong> This report is an educational, informational summary generated for renters and students. It does <em>not</em> constitute formal legal advice or create an attorney-client relationship. If high-risk clauses are present, consultation with a licensed legal professional is strongly recommended before signing.
              </span>
            </div>
          </div>

          {/* Fairness Rating Banner */}
          <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Fairness Health Score
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                {healthScore.score} <span className="text-lg text-slate-500 font-normal">/ 100</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">
                {healthScore.status}
              </div>
              <div className="text-xs text-slate-400 mt-1 max-w-sm">
                {healthScore.verdict}
              </div>
            </div>
          </div>

          {/* Key Terms Summary Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-800 pb-1.5">
              Core Contract Terms
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Monthly Rent</span>
                <strong className="text-white text-sm block mt-0.5">{keyMetrics.rent.amount}</strong>
                <span className="text-slate-400">{keyMetrics.rent.dueDate}</span>
              </div>
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Security Deposit</span>
                <strong className="text-white text-sm block mt-0.5">{keyMetrics.deposit.amount}</strong>
                <span className="text-slate-400">{keyMetrics.deposit.deductions}</span>
              </div>
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Lock-in Duration</span>
                <strong className="text-white text-sm block mt-0.5">{keyMetrics.lockIn.duration}</strong>
                <span className="text-slate-400">{keyMetrics.lockIn.penalty}</span>
              </div>
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Notice Period</span>
                <strong className="text-white text-sm block mt-0.5">Tenant: {keyMetrics.notice.tenant}</strong>
                <span className="text-slate-400">Landlord: {keyMetrics.notice.owner}</span>
              </div>
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Maintenance Split</span>
                <strong className="text-white text-sm block mt-0.5">{keyMetrics.maintenance.responsibility === 'heavy' ? 'Tenant 100%' : 'Shared'}</strong>
                <span className="text-slate-400">{keyMetrics.maintenance.terms}</span>
              </div>
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Privacy & Inspection</span>
                <strong className="text-white text-sm block mt-0.5">{keyMetrics.privacy.unrestrictedEntry ? 'No Notice (High Risk)' : '24h Notice'}</strong>
                <span className="text-slate-400">{keyMetrics.privacy.terms}</span>
              </div>
            </div>
          </div>

          {/* Flagged Risks Section */}
          <div className="print-break-inside-avoid">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-800 pb-1.5">
              Flagged Clauses & Plain-English Translation
            </h3>
            <div className="space-y-3">
              {riskAnalysis.filter(r => r.severity !== 'safe').map((r) => (
                <div key={r.id} className="p-4 border border-slate-800 rounded-2xl bg-slate-950/70 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      Clause {r.clauseNumber}: {r.title}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.severity === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {r.severity === 'high' ? '🔴 Red Flag' : '🟡 Review Needed'}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-300">
                    <strong className="text-indigo-400">Plain English:</strong> {r.plainEnglish}
                  </p>
                  <p className="mt-1 text-slate-400">
                    <strong className="text-rose-400">The Risk:</strong> {r.hiddenRisk}
                  </p>
                  <p className="mt-2 font-sans text-xs text-emerald-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <strong className="text-emerald-400 font-sans">Counter-clause:</strong> "{r.negotiationTip}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Questions to Ask Landlord */}
          <div className="print-break-inside-avoid">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-800 pb-1.5">
              Actionable Questions to Ask Landlord Before Signing
            </h3>
            <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-300">
              {questions.map((q, idx) => (
                <li key={idx} className="leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                  <strong className="text-indigo-400">[{q.topic}]:</strong> {q.question}
                </li>
              ))}
            </ol>
          </div>

          {/* Pre-signing Checklist */}
          <div className="print-break-inside-avoid">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-800 pb-1.5">
              Move-in Due Diligence Checklist
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {checklist.map((c) => (
                <div key={c.id} className="flex items-center gap-2 p-2.5 border border-slate-800 rounded-xl bg-slate-950/60">
                  <span className="w-4 h-4 border border-slate-700 rounded-md flex items-center justify-center shrink-0 text-emerald-400 text-xs">
                    {c.isCompleted ? '✓' : ''}
                  </span>
                  <span className={c.isCompleted ? 'line-through text-slate-500' : 'text-slate-300'}>
                    {c.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
