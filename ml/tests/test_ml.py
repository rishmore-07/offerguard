"""Unit tests for OfferGuard India ML pipeline, data hygiene, and metrics."""
import unittest
import json
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

from ml.evaluate import calculate_metrics, normalize_label, find_optimal_threshold


class TestDataHygieneAndSplits(unittest.TestCase):
    def setUp(self):
        self.root = Path(__file__).resolve().parent.parent.parent
        self.data_dir = self.root / "ml" / "data"

    def test_split_files_exist(self):
        train_p = self.data_dir / "offerguard_train.csv"
        val_p = self.data_dir / "offerguard_validation.csv"
        test_p = self.data_dir / "offerguard_test.csv"
        self.assertTrue(train_p.exists(), "offerguard_train.csv must exist")
        self.assertTrue(val_p.exists(), "offerguard_validation.csv must exist")
        self.assertTrue(test_p.exists(), "offerguard_test.csv must exist")

    def test_schema_and_labels(self):
        for fname in ["offerguard_train.csv", "offerguard_validation.csv", "offerguard_test.csv"]:
            df = pd.read_csv(self.data_dir / fname)
            self.assertIn("instruction", df.columns, f"{fname} missing 'instruction'")
            self.assertIn("response", df.columns, f"{fname} missing 'response'")
            unique_labels = set(df["response"].unique())
            self.assertTrue(unique_labels.issubset({"LEGITIMATE", "FRAUDULENT"}), f"Invalid labels in {fname}: {unique_labels}")

    def test_no_data_leakage(self):
        df_train = pd.read_csv(self.data_dir / "offerguard_train.csv")
        df_val = pd.read_csv(self.data_dir / "offerguard_validation.csv")
        df_test = pd.read_csv(self.data_dir / "offerguard_test.csv")

        train_texts = set(df_train["instruction"].str.strip())
        val_texts = set(df_val["instruction"].str.strip())
        test_texts = set(df_test["instruction"].str.strip())

        val_overlap = train_texts.intersection(val_texts)
        test_overlap = train_texts.intersection(test_texts)
        val_test_overlap = val_texts.intersection(test_texts)

        self.assertEqual(len(val_overlap), 0, f"Found {len(val_overlap)} leaking examples between Train and Val")
        self.assertEqual(len(test_overlap), 0, f"Found {len(test_overlap)} leaking examples between Train and Test")
        self.assertEqual(len(val_test_overlap), 0, f"Found {len(val_test_overlap)} leaking examples between Val and Test")


class TestEvaluationMetrics(unittest.TestCase):
    def test_normalize_labels(self):
        self.assertEqual(normalize_label("FRAUDULENT"), 1)
        self.assertEqual(normalize_label("fake"), 1)
        self.assertEqual(normalize_label("LEGITIMATE"), 0)
        self.assertEqual(normalize_label("real"), 0)
        self.assertEqual(normalize_label(1), 1)
        self.assertEqual(normalize_label(0), 0)

    def test_metric_calculation_accuracy_and_f1(self):
        y_true = [0, 0, 0, 1, 1]
        y_pred = [0, 0, 1, 1, 1]
        probs = [0.1, 0.2, 0.8, 0.9, 0.7]

        metrics = calculate_metrics(y_true, y_pred, probs, split_name="Test")
        self.assertEqual(metrics["primary_kpis"]["accuracy"], 0.8)
        self.assertEqual(metrics["per_class"]["FRAUDULENT"]["recall"], 1.0)
        self.assertEqual(metrics["per_class"]["FRAUDULENT"]["precision"], 0.6667)
        self.assertEqual(metrics["confusion_matrix"]["true_positives"], 2)
        self.assertEqual(metrics["confusion_matrix"]["false_positives"], 1)
        self.assertEqual(metrics["confusion_matrix"]["false_negatives"], 0)
        self.assertEqual(metrics["confusion_matrix"]["true_negatives"], 2)
        self.assertIn("probabilistic_metrics", metrics)

    def test_threshold_tuning(self):
        y_true = [0, 0, 1, 1]
        y_prob = [0.2, 0.45, 0.55, 0.9]
        tuning = find_optimal_threshold(y_true, y_prob, threshold_range=np.array([0.3, 0.5, 0.7]))
        self.assertIn("best_threshold", tuning)
        self.assertIn("best_fraud_f1", tuning)
        self.assertGreaterEqual(tuning["best_fraud_f1"], 0.0)


class TestBaselineArtifacts(unittest.TestCase):
    def setUp(self):
        self.root = Path(__file__).resolve().parent.parent.parent

    def test_model_artifact_loadable(self):
        model_path = self.root / "ml" / "models" / "offerguard_baseline.joblib"
        self.assertTrue(model_path.exists(), "offerguard_baseline.joblib must exist")
        bundle = joblib.load(model_path)
        self.assertIn("vectorizer", bundle)
        self.assertIn("classifier", bundle)
        self.assertIn("optimal_threshold", bundle)

        # Test inference
        sample_text = ["Title: Data Entry Operator. Pay 1000 INR registration fee to start immediately."]
        vec = bundle["vectorizer"]
        clf = bundle["classifier"]
        prob = clf.predict_proba(vec.transform(sample_text))[0, 1]
        self.assertTrue(0.0 <= prob <= 1.0)

    def test_metrics_json_validity(self):
        metrics_p = self.root / "ml" / "metrics" / "baseline_evaluation.json"
        self.assertTrue(metrics_p.exists(), "baseline_evaluation.json must exist")
        with open(metrics_p, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertIn("splits", data)
        self.assertIn("test_real_emscad_default_threshold", data["splits"])
        self.assertIn("primary_kpis", data["splits"]["test_real_emscad_default_threshold"])


if __name__ == "__main__":
    unittest.main()

