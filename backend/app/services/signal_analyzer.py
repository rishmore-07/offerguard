"""Rule-based suspicious signal analyzer for OfferGuard AI.

Identifies domain-specific recruitment fraud patterns targeting Indian job seekers.
Provides transparent evidence extraction with exact character offsets for UI highlighting.
Signals are advisory indicators designed to prompt due diligence, not definitive proofs.
"""
import re
from typing import List
from backend.app.schemas import SuspiciousSignal

RULES = [
    # 1. Registration / Security Deposit / Upfront Payment
    {
        "category": "Upfront Payment Demand",
        "signal": "Advance Registration or Processing Fee",
        "severity": "CRITICAL",
        "pattern": r"(?i)(?:registration|processing|application|gate\s*pass|portal|onboarding|medical\s*test|uniform|id\s*card)\s*(?:fee|fees|charge|charges|cost|deposit|amount)",
        "description": "Legitimate employers in India bear all hiring costs under Ministry of Labour guidelines. Demands for registration or gate-pass charges are the most frequent indicator of recruitment fraud."
    },
    {
        "category": "Upfront Payment Demand",
        "signal": "Equipment or Laptop Security Deposit",
        "severity": "CRITICAL",
        "pattern": r"(?i)(?:laptop|macbook|computer|courier|dispatch|asset|training\s*kit)\s*(?:security\s*deposit|deposit|courier\s*charge|refundable\s*deposit)",
        "description": "Scammers claim work-from-home hardware is prepared but ask candidates to wire refundable security deposits or courier insurance before shipping."
    },

    # 2. UPI / Direct Money Transfer Solicitation
    {
        "category": "Payment Method",
        "signal": "Direct UPI / Mobile Wallet Payment Request",
        "severity": "CRITICAL",
        "pattern": r"(?i)(?:gpay|google\s*pay|phonepe|paytm|bhim|upi\s*id|upi\s*pin|send\s*to\s*upi|qr\s*code|scan\s*to\s*pay)\b",
        "description": "Recruiters soliciting fees via personal UPI handles (Google Pay, PhonePe, Paytm) bypass company bank accounts and accounting audits."
    },
    {
        "category": "Upfront Payment Demand",
        "signal": "Explicit INR Rupee Transfer Demand",
        "severity": "CRITICAL",
        "pattern": r"(?i)(?:pay|deposit|transfer|send)\s*(?:rs\.?|inr|₹)\s*\d{2,6}\b",
        "description": "The message explicitly directs the candidate to transfer money (in INR) to secure an offer letter or interview slot."
    },

    # 3. Direct Joining / No Interview
    {
        "category": "Hiring Process Anomaly",
        "signal": "Guaranteed Employment Without Technical or HR Interview",
        "severity": "HIGH",
        "pattern": r"(?i)(?:no\s*interview|direct\s*joining|100%\s*guaranteed|instant\s*offer\s*letter|spot\s*selection|without\s*interview|guaranteed\s*job\s*offer)",
        "description": "Formal corporate hiring requires structured evaluation. Unconditional appointments without technical assessment or live video interviews are an advance-fee hallmark."
    },

    # 4. Unrealistic Compensation / Daily Task Schemes
    {
        "category": "Compensation & Scope",
        "signal": "Unrealistic Task Payout / Daily Micro-Task Promise",
        "severity": "HIGH",
        "pattern": r"(?i)(?:earn\s*(?:rs\.?|₹)?\s*(?:3000|4000|5000|8000|10000)\s*(?:daily|per\s*day)|like\s*youtube\s*videos|merchant\s*tasks|telegram\s*tasks|captcha\s*typing\s*(?:50k|40k|60k)|sms\s*sending\s*job)",
        "description": "High daily earnings for trivial tasks (video likes, captcha entry, review posting) represent the signature architecture of organized transnational digital task fraud."
    },

    # 5. Artificial Urgency & High Pressure
    {
        "category": "Pressure Tactics",
        "signal": "Artificial Urgency Deadline",
        "severity": "MEDIUM",
        "pattern": r"(?i)(?:apply\s*within\s*\d+\s*(?:minutes|mins|hours)|limited\s*seats\s*left|offer\s*expires\s*today|immediate\s*payment\s*required|pay\s*immediately\s*to\s*confirm)",
        "description": "Fabricating short payment deadlines induces urgency and panic, discouraging candidates from independently verifying company registration."
    },

    # 6. Telegram-Only Recruitment
    {
        "category": "Communication Channel",
        "signal": "Exclusively Telegram Recruitment Channel",
        "severity": "HIGH",
        "pattern": r"(?i)(?:t\.me\/[a-zA-Z0-9_]+|contact\s*(?:only|hr)?\s*on\s*telegram|message\s*on\s*telegram|telegram\s*channel|telegram\s*id)\b",
        "description": "Conducting recruitment strictly within anonymous Telegram channels prevents tracking recruiter identity and prevents corporate verification."
    },

    # 7. Obfuscated or Non-Official Application Links
    {
        "category": "Communication Channel",
        "signal": "Obfuscated Link or Non-Corporate Form",
        "severity": "MEDIUM",
        "pattern": r"(?i)(?:bit\.ly|tinyurl\.com|forms\.gle|docs\.google\.com\/forms|cutt\.ly|is\.gd|rb\.gy)\/[a-zA-Z0-9_\-]+",
        "description": "Established Indian enterprises utilize authenticated ATS portals (e.g. Workday, Taleo, official company domain), never public URL shorteners or anonymous Google Forms."
    },

    # 8. Sensitive Financial & Credential Harvesting
    {
        "category": "Credential Harvesting",
        "signal": "Request for OTP, Bank Details, or Passwords",
        "severity": "CRITICAL",
        "pattern": r"(?i)(?:share\s*otp|send\s*otp|upi\s*pin|netbanking|bank\s*password|debit\s*card\s*(?:number|cvv)|atm\s*pin)\b",
        "description": "Recruiters never require banking credentials, OTPs, or UPI PINs. Any solicitation of banking authentication credentials is direct cyber theft."
    },

    # 9. Free Webmail Domain Impersonation
    {
        "category": "Recruiter Identity",
        "signal": "Free Public Webmail Posing as Corporate Recruiter",
        "severity": "HIGH",
        "pattern": r"(?i)[\w\.-]+@(gmail|yahoo|hotmail|outlook|proton|protonmail|rediffmail)\.com",
        "description": "Official enterprise recruiters communicate via authenticated custom domain mailboxes (e.g. @tcs.com, @infosys.com), not free webmail accounts."
    },

    # 10. Communication Exclusively Outside Official Channels
    {
        "category": "Communication Channel",
        "signal": "Redirection to Personal Messaging App",
        "severity": "ADVISORY",
        "pattern": r"(?i)(?:wa\.me\/\d+|chat\s*on\s*whatsapp|contact\s*hr\s*on\s*whatsapp|send\s*resume\s*on\s*whatsapp)\b",
        "description": "While preliminary reachouts on messaging apps occur, candidate interviews and contract issuances must always be verifiable through official enterprise emails."
    }
]


def extract_suspicious_signals(text: str) -> List[SuspiciousSignal]:
    """Scan text and return detected signals with exact matched snippets and offsets."""
    signals: List[SuspiciousSignal] = []
    seen_signals = set()

    for r in RULES:
        pattern = r["pattern"]
        signal_name = r["signal"]
        if signal_name in seen_signals:
            continue

        match = re.search(pattern, text)
        if match:
            seen_signals.add(signal_name)
            signals.append(SuspiciousSignal(
                category=r["category"],
                signal=signal_name,
                severity=r["severity"],
                description=r["description"],
                matched_text=match.group(0),
                start_pos=match.start(),
                end_pos=match.end()
            ))

    return signals

