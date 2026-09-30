import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X, Scale, ExternalLink } from 'lucide-react';

export default function DisclaimerBanner() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <aside aria-label="Legal Disclaimer" className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white shadow-md border-b border-amber-500/40 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 font-medium">
            <span className="p-1 bg-black/20 rounded-md shrink-0">
              <ShieldAlert className="w-4 h-4 text-white" />
            </span>
            <span className="leading-snug">
              <strong className="font-extrabold uppercase tracking-wide mr-1.5 bg-black/25 px-1.5 py-0.5 rounded text-[10px]">
                Critical Guardrail
              </strong>
              <strong>Not legal advice.</strong> This tool is an educational informational assistant for renters & students. Consult a licensed legal professional for legally binding interpretation.
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="hidden md:inline-flex items-center gap-1 font-bold underline underline-offset-2 hover:text-amber-100 whitespace-nowrap ml-4 shrink-0 transition"
          >
            Learn more & limits
          </button>
        </div>
      </aside>

      {/* Educational Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-700 text-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-amber-400 font-bold text-lg">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Legal Disclaimer & Scope
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                <strong>1. Informational Aid Only:</strong> The Tenant Agreement Explainer parses contractual clauses using heuristic neural rules and language analysis to translate legalese into plain English.
              </p>
              <p>
                <strong>2. No Attorney-Client Privilege:</strong> Using this application does not establish an attorney-client relationship, nor does it constitute formal legal representation or statutory legal advice.
              </p>
              <p>
                <strong>3. State & Local Jurisdiction Laws:</strong> Tenancy Acts (such as Rent Control Acts and Model Tenancy Act provisions) differ significantly across states and municipalities.
              </p>
              <p>
                <strong>4. High-Risk Clauses:</strong> When our tool detects high-risk clauses (such as unannounced owner entry, asymmetrical notice, or non-refundable deposit deductions), you must seek guidance from a qualified local lawyer before signing.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/30"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
