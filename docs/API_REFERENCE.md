# OfferGuard India: REST API Reference

Base URL: `http://localhost:8000/api`

---

## 1. Health Check
`GET /api/health`

### Response:
```json
{
  "status": "healthy",
  "service": "OfferGuard India",
  "model_loaded": true,
  "optimal_threshold": 0.62
}
```

---

## 2. Analyze Single Job Listing
`POST /api/analyze`

### Request Body:
```json
{
  "text": "We are hiring remote content writers. Salary 50k per month. Register on this link and pay 500 rupees registration charges immediately to receive contract. WhatsApp HR at wa.me/919999999999.",
  "title": "Remote Content Writer",
  "company": "Fast Media Works",
  "source": "WhatsApp"
}
```

### Response Body:
```json
{
  "prediction": "FRAUDULENT",
  "risk_score": 90.0,
  "risk_level": "CRITICAL",
  "confidence": 0.985,
  "ml_probability": 0.985,
  "decision_threshold": 0.62,
  "red_flags": [
    {
      "category": "Monetary Demands",
      "flag": "Registration or Processing Fee Demand",
      "severity": "CRITICAL",
      "description": "Legitimate Indian companies, MNCs, and staffing agencies never charge job seekers application, registration, or processing fees.",
      "matched_text": "registration charges"
    },
    {
      "category": "Communication Channels",
      "flag": "Redirection to Unofficial Messaging Channels",
      "severity": "HIGH",
      "description": "Recruiters urging candidates exclusively onto WhatsApp or Telegram bypass corporate security.",
      "matched_text": "wa.me/919999999999"
    }
  ],
  "key_indicators": [
    "posting",
    "entry",
    "cash"
  ],
  "indian_context_advice": [
    "⚠️ DO NOT PAY ANY MONEY: Under Ministry of Labour & Employment guidelines, no registered Indian company can charge job seekers registration fees.",
    "🚨 REPORT CYBER FRAUD: Call the National Cyber Crime Helpline immediately at 1930 or file a report at https://cybercrime.gov.in.",
    "📱 DEMAND OFFICIAL COMMUNICATION: Refuse recruitment conducted exclusively on WhatsApp or Telegram."
  ],
  "model_info": {
    "model_name": "OfferGuard Baseline",
    "model_type": "TF-IDF + Class-Weighted Logistic Regression",
    "optimal_threshold": 0.62,
    "training_dataset": "EMSCAD (11,025 train) + Aioshi/smolified-fakejob (477 train)"
  }
}
```

---

## 3. Batch Analysis
`POST /api/batch`

### Request Body:
```json
{
  "jobs": [
    {
      "id": "job-1",
      "text": "Direct joining for Reliance Jio Back Office. Pay 1500 INR gate pass fee.",
      "title": "Back Office"
    },
    {
      "id": "job-2",
      "text": "Infosys is hiring Java Backend Engineers. 3+ years experience. Apply at infosys.com/careers.",
      "title": "Backend Engineer"
    }
  ]
}
```

### Response Body:
```json
{
  "total_processed": 2,
  "fraudulent_count": 1,
  "legitimate_count": 1,
  "results": [
    {
      "id": "job-1",
      "prediction": "FRAUDULENT",
      "risk_score": 85.0,
      "risk_level": "CRITICAL",
      "red_flags_count": 2,
      "red_flags": [
        "Registration or Processing Fee Demand",
        "Direct Joining / Guaranteed Placement Without Rigorous Interview"
      ]
    },
    {
      "id": "job-2",
      "prediction": "LEGITIMATE",
      "risk_score": 12.3,
      "risk_level": "LOW",
      "red_flags_count": 0,
      "red_flags": []
    }
  ]
}
```

---

## 4. Get Curated Samples
`GET /api/samples`

Returns preset scam and legitimate recruitment scenarios for interactive testing.

---

## 5. Get Model Evaluation Metrics
`GET /api/metrics`

Returns reproducible benchmark metrics JSON, including precision, recall, F1, confusion matrices across default and tuned thresholds, and top vocabulary features.

