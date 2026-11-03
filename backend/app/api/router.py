"""API Endpoints for OfferGuard AI."""
import json
import logging
import threading
import time
from collections import defaultdict
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Request

from backend.app.config import METRICS_PATH, PROJECT_ROOT, RATE_LIMIT_PER_MINUTE
from backend.app.schemas import (
    JobAnalysisRequest,
    JobAnalysisResponse,
    BatchAnalysisRequest,
    BatchAnalysisResponse,
    SessionStatsResponse,
    ModelInfoResponse,
    SampleJob
)
from backend.app.services.analyzer import analyze_job_offer
from backend.app.services.inference_adapter import ModelNotReady, inference_adapter
from backend.app.services.session_store import session_store

_rate_lock = threading.Lock()
_rate_hits: dict[str, list[float]] = defaultdict(list)
LORA_EVAL_PATH = PROJECT_ROOT / "evaluation" / "evaluation_results.json"
LIGHTWEIGHT_EVAL_PATH = PROJECT_ROOT / "evaluation" / "lightweight_baseline_holdout.json"


def enforce_rate_limit(request: Request) -> None:
    client = request.client.host if request.client else "unknown"
    now = time.time()
    with _rate_lock:
        recent = [stamp for stamp in _rate_hits[client] if now - stamp < 60]
        if len(recent) >= RATE_LIMIT_PER_MINUTE:
            raise HTTPException(status_code=429, detail="Too many analysis requests. Try again in a minute.")
        recent.append(now)
        _rate_hits[client] = recent


def model_is_ready() -> bool:
    return inference_adapter.baseline_bundle is not None

logger = logging.getLogger("OfferGuard-API")
router = APIRouter()

PRESET_SAMPLES = [
    SampleJob(
        id="sample-1",
        label="Reliance Jio Gate Pass & Registration Fee Scam",
        type="Scam",
        source="WhatsApp / SMS",
        title="Back Office Executive",
        company="Reliance Jio Infocomm (Impersonated)",
        text="Dear Candidate, You are selected for the post of Back Office Executive at Reliance Jio Mumbai. Salary is Rs. 48,000 per month. Direct joining without interview. You must transfer Rs. 1,450 gate pass and registration charges immediately to our HR via Google Pay at 9876543210 to receive your official appointment letter.",
        expected_risk="CRITICAL",
        key_scam_vector="Mandatory registration fee & personal UPI transfer"
    ),
    SampleJob(
        id="sample-2",
        label="YouTube Like & Merchant Task Cyber Fraud",
        type="Scam",
        source="Telegram Channel",
        title="Part-time Digital Assistant",
        company="Global Media Merchants",
        text="Work from home part time job! Earn Rs. 3,000 to Rs. 8,000 daily simply by liking YouTube videos and completing merchant review tasks. No resume or interview required. Join our official Telegram channel t.me/fast_earn_tasks to receive today's prepaid task wallet.",
        expected_risk="CRITICAL",
        key_scam_vector="Transnational task scam / Telegram redirection"
    ),
    SampleJob(
        id="sample-3",
        label="Amazon Freelance Data Entry Laptop Deposit Scam",
        type="Scam",
        source="LinkedIn Direct Message",
        title="Freelance Catalog Auditor",
        company="Amazon India (Impersonated)",
        text="Job Posting: Work from home for Amazon India as a remote catalog auditor. Guaranteed monthly compensation of Rs. 65,000. Apple MacBook Air provided by company. To dispatch equipment, deposit a refundable courier and asset insurance fee of 2,500 INR via PhonePe. Offer valid only for next 2 hours.",
        expected_risk="CRITICAL",
        key_scam_vector="Equipment deposit & artificial urgency deadline"
    ),
    SampleJob(
        id="sample-4",
        label="HDFC Bank Free Webmail Phishing Attempt",
        type="Scam",
        source="Unsolicited Email",
        title="Credit Operations Associate",
        company="HDFC Bank Careers (Impersonated)",
        text="Offer of Employment: HDFC Bank is pleased to offer you the role of Credit Operations Associate at our Bangalore branch. Package: 9.5 LPA. Kindly submit scanned copies of Aadhaar card, PAN card, and cancelled cheque to hr-hdfcbankrecruitment@protonmail.com within 24 hours.",
        expected_risk="HIGH",
        key_scam_vector="Free disposable webmail & sensitive KYC document harvesting"
    ),
    SampleJob(
        id="sample-5",
        label="Tata Consultancy Services (TCS) Genuine Engineer Listing",
        type="Legitimate",
        source="TCS iBegin Portal",
        title="Full-Stack React & Node Developer",
        company="Tata Consultancy Services (TCS)",
        text="Tata Consultancy Services (TCS) is hiring Full-Stack Developers (3-5 years experience) for Bengaluru location. Key skills: React, TypeScript, Node.js, and cloud deployments. Candidates will undergo a coding assessment followed by technical and managerial rounds. Apply strictly through official portal ibegin.tcs.com. TCS never requests any recruitment fee or security deposit.",
        expected_risk="LOW",
        key_scam_vector="Authentic enterprise recruitment with explicit zero-fee policy"
    ),
    SampleJob(
        id="sample-6",
        label="Infosys Legitimate Senior Machine Learning Engineer",
        type="Legitimate",
        source="Infosys Careers Portal",
        title="Senior Machine Learning Engineer",
        company="Infosys Limited",
        text="Infosys is seeking a Senior ML Engineer to join our Applied AI practice in Pune. Qualifications: B.Tech/M.Tech in Computer Science, 4+ years hands-on machine learning experience with scikit-learn, PyTorch, and FastAPI. Comprehensive compensation package includes provident fund, medical insurance, and performance bonuses. Submit application directly at career.infosys.com.",
        expected_risk="LOW",
        key_scam_vector="Authentic structured job posting with clear requirements"
    )
]


@router.get("/health")
def health_check():
    meta = inference_adapter.get_metadata()
    return {
        "status": "healthy",
        "service": "OfferGuard AI",
        "model_provider": meta.provider,
        "model_status": meta.status_label,
        "is_demo_mode": meta.is_demo_mode,
        "model_ready": model_is_ready()
    }


@router.get("/ready")
def readiness_check():
    if not model_is_ready():
        raise HTTPException(status_code=503, detail="Trained model inference is not ready.")
    meta = inference_adapter.get_metadata()
    return {
        "ready": True,
        "model_provider": meta.provider,
        "model_status": meta.status_label
    }


@router.post("/analyze", response_model=JobAnalysisResponse)
async def analyze_listing(request: Request, body: JobAnalysisRequest):
    enforce_rate_limit(request)
    try:
        return await analyze_job_offer(body)
    except ModelNotReady as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception:
        logger.exception("Analysis failed")
        raise HTTPException(status_code=500, detail="Analysis failed.")


@router.post("/batch", response_model=BatchAnalysisResponse)
async def batch_analyze(request: Request, body: BatchAnalysisRequest):
    enforce_rate_limit(request)
    request_body = body
    results = []
    fraud_count = 0
    legit_count = 0

    try:
        analyzed = []
        for job in request_body.jobs:
            req = JobAnalysisRequest(
                text=job.text,
                title=job.title,
                source=job.source or "Batch"
            )
            analyzed.append((job, await analyze_job_offer(req)))
    except ModelNotReady as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception:
        logger.exception("Batch analysis failed")
        raise HTTPException(status_code=500, detail="Analysis failed.")

    for job, res in analyzed:
        if res.prediction == "FRAUDULENT":
            fraud_count += 1
        else:
            legit_count += 1

        results.append({
            "id": job.id,
            "prediction": res.prediction,
            "risk_score": res.risk_score,
            "risk_level": res.risk_level,
            "signals_count": len(res.signals),
            "signals": [s.signal for s in res.signals]
        })

    return BatchAnalysisResponse(
        total_processed=len(request_body.jobs),
        fraudulent_count=fraud_count,
        legitimate_count=legit_count,
        results=results
    )


@router.get("/session-stats", response_model=SessionStatsResponse)
def get_session_stats():
    return session_store.get_stats()


@router.get("/samples", response_model=List[SampleJob])
def get_samples():
    return PRESET_SAMPLES


@router.get("/model-info", response_model=ModelInfoResponse)
def get_model_info():
    meta = inference_adapter.get_metadata()

    # Load baseline metrics from file if available
    baseline_data = None
    if METRICS_PATH.exists():
        try:
            with open(METRICS_PATH, "r", encoding="utf-8") as f:
                baseline_data = json.load(f)
        except Exception as e:
            logger.warning(f"Could not read metrics file {METRICS_PATH}: {e}")

    # Dataset overview from preparation pipeline
    dataset_overview = {
        "emscad_total_records": 17880,
        "emscad_clean_unique_records": 15750,
        "emscad_train_split": 11025,
        "emscad_validation_split": 2362,
        "emscad_real_test_holdout": 2363,
        "aioshi_synthetic_records": 597,
        "aioshi_synthetic_train": 477,
        "aioshi_synthetic_test_holdout": 120,
        "combined_train_records": 11502,
        "classes": ["LEGITIMATE", "FRAUDULENT"]
    }

    lora_evaluation = None
    if LORA_EVAL_PATH.exists():
        try:
            with open(LORA_EVAL_PATH, "r", encoding="utf-8") as handle:
                lora_evaluation = json.load(handle)
        except Exception:
            logger.warning("Could not read LoRA evaluation results")

    lightweight_holdout = None
    if LIGHTWEIGHT_EVAL_PATH.exists():
        try:
            with open(LIGHTWEIGHT_EVAL_PATH, "r", encoding="utf-8") as handle:
                lightweight_holdout = json.load(handle)
        except Exception:
            logger.warning("Could not read lightweight holdout evaluation")

    if lora_evaluation and lora_evaluation.get("complete"):
        autoscientist_status = (
            "Qwen3.5-2B LoRA evaluation is stored locally. It is not the production classifier."
        )
    else:
        autoscientist_status = "No completed Qwen evaluation is stored. Production uses the TF-IDF logistic regression."

    return ModelInfoResponse(
        active_provider=meta.provider,
        model_name=meta.model_name,
        model_status=meta.status_label,
        autoscientist_status=autoscientist_status,
        dataset_overview=dataset_overview,
        baseline_metrics=baseline_data,
        lora_evaluation=lora_evaluation,
        lightweight_holdout=lightweight_holdout,
        evaluation_methodology=(
            "Live predictions come only from the saved TF-IDF logistic regression. "
            "Its 2,291-row metrics are a separate measurement from the Qwen3.5-2B LoRA evaluation. "
            "The Adaption win rate is not accuracy."
        ),
    )
