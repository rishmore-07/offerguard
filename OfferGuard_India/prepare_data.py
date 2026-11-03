"""Prepare OfferGuard India training/test CSVs without train/test leakage.

Input: fake_job_postings.csv from the EMSCAD Kaggle dataset.
Optional: an Indian synthetic dataset from Hugging Face (requires internet).
"""
from pathlib import Path
import re
import pandas as pd
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parent
candidate_sources = [
    ROOT / 'fake_job_postings.csv',
    ROOT.parent / 'fake_job_postings.csv',
    Path.cwd() / 'fake_job_postings.csv'
]
SRC = next((p for p in candidate_sources if p.exists()), None)
if SRC is None:
    raise SystemExit('Place fake_job_postings.csv next to prepare_data.py or in the project root, then run again.')

cols = ['title', 'company_profile', 'description', 'requirements', 'benefits']
df = pd.read_csv(SRC, low_memory=False)
missing = set(cols + ['fraudulent']) - set(df.columns)
if missing:
    raise SystemExit(f'Missing EMSCAD columns: {sorted(missing)}')

df[cols] = df[cols].fillna('').astype(str)
df['fraudulent'] = pd.to_numeric(df['fraudulent'], errors='coerce')
df = df[df['fraudulent'].isin([0, 1])].copy()

def make_listing(row):
    return '\n'.join(f'{c}: {row[c][:850].strip()}' for c in cols if row[c].strip())[:3300]

def normalized(t):
    return re.sub(r'\s+', ' ', t.lower()).strip()

df['listing'] = df.apply(make_listing, axis=1)
df['key'] = df['listing'].map(normalized)
df = df[df['key'].str.len() >= 40]
# Discard texts that appear with contradictory labels.
conflicts = df.groupby('key')['fraudulent'].nunique()
df = df[~df['key'].isin(conflicts[conflicts > 1].index)]
df = df.drop_duplicates('key')

train, remain = train_test_split(df, test_size=.30, stratify=df['fraudulent'], random_state=42)
valid, test = train_test_split(remain, test_size=.50, stratify=remain['fraudulent'], random_state=42)

PROMPT = ('Classify this job advertisement using only one label: '
          'LEGITIMATE or FRAUDULENT. A label is a risk prediction, not '
          'independent verification of a company.\n\n')

def output_frame(frame):
    return pd.DataFrame({
        'instruction': [PROMPT + s for s in frame['listing']],
        'response': frame['fraudulent'].map({0: 'LEGITIMATE', 1: 'FRAUDULENT'}).tolist()
    })

train_out = output_frame(train)
output_frame(valid).to_csv(ROOT / 'offerguard_validation.csv', index=False)
output_frame(test).to_csv(ROOT / 'offerguard_test.csv', index=False)
print(f'EMSCAD train={len(train)}, validation={len(valid)}, test={len(test)}')

# Optional, independently split India-context SYNTHETIC examples.
try:
    from datasets import load_dataset
    india = load_dataset('Aioshi/smolified-fakejob', split='train').to_pandas()
    required = {'user','assistant'}
    assert required.issubset(set(india.columns))
    india['fraudulent'] = india['assistant'].astype(str).str.extract(
        r'(?i)Classification:\s*(Fake|Real)', expand=False
    ).str.lower().map({'fake': 1, 'real': 0})
    india = india[india['fraudulent'].isin([0,1])].copy()
    india['listing'] = india['user'].fillna('').astype(str).str.slice(0, 3300)
    india['key'] = india['listing'].map(normalized)
    india = india[india['key'].str.len() >= 40].drop_duplicates('key')
    # Keep examples distinct from all EMSCAD splits.
    india = india[~india['key'].isin(df['key'])]
    india_train, india_test = train_test_split(
        india, test_size=.20, stratify=india['fraudulent'], random_state=42
    )
    train_out = pd.concat([train_out, output_frame(india_train)], ignore_index=True)
    output_frame(india_test).to_csv(ROOT / 'offerguard_india_synthetic_test.csv', index=False)
    print(f'India synthetic train={len(india_train)}, test={len(india_test)}')
except Exception as exc:
    print('India synthetic data unavailable; EMSCAD training remains usable:', exc)

train_out = train_out.sample(frac=1, random_state=42).reset_index(drop=True)
train_out.to_csv(ROOT / 'offerguard_train.csv', index=False)
print('Created offerguard_train.csv / offerguard_validation.csv / offerguard_test.csv')
print('Upload ONLY offerguard_train.csv to Adaption.')
print('Training labels:', train_out['response'].value_counts().to_dict())
