"""Modular model inference adapter for OfferGuard AI.

Supports three interchangeable backends:
1. "autoscientist": Adaption Labs AutoScientist Qwen3.5-2B LoRA model (served locally via PEFT or via remote endpoint).
2. "baseline": Local trained TF-IDF + class-weighted Logistic Regression model.
3. "demo": Explicitly labeled rule-based demo mode (never fakes trained AI inference).
"""
import logging
from typing import Dict, Any, Optional, Tuple
import joblib

from backend.app.config import (
    MODEL_PROVIDER,
    MODEL_PATH,
    PROJECT_ROOT
)
from backend.app.schemas import ModelMetadata

logger = logging.getLogger("OfferGuard-InferenceAdapter")


class ModelNotReady(RuntimeError):
    """Raised when the selected trained model cannot produce a prediction."""

CHECKPOINT_DIR = PROJECT_ROOT / "ml" / "models" / "autoscientist_qwen3_5_2b"


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
            from backend.app.services.lora_predictor import local_lora_predictor

            loaded = local_lora_predictor.is_loaded and local_lora_predictor.inference_verified
            has_weights = getattr(self, "has_lora_weights", False)
            if loaded:
                status = "Trained Qwen3.5-2B LoRA ready"
            elif has_weights:
                status = "LoRA weights present; inference not verified"
            else:
                status = "Trained model not loaded"
            return ModelMetadata(
                model_name="AutoScientist Qwen3.5-2B LoRA",
                model_type="Instruction Fine-Tuned PEFT LoRA (r=48, alpha=96)",
                provider="Adaption AutoScientist",
                is_demo_mode=False,
                status_label=status,
                endpoint_configured=loaded
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

        # The trained LoRA model never falls through to the baseline or heuristic engines.
        if self.provider == "autoscientist":
            from backend.app.services.lora_predictor import local_lora_predictor

            if not getattr(self, "has_lora_weights", False):
                raise ModelNotReady("Trained LoRA weights are not available on this server.")
            if not local_lora_predictor.is_loaded:
                logger.info("Initializing local Qwen3.5-2B LoRA model")
                local_lora_predictor.load_model()
            label, _confidence = local_lora_predictor.predict(text)
            metadata = self.get_metadata()
            return label, None, None, metadata

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
