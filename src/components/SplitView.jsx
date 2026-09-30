import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Grid, 
  Sparkles, 
  CheckSquare
} from 'lucide-react';
import DocumentViewer from './DocumentViewer';
import FairnessGauge from './FairnessGauge';
import MetricCards from './MetricCards';
import RiskList from './RiskList';
import QuestionsGenerator from './QuestionsGenerator';
import Checklist from './Checklist';

export default function SplitView({ analysisData }) {
  const [activeTab, setActiveTab] = useState('risks'); // 'risks', 'metrics', 'questions', 'checklist'
  const [activeClauseId, setActiveClauseId] = useState(null);

  if (!analysisData) return null;

  const { clauses, keyMetrics, riskAnalysis, healthScore, questions, checklist } = analysisData;

  const handleLocateClause = (clauseId) => {
    setActiveClauseId(clauseId);
    if (window.innerWidth < 1024) {
      const docEl = document.getElementById('document-viewer-container');
      if (docEl) {
        docEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSelectClause = (clauseId) => {
    setActiveClauseId(clauseId);
    const hasRisk = riskAnalysis.some(r => r.clauseId === clauseId);
    if (hasRisk && activeTab !== 'risks') {
      setActiveTab('risks');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Overall Health Score Banner */}
      <FairnessGauge healthScore={healthScore} />

      {/* Main Two-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Source Agreement Document Viewer */}
        <div id="document-viewer-container" className="lg:col-span-5 sticky top-20">
          <DocumentViewer
            clauses={clauses}
            risks={riskAnalysis}
            activeClauseId={activeClauseId}
            onSelectClause={handleSelectClause}
          />
        </div>

        {/* Right Column: AI Explanations, Risks & Checklist Tabs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Eye-Pleasing Dark Glass Navigation Bar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-1.5 shadow-xl flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveTab('risks')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'risks'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${activeTab === 'risks' ? 'text-white' : 'text-rose-400'}`} />
              Clause Risks
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'risks' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {riskAnalysis.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'metrics'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Grid className="w-4 h-4" />
              Key Terms
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'questions'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Negotiate
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'questions' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {questions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'checklist'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Checklist
            </button>
          </div>

          {/* Active Tab Panel Content */}
          <div className="animate-fade-in">
            {activeTab === 'risks' && (
              <RiskList
                risks={riskAnalysis}
                onLocateClause={handleLocateClause}
                activeClauseId={activeClauseId}
              />
            )}

            {activeTab === 'metrics' && (
              <div>
                <div className="mb-4 text-xs sm:text-sm text-slate-300 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shadow-md">
                  💡 <strong>Tip for Renters:</strong> Click any key term card below to automatically scroll to and flash-highlight the matching clause in your agreement on the left.
                </div>
                <MetricCards
                  metrics={keyMetrics}
                  onLocateClause={handleLocateClause}
                />
              </div>
            )}

            {activeTab === 'questions' && (
              <QuestionsGenerator
                questions={questions}
              />
            )}

            {activeTab === 'checklist' && (
              <Checklist
                initialItems={checklist}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
