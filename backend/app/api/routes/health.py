from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()


@router.get("/health", summary="Health check")
async def health() -> dict:
    return {
        "status": "healthy",
        "service": "genai-multimodal-api",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
    }


@router.get("/health/ready", summary="Readiness probe")
async def ready() -> dict:
    return {"ready": True}
