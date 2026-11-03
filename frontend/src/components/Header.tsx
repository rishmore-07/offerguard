import React from 'react';
import {
  ShieldAlert,
  Search,
  Activity,
  Cpu,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';

export type NavTab = 'home' | 'scanner' | 'threats' | 'model' | 'guide';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  modelStatus?: string;
  isDemoMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  modelStatus = 'Trained Baseline AI',
  isDemoMode = false
}) => {
  return (
    <header className="border-b-[2.5px] border-[#111111] bg-[#FAF9F6] sticky top-0 z-50 transition-all">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo - Neo Brutalist */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 text-left group cursor-pointer"
          >
            <div className="p-2 bg-[#F72585] border-2 border-[#111111] rounded-xl shadow-[3px_3px_0px_#111111] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-[4px_4px_0px_#111111] transition-all">
              <ShieldAlert className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-[#111111] font-heading">
                  OfferGuard<span className="text-[#F72585]">.ai</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-extrabold bg-[#FFE45E] text-[#111111] border-2 border-[#111111] rounded shadow-[1.5px_1.5px_0px_#111111]">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-[#555555] font-medium hidden sm:block">
                Job Scam Detection • Built for Safer Careers
              </p>
            </div>
          </button>

          {/* Navigation Links - Neo-Brutalist Pill Tabs */}
          <nav className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border-2 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#FFE45E] text-[#111111] border-[#111111] shadow-[2.5px_2.5px_0px_#111111]'
                  : 'bg-transparent text-[#333333] border-transparent hover:border-[#111111] hover:bg-[#FFD6E8]'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border-2 cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-[#F72585] text-white border-[#111111] shadow-[2.5px_2.5px_0px_#111111]'
                  : 'bg-transparent text-[#333333] border-transparent hover:border-[#111111] hover:bg-[#FFD6E8]'
              }`}
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>AI Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('threats')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border-2 cursor-pointer ${
                activeTab === 'threats'
                  ? 'bg-[#E9DDFF] text-[#111111] border-[#111111] shadow-[2.5px_2.5px_0px_#111111]'
                  : 'bg-transparent text-[#333333] border-transparent hover:border-[#111111] hover:bg-[#FFD6E8]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Threat Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('model')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border-2 cursor-pointer ${
                activeTab === 'model'
                  ? 'bg-[#FFE45E] text-[#111111] border-[#111111] shadow-[2.5px_2.5px_0px_#111111]'
                  : 'bg-transparent text-[#333333] border-transparent hover:border-[#111111] hover:bg-[#FFD6E8]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Model Specs</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border-2 cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-[#FFD6E8] text-[#111111] border-[#111111] shadow-[2.5px_2.5px_0px_#111111]'
                  : 'bg-transparent text-[#333333] border-transparent hover:border-[#111111] hover:bg-[#FFD6E8]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Scam Directory</span>
            </button>
          </nav>

          {/* Model Status & CTA */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-[11px] font-mono text-[#111111] font-bold">
              <span className={`w-2.5 h-2.5 rounded-full border border-[#111111] ${isDemoMode ? 'bg-[#FFE45E]' : 'bg-emerald-400'}`} />
              <span className="truncate max-w-[170px]">{modelStatus}</span>
            </div>

            <button
              onClick={() => setActiveTab('scanner')}
              className="px-4 py-2 rounded-xl bg-[#F72585] text-white font-extrabold text-xs tracking-wide border-2 border-[#111111] shadow-[3px_3px_0px_#111111] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4.5px_4.5px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Scan Offer</span>
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center space-x-1 overflow-x-auto py-2.5 border-t-2 border-[#111111] text-xs">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1 rounded-lg whitespace-nowrap font-bold border-2 ${
              activeTab === 'home' ? 'bg-[#FFE45E] border-[#111111] shadow-[2px_2px_0px_#111111]' : 'border-transparent text-[#333]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3 py-1 rounded-lg whitespace-nowrap font-bold border-2 ${
              activeTab === 'scanner' ? 'bg-[#F72585] text-white border-[#111111] shadow-[2px_2px_0px_#111111]' : 'border-transparent text-[#333]'
            }`}
          >
            Scanner
          </button>
          <button
            onClick={() => setActiveTab('threats')}
            className={`px-3 py-1 rounded-lg whitespace-nowrap font-bold border-2 ${
              activeTab === 'threats' ? 'bg-[#E9DDFF] border-[#111111] shadow-[2px_2px_0px_#111111]' : 'border-transparent text-[#333]'
            }`}
          >
            Threats
          </button>
          <button
            onClick={() => setActiveTab('model')}
            className={`px-3 py-1 rounded-lg whitespace-nowrap font-bold border-2 ${
              activeTab === 'model' ? 'bg-[#FFE45E] border-[#111111] shadow-[2px_2px_0px_#111111]' : 'border-transparent text-[#333]'
            }`}
          >
            Model
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1 rounded-lg whitespace-nowrap font-bold border-2 ${
              activeTab === 'guide' ? 'bg-[#FFD6E8] border-[#111111] shadow-[2px_2px_0px_#111111]' : 'border-transparent text-[#333]'
            }`}
          >
            Directory
          </button>
        </div>
      </div>
    </header>
  );
};
