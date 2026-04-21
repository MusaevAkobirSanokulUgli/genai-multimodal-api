"""Text generation routes — completion and streaming."""

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.api.dependencies import get_context_manager, get_moderation
from app.models.schemas import TextGenerationRequest, TextGenerationResponse
from app.services.context_protocol import ContextManager
from app.services.moderation import ModerationService
from app.services.text_generation import TextGenerationService
from app.utils.streaming import sse_stream

router = APIRouter(prefix="/text", tags=["text"])


@router.post(
    "/generate",
    response_model=TextGenerationResponse,
    summary="Generate text (single turn or multi-turn with context)",
)
async def generate_text(
    request: TextGenerationRequest,
    moderation: ModerationService = Depends(get_moderation),
    context_manager: ContextManager = Depends(get_context_manager),
) -> TextGenerationResponse | StreamingResponse:
    service = TextGenerationService(
        moderation=moderation,
        context_manager=context_manager,
    )

    if request.stream:
        return StreamingResponse(
            sse_stream(service.stream(request)),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    return await service.generate(request)
