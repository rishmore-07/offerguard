"""TF-IDF + class-weighted Logistic Regression baseline for OfferGuard India.

Key Features:
1. Robust text preprocessing and feature extraction (unigrams + bigrams, sublinear TF).
2. Class-weighted Logistic Regression to prevent majority-class collapse.
3. Explicit threshold tuning optimizing for Fraud F1 and Recall on the Validation set.
4. Independent evaluation on real-world EMSCAD test set vs. synthetic Indian test set.
5. Export reproducible evaluation JSON and persist the trained model pipeline for the backend.
"""
import os
import sys
import json
import logging
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# Local import
try:
    from ml.evaluate import calculate_metrics, find_optimal_threshold, save_metrics_to_json
except ImportError:
    from evaluate import calculate_metrics, find_optimal_threshold, save_metrics_to_json

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("OfferGuard-Baseline")

PROMPT_PREFIX = (
    "Classify this job advertisement using only one label: "
    "LEGITIMATE or FRAUDULENT. A label is a risk prediction, not "
    "independent verification of a company.\n\n"
)


def clean_instruction_text(series: pd.Series) -> pd.Series:
    """Strip prompt wrapper to focus TF-IDF purely on the job listing text."""
    return series.fillna("").astype(str).str.replace(PROMPT_PREFIX, "", regex=False).str.strip()


def train_and_evaluate(data_dir: Path, output_dir: Path, model_dir: Path):
    data_dir = Path(data_dir)
    output_dir = Path(output_dir)
    model_dir = Path(model_dir)

    train_path = data_dir / "offerguard_train.csv"
    val_path = data_dir / "offerguard_validation.csv"
    test_path = data_dir / "offerguard_test.csv"
    syn_test_path = data_dir / "offerguard_india_synthetic_test.csv"

    for p in [train_path, val_path, test_path]:
        if not p.exists():
            raise FileNotFoundError(f"Required dataset split not found: {p}. Run prepare_data.py first.")

    logger.info("Loading dataset splits...")
    df_train = pd.read_csv(train_path)
    df_val = pd.read_csv(val_path)
    df_test = pd.read_csv(test_path)
    df_syn = pd.read_csv(syn_test_path) if syn_test_path.exists() else None

    logger.info(f"Loaded Train: {len(df_train)}, Val: {len(df_val)}, Test: {len(df_test)}")
    if df_syn is not None:
        logger.info(f"Loaded Synthetic Test: {len(df_syn)}")

    X_train = clean_instruction_text(df_train["instruction"])
    y_train = (df_train["response"] == "FRAUDULENT").astype(int).to_numpy()

    X_val = clean_instruction_text(df_val["instruction"])
    y_val = (df_val["response"] == "FRAUDULENT").astype(int).to_numpy()

    X_test = clean_instruction_text(df_test["instruction"])
    y_test = (df_test["response"] == "FRAUDULENT").astype(int).to_numpy()

    logger.info("Building TF-IDF Vectorizer (ngram_range=(1,2), sublinear_tf=True, max_features=15000)...")
    vectorizer = TfidfVectorizer(
        max_features=15000,
        stop_words="english",
        ngram_range=(1, 2),
        sublinear_tf=True,
        min_df=2
    )

    X_train_vec = vectorizer.fit_transform(X_train)
    X_val_vec = vectorizer.transform(X_val)
    X_test_vec = vectorizer.transform(X_test)

    logger.info("Fitting class-weighted LogisticRegression (class_weight='balanced', max_iter=1000)...")
    classifier = LogisticRegression(
        class_weight="balanced",
        C=1.0,
        max_iter=1000,
        random_state=42,
        solver="lbfgs"
    )
    classifier.fit(X_train_vec, y_train)

    # Probabilities
    val_probs = classifier.predict_proba(X_val_vec)[:, 1]
    test_probs = classifier.predict_proba(X_test_vec)[:, 1]

    # Default predictions (th=0.5)
    val_preds_default = (val_probs >= 0.5).astype(int)
    test_preds_default = (test_probs >= 0.5).astype(int)

    # Find optimal threshold on validation set
    threshold_tuning = find_optimal_threshold(y_val, val_probs)
    best_th = threshold_tuning["best_threshold"]
    logger.info(f"Validation optimal threshold: {best_th:.3f} (Validation Fraud F1: {threshold_tuning['best_fraud_f1']:.4f})")

    val_preds_tuned = (val_probs >= best_th).astype(int)
    test_preds_tuned = (test_probs >= best_th).astype(int)

    # Compute detailed metrics
    val_metrics_default = calculate_metrics(y_val, val_preds_default, val_probs, split_name="EMSCAD Validation (th=0.5)")
    val_metrics_tuned = calculate_metrics(y_val, val_preds_tuned, val_probs, split_name=f"EMSCAD Validation (Tuned th={best_th})")
    test_metrics_default = calculate_metrics(y_test, test_preds_default, test_probs, split_name="EMSCAD Test (Real Holdout, th=0.5)")
    test_metrics_tuned = calculate_metrics(y_test, test_preds_tuned, test_probs, split_name=f"EMSCAD Test (Real Holdout, Tuned th={best_th})")

    # Evaluate Synthetic Test if available
    syn_metrics_default = None
    syn_metrics_tuned = None
    if df_syn is not None:
        X_syn = clean_instruction_text(df_syn["instruction"])
        y_syn = (df_syn["response"] == "FRAUDULENT").astype(int).to_numpy()
        X_syn_vec = vectorizer.transform(X_syn)
        syn_probs = classifier.predict_proba(X_syn_vec)[:, 1]
        syn_preds_default = (syn_probs >= 0.5).astype(int)
        syn_preds_tuned = (syn_probs >= best_th).astype(int)
        syn_metrics_default = calculate_metrics(y_syn, syn_preds_default, syn_probs, split_name="Aioshi Synthetic Test (th=0.5)")
        syn_metrics_tuned = calculate_metrics(y_syn, syn_preds_tuned, syn_probs, split_name=f"Aioshi Synthetic Test (th={best_th})")

    # Feature Importance (top fraud vs legitimate n-grams)
    feature_names = np.array(vectorizer.get_feature_names_out())
    coefs = classifier.coef_[0]
    top_fraud_indices = np.argsort(coefs)[-20:][::-1]
    top_legit_indices = np.argsort(coefs)[:20]

    top_fraud_features = [{"feature": str(feature_names[i]), "weight": round(float(coefs[i]), 4)} for i in top_fraud_indices]
    top_legit_features = [{"feature": str(feature_names[i]), "weight": round(float(coefs[i]), 4)} for i in top_legit_indices]

    results = {
        "model_name": "TF-IDF + Class-Weighted Logistic Regression",
        "model_type": "Baseline Linear Classifier",
        "hyperparameters": {
            "tfidf_max_features": 15000,
            "tfidf_ngram_range": [1, 2],
            "tfidf_sublinear_tf": True,
            "classifier_class_weight": "balanced",
            "classifier_C": 1.0,
            "classifier_max_iter": 1000,
            "classifier_solver": "lbfgs"
        },
        "optimal_decision_threshold": best_th,
        "splits": {
            "validation_default_threshold": val_metrics_default,
            "validation_tuned_threshold": val_metrics_tuned,
            "test_real_emscad_default_threshold": test_metrics_default,
            "test_real_emscad_tuned_threshold": test_metrics_tuned,
            "test_synthetic_india_default_threshold": syn_metrics_default,
            "test_synthetic_india_tuned_threshold": syn_metrics_tuned,
        },
        "threshold_tuning_curve": threshold_tuning["threshold_curve"],
        "top_features": {
            "fraud_indicative": top_fraud_features,
            "legitimate_indicative": top_legit_features
        }
    }

    # Save metrics JSON
    output_dir.mkdir(parents=True, exist_ok=True)
    metrics_path = output_dir / "baseline_evaluation.json"
    save_metrics_to_json(results, metrics_path)
    logger.info(f"Saved evaluation metrics JSON: {metrics_path}")

    # Save fitted model artifacts
    model_dir.mkdir(parents=True, exist_ok=True)
    model_pipeline = {
        "vectorizer": vectorizer,
        "classifier": classifier,
        "optimal_threshold": best_th,
        "top_fraud_features": top_fraud_features,
        "top_legit_features": top_legit_features
    }
    model_path = model_dir / "offerguard_baseline.joblib"
    joblib.dump(model_pipeline, model_path)
    logger.info(f"Saved trained model artifacts: {model_path}")

    # Print summary
    print("\n" + "=" * 70)
    print("OFFERGUARD INDIA: BASELINE MODEL EVALUATION REPORT")
    print("=" * 70)
    print(f"Validation Default (th=0.5): Fraud F1={val_metrics_default['primary_kpis']['fraud_f1']:.4f} | Recall={val_metrics_default['primary_kpis']['fraud_recall']:.4f} | Prec={val_metrics_default['primary_kpis']['fraud_precision']:.4f}")
    print(f"Validation Tuned (th={best_th}): Fraud F1={val_metrics_tuned['primary_kpis']['fraud_f1']:.4f} | Recall={val_metrics_tuned['primary_kpis']['fraud_recall']:.4f} | Prec={val_metrics_tuned['primary_kpis']['fraud_precision']:.4f}")
    print("-" * 70)
    print(f"EMSCAD Real Test (th=0.5):   Fraud F1={test_metrics_default['primary_kpis']['fraud_f1']:.4f} | Recall={test_metrics_default['primary_kpis']['fraud_recall']:.4f} | Prec={test_metrics_default['primary_kpis']['fraud_precision']:.4f} | Acc={test_metrics_default['primary_kpis']['accuracy']:.4f}")
    print(f"EMSCAD Real Test (th={best_th}):   Fraud F1={test_metrics_tuned['primary_kpis']['fraud_f1']:.4f} | Recall={test_metrics_tuned['primary_kpis']['fraud_recall']:.4f} | Prec={test_metrics_tuned['primary_kpis']['fraud_precision']:.4f} | Acc={test_metrics_tuned['primary_kpis']['accuracy']:.4f}")
    if syn_metrics_default:
        print("-" * 70)
        print(f"India Synthetic Test (th=0.5): Fraud F1={syn_metrics_default['primary_kpis']['fraud_f1']:.4f} | Recall={syn_metrics_default['primary_kpis']['fraud_recall']:.4f} | Prec={syn_metrics_default['primary_kpis']['fraud_precision']:.4f}")
        print(f"India Synthetic Test (th={best_th}): Fraud F1={syn_metrics_tuned['primary_kpis']['fraud_f1']:.4f} | Recall={syn_metrics_tuned['primary_kpis']['fraud_recall']:.4f} | Prec={syn_metrics_tuned['primary_kpis']['fraud_precision']:.4f}")
    print("=" * 70 + "\n")

    return results


if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    data_dir = root / "ml" / "data"
    output_dir = root / "ml" / "metrics"
    model_dir = root / "ml" / "models"
    train_and_evaluate(data_dir, output_dir, model_dir)

