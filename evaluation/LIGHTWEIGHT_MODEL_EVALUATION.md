# Lightweight classifier evaluation

Measured locally on 3 November 2026. These figures are the saved TF-IDF logistic regression. They are not AutoScientist or Qwen3.5-2B results.

## Model that was loaded

File: `ml/models/offerguard_baseline.joblib` (756,392 bytes), unpickled with scikit-learn 1.9.1.

| Piece | Verified value |
| --- | --- |
| Vectorizer | `TfidfVectorizer`, 15,000 word features, n-grams (1, 2), English stop words, `sublinear_tf=True`, `min_df=2` |
| Preprocessing | Strip the fixed “Classify this job advertisement…” prefix, then the saved word analyzer |
| Labels | class `0` = LEGITIMATE, class `1` = FRAUDULENT |
| Classifier | `LogisticRegression`, `class_weight='balanced'`, `C=1.0`, `solver='lbfgs'`, intercept `-0.2774517563835244` |
| Decision | FRAUDULENT when `P(class=1) >= 0.62` |

The bundle loaded with keys `vectorizer`, `classifier`, `optimal_threshold`, `top_fraud_features`, and `top_legit_features`.

## Leakage check

Normalized instruction text (prefix removed, whitespace collapsed, lowercased, SHA-256) was compared across the files on disk.

| File | Rows | Overlap with `offerguard_clean_test.csv` |
| --- | ---: | ---: |
| `ml/data/offerguard_train.csv` (the file this joblib was fit on) | 11,502 | 0 |
| `ml/data/offerguard_validation.csv` (the file used to choose 0.62) | 2,362 | 0 |
| `ml/data/offerguard_test.csv` (older EMSCAD holdout) | 2,363 | 0 |
| `offerguard_adaption_train.csv` | 2,596 | 0 |
| `offerguard_validation.csv` | 1,032 | 0 |
| `offerguard_clean_test.csv` | 2,291 | 2,291 (the file itself) |

The 2,291-row result below is an independent test of this saved classifier. The threshold was not selected on this file. The older numbers in `ml/metrics/baseline_evaluation.json` are the original EMSCAD and synthetic splits, not this file.

## Holdout result, all 2,291 rows

Fraud support 106. Legitimate support 2,185. Invalid predictions: 0.

| Metric | Value |
| --- | ---: |
| Accuracy | 0.981230903535574 (98.12%) |
| FRAUDULENT precision | 0.8539325842696629 (85.39%) |
| FRAUDULENT recall | 0.7169811320754716 (71.70%) |
| FRAUDULENT F1 | 0.7794871794871795 (77.95%) |
| Macro F1 | 0.8848427463426324 (88.48%) |

Confusion matrix, rows true and columns predicted, order LEGITIMATE, FRAUDULENT:

|  | Predicted LEGITIMATE | Predicted FRAUDULENT |
| --- | ---: | ---: |
| True LEGITIMATE | 2,172 | 13 |
| True FRAUDULENT | 30 | 76 |

TN 2172, FP 13, FN 30, TP 76.

Per-example latency is one TF-IDF transform plus `predict_proba`, timed with `time.perf_counter` on this machine:

| | Seconds |
| --- | ---: |
| Mean | 0.0007208880837494527 |
| Median | 0.0006521000032080337 |
| p95 | 0.0012565500001073815 |
| Max | 0.002124200007528998 |

## Comparison with the Qwen3.5-2B LoRA

The LoRA numbers are copied from `evaluation/evaluation_results.json`. That file is a different model (`Qwen/Qwen3.5-2B` plus the Adaption LoRA, experiment `07db89e9-7722-4897-9c2f-fc384482dc91`) scored on the same 2,291-row file. The Adaption win rate is not in this table.

| Metric | TF-IDF logistic regression | Qwen3.5-2B LoRA |
| --- | ---: | ---: |
| Accuracy | 98.12% | 95.68% |
| Fraud precision | 85.39% | 52.15% |
| Fraud recall | 71.70% | 80.19% |
| Fraud F1 | 77.95% | 63.20% |
| Macro F1 | 88.48% | 80.45% |
| Mean latency | 0.72 ms | 618.20 ms |

The logistic regression is higher on accuracy, fraud precision, fraud F1, and macro F1. The LoRA is higher on fraud recall (85 true frauds caught versus 76) and has more false fraud flags (78 versus 13).

## Why a second model was not trained

The task called for a TF-IDF + LinearSVC model only if this baseline performed poorly. On the independent holdout its fraud F1 is 0.779 versus 0.632 for the LoRA, and its file is 756 KB. A LinearSVC was not fit, and the test file was not used to tune either model.

The production classifier is this saved logistic regression.
