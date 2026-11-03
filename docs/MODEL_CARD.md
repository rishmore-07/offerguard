# OfferGuard India: Model Card

## 1. Model Overview
- **Model Name**: OfferGuard Baseline Classifier
- **Model Type**: TF-IDF Feature Extractor + Class-Weighted Logistic Regression
- **Framework**: scikit-learn 1.9.1 / Python 3.13
- **Primary Objective**: Detect recruitment fraud, advance-fee scams, and job phishing targeting Indian candidates with high fraud-class recall and F1.

---

## 2. Feature Extraction & Hyperparameters

| Component | Setting / Parameter | Rationale |
| :--- | :--- | :--- |
| **Feature Extraction** | `TfidfVectorizer` | Captures individual scam terms and bi-gram phrases. |
| **Vocabulary Size** | `max_features=15000` | Prunes rare noise while preserving specialized fraud patterns. |
| **N-gram Range** | `(1, 2)` (Unigrams + Bigrams) | Detects critical phrases: `"work home"`, `"registration fee"`, `"gate pass"`. |
| **Sublinear TF** | `sublinear_tf=True` | Dampens repeated spam terms via $1 + \log(tf)$. |
| **Class Weighting** | `class_weight='balanced'` | Counteracts the 95.5% vs. 4.5% class imbalance. |
| **Solver & Regularization** | `solver='lbfgs'`, `C=1.0`, `max_iter=1000` | Convex optimization with L2 regularization. |
| **Optimal Threshold** | `threshold=0.620` | Tuned on validation split to maximize Fraud-class F1. |

---

## 3. Empirical Benchmark Results

### A. Real-World Holdout Evaluation (EMSCAD Test Split, N=2,363)
*Note: Evaluated on genuine, non-synthetic job postings.*

| Metric | Default Threshold ($th=0.50$) | Optimal Threshold ($th=0.62$) |
| :--- | :---: | :---: |
| **Fraud Recall** | **76.64%** (82 / 107 caught) | **71.03%** (76 / 107 caught) |
| **Fraud Precision** | 72.57% | **87.36%** |
| **Fraud F1-Score** | **0.7455** | **0.7835** |
| **Legitimate Precision** | 98.89% | 98.64% |
| **Legitimate Recall** | 98.63% | 99.51% |
| **Overall Accuracy** | 97.63% | 98.22% |
| **Macro F1-Score** | 0.8665 | 0.8871 |
| **ROC-AUC** | 0.9839 | 0.9839 |
| **PR-AUC (Avg Precision)** | 0.8268 | 0.8268 |

#### Confusion Matrix (Real Holdout, $th=0.50$):
```
                      Predicted Legitimate    Predicted Fraudulent
Actual Legitimate:           2,225                     31
Actual Fraudulent:             25                      82
```

#### Confusion Matrix (Real Holdout, $th=0.62$):
```
                      Predicted Legitimate    Predicted Fraudulent
Actual Legitimate:           2,245                     11   <-- 64% fewer false alarms
Actual Fraudulent:             31                      76
```

---

### B. Independent Synthetic India Holdout (`Aioshi/smolified-fakejob`, N=120)
*Note: Evaluated independently. Clearly identified as synthetic test data.*

| Metric | Default Threshold ($th=0.50$) | Optimal Threshold ($th=0.62$) |
| :--- | :---: | :---: |
| **Fraud Recall** | **98.67%** (74 / 75 caught) | **98.67%** (74 / 75 caught) |
| **Fraud Precision** | 69.81% | **74.00%** |
| **Fraud F1-Score** | **0.8177** | **0.8457** |
| **Legitimate Support** | 45 | 45 |
| **Fraudulent Support** | 75 | 75 |

---

## 4. Top Learned Vocabulary Signals

### Highest Positive Coefficients (Indicative of Fraud):
1. `posting` (+2.62)
2. `cash` (+2.57)
3. `entry` (+2.53)
4. `accion` (+2.46)
5. `work home` (+2.41)
6. `clerk` (+2.26)

### Most Negative Coefficients (Indicative of Genuine Employers):
1. `company_profile` (-4.15) — Presence of an authentic corporate profile is the single strongest legitimate signal.
2. `team` (-3.03)
3. `companies` (-2.74)
4. `official` (-2.70)
5. `growing` (-2.48)
6. `english` (-2.40)

---

## 5. Future Adaption AutoScientist Evaluation Protocol
When an AutoScientist model is trained, its generated text responses (e.g. `"FRAUDULENT"` or `"LEGITIMATE"`) can be evaluated directly via `ml/evaluate.py`:
```python
from ml.evaluate import evaluate_autoscientist_responses, save_metrics_to_json

metrics = evaluate_autoscientist_responses(
    ground_truth=test_df['response'].tolist(),
    predictions=autoscientist_preds.tolist(),
    split_name="AutoScientist EMSCAD Test Holdout"
)
save_metrics_to_json(metrics, "ml/metrics/autoscientist_evaluation.json")
```

