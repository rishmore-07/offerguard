"""Heuristic rule-engine for identifying Indian recruitment scam tactics."""
import re
from typing import List, Dict, Any
from backend.app.schemas import RedFlagItem

# Patterns commonly abused in recruitment fraud across India
FEE_PATTERNS = [
    (r"(?i)(?:registration|processing|application|portal|verification|interview|orientation)\s*(?:fee|fees|charge|charges|cost|amount)",
     "Registration or Processing Fee Demand",
     "CRITICAL",
     "Legitimate Indian companies, MNCs, and staffing agencies never charge job seekers application, registration, or processing fees. Mandated by Ministry of Labour & Employment guidelines."),
    
    (r"(?i)(?:security|laptop|equipment|uniform|training|certificate|id\s*card)\s*(?:deposit|fee|charges|cost|money)",
     "Mandatory Security or Equipment Deposit",
     "CRITICAL",
     "Scammers ask for refundable deposits for laptops, ID badges, or training material. Real employers provide company assets without upfront applicant payments."),
    
    (r"(?i)(?:pay|deposit|transfer|send)\s*(?:rs\.?|inr|₹)?\s*\d{2,6}\s*(?:rupees|inr|rs)?\s*(?:immediately|advance|charges|fee)?",
     "Direct Money Solicitation in INR",
     "CRITICAL",
     "The listing explicitly instructs the applicant to pay money or transfer funds to secure an interview or offer letter.")
]

CHANNEL_PATTERNS = [
    (r"(?i)(?:wa\.me|t\.me|whatsapp|telegram|chat\s*on\s*whatsapp|contact\s*hr\s*on\s*whatsapp|dm\s*telegram)",
     "Redirection to Unofficial Messaging Channels",
     "HIGH",
     "Recruiters urging candidates exclusively onto WhatsApp or Telegram bypass corporate security, enterprise email audit trails, and background check standards."),
    
    (r"(?i)(?:bit\.ly|tinyurl\.com|forms\.gle|drive\.google\.com\/file|cutt\.ly|is\.gd|rb\.gy)",
     "Obfuscated or Non-Official Application URL",
     "MEDIUM",
     "Use of public link shorteners or Google Forms instead of official career portals or enterprise Applicant Tracking Systems (ATS).")
]

EMAIL_PATTERNS = [
    (r"(?i)[\w\.-]+@(gmail|yahoo|hotmail|outlook|proton|protonmail|rediffmail)\.com",
     "Public / Disposable Webmail Address",
     "HIGH",
     "Official recruiters from established organizations communicate exclusively via enterprise corporate domain emails (e.g. @tcs.com, @infosys.com), never free public mailboxes.")
]

URGENCY_PATTERNS = [
    (r"(?i)(?:no\s*interview|direct\s*joining|100%\s*guaranteed|instant\s*offer|no\s*exam|spot\s*offer|without\s*interview)",
     "Direct Joining / Guaranteed Placement Without Rigorous Interview",
     "HIGH",
     "Unconditional employment offers issued without structured technical or HR interviews are a hallmark of phishing and advance-fee schemes."),
    
    (r"(?i)(?:apply\s*within\s*\d+\s*(?:minutes|hours)|limited\s*seats|offer\s*expires\s*today|immediate\s*joining\s*today|urgent\s*requirement)",
     "Artificial Urgency and High Pressure",
     "MEDIUM",
     "Creating false urgency pushes job seekers into making impulsive fee payments without due diligence.")
]

TASK_SCAM_PATTERNS = [
    (r"(?i)(?:copy\s*paste|sms\s*sending|captcha\s*typing|data\s*entry\s*offline|like\s*youtube\s*videos|telegram\s*tasks|earn\s*(?:rs\.?|₹)?\s*\d{3,5}\s*daily)",
     "Task-Based / Daily Payout / Captcha Scam Pattern",
     "HIGH",
     "Promising daily payouts for trivial repetitive tasks (video likes, captcha entry, review posting) is the signature pattern of widespread 'digital arrest' and task-based cyber fraud."),
    
    (r"(?i)(?:share\s*otp|send\s*upi\s*pin|bank\s*details\s*for\s*verification|netbanking|debit\s*card)",
     "Sensitive Financial / Credential Harvesting",
     "CRITICAL",
     "Recruiters never require banking credentials, UPI pins, or OTPs during recruitment.")
]

ALL_RULES = FEE_PATTERNS + CHANNEL_PATTERNS + EMAIL_PATTERNS + URGENCY_PATTERNS + TASK_SCAM_PATTERNS


def scan_for_red_flags(text: str) -> List[RedFlagItem]:
    """Scan text against high-risk Indian recruitment scam patterns."""
    flags: List[RedFlagItem] = []
    seen_flags = set()

    for pattern, flag_name, severity, description in ALL_RULES:
        if flag_name in seen_flags:
            continue
        match = re.search(pattern, text)
        if match:
            matched_snippet = match.group(0)
            seen_flags.add(flag_name)
            
            # Map category
            if "Fee" in flag_name or "Deposit" in flag_name or "INR" in flag_name:
                category = "Monetary Demands"
            elif "Messaging" in flag_name or "URL" in flag_name:
                category = "Communication Channels"
            elif "Webmail" in flag_name:
                category = "Recruiter Identity"
            elif "Urgency" in flag_name or "Direct" in flag_name or "Guaranteed" in flag_name:
                category = "Hiring Process"
            else:
                category = "Scam Indicators"

            flags.append(RedFlagItem(
                category=category,
                flag=flag_name,
                severity=severity,
                description=description,
                matched_text=matched_snippet
            ))

    return flags

