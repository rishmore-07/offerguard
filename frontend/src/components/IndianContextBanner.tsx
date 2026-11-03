import React from 'react';
import { PhoneCall, ExternalLink, Scale } from 'lucide-react';

interface IndianContextBannerProps {
  advice: string[];
}

export const IndianContextBanner: React.FC<IndianContextBannerProps> = ({ advice }) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-900/40 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-indigo-900/30 pb-3">
        <div className="flex items-center space-x-2">
          <Scale className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-indigo-200">
            Indian Recruitment Safety & Regulatory Guidelines
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-rose-300 font-semibold bg-rose-950/60 border border-rose-500/30 px-2.5 py-1 rounded-full">
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Cyber Crime Helpline: 1930</span>
        </div>
      </div>

      <ul className="space-y-2 text-xs text-slate-300">
        {advice.map((item, index) => (
          <li key={index} className="flex items-start space-x-2">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>

      <div className="pt-2 flex flex-wrap gap-2 text-xs">
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-indigo-300 hover:text-indigo-200 bg-indigo-950/60 border border-indigo-800/50 px-2.5 py-1 rounded transition"
        >
          <span>National Cyber Crime Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <a
          href="https://www.mca.gov.in/mcafoportal/viewCompanyMasterData.do"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-indigo-300 hover:text-indigo-200 bg-indigo-950/60 border border-indigo-800/50 px-2.5 py-1 rounded transition"
        >
          <span>Verify Company CIN (MCA21)</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
