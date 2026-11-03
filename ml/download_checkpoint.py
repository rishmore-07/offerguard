"""Download and extract Adaption AutoScientist LoRA checkpoint archive."""
import os
import tarfile
import httpx
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(PROJECT_ROOT / "backend" / ".env")

API_KEY = os.getenv("ADAPTION_API_KEY")
EXPERIMENT_ID = os.getenv("ADAPTION_EXPERIMENT_ID", "07db89e9-7722-4897-9c2f-fc384482dc91")
BASE_URL = os.getenv("ADAPTION_BASE_URL", "https://api.prod.adaptionlabs.ai").rstrip("/")

MODELS_DIR = PROJECT_ROOT / "ml" / "models" / "autoscientist_qwen3_5_2b"
MODELS_DIR.mkdir(parents=True, exist_ok=True)
ARCHIVE_PATH = MODELS_DIR / "checkpoint.tgz"

url = f"{BASE_URL}/api/v1/autoscientist/{EXPERIMENT_ID}/download"
print(f"Downloading checkpoint from {url}", flush=True)
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "User-Agent": "OfferGuard-AI/1.0"
}
timeout = httpx.Timeout(connect=30.0, read=120.0, write=30.0, pool=30.0)

with httpx.Client(timeout=timeout, follow_redirects=True) as client:
    with client.stream("GET", url, headers=headers) as response:
        print(f"HTTP {response.status_code} content-type={response.headers.get('content-type')}", flush=True)
        if response.status_code != 200:
            body = response.read().decode("utf-8", errors="replace")[:500]
            print(f"Error downloading: HTTP {response.status_code} - {body}")
            exit(1)
        total = int(response.headers.get("Content-Length", 0))
        downloaded = 0
        with open(ARCHIVE_PATH, "wb") as f:
            for chunk in response.iter_bytes(chunk_size=1024 * 1024):
                f.write(chunk)
                f.flush()
                downloaded += len(chunk)
                if total:
                    print(
                        f"Progress: {downloaded / 1024 / 1024:.1f} MB / {total / 1024 / 1024:.1f} MB ({downloaded / total * 100:.1f}%)",
                        flush=True,
                    )
                else:
                    print(f"Progress: {downloaded / 1024 / 1024:.1f} MB", flush=True)

print(f"\nDownload complete: {ARCHIVE_PATH} ({ARCHIVE_PATH.stat().st_size / 1024 / 1024:.2f} MB)")

# Adaption serves a zstd-compressed tar even when the content type says gzip.
print("Extracting checkpoint archive...", flush=True)
header = ARCHIVE_PATH.read_bytes()[:4]
if header == b"\x28\xb5\x2f\xfd":
    import zstandard

    with ARCHIVE_PATH.open("rb") as handle:
        reader = zstandard.ZstdDecompressor().stream_reader(handle)
        with tarfile.open(fileobj=reader, mode="r|") as tar:
            members = []
            for member in tar:
                members.append(member.name)
                tar.extract(member, path=MODELS_DIR)
else:
    with tarfile.open(ARCHIVE_PATH, "r:*") as tar:
        members = tar.getnames()
        tar.extractall(path=MODELS_DIR)
print("Extracted archive members:")
for name in members:
    print(f"  - {name}")

