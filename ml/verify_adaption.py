"""Test and inspect Adaption AutoScientist experiment and models API."""
import os
import json
import httpx
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(PROJECT_ROOT / "backend" / ".env")

API_KEY = os.getenv("ADAPTION_API_KEY")
EXPERIMENT_ID = os.getenv("ADAPTION_EXPERIMENT_ID", "07db89e9-7722-4897-9c2f-fc384482dc91")
BASE_URL = os.getenv("ADAPTION_BASE_URL", "https://api.prod.adaptionlabs.ai").rstrip("/")

print(f"--- Querying Adaption API ---")
print(f"Base URL: {BASE_URL}")
print(f"Experiment ID: {EXPERIMENT_ID}")
print(f"API Key present: {bool(API_KEY)} (Length: {len(API_KEY) if API_KEY else 0})")

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "User-Agent": "OfferGuard-AI/1.0"
}

# 1. Retrieve AutoScientist run
autoscientist_url = f"{BASE_URL}/api/v1/autoscientist/{EXPERIMENT_ID}"
print(f"\n1. Requesting: GET {autoscientist_url}")
try:
    with httpx.Client(timeout=25.0) as client:
        r = client.get(autoscientist_url, headers=headers)
        print(f"Status Code: {r.status_code}")
        try:
            exp_data = r.json()
            print("Response JSON:")
            print(json.dumps(exp_data, indent=2))
        except Exception:
            print("Raw Response text:", r.text[:1000])
except Exception as e:
    print(f"Request failed: {e}")

# 2. Query Models list
models_url = f"{BASE_URL}/api/v1/models"
print(f"\n2. Requesting: GET {models_url}")
try:
    with httpx.Client(timeout=25.0) as client:
        r = client.get(models_url, headers=headers)
        print(f"Status Code: {r.status_code}")
        try:
            models_data = r.json()
            print("Response JSON:")
            print(json.dumps(models_data, indent=2))
        except Exception:
            print("Raw Response text:", r.text[:1000])
except Exception as e:
    print(f"Request failed: {e}")
