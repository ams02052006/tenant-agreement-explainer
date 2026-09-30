import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ClipboardPaste,
  FileCheck,
  Zap,
  Info,
  Layers,
  Flame,
  FileCode
} from 'lucide-react';
import { SAMPLE_AGREEMENTS } from '../data/sampleAgreements';
import { uploadAgreementFileAPI } from '../services/apiService';

export default function InputSection({ 
  onAnalyze, 
  initialText = "", 
  onLoadSamplePreset 
}) {
  const [activeTab, setActiveTab] = useState('paste'); // 'upload' or 'paste'
  const [text, setText] = useState(initialText);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);

  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setFileLoading(true);
    setFileError(null);
    setFileName(file.name);

    // Try backend upload first
    try {
      const serverRes = await uploadAgreementFileAPI(file);
      if (serverRes && serverRes.text) {
        setText(serverRes.text);
        setFileLoading(false);
        return;
      }
    } catch (serverErr) {
      console.warn("Backend file processing fallback to client:", serverErr);
    }

    // Client-side fallback extraction
    const ext = file.name.split('.').pop().toLowerCase();
    try {
      if (ext === 'txt') {
        const reader = new FileReader();
        reader.onload = (event) => {
          setText(event.target.result);
          setFileLoading(false);
        };
        reader.readAsText(file);
      } else if (ext === 'pdf') {
        if (window.pdfjsLib) {
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
          const pdfDoc = await loadingTask.promise;
          let fullPdfText = "";
          for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            fullPdfText += pageText + "\n\n";
          }
          setText(fullPdfText);
          setFileLoading(false);
        } else {
          throw new Error("PDF parser loading... Please paste the text directly or try a .txt file.");
        }
      } else if (ext === 'docx') {
        if (window.mammoth) {
          const arrayBuffer = await file.arrayBuffer();
          const result = await window.mammoth.extractRawText({ arrayBuffer });
          setText(result.value);
          setFileLoading(false);
        } else {
          throw new Error("Word document parser loading... Please paste text directly or try a .txt file.");
        }
      } else {
        throw new Error("Unsupported format. Please upload .pdf, .docx, or .txt.");
      }
    } catch (err) {
      setFileError(err.message || "Failed to extract text from document.");
      setFileLoading(false);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text.trim() ? text.trim().split('\n').length : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || wordCount < 20) {
      setFileError("Please provide a valid agreement (at least 20 words) to analyze.");
      return;
    }
    onAnalyze(text);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-14 input-section-container">
      {/* Hero Badge & Headings */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Powered by Express Backend API & Neural-Rule Classification
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          Never Sign a <span className="bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 bg-clip-text text-transparent">Rental Trap</span> Again
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Upload or paste any PG, hostel, or residential flat agreement. We’ll decode predatory legalese into plain English, highlight red flags, and arm you with negotiation counter-clauses.
        </p>

        {/* Demo Cases Chips */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-500" /> Test Contracts:
          </span>
          {SAMPLE_AGREEMENTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                setText(sample.content);
                setFileName(null);
                setFileError(null);
                if (onLoadSamplePreset) onLoadSamplePreset(sample);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 hover:border-indigo-500/50 shadow-md transition transform active:scale-95"
            >
              <span className={`w-2 h-2 rounded-full ${
                sample.id === 'tricky_pg' ? 'bg-rose-500 ring-2 ring-rose-500/30' : 'bg-emerald-500 ring-2 ring-emerald-500/30'
              }`} />
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Glassmorphic Input Panel */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all">
        {/* Switch Tabs */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/60 p-2">
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'paste'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ClipboardPaste className="w-4 h-4" />
            Paste Agreement Text
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'upload'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload File (.pdf, .docx, .txt)
          </button>
        </div>

        <div className="p-5 sm:p-7">
          {/* Upload Dropzone */}
          {activeTab === 'upload' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700/80 hover:border-indigo-500/60 bg-slate-950/40 hover:bg-slate-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>

              <div>
                <p className="text-sm sm:text-base font-bold text-slate-200">
                  {fileName ? (
                    <span className="text-emerald-400 flex items-center gap-2 justify-center">
                      <FileCheck className="w-5 h-5" /> {fileName}
                    </span>
                  ) : (
                    "Drag & drop your rental agreement here, or click to browse"
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Server-side extraction for PDF documents, Word (.docx), and plain text (.txt)
                </p>
              </div>

              {fileLoading && (
                <div className="text-xs text-indigo-400 font-semibold animate-pulse mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  Extracting and reading text...
                </div>
              )}

              {fileName && !fileLoading && (
                <div className="mt-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full font-medium inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Ready to analyze ({wordCount} words)
                </div>
              )}
            </div>
          )}

          {/* Textarea Paste */}
          {activeTab === 'paste' && (
            <div>
              <div className="relative">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
                  <span className="font-semibold flex items-center gap-1.5 text-slate-300">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    Agreement Document Text (Natural Prose)
                  </span>
                  {text && (
                    <button
                      onClick={() => setText("")}
                      className="text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-0.5 rounded-lg border border-slate-700 transition"
                    >
                      Clear Draft
                    </button>
                  )}
                </div>

                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setFileError(null);
                  }}
                  rows={13}
                  placeholder={`Paste your rental or PG agreement here...\n\nExample:\n1. RENT: ₹18,000 payable on 1st of each month...\n2. SECURITY DEPOSIT: ₹45,000 with mandatory non-refundable deduction of ₹15,000 for painting...\n3. LOCK-IN PERIOD: Mandatory 6 months lock-in. Entire deposit forfeited if tenant leaves early...`}
                  className="w-full p-4 sm:p-5 text-sm sm:text-base font-sans text-slate-100 bg-[#070b13] rounded-2xl border border-slate-800/90 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition resize-y leading-relaxed tracking-normal"
                />
              </div>

              {/* Status footer */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  {wordCount > 0 ? (
                    <>
                      <strong className="text-white">{wordCount.toLocaleString()}</strong> words • <strong className="text-white">{lineCount}</strong> paragraphs
                    </>
                  ) : (
                    "Tip: Click any test contract above to populate instantly."
                  )}
                </span>
                <span className="text-[11px] text-slate-500">
                  Natural human-readable font • Processed via Express Backend
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {fileError && (
            <div className="mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{fileError}</span>
            </div>
          )}

          {/* Submit Action CTA */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              Audit deposit deductions, lock-in double penalties, and notice asymmetry.
            </div>

            <button
              onClick={handleSubmit}
              disabled={fileLoading || !text.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 disabled:opacity-40 disabled:cursor-not-allowed transition transform active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              Run Agreement Audit
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
