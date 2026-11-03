"""Optional fast path: upload a ready CSV to Adaption AutoScientist using its SDK.

Set ADAPTION_API_KEY in your environment first. Review account credits before running.
Usage:
  python train_adaption.py --check-only    # Verify setup and dataset without incurring credits
  python train_adaption.py                 # Launch paid AutoScientist training run
"""
import os
import sys
from pathlib import Path

candidate_files = [
    Path(__file__).resolve().parent / 'offerguard_train.csv',
    Path.cwd() / 'offerguard_train.csv',
    Path.cwd() / 'ml' / 'data' / 'offerguard_train.csv',
]
file_path = next((p for p in candidate_files if p.exists()), None)
if file_path is None:
    raise SystemExit('Dataset not found. Run prepare_data.py first.')

api_key = os.getenv('ADAPTION_API_KEY')
if not api_key:
    print('WARNING: ADAPTION_API_KEY is not set.')
    print('Set ADAPTION_API_KEY before running paid training:')
    print('  PowerShell: $env:ADAPTION_API_KEY="YOUR_KEY"')
    print('  Windows cmd: set ADAPTION_API_KEY=YOUR_KEY')
    print('  Linux/macOS: export ADAPTION_API_KEY="YOUR_KEY"')
    if '--check-only' not in sys.argv:
        raise SystemExit(1)

if '--check-only' in sys.argv:
    print(f'[CHECK PASSED] Training file verified at: {file_path}')
    import pandas as pd
    df = pd.read_csv(file_path)
    print(f'[CHECK PASSED] Rows: {len(df)}, Columns: {list(df.columns)}')
    print(f'[CHECK PASSED] Class counts: {df["response"].value_counts().to_dict()}')
    if api_key:
        print('[CHECK PASSED] ADAPTION_API_KEY is detected in environment.')
    else:
        print('[INFO] Set ADAPTION_API_KEY when ready to launch paid AutoScientist training.')
    sys.exit(0)

from adaption import Adaption

client = Adaption()
dataset = client.datasets.upload_file(
    str(file_path),
    processing_mode='raw',
    column_mapping={'prompt': 'instruction', 'completion': 'response'},
)
print('Dataset ID:', dataset.dataset_id)
client.datasets.wait_for_completion(dataset.dataset_id)
run = client.autoscientist.create(
    dataset_id=dataset.dataset_id,
    training_method='instruction',
    max_iterations=1,
    augmentation_domain_rows=0,
    augmentation_general_rows=0,
)
print('AutoScientist run ID:', run.id, '| Initial status:', run.status)
run = client.autoscientist.wait_for_completion(run.id)
if run.status != 'succeeded':
    raise RuntimeError(f'Run status: {run.status}; error: {run.error}')
print('Best training win rate:', run.best_win_rate)
if run.download_available:
    with client.autoscientist.with_streaming_response.download(run.id) as response:
        response.stream_to_file(str(file_path.parent / 'offerguard_checkpoint.tgz'))
    print('Downloaded offerguard_checkpoint.tgz')
else:
    print('Checkpoint not yet available. Check the AutoScientist dashboard.')
