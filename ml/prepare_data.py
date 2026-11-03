"""Dataset preparation pipeline for OfferGuard India.

1. Loads fake_job_postings.csv (EMSCAD dataset).
2. Cleans text features (title, company_profile, description, requirements, benefits).
3. Normalizes text, resolves label conflicts, removes near-duplicates.
4. Performs stratified 70% train / 15% validation / 15% test splitting.
5. Ingests and independently splits Indian synthetic examples (Aioshi/smolified-fakejob).
6. Ensures zero train/validation/test leakage.
7. Exports instruction/response CSVs ready for both baseline and Adaption AutoScientist.
"""
from pathlib import Path
import re
import pandas as pd
from sklearn.model_selection import train_test_split

PROMPT = (
    "Classify this job advertisement using only one label: "
    "LEGITIMATE or FRAUDULENT. A label is a risk prediction, not "
    "independent verification of a company.\n\n"
)

COLS = ['title', 'company_profile', 'description', 'requirements', 'benefits']


def find_source_dataset() -> Path:
    current = Path(__file__).resolve().parent
    candidates = [
        current.parent / "fake_job_postings.csv",
        current / "data" / "fake_job_postings.csv",
        current.parent / "OfferGuard_India" / "fake_job_postings.csv",
        Path.cwd() / "fake_job_postings.csv"
    ]
    for c in candidates:
        if c.exists():
            return c
    raise FileNotFoundError("Could not locate fake_job_postings.csv. Please place it in the project root.")


def make_listing(row):
    return '\n'.join(f'{c}: {row[c][:850].strip()}' for c in COLS if row[c].strip())[:3300]


def normalized(t):
    return re.sub(r'\s+', ' ', t.lower()).strip()


def output_frame(frame: pd.DataFrame) -> pd.DataFrame:
    return pd.DataFrame({
        'instruction': [PROMPT + s for s in frame['listing']],
        'response': frame['fraudulent'].map({0: 'LEGITIMATE', 1: 'FRAUDULENT'}).tolist()
    })


def run_pipeline(output_dirs=None):
    current = Path(__file__).resolve().parent
    if output_dirs is None:
        output_dirs = [
            current / "data",
            current.parent / "OfferGuard_India"
        ]

    src = find_source_dataset()
    print(f"Loading EMSCAD dataset from: {src}")
    df = pd.read_csv(src, low_memory=False)

    missing = set(COLS + ['fraudulent']) - set(df.columns)
    if missing:
        raise ValueError(f"Missing required EMSCAD columns: {sorted(missing)}")

    df[COLS] = df[COLS].fillna('').astype(str)
    df['fraudulent'] = pd.to_numeric(df['fraudulent'], errors='coerce')
    df = df[df['fraudulent'].isin([0, 1])].copy()

    df['listing'] = df.apply(make_listing, axis=1)
    df['key'] = df['listing'].map(normalized)
    df = df[df['key'].str.len() >= 40]

    # Drop contradictory labels
    conflicts = df.groupby('key')['fraudulent'].nunique()
    df = df[~df['key'].isin(conflicts[conflicts > 1].index)]
    df = df.drop_duplicates('key')

    # Stratified split: 70% train, 15% val, 15% test
    train, remain = train_test_split(df, test_size=0.30, stratify=df['fraudulent'], random_state=42)
    valid, test = train_test_split(remain, test_size=0.50, stratify=remain['fraudulent'], random_state=42)

    train_out = output_frame(train)
    valid_out = output_frame(valid)
    test_out = output_frame(test)
    syn_test_out = None

    print(f"EMSCAD train={len(train)}, validation={len(valid)}, test={len(test)}")

    # Ingest synthetic Indian data
    try:
        from datasets import load_dataset
        print("Ingesting Aioshi/smolified-fakejob synthetic dataset...")
        india = load_dataset('Aioshi/smolified-fakejob', split='train').to_pandas()
        india['fraudulent'] = india['assistant'].astype(str).str.extract(
            r'(?i)Classification:\s*(Fake|Real)', expand=False
        ).str.lower().map({'fake': 1, 'real': 0})
        india = india[india['fraudulent'].isin([0, 1])].copy()
        india['listing'] = india['user'].fillna('').astype(str).str.slice(0, 3300)
        india['key'] = india['listing'].map(normalized)
        india = india[india['key'].str.len() >= 40].drop_duplicates('key')
        # Prevent leakage between EMSCAD and synthetic
        india = india[~india['key'].isin(df['key'])]

        india_train, india_test = train_test_split(
            india, test_size=0.20, stratify=india['fraudulent'], random_state=42
        )
        train_out = pd.concat([train_out, output_frame(india_train)], ignore_index=True)
        syn_test_out = output_frame(india_test)
        print(f"India synthetic train={len(india_train)}, test={len(india_test)}")
    except Exception as exc:
        print("Synthetic dataset warning (offline or unavailable):", exc)

    train_out = train_out.sample(frac=1, random_state=42).reset_index(drop=True)

    # Save to all target directories
    for target in output_dirs:
        target.mkdir(parents=True, exist_ok=True)
        train_out.to_csv(target / "offerguard_train.csv", index=False)
        valid_out.to_csv(target / "offerguard_validation.csv", index=False)
        test_out.to_csv(target / "offerguard_test.csv", index=False)
        if syn_test_out is not None:
            syn_test_out.to_csv(target / "offerguard_india_synthetic_test.csv", index=False)
        print(f"Exported prepared datasets to: {target}")

    return {
        "train_rows": len(train_out),
        "validation_rows": len(valid_out),
        "test_rows": len(test_out),
        "syn_test_rows": len(syn_test_out) if syn_test_out is not None else 0,
        "train_distribution": train_out['response'].value_counts().to_dict()
    }


if __name__ == "__main__":
    run_pipeline()

