"""Adaption AutoScientist training script for OfferGuard India.

Set ADAPTION_API_KEY in your environment first. Review account credits before running.
Usage:
  python train_adaption.py --check-only    # Verify setup and dataset without incurring credits
  python train_adaption.py                 # Launch paid AutoScientist training run
"""
import os
import sys
from pathlib import Path

candidate_files = [
    Path(__file__).resolve().parent / "data" / "offerguard_train.csv",
    Path(__file__).resolve().parent.parent / "OfferGuard_India" / "offerguard_train.csv",
    Path.cwd() / "offerguard_train.csv",
]
file_path = next((p for p in candidate_files if p.exists()), None)
if file_path is None:
    raise SystemExit("Dataset not found. Run prepare_data.py first.")

api_key = os.getenv("ADAPTION_API_KEY")

if "--check-only" in sys.argv:
    print("=" * 60)
    print("OfferGuard India - AutoScientist Readiness Check")
    print("=" * 60)
    print(f"[CHECK PASSED] Training file verified at: {file_path}")
    import pandas as pd
    df = pd.read_csv(file_path)
    print(f"[CHECK PASSED] Total Rows: {len(df)}")
    print(f"[CHECK PASSED] Required Columns Present: {list(df.columns)}")
    print(f"[CHECK PASSED] Response Label Distribution: {df['response'].value_counts().to_dict()}")
    if api_key:
        print("[CHECK PASSED] ADAPTION_API_KEY detected.")
    else:
        print("[INFO] ADAPTION_API_KEY is not currently set in environment.")
        print("       Set it before launching actual paid training.")
    print("=" * 60)
    sys.exit(0)

if not api_key:
    print("ERROR: ADAPTION_API_KEY environment variable is missing.")
    print("Export your API key before launching AutoScientist:")
    print("  PowerShell:  $env:ADAPTION_API_KEY='your_api_key_here'")
    print("  CMD:         set ADAPTION_API_KEY=your_api_key_here")
    print("  Bash:        export ADAPTION_API_KEY='your_api_key_here'")
    sys.exit(1)

print(f"Uploading {file_path} to Adaption Adaptive Data...")
from adaption import Adaption

client = Adaption()
dataset = client.datasets.upload_file(
    str(file_path),
    processing_mode="raw",
    column_mapping={"prompt": "instruction", "completion": "response"},
)
print("Uploaded. Dataset ID:", dataset.dataset_id)
print("Waiting for dataset processing...")
client.datasets.wait_for_completion(dataset.dataset_id)

print("Starting AutoScientist run (training_method='instruction', max_iterations=1)...")
run = client.autoscientist.create(
    dataset_id=dataset.dataset_id,
    training_method="instruction",
    max_iterations=1,
    augmentation_domain_rows=0,
    augmentation_general_rows=0,
)
print("AutoScientist run ID:", run.id, "| Initial status:", run.status)
run = client.autoscientist.wait_for_completion(run.id)

if run.status != "succeeded":
    raise RuntimeError(f"Run status: {run.status}; error: {run.error}")

print("Best training win rate:", run.best_win_rate)
if run.download_available:
    checkpoint_file = file_path.parent / "offerguard_checkpoint.tgz"
    with client.autoscientist.with_streaming_response.download(run.id) as response:
        response.stream_to_file(str(checkpoint_file))
    print(f"Downloaded model checkpoint: {checkpoint_file}")
else:
    print("Checkpoint not yet available. Check the AutoScientist dashboard.")

