"""
Vision analysis service.

Supports:
- Single image analysis via URL or data-URI
- Batch concurrent analysis with asyncio.gather
- Semaphore-based concurrency control
"""

import asyncio
import time

from openai import AsyncOpenAI

from app.config import settings
from app.models.schemas import VisionAnalysisRequest, VisionAnalysisResponse


class VisionService:
    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self._semaphore = asyncio.Semaphore(settings.max_concurrent_requests)

    async def analyze(self, request: VisionAnalysisRequest) -> VisionAnalysisResponse:
        """Analyze a single image and return a structured description."""
        start = time.perf_counter()

        content: list[dict] = [
            {"type": "text", "text": request.prompt},
            {
                "type": "image_url",
                "image_url": {"url": request.image_url, "detail": "auto"},
            },
        ]

        async with self._semaphore:
            response = await self.client.chat.completions.create(
                model=request.model,
                messages=[{"role": "user", "content": content}],
                max_tokens=request.max_tokens,
            )

        description = response.choices[0].message.content or ""
        latency = (time.perf_counter() - start) * 1000

        return VisionAnalysisResponse(
            description=description,
            model=request.model,
            tokens_used=response.usage.total_tokens if response.usage else None,
            latency_ms=latency,
        )

    async def analyze_batch(
        self, requests: list[VisionAnalysisRequest]
    ) -> list[VisionAnalysisResponse]:
        """Analyze multiple images concurrently via asyncio.gather."""
        tasks = [self.analyze(req) for req in requests]
        return list(await asyncio.gather(*tasks))
