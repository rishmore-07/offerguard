# OfferGuard India 🛡️🇮🇳
**AI-Powered Recruitment Fraud & Job Phishing Detection Platform**

[![Python](https://img.shields.io/badge/Python-3.13+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.9.1-F7931E?style=flat&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

OfferGuard India is an AI-powered detection and explainability system designed to protect Indian job seekers from recruitment scams, advance-fee frauds (registration fees, laptop deposits), phishing from fake recruiter emails, and task-based daily payout schemes.

---

## 📁 Repository Structure

```text
offerguard/
├── OfferGuard_India/               # Starter scripts (backward compatible)
│   ├── prepare_data.py             # EMSCAD + Aioshi data pipeline
│   ├── train_adaption.py           # AutoScientist runner (with --check-only)
│   ├── README.txt                  # Starter guide
│   └── offerguard_train.csv        # Ready dataset for Adaption
├── ml/                             # Dedicated Machine Learning Subsystem
│   ├── data/                       # Prepared CSV splits (Train, Val, Test, Synthetic Test)
│   ├── models/                     # Saved model artifacts (offerguard_baseline.joblib)
│   ├── metrics/                    # Reproducible metrics JSON (baseline_evaluation.json)
│   ├── prepare_data.py             # Data preparation & leak prevention pipeline
│   ├── baseline.py                 # TF-IDF + Class-Weighted Logistic Regression trainer
│   ├── evaluate.py                 # Reusable evaluation functions (Baseline + AutoScientist)
│   ├── train_adaption.py           # Adaption AutoScientist SDK orchestration
│   └── tests/                      # ML pipeline unit tests (8 passing tests)
├── backend/                        # FastAPI REST API Backend
│   ├── app/
│   │   ├── main.py                 # FastAPI application
│   │   ├── config.py               # Server & paths configuration
│   │   ├── schemas.py              # Pydantic v2 schemas
│   │   ├── services/
│   │   │   ├── predictor.py        # ML inference service
│   │   │   ├── red_flag_rules.py   # Indian recruitment scam heuristics
│   │   │   └── analyzer.py         # Ensemble risk scoring & legal advice
│   │   └── api/
│   │       └── router.py           # Endpoints: /analyze, /batch, /health, /metrics, /samples
│   ├── tests/                      # Backend unit & integration tests (6 passing tests)
│   └── run.py                      # Server runner
├── frontend/                       # Modern React + Vite + Tailwind CSS Application
│   ├── src/
│   │   ├── components/             # Scanner, RiskGauge, RedFlagsCard, MetricsDashboard, Playbook
│   │   ├── api/                    # API client connecting to FastAPI
│   │   ├── types/                  # TypeScript interfaces
│   │   └── App.tsx                 # Main application
│   └── vite.config.ts              # Vite config with backend proxy
└── docs/                           # Comprehensive System Documentation
    ├── SYSTEM_ARCHITECTURE.md      # Mermaid diagrams & system design
    ├── MODEL_CARD.md               # Empirical benchmarks, confusion matrices & PR-AUC
    ├── DATASET_PROVENANCE.md       # Real EMSCAD vs Synthetic data breakdown & leak prevention
    └── API_REFERENCE.md            # REST API schemas and curl examples
```

---

## ⚡ Quick Start

### 1. Set Up Environment & Install Dependencies
```bash
# Python dependencies
python -m pip install pandas scikit-learn fastapi uvicorn datasets pyarrow adaption

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Execute Data Preparation & Hygiene Pipeline
```bash
# Prepares stratified 70/15/15 splits, removes near-duplicates, prevents train/test leakage
python ml/prepare_data.py
```

### 3. Train Baseline & Generate Reproducible Metrics
```bash
# Trains TF-IDF + Class-Weighted Logistic Regression and saves JSON metrics & model bundle
python ml/baseline.py
```

### 4. Run Automated Test Suites
```bash
# ML tests (zero data leakage, label validation, threshold tuning)
python -m unittest ml/tests/test_ml.py

# Backend API tests (fraud classification, red flag detection, batch processing)
python -m unittest backend/tests/test_api.py
```

### 5. Launch Backend & Frontend
```bash
# Terminal 1: Start FastAPI Backend (http://localhost:8000)
python backend/run.py

# Terminal 2: Start Vite Frontend (http://localhost:5173)
cd frontend
npm run dev
```

---

## Production model

The live API serves `ml/models/offerguard_baseline.joblib`: TF-IDF with 15,000 word unigrams and bigrams, class-weighted logistic regression, decision threshold 0.62, scikit-learn 1.9.1. It does not load the Qwen LoRA.

### Independent holdout, `offerguard_clean_test.csv` (N = 2,291, 106 fraudulent)

Measured with scikit-learn 1.9.1. Training and threshold-validation text overlap with this file was 0. These numbers are the logistic regression, not AutoScientist.

- **Accuracy**: 98.12%
- **Fraud precision**: 85.39%
- **Fraud recall**: 71.70% (76 / 106)
- **Fraud F1**: 77.95%
- **Macro F1**: 88.48%
- **Confusion counts**: TN 2,172, FP 13, FN 30, TP 76

The full record is `evaluation/lightweight_baseline_holdout.json`.

### Separate Qwen3.5-2B LoRA evaluation (not deployed)

Same 2,291-row file, recorded in `evaluation/evaluation_results.json`: accuracy 95.68%, fraud precision 52.15%, fraud recall 80.19%, fraud F1 63.20%. The Adaption win rate is not accuracy.

Older EMSCAD and synthetic-split figures remain in `ml/metrics/baseline_evaluation.json`. They are a different test and are not the production holdout.

Raw listing CSVs stay out of Git because the advertisement text contains contact details. The classifier artifact does not include those rows.

## 📊 Earlier EMSCAD split, kept for provenance

### EMSCAD Real-World Test Holdout ($N = 2,363$, 107 Fraudulent)
*Evaluated on real-world job postings at optimal threshold ($th=0.62$):*
- **Fraud-Class F1**: **0.7835** (Baseline default: 0.7455)
- **Fraud-Class Recall**: **71.03%** (76 / 107 scams caught)
- **Fraud-Class Precision**: **87.36%** (64% reduction in false alarms)
- **Overall Accuracy**: **98.22%**
- **ROC-AUC**: **0.9839**
- **PR-AUC (Average Precision)**: **0.8268**

### Independent Synthetic Indian Holdout (`Aioshi/smolified-fakejob`, $N = 120$)
*Evaluated separately to prevent misleading real-world claims:*
- **Fraud-Class Recall**: **98.67%** (74 / 75 caught)
- **Fraud-Class Precision**: **74.00%**
- **Fraud-Class F1**: **0.8457**

---

The Qwen3.5-2B LoRA was evaluated separately and is not the model answering the live site. Do not point the Render service at `backend/requirements-inference.txt`.

See [docs/MODEL_CARD.md](docs/MODEL_CARD.md) and [docs/DATASET_PROVENANCE.md](docs/DATASET_PROVENANCE.md) for the original split documentation.

