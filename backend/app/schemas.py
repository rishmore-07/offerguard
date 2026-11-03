"""Pydantic schemas for OfferGuard AI."""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


class JobAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=15000, description="Job offer or recruitment text to analyze")
    title: Optional[str] = Field(None, max_length=200, description="Optional job title")
    company: Optional[str] = Field(None, max_length=200, description="Optional claimed employer name")
    salary: Optional[str] = Field(None, max_length=150, description="Optional salary / compensation claim")
    source: Optional[str] = Field("WhatsApp / Telegram", max_length=100, description="Recruitment communication channel")

    @field_validator("text")
    def clean_text(cls, v: str) -> str:
        s = v.strip()
        if len(s) < 10:
            raise ValueError("Offer text must contain at least 10 non-whitespace characters.")
        return s


class SuspiciousSignal(BaseModel):
    category: str = Field(..., description="Classification category of the signal")
    signal: str = Field(..., description="Short name of the signal")
    severity: str = Field(..., description="Severity level: CRITICAL, HIGH, MEDIUM, ADVISORY")
    description: str = Field(..., description="Explanation of why this pattern is suspicious")
    matched_text: str = Field(..., description="Exact snippet extracted from the text")
    start_pos: Optional[int] = Field(None, description="Start character offset")
    end_pos: Optional[int] = Field(None, description="End character offset")


class ModelMetadata(BaseModel):
    model_name: str
    model_type: str
    provider: str
    is_demo_mode: bool
    status_label: str
    endpoint_configured: bool


class JobAnalysisResponse(BaseModel):
    prediction: str = Field(..., description="Model classification: LEGITIMATE or FRAUDULENT")
    model_status: str = Field(..., description="Exact model status (e.g. Trained Baseline AI, Adaption AutoScientist, Demo Mode)")
    is_demo_mode: bool = Field(..., description="Whether this prediction came from Heuristic Demo Mode")
    confidence: Optional[float] = Field(None, description="Only populated when meaningful probabilistic confidence is available")
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Overall risk index from 0.0 to 100.0")
    risk_level: str = Field(..., description="CRITICAL, HIGH, MODERATE, or LOW")
    signals: List[SuspiciousSignal] = Field(default_factory=list, description="Extracted suspicious signals with matched passages")
    verification_steps: List[str] = Field(default_factory=list, description="Structured steps for candidate to verify legitimacy")
    safety_recommendations: List[str] = Field(default_factory=list, description="Legal and cybersecurity action steps under Indian law")
    disclaimer: str = Field(..., description="Legal and advisory disclaimer")
    model_info: ModelMetadata


class RecentAnalysisItem(BaseModel):
    id: str
    timestamp: str
    title: str
    source: str
    prediction: str
    risk_score: float
    risk_level: str
    signals_count: int
    is_demo_mode: bool


class SessionStatsResponse(BaseModel):
    total_analyzed: int
    fraudulent_count: int
    legitimate_count: int
    signals_frequency: Dict[str, int]
    recent_analyses: List[RecentAnalysisItem]


class ModelInfoResponse(BaseModel):
    active_provider: str
    model_name: str
    model_status: str
    autoscientist_status: str
    dataset_overview: Dict[str, Any]
    baseline_metrics: Optional[Dict[str, Any]]
    lora_evaluation: Optional[Dict[str, Any]] = None
    lightweight_holdout: Optional[Dict[str, Any]] = None
    evaluation_methodology: str


class SampleJob(BaseModel):
    id: str
    label: str
    type: str  # "Scam" or "Legitimate"
    source: str
    title: str
    company: str
    text: str
    expected_risk: str
    key_scam_vector: Optional[str] = None


class BatchJobItem(BaseModel):
    id: str
    text: str
    title: Optional[str] = None
    source: Optional[str] = None


class BatchAnalysisRequest(BaseModel):
    jobs: List[BatchJobItem] = Field(..., max_length=50)


class BatchAnalysisResponse(BaseModel):
    total_processed: int
    fraudulent_count: int
    legitimate_count: int
    results: List[Dict[str, Any]]
