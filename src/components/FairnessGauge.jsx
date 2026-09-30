import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';

export default function FairnessGauge({ healthScore }) {
  if (!healthScore) return null;

  const { score, status, verdict, highCount, medCount, safeCount } = healthScore;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = "#10b981"; // emerald
  let glowColor = "rgba(16, 185, 129, 0.4)";
  let badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

  if (score < 55) {
    strokeColor = "#ef4444"; // rose
    glowColor = "rgba(239, 68, 68, 0.4)";
    badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-500/30";
  } else if (score < 75) {
    strokeColor = "#f59e0b"; // amber
    glowColor = "rgba(245, 158, 11, 0.4)";
    badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/30";
  }

  return (
    <div className="p-5 sm:p-7 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-2xl mb-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div 
        className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: strokeColor }}
      />

      {/* Left: Score Dial */}
      <div className="flex items-center gap-5 z-10">
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 110 110">
            {/* Background ring */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              stroke="rgba(51, 65, 85, 0.5)"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              stroke={strokeColor}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                filter: `drop-shadow(0 0 6px ${glowColor})`,
                transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-white tracking-tight leading-none">
              {score}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              / 100
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${badgeStyle}`}>
              {status}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white mt-1.5 tracking-tight">
            Tenant Fairness Health Score
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-xl">
            {verdict}
          </p>
        </div>
      </div>

      {/* Right: Risk Count Badges */}
      <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-auto justify-around sm:justify-start pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-800 z-10">
        <div className="bg-slate-950/80 border border-rose-500/30 px-4 py-2.5 rounded-2xl text-center shadow-lg">
          <div className="text-2xl font-black text-rose-400 leading-none">
            {highCount}
          </div>
          <div className="text-[10px] font-bold text-rose-300 uppercase tracking-wider mt-1">
            Red Flags
          </div>
        </div>

        <div className="bg-slate-950/80 border border-amber-500/30 px-4 py-2.5 rounded-2xl text-center shadow-lg">
          <div className="text-2xl font-black text-amber-400 leading-none">
            {medCount}
          </div>
          <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mt-1">
            Needs Review
          </div>
        </div>

        <div className="bg-slate-950/80 border border-emerald-500/30 px-4 py-2.5 rounded-2xl text-center shadow-lg">
          <div className="text-2xl font-black text-emerald-400 leading-none">
            {safeCount}
          </div>
          <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider mt-1">
            Standard/Safe
          </div>
        </div>
      </div>
    </div>
  );
}
