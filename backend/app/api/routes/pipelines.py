"""Multi-modal pipeline execution routes."""

from fastapi import APIRouter, Depends

from app.api.dependencies import get_moderation
from app.models.schemas import PipelineRequest, PipelineResponse
from app.services.moderation import ModerationService
from app.services.pipeline_engine import PipelineEngine

router = APIRouter(prefix="/pipelines", tags=["pipelines"])


@router.post(
    "/execute",
    response_model=PipelineResponse,
    summary="Execute a multi-modal pipeline",
)
async def execute_pipeline(
    request: PipelineRequest,
    moderation: ModerationService = Depends(get_moderation),
) -> PipelineResponse:
    engine = PipelineEngine(moderation=moderation)
    return await engine.execute(request)
