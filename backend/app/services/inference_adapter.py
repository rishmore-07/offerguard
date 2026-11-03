"""Production inference for OfferGuard AI.

Every prediction comes from the saved TF-IDF logistic regression in
ml/models/offerguard_baseline.joblib. This module does not call the
AutoScientist LoRA and does not substitute heuristic rules.
"""
import logging
from typing import Any, Dict, Optional, Tuple

import joblib

from backend.app.config import MODEL_PATH
from backend.app.schemas import ModelMetadata

logger = logging.getLogger("OfferGuard-InferenceAdapter")

PROMPT_PREFIX = (
    "Classify this job advertisement using only one label: "
    "LEGITIMATE or FRAUDULENT. A label is a risk prediction, not "
    "independent verification of a company.\n\n"
)


class ModelNotReady(RuntimeError):
    """Raised when the selected trained model cannot produce a prediction."""


class ModelInferenceAdapter:
    def __init__(self):
        self.baseline_bundle: Optional[Dict[str, Any]] = None
        self._load_baseline()

    def _load_baseline(self):
        if not MODEL_PATH.exists():
            logger.error("Production classifier is missing at %s", MODEL_PATH)
            return
        try:
            self.baseline_bundle = joblib.load(MODEL_PATH)
            logger.info("Loaded production classifier from %s", MODEL_PATH)
        except Exception as exc:
            logger.error("Could not load production classifier from %s: %s", MODEL_PATH, exc)
            self.baseline_bundle = None

    def get_metadata(self) -> ModelMetadata:
        if self.baseline_bundle is None:
            return ModelMetadata(
                model_name="OfferGuard TF-IDF Logistic Regression",
                model_type="TF-IDF + Class-Weighted Logistic Regression",
                provider="Local Baseline",
                is_demo_mode=False,
                status_label="Trained classifier is not loaded",
                endpoint_configured=False,
            )
        return ModelMetadata(
            model_name="OfferGuard TF-IDF Logistic Regression",
            model_type="TF-IDF (15,000 word unigrams/bigrams) + class-weighted Logistic Regression",
            provider="Local Baseline",
            is_demo_mode=False,
            status_label="Trained TF-IDF logistic regression",
            endpoint_configured=True,
        )

    async def predict(self, text: str) -> Tuple[str, Optional[float], float, ModelMetadata]:
        """Return the classifier label, class confidence, fraud probability percent, and metadata."""
        metadata = self.get_metadata()
        if self.baseline_bundle is None:
            raise ModelNotReady("The trained TF-IDF logistic regression is not available.")

        listing = text.replace(PROMPT_PREFIX, "").strip()
        vectorizer = self.baseline_bundle["vectorizer"]
        classifier = self.baseline_bundle["classifier"]
        threshold = float(self.baseline_bundle.get("optimal_threshold", 0.62))

        features = vectorizer.transform([listing])
        fraud_probability = float(classifier.predict_proba(features)[0, 1])
        prediction = "FRAUDULENT" if fraud_probability >= threshold else "LEGITIMATE"
        confidence = fraud_probability if prediction == "FRAUDULENT" else (1.0 - fraud_probability)
        return prediction, round(confidence, 3), round(fraud_probability * 100.0, 1), metadata


inference_adapter = ModelInferenceAdapter()
