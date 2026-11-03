"""Evaluate the saved lightweight classifier and check holdout leakage.

The saved joblib was fit by ml/baseline.py on ml/data/offerguard_train.csv.
That training file is not in the repository. This script therefore:
1. Loads the bundle and records estimator settings.
2. Measures exact normalized-text overlap between every labeled CSV still on disk
   and offerguard_clean_test.csv.
3. Scores the saved classifier on the 2,291-row file using the same prefix stripping
   used at training time.

A zero overlap with the files that remain does not prove the missing training file
was disjoint from the holdout. The JSON records that limitation explicitly.
"""
from __future__ import annotations

import hashlib
import json
import re
import time
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)

ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "ml" / "models" / "offerguard_baseline.joblib"
TEST_PATH = ROOT / "offerguard_clean_test.csv"
OUT_PATH = ROOT / "evaluation" / "lightweight_baseline_holdout.json"

PROMPT_PREFIX = (
    "Classify this job advertisement using only one label: "
    "LEGITIMATE or FRAUDULENT. A label is a risk prediction, not "
    "independent verification of a company.\n\n"
)


def normalize_text(value: object) -> str:
    text = "" if value is None or (isinstance(value, float) and np.isnan(value)) else str(value)
    text = text.replace(PROMPT_PREFIX, "")
    return re.sub(r"\s+", " ", text).strip().lower()


def text_key(value: object) -> str:
    return hashlib.sha256(normalize_text(value).encode("utf-8")).hexdigest()


def label_of(value: object) -> int:
    token = str(value).strip().upper()
    if token in {"1", "FRAUDULENT", "FAKE", "FRAUD"}:
        return 1
    if token in {"0", "LEGITIMATE", "REAL", "GENUINE"}:
        return 0
    raise ValueError(f"Unrecognized label: {value!r}")


def main() -> None:
    bundle = joblib.load(MODEL_PATH)
    vectorizer = bundle["vectorizer"]
    classifier = bundle["classifier"]
    threshold = float(bundle["optimal_threshold"])

    labeled_files = [
        ROOT / "ml" / "data" / "offerguard_train.csv",
        ROOT / "ml" / "data" / "offerguard_validation.csv",
        ROOT / "ml" / "data" / "offerguard_test.csv",
        ROOT / "offerguard_adaption_train.csv",
        ROOT / "offerguard_validation.csv",
        ROOT / "offerguard_clean_test.csv",
        ROOT / "ml" / "data" / "offerguard_india_synthetic_test.csv",
        ROOT / "OfferGuard_India" / "offerguard_india_synthetic_test.csv",
    ]
    frames = {}
    keys = {}
    for path in labeled_files:
        if not path.exists():
            continue
        frame = pd.read_csv(path)
        frames[str(path.relative_to(ROOT)).replace("\\", "/")] = frame
        column = "instruction" if "instruction" in frame.columns else frame.columns[0]
        keys[str(path.relative_to(ROOT)).replace("\\", "/")] = set(frame[column].map(text_key))

    test = pd.read_csv(TEST_PATH)
    test_keys = keys["offerguard_clean_test.csv"]
    overlap = {
        name: {
            "rows": int(len(frames[name])),
            "unique_texts": len(keyset),
            "overlap_with_clean_test": len(keyset & test_keys),
        }
        for name, keyset in keys.items()
    }
    training_key = "ml/data/offerguard_train.csv"
    validation_key = "ml/data/offerguard_validation.csv"
    missing_training_file = training_key not in keys

    texts = test["instruction"].map(
        lambda value: str(value).replace(PROMPT_PREFIX, "").strip()
    )
    y_true = test["response"].map(label_of).to_numpy()
    matrix = vectorizer.transform(texts)

    latencies = np.empty(len(test), dtype=np.float64)
    probabilities = np.empty(len(test), dtype=np.float64)
    # One transform already happened. Per-row latency includes transform + predict_proba,
    # matching a single API request rather than the batched matrix above.
    for index, text in enumerate(texts):
        started = time.perf_counter()
        row = vectorizer.transform([text])
        probability = float(classifier.predict_proba(row)[0, 1])
        latencies[index] = time.perf_counter() - started
        probabilities[index] = probability

    y_pred = (probabilities >= threshold).astype(np.int64)
    matrix_cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = (int(x) for x in matrix_cm.ravel())
    sorted_latency = np.sort(latencies)

    report = {
        "model_file": "ml/models/offerguard_baseline.joblib",
        "model_bytes": MODEL_PATH.stat().st_size,
        "sklearn_runtime": sklearn.__version__,
        "estimator": {
            "vectorizer": type(vectorizer).__name__,
            "max_features": int(vectorizer.max_features),
            "ngram_range": list(vectorizer.ngram_range),
            "stop_words": vectorizer.stop_words,
            "sublinear_tf": bool(vectorizer.sublinear_tf),
            "min_df": int(vectorizer.min_df),
            "vocabulary_size": len(vectorizer.vocabulary_),
            "classifier": type(classifier).__name__,
            "classes": [int(c) for c in classifier.classes_],
            "class_weight": classifier.class_weight,
            "C": float(classifier.C),
            "solver": classifier.solver,
            "penalty": classifier.penalty,
            "intercept": float(classifier.intercept_[0]),
            "label_mapping": {"0": "LEGITIMATE", "1": "FRAUDULENT"},
            "decision_rule": "FRAUDULENT if P(class=1) >= optimal_threshold",
            "optimal_threshold": threshold,
            "preprocessing": "Strip the fixed classification prompt prefix, then the saved TF-IDF word analyzer.",
        },
        "provenance": {
            "training_script": "ml/baseline.py",
            "documented_training_file": "ml/data/offerguard_train.csv",
            "training_file_present": not missing_training_file,
            "documented_validation_rows": 2362,
            "documented_emscad_test_rows": 2363,
            "current_clean_test_rows": int(len(test)),
            "training_overlap_with_clean_test": (
                None if missing_training_file else len(keys[training_key] & test_keys)
            ),
            "threshold_validation_overlap_with_clean_test": (
                None if validation_key not in keys else len(keys[validation_key] & test_keys)
            ),
            "independence_verified": (
                (not missing_training_file)
                and len(keys[training_key] & test_keys) == 0
                and validation_key in keys
                and len(keys[validation_key] & test_keys) == 0
            ),
            "reason": (
                "Normalized instruction text from ml/data/offerguard_train.csv and "
                "ml/data/offerguard_validation.csv was compared with offerguard_clean_test.csv. "
                "The saved threshold was selected on the original validation file, not on this test file."
                if not missing_training_file
                else "The CSV used to fit this joblib is not available, so independence cannot be verified."
            ),
            "overlap_among_files_on_disk": overlap,
            "batched_feature_rows": int(matrix.shape[0]),
            "batched_feature_columns": int(matrix.shape[1]),
        },
        "metrics": {
            "rows": int(len(test)),
            "fraud_support": int((y_true == 1).sum()),
            "legitimate_support": int((y_true == 0).sum()),
            "accuracy": float(accuracy_score(y_true, y_pred)),
            "fraud_precision": float(precision_score(y_true, y_pred, pos_label=1, zero_division=0)),
            "fraud_recall": float(recall_score(y_true, y_pred, pos_label=1, zero_division=0)),
            "fraud_f1": float(f1_score(y_true, y_pred, pos_label=1, zero_division=0)),
            "macro_f1": float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
            "confusion_matrix_labels": ["LEGITIMATE", "FRAUDULENT"],
            "confusion_matrix": matrix_cm.tolist(),
            "tn": tn,
            "fp": fp,
            "fn": fn,
            "tp": tp,
        },
        "latency_seconds": {
            "method": "per-example TF-IDF transform plus predict_proba, time.perf_counter",
            "mean": float(latencies.mean()),
            "p50": float(np.percentile(latencies, 50)),
            "p95": float(np.percentile(sorted_latency, 95)),
            "max": float(latencies.max()),
        },
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
