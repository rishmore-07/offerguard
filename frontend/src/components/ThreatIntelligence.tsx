import React from 'react';
import {
  Activity,
  History,
  Lock,
  BarChart2,
  PieChart as PieIcon,
  RefreshCw,
  Zap
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import type { SessionStatsResponse } from '../types';

interface ThreatIntelligenceProps {
  stats: SessionStatsResponse;
  onRefresh: () => void;
  onSelectRecent: (title: string) => void;
}

export const ThreatIntelligence: React.FC<ThreatIntelligenceProps> = ({ stats, onRefresh, onSelectRecent }) => {
  const hasData = stats.total_analyzed > 0;

  // Prepare chart data
  const pieData = [
    { name: 'Fraudulent', value: stats.fraudulent_count, color: '#F72585' },
    { name: 'Legitimate', value: stats.legitimate_count, color: '#10b981' }
  ].filter(d => d.value > 0);

  const barData = Object.entries(stats.signals_frequency).map(([signal, count]) => ({
    signal: signal.length > 25 ? signal.slice(0, 25) + '...' : signal,
    count
  })).slice(0, 6);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner - Neo Brutalist */}
      <div className="bg-[#FFE45E] border-2 sm:border-3 border-[#111111] rounded-2xl p-6 shadow-[6px_6px_0px_#111111] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#111111] text-xs font-mono font-bold mb-2">
            <Zap className="w-3.5 h-3.5 fill-[#111111]" />
            <span>SESSION TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#111111]">
            Live Threat Radar & Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-[#333] font-medium max-w-2xl mt-1">
            Real, empirical detection statistics collected exclusively from offers scanned in your current session. Zero fabricated nationwide numbers.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-4 py-2.5 rounded-xl bg-white text-[#111111] border-2 border-[#111111] font-bold text-xs shadow-[3px_3px_0px_#111111] hover:bg-[#FFD6E8] hover:translate-x-[-1px] hover:translate-y-[-1px] transition flex items-center space-x-1.5 cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#111111] rounded-2xl p-5 shadow-[4px_4px_0px_#111111] space-y-1">
          <span className="text-xs text-[#555] font-mono font-bold uppercase">Total Offers Scanned</span>
          <div className="text-3xl font-heading font-black text-[#111111]">{stats.total_analyzed}</div>
          <span className="text-[11px] text-[#777] font-medium">Session evaluations</span>
        </div>

        <div className="bg-[#FFD6E8] border-2 border-[#111111] rounded-2xl p-5 shadow-[4px_4px_0px_#111111] space-y-1">
          <span className="text-xs text-[#F72585] font-mono font-bold uppercase">Scams Intercepted</span>
          <div className="text-3xl font-heading font-black text-[#F72585]">{stats.fraudulent_count}</div>
          <span className="text-[11px] text-[#444] font-medium">
            {hasData ? `${((stats.fraudulent_count / stats.total_analyzed) * 100).toFixed(0)}% of total scans` : 'Awaiting scans'}
          </span>
        </div>

        <div className="bg-[#E9DDFF] border-2 border-[#111111] rounded-2xl p-5 shadow-[4px_4px_0px_#111111] space-y-1">
          <span className="text-xs text-indigo-800 font-mono font-bold uppercase">Legitimate Offers</span>
          <div className="text-3xl font-heading font-black text-indigo-900">{stats.legitimate_count}</div>
          <span className="text-[11px] text-[#444] font-medium">
            {hasData ? `${((stats.legitimate_count / stats.total_analyzed) * 100).toFixed(0)}% of total scans` : 'Awaiting scans'}
          </span>
        </div>

        <div className="bg-white border-2 border-[#111111] rounded-2xl p-5 shadow-[4px_4px_0px_#111111] space-y-1">
          <span className="text-xs text-[#555] font-mono font-bold uppercase">Risk Patterns Flagged</span>
          <div className="text-3xl font-heading font-black text-[#111111]">
            {Object.values(stats.signals_frequency).reduce((a, b) => a + b, 0)}
          </div>
          <span className="text-[11px] text-[#777] font-medium">Triggered indicators</span>
        </div>
      </div>

      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Classification Distribution Pie Chart */}
          <div className="lg:col-span-5 bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-6 shadow-[6px_6px_0px_#111111] space-y-4">
            <h3 className="text-sm font-heading font-black text-[#111111] flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-[#F72585]" />
              <span>Classification Breakdown</span>
            </h3>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="#111111"
                    strokeWidth={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FAF9F6', borderColor: '#111111', borderWidth: '2px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center space-x-6 text-xs font-mono font-bold">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#F72585] border border-[#111111]" />
                <span className="text-[#111111]">Fraudulent ({stats.fraudulent_count})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-[#111111]" />
                <span className="text-[#111111]">Legitimate ({stats.legitimate_count})</span>
              </div>
            </div>
          </div>

          {/* Triggered Signals Bar Chart */}
          <div className="lg:col-span-7 bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-6 shadow-[6px_6px_0px_#111111] space-y-4">
            <h3 className="text-sm font-heading font-black text-[#111111] flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <span>Prevalent Scam Patterns in Current Session</span>
            </h3>

            {barData.length > 0 ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" stroke="#111111" fontSize={11} allowDecimals={false} />
                    <YAxis dataKey="signal" type="category" stroke="#111111" fontSize={11} width={130} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FAF9F6', borderColor: '#111111', borderWidth: '2px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" fill="#FFE45E" stroke="#111111" strokeWidth={2} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-xs text-[#888] font-bold">
                No threat patterns detected yet.
              </div>
            )}
          </div>

          {/* Recent Analysis History Table */}
          <div className="lg:col-span-12 bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-6 shadow-[6px_6px_0px_#111111] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
              <h3 className="text-sm font-heading font-black text-[#111111] flex items-center space-x-2">
                <History className="w-4 h-4 text-[#F72585]" />
                <span>Recent Analyses in Current Session ({stats.recent_analyses.length})</span>
              </h3>
              <div className="flex items-center space-x-1 text-xs font-mono font-bold text-[#555]">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Raw Text Persisted</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium">
                <thead className="bg-[#FAF9F6] text-[#111111] border-b-2 border-[#111111] font-mono font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Listing Title / Snippet</th>
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Verdict</th>
                    <th className="py-2.5 px-3">Threat Index</th>
                    <th className="py-2.5 px-3">Flags</th>
                    <th className="py-2.5 px-3">Engine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/15 text-[#111111]">
                  {stats.recent_analyses.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => onSelectRecent(item.title)}
                      className="hover:bg-[#FFD6E8]/30 cursor-pointer transition font-mono"
                      title="Click to inspect this offer"
                    >
                      <td className="py-2.5 px-3 text-[#666]">{item.timestamp}</td>
                      <td className="py-2.5 px-3 font-sans font-bold text-[#111111] max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="py-2.5 px-3 text-[#555]">{item.source}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border-2 border-[#111111] ${
                            item.prediction === 'FRAUDULENT'
                              ? 'bg-[#F72585] text-white shadow-[1.5px_1.5px_0px_#111111]'
                              : 'bg-emerald-400 text-[#111111] shadow-[1.5px_1.5px_0px_#111111]'
                          }`}
                        >
                          {item.prediction}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold font-mono">
                        <span className={item.risk_level === 'CRITICAL' ? 'text-[#F72585]' : 'text-[#111111]'}>
                          {item.risk_score}/100
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#555]">{item.signals_count} flags</td>
                      <td className="py-2.5 px-3 text-[#555]">
                        {item.is_demo_mode ? 'Demo' : 'Trained AI'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-[#111111] rounded-2xl p-12 text-center space-y-3 shadow-[4px_4px_0px_#111111]">
          <Activity className="w-12 h-12 mx-auto text-[#888]" />
          <h3 className="text-base font-heading font-black text-[#111111]">No Offers Evaluated In This Session Yet</h3>
          <p className="text-xs text-[#555] font-medium max-w-md mx-auto leading-relaxed">
            Run an analysis on any job offer or test with one of the predefined demo scenarios to populate telemetry, threat severity distribution, and pattern counts.
          </p>
        </div>
      )}
    </div>
  );
};
