import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  LocateFixed, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Scale
} from 'lucide-react';

export default function RiskList({ risks, onLocateClause, activeClauseId }) {
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);

  const filteredRisks = risks.filter((r) => {
    if (filter === 'all') return true;
    return r.severity === filter;
  });

  const counts = {
    all: risks.length,
    high: risks.filter(r => r.severity === 'high').length,
    medium: risks.filter(r => r.severity === 'medium').length,
    safe: risks.filter(r => r.severity === 'safe').length,
  };

  const handleCopyClause = async (tip, id, e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(tip);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSpeakRisk = (risk, e) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      if (speakingId === risk.id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const textToRead = `${risk.title}. What this means: ${risk.plainEnglish}. Suggested counter-clause: ${risk.negotiationTip}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);

      setSpeakingId(risk.id);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-2 rounded-xl font-bold transition ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Detected ({counts.all})
        </button>
        <button
          onClick={() => setFilter('high')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
            filter === 'high'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-rose-400 hover:bg-rose-500/10'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          Red Flags ({counts.high})
        </button>
        <button
          onClick={() => setFilter('medium')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
            filter === 'medium'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-amber-400 hover:bg-amber-500/10'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Review Needed ({counts.medium})
        </button>
        <button
          onClick={() => setFilter('safe')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition ${
            filter === 'safe'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-emerald-400 hover:bg-emerald-500/10'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Safe Terms ({counts.safe})
        </button>
      </div>

      {/* Risk Cards */}
      <div className="space-y-3.5">
        {filteredRisks.map((risk) => {
          const isSelected = activeClauseId === risk.clauseId;
          const isExpanded = expandedId === risk.id || isSelected;
          const isSpeakingThis = speakingId === risk.id;

          const severityConfig = {
            high: {
              border: isSelected ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-rose-500/30 hover:border-rose-500/60',
              bg: 'bg-rose-500/5',
              badgeBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
              icon: AlertOctagon,
              iconColor: 'text-rose-400',
              label: 'High Risk Flag'
            },
            medium: {
              border: isSelected ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-amber-500/30 hover:border-amber-500/60',
              bg: 'bg-amber-500/5',
              badgeBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
              icon: AlertTriangle,
              iconColor: 'text-amber-400',
              label: 'Review Needed'
            },
            safe: {
              border: isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-emerald-500/30 hover:border-emerald-500/60',
              bg: 'bg-emerald-500/5',
              badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
              icon: CheckCircle2,
              iconColor: 'text-emerald-400',
              label: 'Standard / Safe'
            }
          }[risk.severity];

          const IconComp = severityConfig.icon;

          return (
            <div
              key={risk.id}
              className={`rounded-3xl border ${severityConfig.border} bg-slate-900/80 backdrop-blur-xl shadow-lg transition-all overflow-hidden`}
            >
              {/* Header */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className={`p-2 rounded-xl shrink-0 ${severityConfig.badgeBg}`}>
                      <IconComp className={`w-4 h-4 ${severityConfig.iconColor}`} />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${severityConfig.badgeBg}`}>
                          {severityConfig.label}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                          Clause {risk.clauseNumber} • {risk.category}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white mt-1.5">
                        {risk.title}
                      </h4>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Audio Listen */}
                    <button
                      onClick={(e) => handleSpeakRisk(risk, e)}
                      className={`p-2 rounded-xl text-xs transition ${
                        isSpeakingThis ? 'bg-indigo-600 text-white animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title="Listen to explanation"
                    >
                      {isSpeakingThis ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    {/* Locate Button */}
                    <button
                      onClick={() => onLocateClause(risk.clauseId)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 rounded-xl transition"
                      title="Scroll to and highlight this clause in source agreement"
                    >
                      <LocateFixed className="w-3.5 h-3.5" />
                      <span>Locate</span>
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : risk.id)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Plain English Translation */}
                <div className="mt-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <span className="font-bold text-indigo-400 block mb-1 text-[11px] uppercase tracking-wider">
                    🗣️ Plain English Meaning:
                  </span>
                  {risk.plainEnglish}
                </div>
              </div>

              {/* Expanded Comparison & Counter-clause */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-800/80 space-y-3.5 bg-slate-950/40 animate-fade-in text-xs sm:text-sm">
                  {/* The Hidden Risk */}
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3.5 text-rose-200">
                    <span className="font-bold text-rose-400 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      The Hidden Trap:
                    </span>
                    <p className="leading-relaxed text-slate-300">
                      {risk.hiddenRisk}
                    </p>
                  </div>

                  {/* Negotiation Tip & 1-Click Copy */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 text-emerald-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <Lightbulb className="w-3.5 h-3.5" />
                        Suggested Fair Counter-Clause:
                      </span>
                      <button
                        onClick={(e) => handleCopyClause(risk.negotiationTip, risk.id, e)}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-white bg-emerald-500/20 hover:bg-emerald-500/30 px-2.5 py-1 rounded-lg transition"
                      >
                        {copiedId === risk.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === risk.id ? 'Copied' : 'Copy Counter-Clause'}</span>
                      </button>
                    </div>
                    <p className="leading-relaxed text-emerald-200 font-sans text-xs sm:text-sm bg-slate-950/80 p-3 rounded-xl border border-emerald-500/30 mt-1.5 font-medium">
                      "{risk.negotiationTip}"
                    </p>
                  </div>

                  {/* Original Text Snippet */}
                  <div className="text-xs text-slate-400 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="font-semibold text-slate-300 block mb-1">
                      Original Contract Snippet:
                    </span>
                    <p className="font-sans italic text-slate-300 leading-relaxed">
                      "{risk.snippet}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
