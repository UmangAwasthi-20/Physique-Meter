from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import analysis, auth, progress, reports

app = FastAPI(
    title="Physique Meter AI API",
    description="FastAPI backend for AI physique analysis, progress tracking, and PDF reports.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router)
app.include_router(analysis.router)
app.include_router(progress.router)
app.include_router(reports.router)


@app.get("/health")
def health():
    return {"ok": True, "service": "physique-meter-ai"}
