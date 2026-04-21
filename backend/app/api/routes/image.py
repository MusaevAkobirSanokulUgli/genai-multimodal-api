"""Image generation routes."""

from fastapi import APIRouter, Depends

from app.api.dependencies import get_moderation
from app.models.schemas import ImageGenerationRequest, ImageGenerationResponse
from app.services.image_generation import ImageGenerationService
from app.services.moderation import ModerationService

router = APIRouter(prefix="/image", tags=["image"])


@router.post(
    "/generate",
    response_model=ImageGenerationResponse,
    summary="Generate images from a text prompt (DALL-E 3)",
)
async def generate_image(
    request: ImageGenerationRequest,
    moderation: ModerationService = Depends(get_moderation),
) -> ImageGenerationResponse:
    service = ImageGenerationService(moderation=moderation)
    return await service.generate(request)
