import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  ShieldCheck, 
  Sparkles,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Checklist({ initialItems }) {
  const [items, setItems] = useState(initialItems || []);

  const toggleItem = (id) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, isCompleted: !item.isCompleted };
      }
      return item;
    });
    setItems(updated);

    const allDone = updated.every(i => i.isCompleted);
    if (allDone) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const completedCount = items.filter(i => i.isCompleted).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h4 className="font-extrabold text-white text-base">
              Pre-Signing Due Diligence Checklist
            </h4>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            {completedCount} / {items.length} Completed ({progressPercent}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden mt-3 border border-slate-800">
          <div
            className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-xs text-slate-400 mt-2.5">
          {progressPercent === 100 ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" /> All verification steps checked! You're ready to proceed with confidence.
            </span>
          ) : (
            "Complete these key checks before handing over token money or signing the final draft."
          )}
        </p>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2.5">
        {items.map((item) => {
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                item.isCompleted
                  ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-300'
                  : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 shadow-md'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-slate-500 hover:text-indigo-400 shrink-0 focus:outline-hidden"
              >
                {item.isCompleted ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-600" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      item.isCompleted ? 'line-through text-slate-500' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
