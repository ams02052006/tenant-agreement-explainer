import React from 'react';
import { 
  DollarSign, 
  ShieldAlert, 
  Clock, 
  Bell, 
  Wrench, 
  Eye, 
  ArrowUpRight
} from 'lucide-react';

export default function MetricCards({ metrics, onLocateClause }) {
  if (!metrics) return null;

  const cards = [
    {
      id: "rent",
      title: "Rent & Payment Due Date",
      icon: DollarSign,
      mainValue: metrics.rent.amount,
      subValue: `Due by ${metrics.rent.dueDate}`,
      extraNote: metrics.rent.lateFee !== "None stated" && metrics.rent.lateFee !== "No specific penalty stated" ? `Late fee: ${metrics.rent.lateFee}` : null,
      severity: metrics.rent.severity,
      targetClauseNum: "1"
    },
    {
      id: "deposit",
      title: "Security Deposit & Refund",
      icon: ShieldAlert,
      mainValue: metrics.deposit.amount,
      subValue: metrics.deposit.deductions,
      extraNote: `Refund timeline: ${metrics.deposit.refundTimeline}`,
      severity: metrics.deposit.severity,
      targetClauseNum: "2"
    },
    {
      id: "lockIn",
      title: "Lock-in & Early Exit Penalty",
      icon: Clock,
      mainValue: metrics.lockIn.duration,
      subValue: metrics.lockIn.penalty,
      extraNote: metrics.lockIn.severity === "high" ? "⚠️ Full deposit forfeit if exiting early" : null,
      severity: metrics.lockIn.severity,
      targetClauseNum: "3"
    },
    {
      id: "notice",
      title: "Notice Period Balance",
      icon: Bell,
      mainValue: `Tenant: ${metrics.notice.tenant}`,
      subValue: `Landlord: ${metrics.notice.owner}`,
      extraNote: metrics.notice.hasAsymmetry ? "⚠️ Asymmetric notice! Landlord can evict faster than you can leave" : "Mutual notice period",
      severity: metrics.notice.severity,
      targetClauseNum: "4"
    },
    {
      id: "repairs",
      title: "Maintenance & Repairs",
      icon: Wrench,
      mainValue: metrics.maintenance.severity === "high" ? "Tenant 100%" : "Shared Split",
      subValue: metrics.maintenance.terms,
      extraNote: metrics.maintenance.severity === "high" ? "Includes high-cost geysers & structural repairs" : null,
      severity: metrics.maintenance.severity,
      targetClauseNum: "5"
    },
    {
      id: "privacy",
      title: "Privacy & Inspection Notice",
      icon: Eye,
      mainValue: metrics.privacy.unrestrictedEntry ? "No Notice Required" : "24h Prior Notice",
      subValue: metrics.privacy.terms,
      extraNote: metrics.privacy.unrestrictedEntry ? "⚠️ Landlord claims right to enter room at any hour" : "Standard daylight inspection",
      severity: metrics.privacy.severity,
      targetClauseNum: "6"
    }
  ];

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'high':
        return {
          border: 'border-rose-500/30 hover:border-rose-500/60 bg-rose-500/5',
          badgeBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
          iconBg: 'bg-rose-500/20 text-rose-400',
          badgeText: 'High Risk'
        };
      case 'medium':
        return {
          border: 'border-amber-500/30 hover:border-amber-500/60 bg-amber-500/5',
          badgeBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
          iconBg: 'bg-amber-500/20 text-amber-400',
          badgeText: 'Review Needed'
        };
      default:
        return {
          border: 'border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/5',
          badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
          iconBg: 'bg-emerald-500/20 text-emerald-400',
          badgeText: 'Standard'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6">
      {cards.map((card) => {
        const style = getSeverityStyle(card.severity);
        const IconComponent = card.icon;

        return (
          <div
            key={card.id}
            onClick={() => onLocateClause && onLocateClause(`clause-${card.targetClauseNum}`)}
            className={`p-4 sm:p-5 rounded-2xl border ${style.border} bg-slate-900/80 backdrop-blur-xl transition-all duration-200 cursor-pointer hover:shadow-xl flex flex-col justify-between group relative`}
            title="Click to jump to this clause in agreement text"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className={`p-2 rounded-xl ${style.iconBg}`}>
                  <IconComponent className="w-4 h-4" />
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${style.badgeBg}`}>
                  {style.badgeText}
                </span>
              </div>

              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </h4>
              <div className="text-lg sm:text-xl font-black text-white mt-1">
                {card.mainValue}
              </div>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {card.subValue}
              </p>
            </div>

            {card.extraNote && (
              <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] font-medium text-slate-400 flex items-center justify-between">
                <span>{card.extraNote}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-indigo-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
