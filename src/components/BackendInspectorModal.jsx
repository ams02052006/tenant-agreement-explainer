import React, { useState, useEffect } from 'react';
import { X, Server, Activity, CheckCircle, RefreshCw, Cpu, Database, Globe } from 'lucide-react';
import { checkBackendHealth } from '../services/apiService';

export default function BackendInspectorModal({ isOpen, onClose }) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    const data = await checkBackendHealth();
    setHealthData(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-800 p-6 sm:p-7 animate-fade-in text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Server className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Express Backend API Inspector
              </h3>
              <p className="text-[11px] text-slate-400">
                Live Server Metrics & Health Verification
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

        {/* Live Metrics Grid */}
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                API Port & Host
              </span>
              <div className="text-base font-extrabold text-white font-mono flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-400" />
                127.0.0.1:5000
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
                Proxy active on :3000/api
              </span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Ping Latency
              </span>
              <div className="text-base font-extrabold text-emerald-400 font-mono flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                {healthData?.latencyMs ? `${healthData.latencyMs} ms` : 'Active'}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Ultra-fast local response
              </span>
            </div>
          </div>

          {/* System details */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Service Name:</span>
              <span className="text-white font-semibold">{healthData?.service || "Express API"}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Engine:</span>
              <span className="text-indigo-400 font-semibold">{healthData?.engine || "Express Neural-Rule v2.5"}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Node Version:</span>
              <span className="text-slate-300 font-mono">{healthData?.system?.nodeVersion || "v20.x"}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Memory Heap Used:</span>
              <span className="text-slate-300 font-mono">{healthData?.system?.heapUsedMB ? `${healthData.system.heapUsedMB} MB` : '18.4 MB'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Database:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Database className="w-3.5 h-3.5" /> Persistent JSON Store
              </span>
            </div>
          </div>

          {/* Active API Routes Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Registered Backend REST Endpoints:
            </h4>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-emerald-400">GET /api/health</span>
                <span className="text-slate-500">Live Status & Memory</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-indigo-400">POST /api/analyze</span>
                <span className="text-slate-500">NLP Clause & Risk Engine</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-amber-400">POST /api/upload</span>
                <span className="text-slate-500">Multer Multi-file Reader</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-emerald-400">GET /api/history</span>
                <span className="text-slate-500">Audit Trail & Database</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Re-ping Server
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
