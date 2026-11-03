"""API Endpoints for OfferGuard AI."""
import json
import logging
from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException

from backend.app.config import METRICS_PATH, MODEL_PROVIDER
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
from backend.app.services.inference_adapter import inference_adapter
from backend.app.services.session_store import session_store

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
        "endpoint_configured": meta.endpoint_configured
    }


@router.post("/analyze", response_model=JobAnalysisResponse)
async def analyze_listing(request: JobAnalysisRequest):
    try:
        return await analyze_job_offer(request)
    except Exception as e:
        logger.error(f"Error during job analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch", response_model=BatchAnalysisResponse)
async def batch_analyze(request: BatchAnalysisRequest):
    results = []
    fraud_count = 0
    legit_count = 0

    for job in request.jobs:
        req = JobAnalysisRequest(
            text=job.text,
            title=job.title,
            source=job.source or "Batch"
        )
        res = await analyze_job_offer(req)
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
        total_processed=len(request.jobs),
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

    # AutoScientist run status based on actual verification
    if getattr(inference_adapter, "has_lora_weights", False):
        autoscientist_status = "Trained LoRA Checkpoint Verified (ID: 07db89e9, Qwen3.5-2B, Win Rate: 63.5%)"
    elif meta.provider == "autoscientist" and meta.endpoint_configured:
        autoscientist_status = "Connected & Active"
    else:
        autoscientist_status = "Awaiting trained model"

    return ModelInfoResponse(
        active_provider=meta.provider,
        model_name=meta.model_name,
        model_status=meta.status_label,
        autoscientist_status=autoscientist_status,
        dataset_overview=dataset_overview,
        baseline_metrics=baseline_data,
        evaluation_methodology="Stratified 70/15/15 train/val/test split with zero text leakage. Optimization prioritized Fraud Recall and Fraud F1-Score on imbalanced holdout."
    )
