"""OfferGuard AI Backend Configuration."""
from pathlib import Path
import os
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

# Load .env file
load_dotenv(PROJECT_ROOT / ".env")

# Paths
DEFAULT_MODEL_PATH = PROJECT_ROOT / "ml" / "models" / "offerguard_baseline.joblib"
DEFAULT_METRICS_PATH = PROJECT_ROOT / "ml" / "metrics" / "baseline_evaluation.json"

MODEL_PATH = Path(os.getenv("OFFERGUARD_MODEL_PATH", str(DEFAULT_MODEL_PATH)))
METRICS_PATH = Path(os.getenv("OFFERGUARD_METRICS_PATH", str(DEFAULT_METRICS_PATH)))

# Inference Provider Configuration
# Supported values:
#   "baseline": Uses local scikit-learn TF-IDF + Logistic Regression model
#   "autoscientist": Calls remote Adaption AutoScientist API endpoint
#   "demo": Pure heuristic rule-based demo mode without trained weights
MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "baseline").lower()

# Adaption Labs AutoScientist & Hosted Inference API
ADAPTION_API_KEY = os.getenv("ADAPTION_API_KEY", os.getenv("AUTOSCIENTIST_API_KEY", ""))
ADAPTION_EXPERIMENT_ID = os.getenv("ADAPTION_EXPERIMENT_ID", "07db89e9-7722-4897-9c2f-fc384482dc91")
ADAPTION_BASE_URL = os.getenv("ADAPTION_BASE_URL", "https://api.adaptionlabs.ai").rstrip("/")

AUTOSCIENTIST_API_URL = os.getenv("AUTOSCIENTIST_API_URL", "")
AUTOSCIENTIST_API_KEY = ADAPTION_API_KEY
MODEL_TIMEOUT = float(os.getenv("MODEL_TIMEOUT", "15.0"))

# Request Limits
MAX_INPUT_LENGTH = int(os.getenv("MAX_INPUT_LENGTH", "15000"))
MIN_INPUT_LENGTH = int(os.getenv("MIN_INPUT_LENGTH", "10"))

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
    "https://offerguard.vercel.app",
    "*"
]
