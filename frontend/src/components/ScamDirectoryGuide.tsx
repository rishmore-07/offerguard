import React from 'react';
import { AlertTriangle, ShieldCheck, Scale, PhoneCall, Building2, ExternalLink } from 'lucide-react';

export const ScamDirectoryGuide: React.FC = () => {
  const typologies = [
    {
      title: "1. The Registration & Gate Pass Fee Scheme",
      target: "Fresh graduates, non-IT candidates, diploma holders",
      vector: "SMS, Naukri unsolicited messages, WhatsApp",
      modus: "Candidate receives congratulatory SMS claiming selection at major brand (Reliance Jio, Tata Motors, Delhi Airport Authority). Asked to deposit Rs. 950 - Rs. 2,500 as 'refundable security' or 'gate pass charges' prior to issuing the appointment letter.",
      legalFact: "Section 10 of Emigration Act & Ministry of Labour mandates that employers must bear all recruitment expenses. Charging candidates is illegal."
    },
    {
      title: "2. The 'Digital Arrest' & Daily Merchant Task Scam",
      target: "Students, homemakers, remote job seekers",
      vector: "WhatsApp, Telegram channels, Instagram DMs",
      modus: "Victims are added to Telegram groups offering 'work from home' earning Rs. 2,000 - 8,000 daily. Tasks start with liking YouTube videos or Google reviews. Small initial payouts build trust, followed by demands to deposit money into 'prepaid merchant crypto accounts' to unlock large balances.",
      legalFact: "Classified as organized transnational cyber fraud. Funds are quickly routed through mule accounts and cryptocurrency mixers."
    },
    {
      title: "3. Corporate Phishing via Free Webmail Accounts",
      target: "IT professionals, banking candidates",
      vector: "LinkedIn Direct Message, fake job board ads",
      modus: "Scammers pose as senior HR managers from TCS, Infosys, or HDFC Bank, using deceptive addresses like hdfc-careers@protonmail.com or tcsrecruiter@gmail.com. Demands scanned copies of PAN, Aadhaar, and cancelled cheques to commit identity theft and loan fraud.",
      legalFact: "Legitimate enterprise recruiters strictly communicate via authenticated custom email domains (@tcs.com, @infosys.com)."
    },
    {
      title: "4. The Work-From-Home Laptop & Courier Deposit",
      target: "Customer care, data entry, content writing applicants",
      vector: "Job portals, Facebook job groups",
      modus: "Candidate receives a formal-looking offer letter with high compensation. Recruiter claims a brand-new MacBook/Dell laptop and welcome kit is ready, but candidate must transfer Rs. 3,500 as refundable courier insurance or asset deposit.",
      legalFact: "Legitimate employers never require candidates to pay courier fees or asset deposits."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 mb-1">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-100">
              Directory of Indian Recruitment Scams & Legal Protections
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            A practical field guide to understanding fraud typologies targeting Indian job seekers and legal recourse under IT Act & BNS / IPC.
          </p>
        </div>

        <div className="bg-rose-950/60 border border-rose-500/30 p-3 rounded-lg text-xs text-rose-200 flex items-center space-x-3">
          <PhoneCall className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <div className="font-bold">National Cyber Crime Helpline</div>
            <div className="text-[11px] text-rose-300">Dial 1930 (Toll-Free, 24x7)</div>
          </div>
        </div>
      </div>

      {/* Typologies List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Prevalent Scam Modus Operandi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {typologies.map((t, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-100">{t.title}</h4>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  <strong>Channel:</strong> {t.vector}
                </span>
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  <strong>Target:</strong> {t.target}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{t.modus}</p>
              <div className="bg-indigo-950/40 border border-indigo-500/20 rounded p-2.5 text-[11px] text-indigo-300 space-y-0.5">
                <span className="font-semibold text-indigo-200">Legal Safeguard:</span>
                <p>{t.legalFact}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Steps */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Due Diligence Checklist for Candidates</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <div className="font-semibold text-slate-100 flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>1. MCA21 Portal Check</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Search the company name on mca.gov.in. Verify that the company is active, has a registered CIN, and its registered office matches official documents.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <div className="font-semibold text-slate-100 flex items-center space-x-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Zero Fee Rule</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              If an offer letter requires even 1 Rupee for registration, background check, gate pass, or equipment deposit, it is 100% fraudulent.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <div className="font-semibold text-slate-100 flex items-center space-x-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
              <span>3. Careers URL Verification</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Open the employer's official website manually in your browser (not through provided links). Locate the Job ID on their official career portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

