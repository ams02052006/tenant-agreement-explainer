import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  BookOpen, 
  HelpCircle, 
  X, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { LEGAL_GLOSSARY } from '../data/legalGlossary';

export default function DocumentViewer({ 
  clauses, 
  risks, 
  activeClauseId, 
  onSelectClause 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [fontSize, setFontSize] = useState('text-sm');
  const [activeJargon, setActiveJargon] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingClauseId, setSpeakingClauseId] = useState(null);

  const clauseRefs = useRef({});
  const containerRef = useRef(null);

  // Auto-scroll when activeClauseId changes
  useEffect(() => {
    if (activeClauseId && clauseRefs.current[activeClauseId]) {
      const el = clauseRefs.current[activeClauseId];
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.remove('flash-highlight');
      void el.offsetWidth;
      el.classList.add('flash-highlight');
    }
  }, [activeClauseId]);

  // Read clause aloud using SpeechSynthesis
  const handleSpeakClause = (clause, e) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      if (isSpeaking && speakingClauseId === clause.id) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setSpeakingClauseId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const risk = risks.find(r => r.clauseId === clause.id);
      const textToRead = risk 
        ? `Clause ${clause.number}: ${clause.title}. In plain English: ${risk.plainEnglish}`
        : `Clause ${clause.number}: ${clause.title}. ${clause.text.substring(0, 200)}`;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingClauseId(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingClauseId(null);
      };

      setIsSpeaking(true);
      setSpeakingClauseId(clause.id);
      window.speechSynthesis.speak(utterance);
    }
  };

  const getClauseRiskInfo = (clauseId) => {
    const matching = risks.filter(r => r.clauseId === clauseId);
    if (matching.some(r => r.severity === 'high')) {
      return { severity: 'high', label: 'High Risk', count: matching.length };
    }
    if (matching.some(r => r.severity === 'medium')) {
      return { severity: 'medium', label: 'Review Needed', count: matching.length };
    }
    if (matching.some(r => r.severity === 'safe')) {
      return { severity: 'safe', label: 'Standard', count: matching.length };
    }
    return null;
  };

  const renderTextWithJargon = (text) => {
    const terms = Object.keys(LEGAL_GLOSSARY);
    const pattern = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const matchedWord = match[0];
      const lower = matchedWord.toLowerCase();
      const info = LEGAL_GLOSSARY[lower];

      parts.push(
        <button
          key={`${match.index}-${lower}`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveJargon(info);
          }}
          className="inline-flex items-center gap-0.5 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-1 py-0.5 rounded font-semibold underline decoration-indigo-400/50 decoration-dotted underline-offset-2 transition"
          title={`Click to decode legal jargon: ${matchedWord}`}
        >
          {matchedWord}
          <HelpCircle className="w-2.5 h-2.5 text-indigo-400 opacity-80" />
        </button>
      );

      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-xl flex flex-col h-full overflow-hidden relative">
      {/* Document Header Controls */}
      <div className="p-3.5 sm:p-4 border-b border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-white text-xs sm:text-sm">
            Source Agreement
          </h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 border border-slate-700/80 px-2 py-0.5 rounded-full">
            {clauses.length} Clauses
          </span>
        </div>

        {/* Search & Font Size */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-2.5 py-1 text-xs bg-slate-950/80 rounded-xl border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 w-32 sm:w-40"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center border border-slate-700 rounded-xl bg-slate-950/80 overflow-hidden text-xs">
            <button
              onClick={() => setFontSize('text-xs')}
              className={`px-2 py-1 hover:bg-slate-800 ${fontSize === 'text-xs' ? 'font-bold bg-slate-800 text-indigo-400' : 'text-slate-400'}`}
              title="Small text"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('text-sm')}
              className={`px-2 py-1 hover:bg-slate-800 ${fontSize === 'text-sm' ? 'font-bold bg-slate-800 text-indigo-400' : 'text-slate-400'}`}
              title="Normal text"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('text-base')}
              className={`px-2 py-1 hover:bg-slate-800 ${fontSize === 'text-base' ? 'font-bold bg-slate-800 text-indigo-400' : 'text-slate-400'}`}
              title="Large text"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Jargon Buster Popup Banner */}
      {activeJargon && (
        <div className="bg-indigo-950/90 border-b border-indigo-500/30 text-white p-3.5 px-4 text-xs flex items-start justify-between gap-3 animate-fade-in shadow-lg shrink-0">
          <div>
            <div className="font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Legal Jargon Decoder: {activeJargon.term}
            </div>
            <p className="mt-1 text-slate-200 leading-relaxed text-xs">
              {activeJargon.definition}
            </p>
            <p className="mt-1 text-emerald-400 font-semibold text-xs">
              💡 <strong>Renter Takeaway:</strong> {activeJargon.tenantTip}
            </p>
          </div>
          <button
            onClick={() => setActiveJargon(null)}
            className="p-1 text-indigo-400 hover:text-white rounded-lg hover:bg-indigo-900 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container with Risk Minimap on Right */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Scrollable Clauses */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 max-h-[750px] divide-y divide-slate-800/60"
        >
          {clauses.map((clause) => {
            const riskInfo = getClauseRiskInfo(clause.id);
            const isSelected = activeClauseId === clause.id;
            const isSpeakingThis = isSpeaking && speakingClauseId === clause.id;

            const severityStyles = {
              high: 'border-l-4 border-l-rose-500 bg-rose-500/5',
              medium: 'border-l-4 border-l-amber-500 bg-amber-500/5',
              safe: 'border-l-4 border-l-emerald-500 bg-emerald-500/5',
              default: 'border-l-2 border-l-transparent hover:bg-slate-800/30'
            }[riskInfo ? riskInfo.severity : 'default'];

            const matchesSearch = searchTerm && clause.text.toLowerCase().includes(searchTerm.toLowerCase());

            return (
              <div
                key={clause.id}
                ref={(el) => (clauseRefs.current[clause.id] = el)}
                onClick={() => onSelectClause && onSelectClause(clause.id)}
                className={`p-4 rounded-2xl transition-all duration-200 cursor-pointer ${severityStyles} ${
                  isSelected ? 'ring-2 ring-indigo-500 bg-indigo-500/10 shadow-lg' : ''
                } ${matchesSearch ? 'bg-amber-400/20' : ''}`}
              >
                {/* Clause Header Bar */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[11px] text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-lg font-sans">
                      #{clause.number}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight font-sans">
                      {clause.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Read Aloud Button */}
                    <button
                      onClick={(e) => handleSpeakClause(clause, e)}
                      className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1 ${
                        isSpeakingThis 
                          ? 'bg-indigo-600 text-white animate-pulse' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={isSpeakingThis ? "Stop reading" : "Read clause & explanation aloud"}
                    >
                      {isSpeakingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>

                    {riskInfo && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          riskInfo.severity === 'high'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : riskInfo.severity === 'medium'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {riskInfo.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Clause Content - Clean Natural Typography */}
                <div className={`font-sans ${fontSize} text-slate-200 leading-relaxed whitespace-pre-line tracking-normal`}>
                  {renderTextWithJargon(clause.text)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Risk Minimap Visual Rail */}
        <div className="w-4 bg-slate-950/80 border-l border-slate-800/80 flex flex-col items-center py-2 gap-1 shrink-0 select-none">
          {clauses.map((c, i) => {
            const riskInfo = getClauseRiskInfo(c.id);
            let dotColor = "bg-slate-700";
            if (riskInfo?.severity === 'high') dotColor = "bg-rose-500";
            else if (riskInfo?.severity === 'medium') dotColor = "bg-amber-400";
            else if (riskInfo?.severity === 'safe') dotColor = "bg-emerald-400";

            return (
              <button
                key={c.id}
                onClick={() => onSelectClause && onSelectClause(c.id)}
                className={`w-2 h-2 rounded-full transition transform hover:scale-150 ${dotColor} ${
                  activeClauseId === c.id ? 'ring-2 ring-indigo-400 scale-125' : ''
                }`}
                title={`Jump to Clause ${c.number}: ${c.title}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
