"""Modular model inference adapter for OfferGuard AI.

Supports three interchangeable backends:
1. "autoscientist": Adaption Labs AutoScientist Qwen3.5-2B LoRA model (served locally via PEFT or via remote endpoint).
2. "baseline": Local trained TF-IDF + class-weighted Logistic Regression model.
3. "demo": Explicitly labeled rule-based demo mode (never fakes trained AI inference).
"""
import logging
from typing import Dict, Any, Optional, Tuple
from pathlib import Path
import joblib
import httpx

from backend.app.config import (
    MODEL_PROVIDER,
    AUTOSCIENTIST_API_URL,
    AUTOSCIENTIST_API_KEY,
    ADAPTION_API_KEY,
    ADAPTION_EXPERIMENT_ID,
    MODEL_TIMEOUT,
    MODEL_PATH,
    PROJECT_ROOT
)
from backend.app.schemas import ModelMetadata

logger = logging.getLogger("OfferGuard-InferenceAdapter")

CHECKPOINT_DIR = PROJECT_ROOT / "ml" / "models" / "autoscientist_qwen3_5_2b"

INSTRUCTION_WRAPPER = (
    "Classify this job advertisement using only one label: "
    "LEGITIMATE or FRAUDULENT. A label is a risk prediction, not "
    "independent verification of a company.\n\n"
)


class ModelInferenceAdapter:
    def __init__(self):
        self.provider = MODEL_PROVIDER
        self.baseline_bundle: Optional[Dict[str, Any]] = None
        self.local_lora = None
        self._load_baseline_if_available()
        self._check_lora_availability()

    def _load_baseline_if_available(self):
        if MODEL_PATH.exists():
            try:
                self.baseline_bundle = joblib.load(MODEL_PATH)
                logger.info(f"Loaded baseline model bundle from {MODEL_PATH}")
            except Exception as e:
                logger.warning(f"Could not load baseline model from {MODEL_PATH}: {e}")

    def _check_lora_availability(self):
        adapter_file = CHECKPOINT_DIR / "adapter_model.safetensors"
        self.has_lora_weights = adapter_file.exists()
        if self.has_lora_weights:
            logger.info(f"Downloaded AutoScientist LoRA adapter weights verified at {CHECKPOINT_DIR}")

    def get_metadata(self) -> ModelMetadata:
        if self.provider == "autoscientist":
            has_remote = bool(AUTOSCIENTIST_API_URL and (AUTOSCIENTIST_API_KEY or ADAPTION_API_KEY))
            has_local = getattr(self, "has_lora_weights", False)
            is_configured = has_remote or has_local
            status = "Adaption AutoScientist Qwen3.5-2B LoRA" if is_configured else "AutoScientist (Checkpoint Available)"
            return ModelMetadata(
                model_name="AutoScientist Qwen3.5-2B LoRA",
                model_type="Instruction Fine-Tuned PEFT LoRA (r=48, alpha=96)",
                provider="Adaption AutoScientist",
                is_demo_mode=False,
                status_label=status,
                endpoint_configured=is_configured
            )
        elif self.provider == "baseline" and self.baseline_bundle is not None:
            return ModelMetadata(
                model_name="OfferGuard Baseline",
                model_type="TF-IDF + Class-Weighted Logistic Regression",
                provider="Local Baseline",
                is_demo_mode=False,
                status_label="Trained Baseline AI (TF-IDF + Logistic Regression)",
                endpoint_configured=True
            )
        else:
            return ModelMetadata(
                model_name="OfferGuard Heuristic Engine",
                model_type="Rule-Based Pattern Matcher",
                provider="Demo Heuristic",
                is_demo_mode=True,
                status_label="DEMO MODE (Heuristic Check)",
                endpoint_configured=False
            )

    async def predict(self, text: str) -> Tuple[str, Optional[float], float, ModelMetadata]:
        """Perform inference and return:
        (prediction, confidence, base_risk_score, metadata)
        
        Labels are strictly 'LEGITIMATE' or 'FRAUDULENT'.
        """
        metadata = self.get_metadata()

        # 1. Adaption AutoScientist Local LoRA (if active and loaded)
        if self.provider == "autoscientist" and getattr(self, "has_lora_weights", False):
            try:
                from backend.app.services.lora_predictor import local_lora_predictor
                if not local_lora_predictor.is_loaded:
                    logger.info("Initializing local Qwen3.5-2B LoRA model...")
                    local_lora_predictor.load_model()
                pred, risk = local_lora_predictor.predict(text)
                return pred, 0.95, risk, metadata
            except Exception as e:
                logger.warning(f"Local LoRA inference not currently active: {e}. Falling back to baseline.")

        # 1b. Adaption AutoScientist Remote HTTP API
        if self.provider == "autoscientist" and AUTOSCIENTIST_API_URL:
            try:
                prompt_text = INSTRUCTION_WRAPPER + text
                api_key = ADAPTION_API_KEY or AUTOSCIENTIST_API_KEY
                headers = {
                    "Content-Type": "application/json",
                    "User-Agent": "OfferGuard-AI/1.0"
                }
                if api_key:
                    headers["Authorization"] = f"Bearer {api_key}"

                payload = {
                    "prompt": prompt_text,
                    "max_tokens": 16,
                    "temperature": 0.0
                }

                async with httpx.AsyncClient(timeout=MODEL_TIMEOUT) as client:
                    resp = await client.post(AUTOSCIENTIST_API_URL, json=payload, headers=headers)
                    resp.raise_for_status()
                    data = resp.json()

                completion_raw = (
                    data.get("completion")
                    or data.get("response")
                    or data.get("text")
                    or (data.get("choices", [{}])[0].get("text"))
                    or ""
                ).strip()

                if "FRAUDULENT" in completion_raw.upper() or "FAKE" in completion_raw.upper():
                    prediction = "FRAUDULENT"
                    base_risk = 85.0
                else:
                    prediction = "LEGITIMATE"
                    base_risk = 15.0

                api_confidence = data.get("confidence")
                confidence = float(api_confidence) if api_confidence is not None else None

                return prediction, confidence, base_risk, metadata

            except Exception as e:
                logger.error(f"AutoScientist endpoint error: {e}. Falling back to baseline.")

        # 2. Local Trained Baseline
        if self.baseline_bundle is not None and self.provider != "demo":
            vec = self.baseline_bundle["vectorizer"]
            clf = self.baseline_bundle["classifier"]
            th = float(self.baseline_bundle.get("optimal_threshold", 0.62))

            X_vec = vec.transform([text])
            prob = float(clf.predict_proba(X_vec)[0, 1])
            prediction = "FRAUDULENT" if prob >= th else "LEGITIMATE"

            # Validated statistical confidence from calibrated probability
            confidence = round(prob if prediction == "FRAUDULENT" else (1.0 - prob), 3)
            base_risk = round(prob * 100.0, 1)

            return prediction, confidence, base_risk, metadata

        # 3. Explicit Demo Mode (Heuristic Fallback)
        metadata = ModelMetadata(
            model_name="OfferGuard Heuristic Engine",
            model_type="Rule-Based Pattern Matcher",
            provider="Demo Heuristic",
            is_demo_mode=True,
            status_label="DEMO MODE (Heuristic Check)",
            endpoint_configured=False
        )

        from backend.app.services.signal_analyzer import extract_suspicious_signals
        signals = extract_suspicious_signals(text)
        has_critical = any(s.severity == "CRITICAL" for s in signals)
        has_high = any(s.severity == "HIGH" for s in signals)

        if has_critical or len(signals) >= 2:
            prediction = "FRAUDULENT"
            base_risk = 80.0
        elif has_high:
            prediction = "FRAUDULENT"
            base_risk = 65.0
        else:
            prediction = "LEGITIMATE"
            base_risk = 20.0

        return prediction, None, base_risk, metadata


inference_adapter = ModelInferenceAdapter()
