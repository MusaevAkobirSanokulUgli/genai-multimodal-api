"""Content moderation routes — single and batch."""

import time
from uuid import uuid4

from fastapi import APIRouter, Depends

from app.api.dependencies import get_moderation
from app.models.schemas import (
    BatchModerationRequest,
    BatchModerationResponse,
    ModerationResult,
)
from app.services.moderation import ModerationService
from pydantic import BaseModel

router = APIRouter(prefix="/moderation", tags=["moderation"])


class ModerationRequest(BaseModel):
    content: str


@router.post(
    "/check",
    response_model=ModerationResult,
    summary="Check content against moderation policies",
)
async def check_content(
    request: ModerationRequest,
    service: ModerationService = Depends(get_moderation),
) -> ModerationResult:
    return await service.check(request.content)


@router.post(
    "/check/batch",
    response_model=BatchModerationResponse,
    summary="Batch content moderation check",
)
async def check_batch(
    request: BatchModerationRequest,
    service: ModerationService = Depends(get_moderation),
) -> BatchModerationResponse:
    start = time.perf_counter()
    results = await service.check_batch(request.contents)
    return BatchModerationResponse(
        id=uuid4(),
        results=results,
        total_latency_ms=(time.perf_counter() - start) * 1000,
    )
