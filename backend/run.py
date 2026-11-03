"""Backend entrypoint script."""
import uvicorn
import os
import sys
from pathlib import Path

# Add project root to sys.path so 'backend' package imports work cleanly
root = Path(__file__).resolve().parent.parent
if str(root) not in sys.path:
    sys.path.insert(0, str(root))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    print(f"Starting OfferGuard India API server on http://{host}:{port}")
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=False)

