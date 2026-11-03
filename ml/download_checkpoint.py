"""Download and extract Adaption AutoScientist LoRA checkpoint archive."""
import os
import tarfile
import httpx
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

API_KEY = os.getenv("ADAPTION_API_KEY")
EXPERIMENT_ID = os.getenv("ADAPTION_EXPERIMENT_ID", "07db89e9-7722-4897-9c2f-fc384482dc91")
BASE_URL = os.getenv("ADAPTION_BASE_URL", "https://api.prod.adaptionlabs.ai").rstrip("/")

MODELS_DIR = PROJECT_ROOT / "ml" / "models" / "autoscientist_qwen3_5_2b"
MODELS_DIR.mkdir(parents=True, exist_ok=True)
ARCHIVE_PATH = MODELS_DIR / "checkpoint.tgz"

print(f"Downloading checkpoint from {BASE_URL}/api/v1/autoscientist/{EXPERIMENT_ID}/download ...")
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "User-Agent": "OfferGuard-AI/1.0"
}

with httpx.Client(timeout=120.0) as client:
    with client.stream("GET", f"{BASE_URL}/api/v1/autoscientist/{EXPERIMENT_ID}/download", headers=headers) as response:
        if response.status_code != 200:
            print(f"Error downloading: HTTP {response.status_code} - {response.text}")
            exit(1)
        total = int(response.headers.get("Content-Length", 0))
        downloaded = 0
        with open(ARCHIVE_PATH, "wb") as f:
            for chunk in response.iter_bytes(chunk_size=1024 * 1024):
                f.write(chunk)
                downloaded += len(chunk)
                if total:
                    print(f"Progress: {downloaded / 1024 / 1024:.1f} MB / {total / 1024 / 1024:.1f} MB ({downloaded / total * 100:.1f}%)", end="\r")

print(f"\nDownload complete: {ARCHIVE_PATH} ({ARCHIVE_PATH.stat().st_size / 1024 / 1024:.2f} MB)")

# Extract tarball
print("Extracting tarball...")
with tarfile.open(ARCHIVE_PATH, "r:gz") as tar:
    tar.extractall(path=MODELS_DIR)
    members = tar.getnames()
    print("Extracted archive members:")
    for m in members:
        print(f"  - {m}")

