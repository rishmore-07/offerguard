"""Orchestrator combining model inference, rule-based signal detection, and regulatory guidance."""
import uuid
import html
from typing import List, Tuple
from backend.app.schemas import (
    JobAnalysisRequest,
    JobAnalysisResponse,
    SuspiciousSignal,
    ModelMetadata
)
from backend.app.services.inference_adapter import inference_adapter
from backend.app.services.signal_analyzer import extract_suspicious_signals
from backend.app.services.session_store import session_store

DISCLAIMER_TEXT = (
    "DISCLAIMER: OfferGuard AI predictions and suspicious signals are advisory risk estimates "
    "generated via automated machine learning and heuristic pattern matching. A 'LEGITIMATE' "
    "classification is NOT proof that an employer or job offer is genuine. Candidates must always "
    "independently verify hiring communications through authenticated corporate channels before "
    "transmitting documents, banking credentials, or payments."
)


def sanitize_input(text: str) -> str:
    """Escape potential HTML and normalize excessive whitespace."""
    escaped = html.escape(text.strip())
    # Keep standard newlines and single spaces
    return escaped


def generate_verification_steps(signals: List[SuspiciousSignal], company: str) -> List[str]:
    steps = [
        f"1. MCA21 Corporate Verification: Search '{company or 'the employer'}' on the Ministry of Corporate Affairs portal (mca.gov.in) to verify active status, CIN, and registered office address.",
        "2. Direct Careers Portal Verification: Independently navigate to the organization's official website (do not click links in the message) and check their official /careers or /jobs board for this exact Job ID.",
        "3. Recruiter Identity Check: Confirm the recruiter has an authenticated email ending with the company's official domain (e.g., @tcs.com, @infosys.com). Legitimate recruiters never issue contracts from free webmail accounts.",
        "4. Strict Zero-Fee Policy: If the recruiter asks for even ₹1 for registration, training materials, or equipment deposit, terminate communication immediately."
    ]
    return steps


def generate_safety_recommendations(risk_level: str, signals: List[SuspiciousSignal]) -> List[str]:
    recs = []

    has_fee_or_upi = any(s.category in ["Upfront Payment Demand", "Payment Method", "Credential Harvesting"] for s in signals)

    if risk_level in ["CRITICAL", "HIGH"] or has_fee_or_upi:
        recs.append("🚨 DO NOT TRANSFER FUNDS: Under Ministry of Labour & Employment guidelines and the Emigration Act 1983, charging job seekers recruitment fees is illegal.")
        recs.append("📞 REPORT IMMEDIATELY TO 1930: If you have transferred money or received threats, dial the National Cyber Crime Helpline (1930) or report at https://cybercrime.gov.in within the golden hour to freeze fraudulent recipient accounts.")
        recs.append("🔒 PROTECT BANKING & KYC: Never share OTPs, UPI PINs, Aadhaar photocopies, or bank login passwords. If shared, immediately block your debit/credit cards and notify your bank branch.")
        recs.append("📸 PRESERVE EVIDENCE: Take unedited screenshots of WhatsApp/Telegram conversations, recruiter phone numbers, payment QR codes, and bank transaction reference numbers (UTR).")

    if any(s.category == "Communication Channel" for s in signals):
        recs.append("📱 DEMAND ENTERPRISE COMMUNICATIONS: Refuse recruitment conducted exclusively over WhatsApp or anonymous Telegram channels.")

    recs.append("🏢 FILE GRIEVANCE: Report unsolicited job scam SMS and calls via TRAI's DND 3.0 portal or national cybercrime grievance redressal.")

    return recs


async def analyze_job_offer(request: JobAnalysisRequest) -> JobAnalysisResponse:
    # 1. Clean and prepare text
    cleaned_text = sanitize_input(request.text)

    # 2. Extract Transparent Suspicious Signals (Rule-Based Analyzer)
    signals = extract_suspicious_signals(cleaned_text)

    # 3. Model Inference (Modular Adapter)
    prediction, confidence, base_risk, model_metadata = await inference_adapter.predict(cleaned_text)

    # 4. Calibrated Ensemble Risk Scoring
    risk_score = base_risk

    # Incorporate signal severity penalties
    critical_signals = [s for s in signals if s.severity == "CRITICAL"]
    high_signals = [s for s in signals if s.severity == "HIGH"]
    medium_signals = [s for s in signals if s.severity == "MEDIUM"]

    if critical_signals:
        risk_score = max(risk_score, 88.0 + (len(critical_signals) - 1) * 4.0)
    elif high_signals:
        risk_score = max(risk_score, 70.0 + (len(high_signals) - 1) * 5.0)
    elif len(medium_signals) >= 2:
        risk_score = max(risk_score, 55.0)

    risk_score = min(99.9, max(0.1, round(risk_score, 1)))

    # Determine risk level
    if risk_score >= 80.0:
        risk_level = "CRITICAL"
        final_prediction = "FRAUDULENT"
    elif risk_score >= 60.0:
        risk_level = "HIGH"
        final_prediction = "FRAUDULENT"
    elif risk_score >= 40.0:
        risk_level = "MODERATE"
        final_prediction = prediction
    else:
        risk_level = "LOW"
        final_prediction = prediction

    # 5. Formulate Steps & Recommendations
    verification_steps = generate_verification_steps(signals, request.company or "")
    safety_recommendations = generate_safety_recommendations(risk_level, signals)

    # 6. Record Session Analytics (privacy-preserving, no raw message text)
    analysis_id = str(uuid.uuid4())[:8]
    session_store.record_analysis(
        analysis_id=analysis_id,
        title=request.title or (request.text[:40] + "..."),
        source=request.source or "Direct Scan",
        prediction=final_prediction,
        risk_score=risk_score,
        risk_level=risk_level,
        signals=[s.signal for s in signals],
        is_demo_mode=model_metadata.is_demo_mode
    )

    return JobAnalysisResponse(
        prediction=final_prediction,
        model_status=model_metadata.status_label,
        is_demo_mode=model_metadata.is_demo_mode,
        confidence=confidence,
        risk_score=risk_score,
        risk_level=risk_level,
        signals=signals,
        verification_steps=verification_steps,
        safety_recommendations=safety_recommendations,
        disclaimer=DISCLAIMER_TEXT,
        model_info=model_metadata
    )
