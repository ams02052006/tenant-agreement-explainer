import React, { useState, useEffect } from 'react';
import { X, Clock, ShieldAlert, CheckCircle, Trash2, ArrowRight, FileText, Database } from 'lucide-react';
import { fetchHistoryAPI, fetchAuditByIdAPI, deleteAuditAPI } from '../services/apiService';

export default function HistoryDrawer({ isOpen, onClose, onSelectAudit }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const loadHistory = async () => {
    setLoading(true);
    const list = await fetchHistoryAPI();
    setHistory(list);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoadItem = async (id) => {
    setLoadingId(id);
    try {
      const fullAudit = await fetchAuditByIdAPI(id);
      if (fullAudit) {
        onSelectAudit(fullAudit);
        onClose();
      }
    } catch (err) {
      alert("Failed to load saved audit: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm("Delete this saved audit record from server database?")) {
      await deleteAuditAPI(id);
      loadHistory();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex justify-end animate-fade-in">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Saved Audits & History
              </h3>
              <p className="text-[11px] text-slate-400">
                Stored in Express Backend Database ({history.length} records)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {loading && (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Loading audits from backend...
            </div>
          )}

          {!loading && history.length === 0 && (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No saved audits yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Any agreement you analyze is automatically archived here for future reference.
              </p>
            </div>
          )}

          {!loading && history.map((item) => {
            const isPredatory = item.fairnessScore < 55;
            const isCaution = item.fairnessScore >= 55 && item.fairnessScore < 75;

            return (
              <div
                key={item.id}
                onClick={() => handleLoadItem(item.id)}
                className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-indigo-500/50 transition cursor-pointer group shadow-sm flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-sans">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      <span>•</span>
                      <span>{item.clausesCount} clauses</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    isPredatory 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : isCaution
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {item.fairnessScore}/100
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-xs">
                  <span className="text-[11px] text-rose-400 font-semibold">
                    {item.highRisks > 0 ? `⚠️ ${item.highRisks} Red Flags` : '🟢 Standard Terms'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-semibold rounded-lg transition"
                    >
                      {loadingId === item.id ? "Loading..." : "Open Audit"}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Drawer footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-500 text-center">
          Persisted locally on Express Server • Never shared externally
        </div>
      </div>
    </div>
  );
}
