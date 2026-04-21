"""Vision analysis routes — single image and batch."""

import time
from uuid import uuid4

from fastapi import APIRouter

from app.models.schemas import (
    BatchVisionRequest,
    BatchVisionResponse,
    VisionAnalysisRequest,
    VisionAnalysisResponse,
)
from app.services.vision_service import VisionService

router = APIRouter(prefix="/vision", tags=["vision"])


@router.post(
    "/analyze",
    response_model=VisionAnalysisResponse,
    summary="Analyze a single image via URL",
)
async def analyze_image(request: VisionAnalysisRequest) -> VisionAnalysisResponse:
    service = VisionService()
    return await service.analyze(request)


@router.post(
    "/analyze/batch",
    response_model=BatchVisionResponse,
    summary="Analyze multiple images concurrently",
)
async def analyze_batch(request: BatchVisionRequest) -> BatchVisionResponse:
    start = time.perf_counter()
    service = VisionService()
    results = await service.analyze_batch(request.requests)
    return BatchVisionResponse(
        id=uuid4(),
        results=results,
        total_latency_ms=(time.perf_counter() - start) * 1000,
    )
