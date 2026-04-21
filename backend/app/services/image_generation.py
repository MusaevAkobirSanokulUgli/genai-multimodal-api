"""
Image generation service using DALL-E 3.

Features:
- Prompt-based image generation
- Content moderation gate (blocks flagged prompts before API call)
- Semaphore limited to 5 (image generation is expensive / rate-limited)
"""

import asyncio
import time

from openai import AsyncOpenAI

from app.config import settings
from app.models.schemas import ImageGenerationRequest, ImageGenerationResponse
from app.services.moderation import ModerationService


class ImageGenerationService:
    def __init__(self, moderation: ModerationService | None = None) -> None:
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.moderation = moderation
        # Image generation is expensive — keep concurrency low
        self._semaphore = asyncio.Semaphore(5)

    async def generate(self, request: ImageGenerationRequest) -> ImageGenerationResponse:
        """Generate images from a text prompt with optional moderation."""
        start = time.perf_counter()

        # --- Moderation pre-check ---
        mod_result = None
        if self.moderation and settings.moderation_enabled:
            mod_result = await self.moderation.check(request.prompt)
            if mod_result.category.value == "blocked":
                return ImageGenerationResponse(
                    images=[],
                    model=request.model,
                    moderation=mod_result.model_dump(),
                    latency_ms=(time.perf_counter() - start) * 1000,
                )

        async with self._semaphore:
            response = await self.client.images.generate(
                model=request.model,
                prompt=request.prompt,
                size=request.size.value,
                quality=request.quality,
                n=request.n,
                style=request.style,
            )

        images = [
            {
                "url": img.url,
                "revised_prompt": img.revised_prompt,
            }
            for img in response.data
        ]

        latency = (time.perf_counter() - start) * 1000

        return ImageGenerationResponse(
            images=images,
            model=request.model,
            moderation=mod_result.model_dump() if mod_result else None,
            latency_ms=latency,
        )
