import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, FileText, CheckCircle2 } from 'lucide-react';

export default function LoadingSkeleton({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "Parsing document structure & numbered clauses", icon: FileText },
    { title: "Auditing security deposit & painting deductions", icon: Search },
    { title: "Checking lock-in duration & termination penalties", icon: ShieldCheck },
    { title: "Evaluating tenant privacy & repair responsibilities", icon: Search },
    { title: "Generating plain-English questions for landlord", icon: CheckCircle2 }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          if (onComplete) {
            setTimeout(onComplete, 400);
          }
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(timer);
  }, [onComplete, steps.length]);

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center animate-fade-in">
      {/* Animated Radar Pulse Icon */}
      <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-indigo-600/30 animate-pulse" />
        <div className="relative w-14 h-14 rounded-3xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30">
          <Search className="w-7 h-7 animate-bounce" />
        </div>
      </div>

      <h3 className="text-2xl font-black text-white tracking-tight">
        Analyzing Agreement Clauses...
      </h3>
      <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
        Neural-rule engine scanning for hidden traps, asymmetric liabilities, and unfair deductions
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden mt-6 border border-slate-800">
        <div
          className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 h-full transition-all duration-300 ease-out shadow-sm"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step Checklist in Eye-Pleasing Dark Glass */}
      <div className="mt-8 space-y-3 text-left max-w-md mx-auto">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const StepIcon = step.icon;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3.5 p-3.5 rounded-2xl border text-xs sm:text-sm transition-all duration-300 ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : isCurrent
                  ? 'bg-indigo-500/15 border-indigo-500/50 shadow-lg text-white font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isDone
                    ? 'bg-emerald-500 text-slate-950'
                    : isCurrent
                    ? 'bg-indigo-500 text-white animate-spin'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <span className="flex-1">{step.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
