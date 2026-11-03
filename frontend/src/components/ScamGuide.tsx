import React from 'react';
import {
  AlertTriangle,
  Scale,
  PhoneCall,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const ScamGuide: React.FC = () => {
  const typologies = [
    {
      title: "1. Registration & Refundable Gate Pass Fee Scheme",
      target: "Fresh graduates, non-IT diploma holders, administrative applicants",
      channels: "SMS, Unsolicited WhatsApp, Fake Job Portals",
      tagColor: "bg-[#FFD6E8]",
      modus: "Victims receive congratulatory messages stating they have been selected for brands like Reliance Jio, Tata Motors, or Airport Authority of India. Recruiters insist that before the formal appointment letter can be emailed, a 'refundable security charge' of ₹1,200 to ₹3,500 must be wired via Google Pay or PhonePe.",
      legalNotice: "Section 10 of the Emigration Act 1983 and Ministry of Labour circulars mandate that employers must bear all recruitment costs. Any solicitation of fees from candidates is an immediate statutory offense."
    },
    {
      title: "2. Transnational YouTube / Merchant Rating Task Fraud",
      target: "Students, homemakers, remote workers looking for secondary income",
      channels: "WhatsApp reachouts, Telegram Channels, Instagram DMs",
      tagColor: "bg-[#FFE45E]",
      modus: "Victims are added to Telegram groups promising ₹3,000 to ₹8,000 daily for liking YouTube videos or leaving merchant reviews. Small payouts (₹200 - ₹500) build initial trust. Victims are then coerced into wiring larger sums (₹10,000 to ₹5,00,000) to 'prepaid merchant crypto wallets' to unlock their supposed earnings.",
      legalNotice: "Organized transnational cybercrime syndicate. Reported under IT Act Section 66D (cheating by personation) and BNS Section 318 (cheating). Immediate reporting to 1930 within the 'golden hour' can freeze receiving mule accounts."
    },
    {
      title: "3. Work-From-Home Laptop & Courier Insurance Scam",
      target: "Content writers, data entry operators, customer support agents",
      channels: "LinkedIn InMail, unsolicited emails, WhatsApp",
      tagColor: "bg-[#E9DDFF]",
      modus: "Candidate is offered an attractive remote role with an enterprise like Amazon India or Flipkart. Recruiter claims a brand-new MacBook Air or Dell work laptop has been requisitioned, but demands the candidate pay ₹2,500 to ₹5,000 as refundable courier transit insurance or asset security.",
      legalNotice: "Legitimate enterprises issue corporate equipment at zero expense to the employee. Authentic employers never ask employees to insure company property via personal UPI transfers."
    },
    {
      title: "4. Corporate Impersonation via Free Public Webmails",
      target: "Banking, IT, and operations candidates",
      channels: "Email, LinkedIn messages, fake job postings",
      tagColor: "bg-white",
      modus: "Scammers pose as senior Talent Acquisition executives from HDFC Bank, TCS, or Infosys, using deceptive addresses like recruiter-hdfccareers@protonmail.com or tcsrecruiter@gmail.com. They demand scanned copies of PAN, Aadhaar, and blank cancelled cheques under the guise of background verification.",
      legalNotice: "Identity theft under IT Act Section 66C. Fraudulent recruiters exploit these documents to open unauthorized bank accounts, issue SIM cards, or execute fraudulent loan applications."
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner - Neo Brutalist */}
      <div className="bg-[#FFE45E] border-2 sm:border-3 border-[#111111] rounded-2xl p-6 shadow-[6px_6px_0px_#111111] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-white border border-[#111111] text-xs font-mono font-black text-[#111111]">
            <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>FIELD DIRECTORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#111111]">
            Indian Recruitment Scam Directory & Legal Rights
          </h1>
          <p className="text-xs sm:text-sm text-[#333] font-medium max-w-2xl leading-relaxed">
            Understand the modus operandi of cyber recruitment networks operating across India and know your statutory legal protections under Indian law.
          </p>
        </div>

        <div className="bg-[#F72585] text-white border-2 border-[#111111] p-4 rounded-xl text-xs flex items-center space-x-3 shrink-0 shadow-[4px_4px_0px_#111111]">
          <PhoneCall className="w-6 h-6 text-white shrink-0 stroke-[2.5]" />
          <div>
            <div className="font-heading font-black text-sm text-white">National Cybercrime Helpline</div>
            <div className="text-[11px] text-white/90 font-mono font-bold">Dial 1930 (24x7 Toll-Free)</div>
          </div>
        </div>
      </div>

      {/* Prevalent Modus Operandi Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-heading font-black text-[#111111] flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-[#F72585]" />
          <span>Major Recruitment Fraud Vectors</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {typologies.map((t, idx) => (
            <div
              key={idx}
              className="bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-6 space-y-4 shadow-[5px_5px_0px_#111111] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#111111] transition-all"
            >
              <div className="space-y-1.5">
                <h3 className="text-base font-heading font-black text-[#111111]">{t.title}</h3>
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className={`${t.tagColor} text-[#111111] px-2.5 py-0.5 rounded border border-[#111111] font-bold`}>
                    Channel: {t.channels}
                  </span>
                  <span className="bg-[#FAF9F6] text-[#333] px-2.5 py-0.5 rounded border border-[#111111] font-bold">
                    Target: {t.target}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#333] font-medium leading-relaxed">{t.modus}</p>

              <div className="bg-[#FAF9F6] border-2 border-[#111111] rounded-xl p-3 text-xs text-[#111111] space-y-1 shadow-[2px_2px_0px_#111111]">
                <span className="font-bold text-[#F72585] flex items-center space-x-1.5">
                  <Scale className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Statutory Legal Protection:</span>
                </span>
                <p className="leading-relaxed text-[11px] text-[#444] font-medium">{t.legalNotice}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statutory Legal Framework Overview */}
      <div className="bg-white border-2 sm:border-3 border-[#111111] rounded-2xl p-6 sm:p-8 space-y-5 shadow-[6px_6px_0px_#111111]">
        <h2 className="text-lg font-heading font-black text-[#111111] flex items-center space-x-2">
          <Scale className="w-5 h-5 text-indigo-700 stroke-[2.5]" />
          <span>Statutory Framework & Candidate Protection in India</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#FAF9F6] p-4 rounded-xl border-2 border-[#111111] space-y-2 shadow-[2px_2px_0px_#111111]">
            <span className="font-heading font-black text-sm text-[#111111] block">Ministry of Labour Guidelines</span>
            <p className="text-[#444] text-[11px] leading-relaxed font-medium">
              Employers and private recruitment agencies are prohibited by law from collecting any direct or indirect charges from job seekers. All staffing expenses must be borne by the employer.
            </p>
          </div>

          <div className="bg-[#FAF9F6] p-4 rounded-xl border-2 border-[#111111] space-y-2 shadow-[2px_2px_0px_#111111]">
            <span className="font-heading font-black text-sm text-[#111111] block">Emigration Act 1983 (Sec 10)</span>
            <p className="text-[#444] text-[11px] leading-relaxed font-medium">
              Strict penal provisions for demanding 'gate pass', 'interview registration', or 'visa insurance' fees. Offenses carry statutory imprisonment and freezing of receiving accounts.
            </p>
          </div>

          <div className="bg-[#FAF9F6] p-4 rounded-xl border-2 border-[#111111] space-y-2 shadow-[2px_2px_0px_#111111]">
            <span className="font-heading font-black text-sm text-[#111111] block">IT Act 66D & BNS 318</span>
            <p className="text-[#444] text-[11px] leading-relaxed font-medium">
              Criminal personation using fake domain names, cloned company logos, or forged appointment letters constitutes cognizable cyber fraud punishable with rigorous imprisonment.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#FFE45E] text-[#111111] border-2 border-[#111111] font-bold text-xs shadow-[3px_3px_0px_#111111] hover:bg-[#FFD6E8] transition"
          >
            <span>National Cybercrime Reporting Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href="https://www.mca.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white text-[#111111] border-2 border-[#111111] font-bold text-xs shadow-[3px_3px_0px_#111111] hover:bg-[#E9DDFF] transition"
          >
            <span>Ministry of Corporate Affairs (MCA21)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
