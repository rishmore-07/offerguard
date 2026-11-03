"""Resumable evaluation of the trained Qwen3.5-2B LoRA classifier.

The model input is the original `instruction` string. `response` is used only
as the expected label and is never sent to the model.
"""
from __future__ import annotations

import argparse
import csv
import json
import statistics
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.app.services.lora_predictor import local_lora_predictor

SPLIT_FILES = {
    "validation": ROOT / "offerguard_validation.csv",
    "test": ROOT / "offerguard_clean_test.csv",
}
OUTPUT_DIR = ROOT / "evaluation"


def load_rows(path: Path):
    import pandas as pd

    frame = pd.read_csv(path)
    if "instruction" not in frame.columns or "response" not in frame.columns:
        raise SystemExit(f"{path} must contain instruction and response columns.")
    rows = []
    for index, row in frame.iterrows():
        label = str(row["response"]).strip().upper()
        if label not in {"LEGITIMATE", "FRAUDULENT"}:
            raise SystemExit(f"Unexpected label at row {index}: {label}")
        rows.append((int(index), str(row["instruction"]), label))
    return rows


def read_completed(path: Path) -> dict:
    completed = {}
    if not path.exists():
        return completed
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            item = json.loads(line)
            completed[int(item["row_index"])] = item
    return completed


def percentile(values, fraction: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    position = min(len(ordered) - 1, max(0, int(round(fraction * (len(ordered) - 1)))))
    return ordered[position]


def compute_metrics(records: list[dict], expected_rows: int) -> dict:
    from sklearn.metrics import (
        accuracy_score,
        confusion_matrix,
        f1_score,
        precision_score,
        recall_score,
    )

    valid = [row for row in records if row.get("prediction") in {"LEGITIMATE", "FRAUDULENT"}]
    invalid = [row for row in records if row.get("prediction") not in {"LEGITIMATE", "FRAUDULENT"}]
    labels = ["LEGITIMATE", "FRAUDULENT"]
    y_true = [row["expected"] for row in valid]
    y_pred = [row["prediction"] for row in valid]
    latencies = [float(row["latency_seconds"]) for row in records if row.get("latency_seconds") is not None]

    metrics = {
        "rows_in_split": expected_rows,
        "rows_scored": len(records),
        "coverage": len(records) / expected_rows if expected_rows else 0.0,
        "valid_predictions": len(valid),
        "invalid_predictions": len(invalid),
        "invalid_rate": len(invalid) / len(records) if records else 0.0,
        "complete": len(records) == expected_rows and len(invalid) == 0,
    }
    if latencies:
        metrics["latency_seconds"] = {
            "average": statistics.fmean(latencies),
            "p95": percentile(latencies, 0.95),
        }
    if not valid:
        metrics["note"] = "No valid predictions. Accuracy is not reported."
        return metrics

    matrix = confusion_matrix(y_true, y_pred, labels=labels)
    tn, fp, fn, tp = matrix.ravel()
    accuracy = accuracy_score(y_true, y_pred)
    always_legit = ["LEGITIMATE"] * len(y_true)
    metrics.update({
        "accuracy_on_valid": accuracy,
        "fraud_precision": precision_score(y_true, y_pred, pos_label="FRAUDULENT", zero_division=0),
        "fraud_recall": recall_score(y_true, y_pred, pos_label="FRAUDULENT", zero_division=0),
        "fraud_f1": f1_score(y_true, y_pred, pos_label="FRAUDULENT", zero_division=0),
        "macro_f1": f1_score(y_true, y_pred, average="macro", zero_division=0),
        "weighted_f1": f1_score(y_true, y_pred, average="weighted", zero_division=0),
        "confusion_matrix_labels": labels,
        "confusion_matrix": matrix.tolist(),
        "tn": int(tn),
        "fp": int(fp),
        "fn": int(fn),
        "tp": int(tp),
        "always_legitimate_baseline_accuracy": accuracy_score(y_true, always_legit),
        "always_legitimate_baseline_macro_f1": f1_score(
            y_true, always_legit, average="macro", zero_division=0
        ),
    })
    return metrics


def write_confusion_plot(metrics: dict, path: Path) -> None:
    matrix = metrics.get("confusion_matrix")
    if not matrix:
        return
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    figure, axis = plt.subplots(figsize=(5.2, 4.4))
    image = axis.imshow(matrix, cmap="Blues")
    axis.set_xticks([0, 1], ["LEGITIMATE", "FRAUDULENT"])
    axis.set_yticks([0, 1], ["LEGITIMATE", "FRAUDULENT"])
    axis.set_xlabel("Predicted")
    axis.set_ylabel("Expected")
    axis.set_title("OfferGuard LoRA test confusion matrix")
    for row in range(2):
        for col in range(2):
            axis.text(col, row, str(matrix[row][col]), ha="center", va="center")
    figure.colorbar(image, ax=axis, fraction=0.046)
    figure.tight_layout()
    figure.savefig(path, dpi=140)
    plt.close(figure)


def write_report(split: str, metrics: dict, path: Path) -> None:
    def pct(value):
        return "n/a" if value is None else f"{value * 100:.2f}%"

    latency = metrics.get("latency_seconds", {})
    lines = [
        "# OfferGuard LoRA evaluation",
        "",
        f"Split: `{split}`",
        "Model: Qwen/Qwen3.5-2B + Adaption AutoScientist LoRA (experiment 07db89e9-7722-4897-9c2f-fc384482dc91).",
        "The Adaption win rate is a training-search statistic. It is not this accuracy number.",
        "",
        f"- Rows in split: {metrics.get('rows_in_split')}",
        f"- Rows scored: {metrics.get('rows_scored')}",
        f"- Valid predictions: {metrics.get('valid_predictions')}",
        f"- Invalid or ambiguous outputs: {metrics.get('invalid_predictions')} ({pct(metrics.get('invalid_rate'))})",
        f"- Coverage: {pct(metrics.get('coverage'))}",
        "",
    ]
    if "accuracy_on_valid" in metrics:
        lines.extend([
            "Metrics below are computed only on valid predictions.",
            "",
            f"- Accuracy: {pct(metrics.get('accuracy_on_valid'))}",
            f"- FRAUDULENT precision: {pct(metrics.get('fraud_precision'))}",
            f"- FRAUDULENT recall: {pct(metrics.get('fraud_recall'))}",
            f"- FRAUDULENT F1: {pct(metrics.get('fraud_f1'))}",
            f"- Macro F1: {pct(metrics.get('macro_f1'))}",
            f"- Weighted F1: {pct(metrics.get('weighted_f1'))}",
            f"- Confusion matrix (expected x predicted, labels LEGITIMATE then FRAUDULENT): {metrics.get('confusion_matrix')}",
            f"- TN {metrics.get('tn')}, FP {metrics.get('fp')}, FN {metrics.get('fn')}, TP {metrics.get('tp')}",
            f"- Always-LEGITIMATE baseline accuracy: {pct(metrics.get('always_legitimate_baseline_accuracy'))}",
            f"- Always-LEGITIMATE baseline macro F1: {pct(metrics.get('always_legitimate_baseline_macro_f1'))}",
        ])
    else:
        lines.append("Accuracy is not reported because there are no valid predictions.")
    if latency:
        lines.extend([
            f"- Average inference latency: {latency.get('average', 0):.3f}s",
            f"- p95 inference latency: {latency.get('p95', 0):.3f}s",
        ])
    lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def export(split: str, records: list[dict], expected_rows: int) -> dict:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    metrics = compute_metrics(records, expected_rows)
    metrics["split"] = split
    metrics["model"] = "Qwen/Qwen3.5-2B + LoRA r=48 alpha=96"
    metrics["experiment_id"] = "07db89e9-7722-4897-9c2f-fc384482dc91"
    metrics["win_rate_is_not_accuracy"] = True
    prefix = "" if split == "test" else f"{split}_"
    (OUTPUT_DIR / f"{prefix}evaluation_results.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    with (OUTPUT_DIR / f"{prefix}predictions.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["row_index", "expected", "prediction", "raw_output", "latency_seconds", "valid"],
        )
        writer.writeheader()
        for row in records:
            writer.writerow({
                "row_index": row["row_index"],
                "expected": row["expected"],
                "prediction": row.get("prediction") or "",
                "raw_output": row.get("raw") or "",
                "latency_seconds": row.get("latency_seconds"),
                "valid": row.get("prediction") in {"LEGITIMATE", "FRAUDULENT"},
            })
    write_report(split, metrics, OUTPUT_DIR / f"{prefix}evaluation_report.md")
    write_confusion_plot(metrics, OUTPUT_DIR / f"{prefix}confusion_matrix.png")
    return metrics


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--split", choices=sorted(SPLIT_FILES), default="test")
    parser.add_argument("--limit", type=int, default=0, help="Score only the first N rows. 0 means all.")
    args = parser.parse_args()

    source = SPLIT_FILES[args.split]
    if not source.exists():
        raise SystemExit(f"Missing dataset: {source}")

    rows = load_rows(source)
    if args.limit > 0:
        rows = rows[: args.limit]
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    partial_path = OUTPUT_DIR / f"predictions_partial_{args.split}.jsonl"
    completed = read_completed(partial_path)
    print(f"Loaded {len(rows)} rows from {source.name}. Resumed {len(completed)} completed predictions.", flush=True)

    local_lora_predictor.load_model()
    for offset, (row_index, instruction, expected) in enumerate(rows, start=1):
        if row_index in completed:
            continue
        started = time.perf_counter()
        try:
            result = local_lora_predictor.predict_raw(instruction, already_instruction=True)
            prediction = result["label"]
            raw = result["raw"]
            error = None
        except Exception as exc:
            prediction = None
            raw = ""
            error = f"{type(exc).__name__}: {exc}"
        record = {
            "row_index": row_index,
            "expected": expected,
            "prediction": prediction,
            "raw": raw,
            "latency_seconds": time.perf_counter() - started,
            "error": error,
        }
        with partial_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record) + "\n")
        completed[row_index] = record
        if offset % 25 == 0 or offset == len(rows):
            print(f"Scored {len(completed)} / {len(rows)}", flush=True)

    ordered = [completed[index] for index, _, _ in rows if index in completed]
    metrics = export(args.split, ordered, len(rows))
    print(json.dumps({
        "rows_scored": metrics.get("rows_scored"),
        "valid_predictions": metrics.get("valid_predictions"),
        "accuracy_on_valid": metrics.get("accuracy_on_valid"),
        "fraud_f1": metrics.get("fraud_f1"),
    }, indent=2), flush=True)


if __name__ == "__main__":
    main()
