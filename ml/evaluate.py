"""Reusable evaluation functions for OfferGuard India fraud detection models.

Supports:
1. Baseline scikit-learn models (numerical arrays and probabilities).
2. AutoScientist / LLM outputs (string predictions: 'FRAUDULENT' vs 'LEGITIMATE', 'Fake' vs 'Real').
3. Multi-threshold calibration focusing on Fraud-class Recall and F1.
4. Serializing reproducible evaluation metrics to JSON.
"""
from typing import Dict, Any, List, Optional, Union
import json
from pathlib import Path
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    roc_auc_score,
    average_precision_score,
    brier_score_loss
)


def normalize_label(val: Any) -> int:
    """Normalize various label formats to binary 0 (Legitimate) / 1 (Fraudulent)."""
    if isinstance(val, (int, np.integer)):
        return int(val)
    if isinstance(val, (float, np.floating)):
        return int(val)
    s = str(val).strip().lower()
    if s in {'1', 'fraudulent', 'fake', 'fraud', 'suspicious'}:
        return 1
    if s in {'0', 'legitimate', 'real', 'genuine', 'safe'}:
        return 0
    # Fallback search for keyword
    if 'fraud' in s or 'fake' in s:
        return 1
    return 0


def calculate_metrics(
    y_true: Union[List, np.ndarray],
    y_pred: Union[List, np.ndarray],
    y_prob: Optional[Union[List, np.ndarray]] = None,
    split_name: str = "Evaluation Split"
) -> Dict[str, Any]:
    """Calculate comprehensive evaluation metrics optimized for imbalanced fraud detection.
    
    Positive class (1) is FRAUDULENT.
    Negative class (0) is LEGITIMATE.
    """
    y_t = np.array([normalize_label(x) for x in y_true])
    y_p = np.array([normalize_label(x) for x in y_pred])
    
    total = len(y_t)
    pos_support = int(np.sum(y_t == 1))
    neg_support = int(np.sum(y_t == 0))
    fraud_rate_pct = round(float(pos_support / total * 100), 2) if total > 0 else 0.0

    cm = confusion_matrix(y_t, y_p, labels=[0, 1])
    tn, fp, fn, tp = int(cm[0, 0]), int(cm[0, 1]), int(cm[1, 0]), int(cm[1, 1])

    # Fraud-class (primary focus)
    fraud_precision = float(precision_score(y_t, y_p, pos_label=1, zero_division=0))
    fraud_recall = float(recall_score(y_t, y_p, pos_label=1, zero_division=0))
    fraud_f1 = float(f1_score(y_t, y_p, pos_label=1, zero_division=0))

    # Legitimate-class
    legit_precision = float(precision_score(y_t, y_p, pos_label=0, zero_division=0))
    legit_recall = float(recall_score(y_t, y_p, pos_label=0, zero_division=0))
    legit_f1 = float(f1_score(y_t, y_p, pos_label=0, zero_division=0))

    # Overall / macro / weighted
    acc = float(accuracy_score(y_t, y_p))
    macro_f1 = float(f1_score(y_t, y_p, average="macro", zero_division=0))
    macro_precision = float(precision_score(y_t, y_p, average="macro", zero_division=0))
    macro_recall = float(recall_score(y_t, y_p, average="macro", zero_division=0))
    weighted_f1 = float(f1_score(y_t, y_p, average="weighted", zero_division=0))

    metrics: Dict[str, Any] = {
        "split_name": split_name,
        "sample_counts": {
            "total": total,
            "legitimate": neg_support,
            "fraudulent": pos_support,
            "fraud_prevalence_pct": fraud_rate_pct
        },
        "primary_kpis": {
            "fraud_f1": round(fraud_f1, 4),
            "fraud_recall": round(fraud_recall, 4),
            "fraud_precision": round(fraud_precision, 4),
            "macro_f1": round(macro_f1, 4),
            "accuracy": round(acc, 4)
        },
        "per_class": {
            "FRAUDULENT": {
                "precision": round(fraud_precision, 4),
                "recall": round(fraud_recall, 4),
                "f1_score": round(fraud_f1, 4),
                "support": pos_support
            },
            "LEGITIMATE": {
                "precision": round(legit_precision, 4),
                "recall": round(legit_recall, 4),
                "f1_score": round(legit_f1, 4),
                "support": neg_support
            }
        },
        "confusion_matrix": {
            "matrix": [[tn, fp], [fn, tp]],
            "true_negatives": tn,
            "false_positives": fp,
            "false_negatives": fn,
            "true_positives": tp,
            "false_positive_rate": round(float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0, 4),
            "false_negative_rate": round(float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0, 4)
        },
        "summary": {
            "macro_precision": round(macro_precision, 4),
            "macro_recall": round(macro_recall, 4),
            "macro_f1": round(macro_f1, 4),
            "weighted_f1": round(weighted_f1, 4)
        }
    }

    if y_prob is not None:
        y_prob_arr = np.array(y_prob, dtype=float)
        try:
            auc = float(roc_auc_score(y_t, y_prob_arr))
            pr_auc = float(average_precision_score(y_t, y_prob_arr))
            brier = float(brier_score_loss(y_t, y_prob_arr))
            metrics["probabilistic_metrics"] = {
                "roc_auc": round(auc, 4),
                "pr_auc": round(pr_auc, 4),
                "brier_score": round(brier, 4)
            }
        except Exception as e:
            metrics["probabilistic_metrics"] = {"error": str(e)}

    return metrics


def find_optimal_threshold(
    y_true: Union[List, np.ndarray],
    y_prob: Union[List, np.ndarray],
    threshold_range: Optional[np.ndarray] = None
) -> Dict[str, Any]:
    """Find decision threshold that maximizes Fraud-class F1."""
    if threshold_range is None:
        threshold_range = np.arange(0.20, 0.85, 0.02)

    y_t = np.array([normalize_label(x) for x in y_true])
    y_pr = np.array(y_prob, dtype=float)

    best_f1 = -1.0
    best_th = 0.5
    curve = []

    for th in threshold_range:
        y_pred = (y_pr >= th).astype(int)
        f1 = float(f1_score(y_t, y_pred, pos_label=1, zero_division=0))
        prec = float(precision_score(y_t, y_pred, pos_label=1, zero_division=0))
        rec = float(recall_score(y_t, y_pred, pos_label=1, zero_division=0))
        curve.append({
            "threshold": round(float(th), 3),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4)
        })
        if f1 > best_f1:
            best_f1 = f1
            best_th = float(th)

    return {
        "best_threshold": round(best_th, 3),
        "best_fraud_f1": round(best_f1, 4),
        "threshold_curve": curve
    }


def evaluate_autoscientist_responses(
    ground_truth: List[str],
    predictions: List[str],
    split_name: str = "AutoScientist Evaluation"
) -> Dict[str, Any]:
    """Evaluates raw text outputs from AutoScientist or fine-tuned LLM inference."""
    return calculate_metrics(
        y_true=ground_truth,
        y_pred=predictions,
        split_name=split_name
    )


def save_metrics_to_json(metrics: Dict[str, Any], filepath: Union[str, Path]) -> None:
    """Save metrics to reproducible JSON file."""
    p = Path(filepath)
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

