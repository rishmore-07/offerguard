import React from 'react';

export const CyberVisualization: React.FC = () => {
  return (
    <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[320px] lg:max-w-[340px] mx-auto flex items-center justify-center">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/15 via-indigo-500/10 to-rose-500/15 rounded-full blur-2xl animate-pulse" />

      {/* Outer concentric radar rings */}
      <div className="absolute inset-2 sm:inset-3 rounded-full border border-cyan-500/20 animate-spin" style={{ animationDuration: '30s' }} />
      <div className="absolute inset-8 sm:inset-10 rounded-full border border-indigo-500/20 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
      <div className="absolute inset-14 sm:inset-16 rounded-full border border-rose-500/20" />
      <div className="absolute inset-20 sm:inset-22 rounded-full border border-cyan-400/30 border-dashed animate-spin" style={{ animationDuration: '40s' }} />

      {/* Scanning radar sweep */}
      <div
        className="absolute inset-6 sm:inset-7 rounded-full pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(6, 182, 212, 0.18) 360deg)',
          animation: 'spin 4s linear infinite'
        }}
      />

      {/* Central Cyber Core */}
      <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-slate-950/85 border border-cyan-500/40 backdrop-blur-xl shadow-2xl shadow-cyan-950/60 flex flex-col items-center text-center">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-2 animate-pulse">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
          OfferGuard Shield
        </span>
        <span className="text-[10px] text-slate-400 mt-0.5">
          Indian Scam Intelligence
        </span>
      </div>

      {/* Threat and Clean Nodes around the perimeter */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-rose-500/20 border border-rose-500/50 text-rose-300 text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full shadow-lg shadow-rose-950/50 flex items-center space-x-1 animate-bounce">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
        <span>Gate Pass Fee Flag</span>
      </div>

      <div className="absolute bottom-6 sm:bottom-8 left-3 sm:left-4 bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full shadow-lg shadow-amber-950/50 flex items-center space-x-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <span>UPI Handle Detected</span>
      </div>

      <div className="absolute top-18 sm:top-20 left-2 sm:left-3 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full shadow-lg shadow-cyan-950/50 flex items-center space-x-1">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        <span>MCA21 Verified</span>
      </div>

      <div className="absolute bottom-12 sm:bottom-14 right-2 sm:right-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full shadow-lg shadow-emerald-950/50 flex items-center space-x-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>TCS Official Portal</span>
      </div>
    </div>
  );
};

