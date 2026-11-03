import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RiskGaugeProps {
  riskScore: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  prediction: 'FRAUDULENT' | 'LEGITIMATE';
  confidence: number;
  threshold: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  riskScore,
  riskLevel,
  prediction,
  confidence,
  threshold
}) => {
  const getLevelConfig = () => {
    switch (riskLevel) {
      case 'CRITICAL':
        return {
          textColor: 'text-rose-400',
          borderColor: 'border-rose-500/40',
          bgColor: 'bg-rose-950/40',
          barColor: 'bg-gradient-to-r from-orange-500 to-rose-600',
          icon: <ShieldAlert className="w-6 h-6 text-rose-400" />,
          label: 'CRITICAL SCAM RISK',
          subtext: 'High-severity indicators detected (advance fee, financial phishing, or task scams).'
        };
      case 'HIGH':
        return {
          textColor: 'text-orange-400',
          borderColor: 'border-orange-500/40',
          bgColor: 'bg-orange-950/40',
          barColor: 'bg-gradient-to-r from-amber-500 to-orange-600',
          icon: <AlertTriangle className="w-6 h-6 text-orange-400" />,
          label: 'HIGH SUSPICION',
          subtext: 'Multiple red flags present. Highly likely to be recruitment fraud.'
        };
      case 'MODERATE':
        return {
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/40',
          bgColor: 'bg-amber-950/40',
          barColor: 'bg-amber-500',
          icon: <AlertCircle className="w-6 h-6 text-amber-400" />,
          label: 'MODERATE RISK',
          subtext: 'Ambiguous or unverified attributes. Proceed with caution and verify company.'
        };
      case 'LOW':
      default:
        return {
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/40',
          bgColor: 'bg-emerald-950/40',
          barColor: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
          label: 'LOW RISK / LEGITIMATE',
          subtext: 'Patterns match legitimate enterprise hiring with no advance fee signals.'
        };
    }
  };

  const config = getLevelConfig();

  return (
    <div className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-6 transition-all`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
            {config.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-lg font-bold tracking-wide ${config.textColor}`}>
                {config.label}
              </span>
              <span
                className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${prediction === 'FRAUDULENT'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
              >
                {prediction}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-md">{config.subtext}</p>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
          <span className="text-xs text-slate-400">Risk Score</span>
          <div className="flex items-baseline space-x-1">
            <span className={`text-3xl font-extrabold ${config.textColor}`}>{riskScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="text-xs text-slate-400 mt-0.5">
            Model Confidence: {(confidence * 100).toFixed(1)}% (Th: {threshold})
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="w-full bg-slate-900 rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ${config.barColor}`}
            style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
          <span>0 (Safe)</span>
          <span>40 (Moderate)</span>
          <span>60 (High Risk)</span>
          <span>100 (Severe Scam)</span>
        </div>
      </div>
    </div>
  );
};

