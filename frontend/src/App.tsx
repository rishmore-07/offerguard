import { useState, useEffect } from 'react';
import { Header, type NavTab } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { ScannerWorkspace } from './components/ScannerWorkspace';
import { ThreatIntelligence } from './components/ThreatIntelligence';
import { ModelIntelligence } from './components/ModelIntelligence';
import { ScamGuide } from './components/ScamGuide';
import { fetchSamples, fetchSessionStats, fetchModelInfo } from './api/client';
import type { SampleJob, SessionStatsResponse, ModelInfoResponse } from './types';
import { ShieldAlert, ArrowUpRight } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [samples, setSamples] = useState<SampleJob[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStatsResponse>({
    total_analyzed: 0,
    fraudulent_count: 0,
    legitimate_count: 0,
    signals_frequency: {},
    recent_analyses: []
  });
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [selectedSample, setSelectedSample] = useState<SampleJob | null>(null);

  const loadData = async () => {
    try {
      const [samplesData, statsData, infoData] = await Promise.all([
        fetchSamples(),
        fetchSessionStats(),
        fetchModelInfo()
      ]);
      setSamples(samplesData);
      setSessionStats(statsData);
      setModelInfo(infoData);
    } catch (err) {
      console.warn('Data sync notice:', err);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      fetchSessionStats().then(setSessionStats).catch(() => {});
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleStartAnalysis = (sample?: SampleJob) => {
    if (sample) {
      setSelectedSample(sample);
    }
    setActiveTab('scanner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExplore = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveTab('guide');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] flex flex-col font-sans selection:bg-[#FFE45E] selection:text-[#111111] bg-neo-grid">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        modelStatus={modelInfo?.model_status}
        isDemoMode={modelInfo?.model_name.includes('Heuristic')}
      />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'home' && (
          <LandingHero
            onAnalyzeClick={() => handleStartAnalysis()}
            onExploreClick={handleExplore}
          />
        )}

        {activeTab === 'scanner' && (
          <ScannerWorkspace
            samples={samples}
            initialSample={selectedSample}
          />
        )}

        {activeTab === 'threats' && (
          <ThreatIntelligence
            stats={sessionStats}
            onRefresh={() => fetchSessionStats().then(setSessionStats)}
            onSelectRecent={(title) => {
              const matched = samples.find(s => s.label.toLowerCase().includes(title.toLowerCase()));
              handleStartAnalysis(matched);
            }}
          />
        )}

        {activeTab === 'model' && (
          <ModelIntelligence modelInfo={modelInfo} />
        )}

        {activeTab === 'guide' && (
          <ScamGuide />
        )}
      </main>

      {/* Neo-Brutalist Editorial Footer */}
      <footer className="border-t-2 sm:border-t-3 border-[#111111] bg-white py-10 text-xs text-[#111111] mt-16 shadow-[0px_-4px_0px_#111111]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-[#111111]/15 pb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-[#F72585] border-2 border-[#111111] shadow-[2.5px_2.5px_0px_#111111]">
                <ShieldAlert className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <span className="font-heading font-black text-base text-[#111111]">
                  OfferGuard<span className="text-[#F72585]">.ai</span>
                </span>
                <span className="text-[#666] font-medium text-xs block">
                  Neo-Brutalist AI Recruitment Fraud Interceptor
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#FFE45E] border-2 border-[#111111] font-mono font-bold text-[11px] shadow-[1.5px_1.5px_0px_#111111]">
                FastAPI Local Engine
              </span>
              <span className="px-2.5 py-1 rounded bg-[#FFD6E8] border-2 border-[#111111] font-mono font-bold text-[11px] shadow-[1.5px_1.5px_0px_#111111]">
                React 19 + TypeScript
              </span>
              <span className="px-2.5 py-1 rounded bg-[#E9DDFF] border-2 border-[#111111] font-mono font-bold text-[11px] shadow-[1.5px_1.5px_0px_#111111]">
                Adaption AutoScientist Ready
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[#555]">
            <p>
              © 2026 OfferGuard AI • Built for Indian Job Seeker Safety • Strictly Prohibits Advance Candidate Fees (Sec 10 Emigration Act)
            </p>
            <div className="flex items-center space-x-2">
              <span className="bg-[#FFE45E] text-[#111111] px-2.5 py-1 rounded-full border border-[#111111] font-mono font-bold">
                Helpline 1930
              </span>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#111111] hover:text-[#F72585] underline flex items-center space-x-1"
              >
                <span>cybercrime.gov.in</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
