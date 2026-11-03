"""Predictor service for OfferGuard India ML model inference."""
import logging
from pathlib import Path
from typing import Dict, Any, Tuple, List, Optional
import joblib
import numpy as np

from backend.app.config import MODEL_PATH

logger = logging.getLogger("OfferGuard-Predictor")


class FraudPredictor:
    def __init__(self, model_path: Optional[Path] = None):
        self.model_path = model_path or MODEL_PATH
        self.model_bundle: Optional[Dict[str, Any]] = None
        self.vectorizer = None
        self.classifier = None
        self.optimal_threshold: float = 0.62
        self.load_model()

    def load_model(self):
        if not self.model_path.exists():
            logger.warning(f"Model file not found at {self.model_path}. Trying fallback locations...")
            fallbacks = [
                Path(__file__).resolve().parent.parent.parent.parent / "ml" / "models" / "offerguard_baseline.joblib",
                Path.cwd() / "ml" / "models" / "offerguard_baseline.joblib",
                Path.cwd() / "OfferGuard_India" / "offerguard_baseline.joblib"
            ]
            for fb in fallbacks:
                if fb.exists():
                    self.model_path = fb
                    break

        if self.model_path.exists():
            try:
                self.model_bundle = joblib.load(self.model_path)
                self.vectorizer = self.model_bundle["vectorizer"]
                self.classifier = self.model_bundle["classifier"]
                self.optimal_threshold = float(self.model_bundle.get("optimal_threshold", 0.62))
                logger.info(f"Model successfully loaded from {self.model_path}. Threshold: {self.optimal_threshold}")
            except Exception as e:
                logger.error(f"Failed to load model from {self.model_path}: {e}")
        else:
            logger.warning("No trained model artifact available. Running in heuristic-only mode.")

    def is_ready(self) -> bool:
        return self.vectorizer is not None and self.classifier is not None

    def predict(self, text: str, threshold: Optional[float] = None) -> Dict[str, Any]:
        """Perform inference on job listing text.
        
        Returns:
            dict containing raw probability, binary prediction, confidence, and top active tokens.
        """
        th = threshold if threshold is not None else self.optimal_threshold

        if not self.is_ready():
            # Heuristic-based fallback
            return {
                "probability": 0.50,
                "prediction": "FRAUDULENT",
                "threshold": th,
                "confidence": 0.50,
                "top_tokens": []
            }

        vec = self.vectorizer.transform([text])
        prob = float(self.classifier.predict_proba(vec)[0, 1])
        prediction = "FRAUDULENT" if prob >= th else "LEGITIMATE"

        # Confidence: distance from decision threshold normalized
        confidence = float(min(1.0, max(0.5, (prob if prediction == "FRAUDULENT" else (1.0 - prob)))))

        # Extract top active tokens contributing to the prediction
        feature_names = self.vectorizer.get_feature_names_out()
        coefs = self.classifier.coef_[0]
        nonzero_cols = vec.nonzero()[1]

        token_contributions = []
        for col in nonzero_cols:
            word = feature_names[col]
            weight = coefs[col]
            tf_idf_val = vec[0, col]
            score = weight * tf_idf_val
            token_contributions.append((word, score, weight))

        # Sort by fraud-contribution (highest positive score)
        token_contributions.sort(key=lambda x: x[1], reverse=True)
        top_fraud_tokens = [w for w, score, weight in token_contributions if score > 0.05][:8]

        return {
            "probability": round(prob, 4),
            "prediction": prediction,
            "threshold": th,
            "confidence": round(confidence, 4),
            "top_tokens": top_fraud_tokens
        }


# Singleton instance
predictor_service = FraudPredictor()

