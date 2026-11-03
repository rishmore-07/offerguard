import React from 'react';
import type { SuspiciousSignal } from '../types';
import { AlertOctagon, Tag } from 'lucide-react';

interface RedFlagsCardProps {
  redFlags: SuspiciousSignal[];
  keyIndicators?: string[];
}

export const RedFlagsCard: React.FC<RedFlagsCardProps> = ({ redFlags, keyIndicators = [] }) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/30';
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <span>Detected Scam Red Flags ({redFlags.length})</span>
        </h3>
        {redFlags.length === 0 && (
          <span className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
            No known scam heuristics triggered
          </span>
        )}
      </div>

      {redFlags.length > 0 ? (
        <div className="space-y-3">
          {redFlags.map((flag, idx) => (
            <div
              key={idx}
              className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-2 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 text-[11px] font-bold rounded border ${getSeverityBadge(flag.severity)}`}>
                    {flag.severity}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{flag.signal}</span>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {flag.category}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{flag.description}</p>

              {flag.matched_text && (
                <div className="bg-slate-900/90 rounded px-2.5 py-1.5 border border-slate-800 text-[11px] text-amber-300/90 font-mono">
                  <span className="text-slate-400 mr-1">Matched text:</span> "{flag.matched_text}"
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">
          This listing did not match signature recruitment fraud rules (e.g. advance fee demands, task scam phrases, or public webmails).
        </p>
      )}

      {keyIndicators && keyIndicators.length > 0 && (
        <div className="pt-3 border-t border-slate-800">
          <span className="text-xs font-medium text-slate-400 flex items-center space-x-1.5 mb-2">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            <span>Model Top Influential Tokens (TF-IDF Weights)</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {keyIndicators.map((token, i) => (
              <span
                key={i}
                className="text-xs font-mono bg-indigo-950/40 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded"
              >
                +{token}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
