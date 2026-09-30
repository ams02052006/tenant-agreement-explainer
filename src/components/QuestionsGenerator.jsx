import React, { useState } from 'react';
import { 
  MessageSquare, 
  Copy, 
  Check, 
  Share2, 
  Send, 
  Sparkles,
  Info,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

export default function QuestionsGenerator({ questions, agreementTitle = "Rental Agreement" }) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [previewMode, setPreviewMode] = useState('cards'); // 'cards' or 'whatsapp'

  const getFullFormattedText = () => {
    let msg = `Hi,\n\nI reviewed the draft rental agreement for the accommodation. Before finalizing, I have a few friendly clarification and negotiation questions regarding specific terms:\n\n`;

    questions.forEach((q, idx) => {
      msg += `${idx + 1}. [${q.topic}]: ${q.question}\n\n`;
    });

    msg += `Looking forward to your confirmation so we can update the agreement draft accordingly.\n\nThank you!`;
    return msg;
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(getFullFormattedText());
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopySingle = async (q) => {
    try {
      await navigator.clipboard.writeText(q.question);
      setCopiedId(q.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(getFullFormattedText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Action Header Card */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <MessageSquare className="w-4 h-4" />
            </span>
            <h4 className="font-extrabold text-white text-base sm:text-lg">
              Negotiation Assistant & Landlord Questions
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
            Formulated to be polite yet legally assertive. Send these before transferring your advance deposit.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setPreviewMode('cards')}
              className={`px-3 py-1.5 rounded-lg transition ${
                previewMode === 'cards' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              List Cards
            </button>
            <button
              onClick={() => setPreviewMode('whatsapp')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                previewMode === 'whatsapp' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp Sim
            </button>
          </div>

          <button
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/20 transition active:scale-95 shrink-0"
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Message</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mode 1: WhatsApp Chat Simulator Preview */}
      {previewMode === 'whatsapp' && (
        <div className="rounded-3xl border border-slate-800 bg-[#0b141a] p-4 sm:p-6 shadow-2xl animate-fade-in text-slate-100 max-w-2xl mx-auto">
          {/* WhatsApp Header bar */}
          <div className="bg-[#202c33] p-3 rounded-2xl flex items-center justify-between mb-4 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-md">
                👤
              </div>
              <div>
                <div className="font-bold text-sm text-slate-100">Landlord / Flat Owner</div>
                <div className="text-[11px] text-emerald-400">online</div>
              </div>
            </div>

            <button
              onClick={handleOpenWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Send in WhatsApp
            </button>
          </div>

          {/* Chat Bubble Body */}
          <div className="space-y-3 p-2 font-sans">
            <div className="ml-auto max-w-[90%] bg-[#005c4b] text-slate-100 p-4 rounded-2xl shadow-md text-xs sm:text-sm leading-relaxed border border-emerald-600/40 relative">
              <p className="font-semibold text-emerald-200 mb-2">
                Hi, I reviewed the draft agreement. Before finalizing, I have a few friendly clarification points:
              </p>

              <div className="space-y-2 mt-2">
                {questions.map((q, idx) => (
                  <div key={idx} className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                    <span className="font-bold text-emerald-300 block text-[11px] uppercase tracking-wide">
                      {idx + 1}. {q.topic}
                    </span>
                    <span className="text-slate-100 text-xs">
                      {q.question}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-emerald-200">
                Looking forward to your confirmation so we can update the agreement draft accordingly. Thank you!
              </p>

              <div className="text-right text-[10px] text-emerald-300/80 mt-2 font-mono flex items-center justify-end gap-1">
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-sky-300 font-bold">✓✓</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: List of Cards */}
      {previewMode === 'cards' && (
        <div className="space-y-3">
          {questions.map((q, idx) => {
            const isCopied = copiedId === q.id;

            return (
              <div
                key={q.id || idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 shadow-lg hover:border-indigo-500/50 transition group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md inline-block mb-1.5">
                        {q.topic}
                      </span>
                      <p className="text-sm font-semibold text-slate-100 leading-snug">
                        "{q.question}"
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopySingle(q)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition shrink-0"
                    title="Copy this specific question"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 flex items-start gap-2 text-xs text-slate-400">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300 font-semibold">Why ask:</strong> {q.why}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
