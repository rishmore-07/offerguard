"""Comprehensive unit and integration tests for OfferGuard AI FastAPI backend."""
import unittest
import sys
from pathlib import Path
from fastapi.testclient import TestClient

root = Path(__file__).resolve().parent.parent.parent
if str(root) not in sys.path:
    sys.path.insert(0, str(root))

from backend.app.main import app
from backend.app.services.session_store import session_store
from backend.app.services.signal_analyzer import extract_suspicious_signals


class TestOfferGuardBackend(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        session_store.clear()

    def test_health_check(self):
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("model_status", data)
        self.assertIn("is_demo_mode", data)

    def test_analyze_scam_with_fee_and_upi(self):
        payload = {
            "text": "Reliance Jio hiring: Pay 1500 INR registration fee immediately via Google Pay to HR 9876543210. Direct joining without interview.",
            "title": "Back Office",
            "source": "WhatsApp"
        }
        resp = self.client.post("/api/analyze", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["prediction"], "FRAUDULENT")
        self.assertFalse(data["is_demo_mode"])
        self.assertIsNotNone(data["confidence"])
        self.assertEqual(data["risk_level"], "CRITICAL")
        self.assertGreaterEqual(data["risk_score"], 80.0)
        self.assertGreater(len(data["signals"]), 0)
        
        # Verify matched snippet is present
        signal_names = [s["signal"] for s in data["signals"]]
        self.assertTrue(any("Registration" in s or "UPI" in s or "INR" in s for s in signal_names))
        
        # Verify safety recommendations and disclaimer
        self.assertGreater(len(data["safety_recommendations"]), 0)
        self.assertIn("DISCLAIMER", data["disclaimer"])

    def test_analyze_legitimate_listing(self):
        payload = {
            "text": "Tata Consultancy Services is hiring Full-Stack React and Node Engineers in Pune. 3+ years experience. Coding assessment and technical rounds required. Apply on official portal ibegin.tcs.com. No fees charged.",
            "title": "Software Engineer",
            "company": "Tata Consultancy Services",
            "source": "Portal"
        }
        resp = self.client.post("/api/analyze", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["prediction"], "LEGITIMATE")
        self.assertFalse(data["is_demo_mode"])
        self.assertIn(data["risk_level"], ["LOW", "MODERATE"])
        self.assertLess(data["risk_score"], 50.0)

    def test_input_validation_empty_and_short(self):
        resp = self.client.post("/api/analyze", json={"text": "   "})
        self.assertEqual(resp.status_code, 422)

        resp2 = self.client.post("/api/analyze", json={"text": "too short"})
        self.assertEqual(resp.status_code, 422)

    def test_input_sanitization(self):
        payload = {
            "text": "<script>alert('xss')</script> TCS is hiring senior developers with 5 years experience.",
            "title": "Developer"
        }
        resp = self.client.post("/api/analyze", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        # Script tags should be escaped, not crash
        self.assertIn("prediction", data)

    def test_session_stats_updates(self):
        # 1. Initially empty
        resp1 = self.client.get("/api/session-stats")
        self.assertEqual(resp1.status_code, 200)
        self.assertEqual(resp1.json()["total_analyzed"], 0)

        # 2. Analyze an offer
        self.client.post("/api/analyze", json={
            "text": "Work from home! Earn Rs 5000 daily with YouTube video likes. Contact on Telegram t.me/fast_task.",
            "title": "Daily Task"
        })

        # 3. Stats incremented
        resp2 = self.client.get("/api/session-stats")
        data = resp2.json()
        self.assertEqual(data["total_analyzed"], 1)
        self.assertEqual(data["fraudulent_count"], 1)
        self.assertGreater(len(data["recent_analyses"]), 0)

    def test_model_info_endpoint(self):
        resp = self.client.get("/api/model-info")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("dataset_overview", data)
        self.assertIn("autoscientist_status", data)
        self.assertTrue(data["autoscientist_status"])
        self.assertNotIn("63.5", data["autoscientist_status"])
        self.assertIn("not the production classifier", data["autoscientist_status"])
        self.assertIn("baseline_metrics", data)
        self.assertEqual(data["lightweight_holdout"]["metrics"]["rows"], 2291)
        self.assertTrue(data["lightweight_holdout"]["provenance"]["independence_verified"])

    def test_readiness_requires_loaded_classifier(self):
        resp = self.client.get("/api/ready")
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json()["ready"])

    def test_missing_classifier_does_not_use_heuristics(self):
        import asyncio
        from backend.app.services.inference_adapter import ModelInferenceAdapter, ModelNotReady

        adapter = ModelInferenceAdapter.__new__(ModelInferenceAdapter)
        adapter.baseline_bundle = None
        with self.assertRaises(ModelNotReady):
            asyncio.run(adapter.predict("Pay a registration fee by UPI to get this job immediately."))

    def test_samples_endpoint(self):
        resp = self.client.get("/api/samples")
        self.assertEqual(resp.status_code, 200)
        samples = resp.json()
        self.assertGreaterEqual(len(samples), 5)
        self.assertTrue(any(s["type"] == "Scam" for s in samples))
        self.assertTrue(any(s["type"] == "Legitimate" for s in samples))

    def test_batch_analyze_endpoint(self):
        payload = {
            "jobs": [
                {
                    "id": "j1",
                    "text": "Deposit 1000 rupees registration fee to start data entry job."
                },
                {
                    "id": "j2",
                    "text": "Infosys requires Senior Java Developer with Spring Boot experience in Bangalore."
                }
            ]
        }
        resp = self.client.post("/api/batch", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["total_processed"], 2)
        self.assertEqual(data["fraudulent_count"], 1)
        self.assertEqual(data["legitimate_count"], 1)


if __name__ == "__main__":
    unittest.main()
