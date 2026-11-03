"""OfferGuard India FastAPI Backend Application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import CORS_ORIGINS
from backend.app.api.router import router as api_router

app = FastAPI(
    title="OfferGuard India API",
    description="AI-powered recruitment fraud and scam detection platform targeting Indian job seekers.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response

app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {
        "platform": "OfferGuard India",
        "tagline": "Protecting Indian Job Seekers Against Recruitment Fraud",
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    from backend.app.config import HOST, PORT
    uvicorn.run("backend.app.main:app", host=HOST, port=PORT, reload=True)

