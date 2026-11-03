import React from 'react';
import {
  ArrowUpRight,
  ShieldAlert,
  AlertTriangle,
  Scale,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  Lock,
  Zap,
  Building,
  Eye
} from 'lucide-react';

interface LandingHeroProps {
  onAnalyzeClick: () => void;
  onExploreClick: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onAnalyzeClick, onExploreClick }) => {
  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8">
      {/* 1. HERO SECTION: Neo-Brutalist Masterpiece */}
      <section className="relative">
        {/* Subtle decorative background shapes */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#FFE45E]/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 -right-10 w-60 h-60 bg-[#FFD6E8]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Bold Headline & Editorial Pitch */}
          <div className="lg:col-span-6 space-y-6">
            {/* Neo-brutalist Pill Tag */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FFE45E] border-2 border-[#111111] shadow-[2.5px_2.5px_0px_#111111] text-xs font-black tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#111111] fill-[#111111]" />
              <span className="uppercase">AI-Powered Recruitment Fraud Shield</span>
            </div>

            {/* Oversized Expressive Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111111] font-heading tracking-tight leading-[1.08]">
              The Job Looks Perfect.{' '}
              <span className="relative inline-block mt-1">
                <span className="relative z-10 text-[#F72585]">But Is It Real?</span>
                {/* Hand-drawn style pink underline */}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-4 text-[#F72585] overflow-visible"
                  viewBox="0 0 250 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 14C50 4 150 2 247 11C180 18 100 16 20 18"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Supporting Pitch */}
            <p className="text-base sm:text-lg text-[#333333] font-medium leading-relaxed max-w-xl">
              Spot fake recruiters, suspicious job offers, and advance-fee employment scams before they cost you. Powered by trained AI, built for safer career moves across India.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onAnalyzeClick}
                className="px-7 py-4 rounded-xl bg-[#F72585] text-white font-extrabold text-sm sm:text-base border-2 border-[#111111] shadow-[4px_4px_0px_#111111] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Check My Job Offer</span>
                <ArrowUpRight className="w-5 h-5 stroke-[3]" />
              </button>

              <button
                onClick={onExploreClick}
                className="px-7 py-4 rounded-xl bg-white text-[#111111] font-extrabold text-sm sm:text-base border-2 border-[#111111] shadow-[4px_4px_0px_#111111] hover:bg-[#FFE45E] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>See How It Works</span>
              </button>
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t-2 border-[#111111]/15 text-xs text-[#333333] font-bold">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Zero-Fee Compliance</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Scale className="w-4 h-4 text-indigo-600 stroke-[2.5]" />
                <span>Indian Labor Laws</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-[#F72585] stroke-[2.5]" />
                <span>100% Privacy Preserved</span>
              </div>
            </div>
          </div>

          {/* Right Column: Layered Neo-Brutalist Product Preview */}
          <div className="lg:col-span-6 relative">
            {/* Hand-drawn prompt arrow */}
            <div className="hidden sm:flex absolute -top-8 -left-6 items-center space-x-2 text-xs font-mono font-bold text-[#F72585] -rotate-6 z-20">
              <span>✦ Live Inspection Preview</span>
              <svg className="w-8 h-6 text-[#F72585]" fill="none" viewBox="0 0 40 24" stroke="currentColor" strokeWidth="2.5">
                <path d="M2 12C12 18 24 18 34 8M34 8L26 6M34 8L32 16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Base Layered Card: Job Scanner Console */}
            <div className="relative bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-5 sm:p-6 shadow-[8px_8px_0px_#111111]">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#F72585] border border-[#111111]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#FFE45E] border border-[#111111]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-[#111111]" />
                </div>
                <span className="text-xs font-mono font-extrabold text-[#555]">
                  OFFER-INSPECTION-CONSOLE
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#FFD6E8] border border-[#111111] rounded">
                  SCANNER ACTIVE
                </span>
              </div>

              {/* Realistic Job Offer Snippet */}
              <div className="space-y-3 font-mono text-xs">
                <div className="bg-[#FAF9F6] p-3 rounded-xl border-2 border-[#111111]/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111111] text-[13px]">
                      Tata Motors • Senior Executive Assistant
                    </span>
                    <span className="text-[10px] bg-[#FFE45E] px-2 py-0.5 rounded border border-[#111111] font-bold">
                      ₹18,50,000 / yr
                    </span>
                  </div>
                  <div className="text-[11px] text-[#666]">
                    Channel: WhatsApp Reachout (<span className="text-rose-600 font-bold">+91 9845X XXXXX</span>)
                  </div>
                  <p className="text-[#333] text-[11px] leading-relaxed pt-1 border-t border-[#111111]/15">
                    "Congratulations! Selected without interview. Please wire <mark className="bg-[#FFD6E8] text-[#111111] font-bold px-1 rounded">refundable ₹2,850 gate pass fee</mark> to UPI ID hr-tatamotors@ybl to release offer letter..."
                  </p>
                </div>

                {/* Detected Threat Summary Pill */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="flex items-center space-x-1.5 bg-[#FFD6E8] border-2 border-[#111111] px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-[2px_2px_0px_#111111]">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Advance Gate Pass Fee</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-[#E9DDFF] border-2 border-[#111111] px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-[2px_2px_0px_#111111]">
                    <Building className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Free Webmail Impersonation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlapping Floating Sticker 1: AI Verdict */}
            <div className="absolute -bottom-6 -right-3 sm:-right-6 bg-[#F72585] text-white border-2 sm:border-3 border-[#111111] rounded-2xl p-3.5 sm:p-4 shadow-[5px_5px_0px_#111111] rotate-2 max-w-[220px] sm:max-w-[240px] z-10">
              <div className="flex items-center space-x-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFE45E] animate-ping" />
                <span className="text-xs font-mono font-extrabold uppercase tracking-wide">
                  AI Verdict
                </span>
              </div>
              <div className="text-base sm:text-lg font-heading font-black leading-tight">
                94% Scam Risk
              </div>
              <p className="text-[10px] text-white/90 leading-tight mt-1 font-sans">
                Matches advance-fee fraud patterns prohibited by Indian Labor Laws.
              </p>
            </div>

            {/* Overlapping Floating Sticker 2: Model Specs Tag */}
            <div className="absolute -top-5 -right-2 sm:-right-4 bg-[#FFE45E] text-[#111111] border-2 border-[#111111] rounded-xl px-3 py-1.5 shadow-[3px_3px_0px_#111111] -rotate-3 z-10 text-xs font-bold font-mono">
              ⚡ 71.0% Fraud Recall Calibrated
            </div>

            {/* Overlapping Floating Sticker 3: Action Step */}
            <div className="hidden sm:block absolute -bottom-5 -left-4 bg-[#E9DDFF] text-[#111111] border-2 border-[#111111] rounded-xl px-3 py-1.5 shadow-[3px_3px_0px_#111111] -rotate-2 z-10 text-xs font-bold font-mono">
              🛡️ Statutory Zero-Fee Law
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATUTORY SAFEGUARDS STRIP (Indian Legal Rights) */}
      <section className="bg-[#FFE45E] border-2 sm:border-3 border-[#111111] rounded-2xl p-5 sm:p-6 shadow-[6px_6px_0px_#111111]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-[#111111] pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white border-2 border-[#111111] rounded-xl shadow-[2px_2px_0px_#111111]">
              <Scale className="w-6 h-6 text-[#111111]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-[#111111]">
                Indian Regulatory Awareness & Legal Rights
              </h2>
              <p className="text-xs text-[#333333] font-medium">
                Ministry of Labour & Employment guidelines strictly prohibit charging job applicants.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-[#F72585] text-white border-2 border-[#111111] px-4 py-2 rounded-xl text-xs font-black shadow-[3px_3px_0px_#111111]">
            <PhoneCall className="w-4 h-4 stroke-[3]" />
            <span>National Cyber Crime Helpline: 1930</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
          <div className="bg-white p-4 rounded-xl border-2 border-[#111111] shadow-[3px_3px_0px_#111111] space-y-1.5">
            <div className="font-extrabold text-[#111111] flex items-center space-x-1.5 text-sm">
              <span className="text-[#F72585]">01.</span>
              <span>The "Zero Recruitment Fee" Rule</span>
            </div>
            <p className="text-[#444] text-[11px] leading-relaxed">
              Under Section 10 of the Emigration Act 1983 and Ministry circulars, no legitimate employer or agency can demand registration, gate pass, or interview fees.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border-2 border-[#111111] shadow-[3px_3px_0px_#111111] space-y-1.5">
            <div className="font-extrabold text-[#111111] flex items-center space-x-1.5 text-sm">
              <span className="text-indigo-600">02.</span>
              <span>MCA21 CIN Verification</span>
            </div>
            <p className="text-[#444] text-[11px] leading-relaxed">
              Always verify the employer's Corporate Identification Number (CIN) on the official portal (<strong className="font-mono text-[#111111]">mca.gov.in</strong>) before sharing sensitive KYC documents.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border-2 border-[#111111] shadow-[3px_3px_0px_#111111] space-y-1.5">
            <div className="font-extrabold text-[#111111] flex items-center space-x-1.5 text-sm">
              <span className="text-emerald-600">03.</span>
              <span>Free Webmail Red Flag</span>
            </div>
            <p className="text-[#444] text-[11px] leading-relaxed">
              Legitimate enterprise recruiters (TCS, Infosys, Wipro, HDFC, Amazon) strictly communicate via authenticated domains. Never accept offers from Gmail or Protonmail.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (3 Neo-Brutalist Steps) */}
      <section id="how-it-works" className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-[#E9DDFF] border-2 border-[#111111] text-xs font-black shadow-[2px_2px_0px_#111111]">
            SIMPLE 3-STEP AUDIT
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-[#111111]">
            How OfferGuard Protects Job Seekers
          </h2>
          <p className="text-sm text-[#555] font-medium">
            Trained machine learning combined with transparent heuristics to intercept scams in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-6 shadow-[5px_5px_0px_#111111] space-y-3 relative hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#111111] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FFE45E] border-2 border-[#111111] text-[#111111] font-heading font-black text-xl flex items-center justify-center shadow-[3px_3px_0px_#111111]">
              01
            </div>
            <h3 className="text-lg font-heading font-black text-[#111111]">
              Paste Your Job Offer
            </h3>
            <p className="text-xs text-[#444] leading-relaxed">
              Paste complete job descriptions, appointment letters, WhatsApp recruitment forwards, or suspicious recruiter direct messages.
            </p>
          </div>

          <div className="bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-6 shadow-[5px_5px_0px_#111111] space-y-3 relative hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#111111] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FFD6E8] border-2 border-[#111111] text-[#111111] font-heading font-black text-xl flex items-center justify-center shadow-[3px_3px_0px_#111111]">
              02
            </div>
            <h3 className="text-lg font-heading font-black text-[#111111]">
              AI Scans Fraud Patterns
            </h3>
            <p className="text-xs text-[#444] leading-relaxed">
              Our calibrated TF-IDF + Logistic Regression model and rule engine inspect advance fees, fake webmails, task scams, and wage inflation.
            </p>
          </div>

          <div className="bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-6 shadow-[5px_5px_0px_#111111] space-y-3 relative hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#111111] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#E9DDFF] border-2 border-[#111111] text-[#111111] font-heading font-black text-xl flex items-center justify-center shadow-[3px_3px_0px_#111111]">
              03
            </div>
            <h3 className="text-lg font-heading font-black text-[#111111]">
              Receive Evidence & Actions
            </h3>
            <p className="text-xs text-[#444] leading-relaxed">
              Review flagged quotes, threat index score, verify employer CIN, and receive immediate safety recommendations under Indian cyber laws.
            </p>
          </div>
        </div>
      </section>

      {/* 4. COMMON SCAM TACTICS */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-[#FFD6E8] border-2 border-[#111111] text-xs font-black shadow-[2px_2px_0px_#111111]">
            FIELD INTELLIGENCE
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-[#111111]">
            Common Indian Recruitment Scam Modus
          </h2>
          <p className="text-sm text-[#555] font-medium">
            Recognize the exact psychological pressure tactics used by fraudulent syndicates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border-2 border-[#111111] rounded-2xl p-5 shadow-[4px_4px_0px_#111111] space-y-2.5 hover:shadow-[6px_6px_0px_#111111] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#F72585] text-white flex items-center justify-center border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#111111]">
              Advance-Fee & Gate Pass
            </h3>
            <p className="text-xs text-[#555] leading-relaxed">
              Demanding refundable registration, training deposits, interview uniform, or gate pass fees before releasing an appointment letter.
            </p>
          </div>

          <div className="bg-white border-2 border-[#111111] rounded-2xl p-5 shadow-[4px_4px_0px_#111111] space-y-2.5 hover:shadow-[6px_6px_0px_#111111] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FFE45E] text-[#111111] flex items-center justify-center border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              <Building className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#111111]">
              Corporate Impersonation
            </h3>
            <p className="text-xs text-[#555] leading-relaxed">
              Scammers claiming to represent TCS, Infosys, or Amazon using free public Gmail, Yahoo, or Protonmail domains.
            </p>
          </div>

          <div className="bg-white border-2 border-[#111111] rounded-2xl p-5 shadow-[4px_4px_0px_#111111] space-y-2.5 hover:shadow-[6px_6px_0px_#111111] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#E9DDFF] text-[#111111] flex items-center justify-center border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              <Zap className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#111111]">
              Viral Video Task Scams
            </h3>
            <p className="text-xs text-[#555] leading-relaxed">
              Telegram groups promising ₹3,000–₹8,000 daily for liking YouTube videos or merchant ratings, luring victims into prepaid recharge traps.
            </p>
          </div>

          <div className="bg-white border-2 border-[#111111] rounded-2xl p-5 shadow-[4px_4px_0px_#111111] space-y-2.5 hover:shadow-[6px_6px_0px_#111111] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FFD6E8] text-[#111111] flex items-center justify-center border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              <Eye className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#111111]">
              KYC & Phishing Harvest
            </h3>
            <p className="text-xs text-[#555] leading-relaxed">
              Harvesting Aadhaar cards, PAN copies, and bank statements through informal Google Forms before any actual employment agreement exists.
            </p>
          </div>
        </div>
      </section>

      {/* 5. SCIENTIFIC TRANSPARENCY & MODEL LIMITATIONS */}
      <section className="bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#111111] space-y-3">
        <div className="flex items-center space-x-2 text-[#111111]">
          <div className="p-1 bg-[#FFE45E] border-2 border-[#111111] rounded shadow-[1.5px_1.5px_0px_#111111]">
            <AlertTriangle className="w-4 h-4 text-[#111111]" />
          </div>
          <span className="font-heading font-black text-sm uppercase">
            Model Limitations & Scientific Transparency
          </span>
        </div>
        <p className="text-xs text-[#444] leading-relaxed font-medium">
          OfferGuard AI is an automated screening assistant, not an official corporate background investigation bureau. A <strong className="bg-[#FFE45E] text-[#111111] px-1 py-0.5 rounded border border-[#111111]">LEGITIMATE</strong> classification means no high-risk fraud signals were identified in the submitted text; it is <em>not</em> an independent guarantee of employment validity. Always conduct due diligence via authenticated corporate portals (<strong className="font-mono">mca.gov.in</strong>).
        </p>
      </section>
    </div>
  );
};
