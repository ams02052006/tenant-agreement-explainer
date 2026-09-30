import React, { useState, useEffect } from 'react';
import { X, Sparkles, Key, Check, ShieldCheck, Server, Activity } from 'lucide-react';
import { checkBackendHealth } from '../services/apiService';

export default function AISettingsModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('express');
  const [saved, setSaved] = useState(false);
  const [backendInfo, setBackendInfo] = useState(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('tenant_ai_key') || '';
    const savedProvider = localStorage.getItem('tenant_ai_provider') || 'express';
    setApiKey(savedKey);
    setProvider(savedProvider);

    if (isOpen) {
      checkBackendHealth().then(setBackendInfo);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('tenant_ai_key', apiKey.trim());
    localStorage.setItem('tenant_ai_provider', provider);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-800 p-6 sm:p-7 animate-fade-in text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Server className="w-5 h-5" />
            </span>
            <h3 className="font-extrabold text-white text-base sm:text-lg">
              Backend & AI Engine Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs sm:text-sm text-slate-300">
          {/* Live Backend Connection Card */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center justify-between font-bold mb-1">
              <span className="flex items-center gap-2 text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Express API Status:
              </span>
              <span className="text-emerald-400 font-mono">
                {backendInfo?.status === 'ok' ? 'Online (Port 5000)' : 'Client Local'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Backend handles PDF/Word parsing via <code className="text-indigo-400">pdf-parse</code> & <code className="text-indigo-400">mammoth</code>.
            </p>
          </div>

          <div>
            <label className="block font-bold text-white mb-2 text-xs uppercase tracking-wider">
              Processing Mode:
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-950 cursor-pointer transition">
                <input
                  type="radio"
                  name="provider"
                  value="express"
                  checked={provider === 'express'}
                  onChange={() => setProvider('express')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-white block text-xs">
                    Express Neural-Rule Engine (Recommended)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    High speed, zero API cost, completely private.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-950 cursor-pointer transition">
                <input
                  type="radio"
                  name="provider"
                  value="gemini"
                  checked={provider === 'gemini'}
                  onChange={() => setProvider('gemini')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-white block text-xs">
                    Google Gemini 1.5 Pro / Flash
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Use your Google AI Studio API key for generative advice.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-950 cursor-pointer transition">
                <input
                  type="radio"
                  name="provider"
                  value="openai"
                  checked={provider === 'openai'}
                  onChange={() => setProvider('openai')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-white block text-xs">
                    OpenAI GPT-4o
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Use your OpenAI API key for live LLM extraction.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {provider !== 'express' && (
            <div className="animate-fade-in pt-1">
              <label className="block font-bold text-white mb-1.5 text-xs">
                Your API Key:
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 text-white outline-hidden"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Keys remain in your client local storage and are never logged.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Configuration</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
