import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Scale,
  Building2,
  FileText
} from 'lucide-react';
import type { JobAnalysisResponse } from '../types';

interface DetectionResultsProps {
  result: JobAnalysisResponse;
  rawText: string;
  onReset: () => void;
}

export const DetectionResults: React.FC<DetectionResultsProps> = ({ result, rawText, onReset }) => {
  const [copied, setCopied] = useState(false);
  const isFraud = result.prediction === 'FRAUDULENT';

  const handleCopyReport = () => {
    const textToCopy = `OFFERGUARD AI RECRUITMENT ANALYSIS REPORT
Status: ${result.prediction} (${result.risk_level} RISK - ${result.risk_score}/100)
Model: ${result.model_status}
Confidence: ${result.confidence != null ? `${(result.confidence * 100).toFixed(1)}%` : 'Not reported'}

DETECTED RED FLAGS:
${result.signals.length > 0 ? result.signals.map(s => `• [${s.severity}] ${s.signal}: "${s.matched_text}"`).join('\n') : '• No signature scam patterns detected.'}

RECOMMENDED NEXT STEPS:
${result.verification_steps.join('\n')}

CYBERCRIME REPORTING HELPLINE: 1930 | cybercrime.gov.in
${result.disclaimer}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskTheme = () => {
    if (result.risk_level === 'CRITICAL' || isFraud) {
      return {
        bgBanner: 'bg-[#FFD6E8]',
        badgeBg: 'bg-[#F72585] text-white',
        accentColor: 'text-[#F72585]',
        progressBg: 'bg-[#F72585]',
        tag: 'HIGH SCAM PROBABILITY',
        icon: <ShieldAlert className="w-8 h-8 text-[#F72585] stroke-[2.5]" />
      };
    }
    if (result.risk_level === 'HIGH' || result.risk_level === 'MODERATE') {
      return {
        bgBanner: 'bg-[#FFE45E]',
        badgeBg: 'bg-[#111111] text-white',
        accentColor: 'text-amber-700',
        progressBg: 'bg-[#FFE45E]',
        tag: 'ELEVATED SUSPICION',
        icon: <AlertTriangle className="w-8 h-8 text-amber-700 stroke-[2.5]" />
      };
    }
    return {
      bgBanner: 'bg-[#E9DDFF]',
      badgeBg: 'bg-emerald-600 text-white',
      accentColor: 'text-emerald-700',
      progressBg: 'bg-emerald-500',
      tag: 'LOW RISK PATTERNS',
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600 stroke-[2.5]" />
    };
  };

  const theme = getRiskTheme();

  return (
    <div className="space-y-6">
      {/* 1. Primary Verdict Banner - Neo Brutalist */}
      <div className={`border-2 sm:border-3 border-[#111111] ${theme.bgBanner} rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0px_#111111] relative overflow-hidden`}>
        {/* Top window dots */}
        <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3 mb-5">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#111111]" />
            <span className="w-3.5 h-3.5 rounded-full bg-white border border-[#111111]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#F72585]" />
            <span className="text-xs font-mono font-black text-[#111111] uppercase tracking-wider ml-2">
              AI INSPECTION REPORT #OG-{Math.floor(Math.random() * 89999 + 10000)}
            </span>
          </div>

          <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-black border-2 border-[#111111] ${theme.badgeBg}`}>
            {result.risk_level} RISK
          </span>
        </div>

        {/* Main Verdict Flex */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white border-2 sm:border-3 border-[#111111] rounded-2xl shadow-[4px_4px_0px_#111111] shrink-0">
              {theme.icon}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-3xl sm:text-4xl font-heading font-black text-[#111111] tracking-tight">
                  {result.prediction}
                </span>

                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-white text-[#111111] border-2 border-[#111111] rounded shadow-[2px_2px_0px_#111111]">
                  {result.model_status}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#222] font-medium leading-relaxed max-w-xl">
                {isFraud
                  ? 'The classifier labeled this offer FRAUDULENT. Review the extracted signals before you act. This is a risk prediction, not confirmation that a payment or employer is criminal.'
                  : 'The classifier labeled this offer LEGITIMATE. That is not independent verification that the employer is genuine. Confirm the role through the company’s own careers channel.'}
              </p>
            </div>
          </div>

          {/* Threat Index Score Card */}
          <div className="w-full md:w-auto bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-4 sm:p-5 shadow-[5px_5px_0px_#111111] text-center md:text-right shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-wider font-black text-[#666] block">
              Threat Severity Index
            </span>
            <div className="flex items-baseline justify-center md:justify-end space-x-1 mt-0.5">
              <span className={`text-3xl sm:text-4xl font-heading font-black ${theme.accentColor}`}>
                {result.risk_score}
              </span>
              <span className="text-sm font-mono font-bold text-[#666]">/100</span>
            </div>

            {result.confidence !== null && result.confidence !== undefined ? (
              <span className="text-[11px] font-mono font-bold text-[#111111] bg-[#FFE45E] px-2 py-0.5 rounded border border-[#111111] mt-1.5 inline-block">
                Model Confidence: {(result.confidence * 100).toFixed(1)}%
              </span>
            ) : (
              <span className="text-[11px] font-mono text-[#666] block mt-1">
                {result.is_demo_mode ? 'Heuristic check' : 'Model confidence not reported'}
              </span>
            )}
          </div>
        </div>

        {/* Threat Gauge Visualizer */}
        <div className="mt-6 pt-4 border-t-2 border-[#111111]/20">
          <div className="flex justify-between text-xs font-mono font-bold text-[#111111] mb-1.5">
            <span>Risk Scale Spectrum</span>
            <span>{result.risk_score}% Severity</span>
          </div>
          <div className="w-full h-4 bg-white rounded-full overflow-hidden border-2 border-[#111111] p-0.5 shadow-[2px_2px_0px_#111111]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${theme.progressBg} border border-[#111111]`}
              style={{ width: `${Math.min(100, Math.max(6, result.risk_score))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-[#444] mt-1">
            <span>0 Low</span>
            <span>40 Moderate</span>
            <span>60 High</span>
            <span>80+ Critical Fraud</span>
          </div>
        </div>
      </div>

      {/* 2. Detected Red Flags & Extracted Evidence */}
      <div className="bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-6 shadow-[6px_6px_0px_#111111] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#111111] pb-3 gap-2">
          <h3 className="text-base font-heading font-black text-[#111111] flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-[#F72585]" />
            <span>Extracted Red Flags & Threat Signals ({result.signals.length})</span>
          </h3>
          <span className="text-xs font-mono font-bold text-[#555] bg-[#FAF9F6] px-2.5 py-1 rounded border border-[#111111]">
            Ground-Truth Pattern Extraction
          </span>
        </div>

        {result.signals.length > 0 ? (
          <div className="space-y-3 pt-1">
            {result.signals.map((sig, idx) => (
              <div
                key={idx}
                className="bg-[#FAF9F6] border-2 border-[#111111] rounded-xl p-4 shadow-[3px_3px_0px_#111111] space-y-2 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border-2 border-[#111111] ${
                        sig.severity === 'CRITICAL'
                          ? 'bg-[#F72585] text-white'
                          : sig.severity === 'HIGH'
                          ? 'bg-[#FFE45E] text-[#111111]'
                          : 'bg-[#E9DDFF] text-[#111111]'
                      }`}
                    >
                      {sig.severity}
                    </span>
                    <span className="text-sm font-heading font-black text-[#111111]">{sig.signal}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono font-extrabold text-[#111111] bg-[#FFD6E8] px-2 py-0.5 rounded border border-[#111111]">
                    {sig.category}
                  </span>
                </div>

                <p className="text-xs text-[#333] font-medium leading-relaxed">{sig.description}</p>

                <div className="bg-white rounded-lg p-3 border-2 border-[#111111] text-xs font-mono text-[#111111] flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <span className="text-[#666] font-bold shrink-0">Exact Text Trigger:</span>
                  <span className="bg-[#FFE45E] text-[#111111] px-2 py-0.5 rounded border border-[#111111] font-bold">
                    "{sig.matched_text}"
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#FAF9F6] border-2 border-[#111111] text-xs text-[#111111] font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>No signature recruitment fraud patterns, gate pass fees, or free webmail impersonations were detected.</span>
          </div>
        )}
      </div>

      {/* 3. Submitted Text Viewer */}
      <div className="bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-6 shadow-[6px_6px_0px_#111111] space-y-3">
        <h3 className="text-sm font-heading font-black text-[#111111] flex items-center space-x-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Audited Offer Content</span>
        </h3>
        <div className="bg-[#FAF9F6] p-4 rounded-xl border-2 border-[#111111] text-xs font-mono text-[#222] max-h-48 overflow-y-auto leading-relaxed whitespace-pre-wrap">
          {rawText}
        </div>
      </div>

      {/* 4. Verification Steps & Legal Recourse Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Checklist */}
        <div className="bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-6 shadow-[6px_6px_0px_#111111] space-y-4">
          <h3 className="text-sm font-heading font-black text-[#111111] flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Candidate Verification Checklist</span>
          </h3>

          <ul className="space-y-2.5 text-xs font-medium text-[#222]">
            {result.verification_steps.map((step, idx) => (
              <li key={idx} className="bg-[#FAF9F6] p-3 rounded-xl border-2 border-[#111111] shadow-[2px_2px_0px_#111111] leading-relaxed">
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Legal & Cyber Crime Action Recommendations */}
        <div className="bg-[#FFE45E] border-2 sm:border-3 border-[#111111] rounded-2xl p-6 shadow-[6px_6px_0px_#111111] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#111111] pb-2">
            <h3 className="text-sm font-heading font-black text-[#111111] flex items-center space-x-2">
              <Scale className="w-4 h-4 text-[#F72585]" />
              <span>Cybercrime Redressal & Legal Recourse</span>
            </h3>
            <span className="text-[10px] font-mono font-black text-white bg-[#F72585] px-2 py-0.5 rounded border border-[#111111]">
              Helpline 1930
            </span>
          </div>

          <ul className="space-y-2.5 text-xs font-medium text-[#111111]">
            {result.safety_recommendations.map((rec, idx) => (
              <li key={idx} className="bg-white p-3 rounded-xl border-2 border-[#111111] shadow-[2px_2px_0px_#111111] leading-relaxed">
                {rec}
              </li>
            ))}
          </ul>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white text-[#111111] border-2 border-[#111111] font-bold shadow-[2px_2px_0px_#111111] hover:bg-[#FFD6E8] transition"
            >
              <span>National Cyber Crime Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://www.mca.gov.in/mcafoportal/viewCompanyMasterData.do"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white text-[#111111] border-2 border-[#111111] font-bold shadow-[2px_2px_0px_#111111] hover:bg-[#FFD6E8] transition"
            >
              <span>Verify Company CIN (MCA21)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 5. Statutory Advisory Disclaimer */}
      <div className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] rounded-xl p-4 text-[11px] text-[#444] font-medium leading-relaxed">
        <strong className="text-[#111111] font-heading font-black block mb-1">
          STATUTORY ADVISORY NOTICE:
        </strong>
        {result.disclaimer}
      </div>

      {/* 6. Action Footer (Copy Report & Analyze Another Offer) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={handleCopyReport}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-[#111111] border-2 border-[#111111] font-extrabold text-xs shadow-[3px_3px_0px_#111111] hover:bg-[#FFE45E] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4.5px_4.5px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Analysis Report Copied!' : 'Copy Summary Report'}</span>
        </button>

        <button
          onClick={onReset}
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#F72585] text-white border-2 border-[#111111] font-heading font-black text-xs sm:text-sm shadow-[4px_4px_0px_#111111] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 stroke-[3]" />
          <span>Analyze Another Job Offer ↗</span>
        </button>
      </div>
    </div>
  );
};
