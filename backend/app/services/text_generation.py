"""
Text generation service.

Supports:
- Single-turn completion
- Streaming via AsyncGenerator
- Multi-turn conversation using MCP-style context sessions
- Integrated content moderation gate
- Semaphore-based concurrency control
"""

import asyncio
import time
from collections.abc import AsyncGenerator

from openai import AsyncOpenAI

from app.config import settings
from app.models.schemas import TextGenerationRequest, TextGenerationResponse
from app.services.moderation import ModerationService
from app.services.context_protocol import ContextManager


class TextGenerationService:
    def __init__(
        self,
        moderation: ModerationService | None = None,
        context_manager: ContextManager | None = None,
    ) -> None:
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.moderation = moderation
        self.context_manager = context_manager
        self._semaphore = asyncio.Semaphore(settings.max_concurrent_requests)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def generate(self, request: TextGenerationRequest) -> TextGenerationResponse:
        """Run a non-streaming completion and return a structured response."""
        start = time.perf_counter()

        # --- Moderation pre-check ---
        mod_result = None
        if self.moderation and settings.moderation_enabled:
            mod_result = await self.moderation.check(request.prompt)
            if mod_result.category.value == "blocked":
                return TextGenerationResponse(
                    content="Content blocked by moderation policy.",
                    model=request.model,
                    moderation=mod_result.model_dump(),
                    context_id=request.context_id,
                    latency_ms=(time.perf_counter() - start) * 1000,
                )

        messages = self._build_messages(request)

        async with self._semaphore:
            response = await self.client.chat.completions.create(
                model=request.model,
                messages=messages,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
            )

        content = response.choices[0].message.content or ""
        latency = (time.perf_counter() - start) * 1000

        # --- Update context ---
        if request.context_id and self.context_manager:
            self.context_manager.add_message(
                request.context_id, {"role": "user", "content": request.prompt}
            )
            self.context_manager.add_message(
                request.context_id, {"role": "assistant", "content": content}
            )

        return TextGenerationResponse(
            content=content,
            model=request.model,
            tokens_used=response.usage.total_tokens if response.usage else None,
            moderation=mod_result.model_dump() if mod_result else None,
            context_id=request.context_id,
            latency_ms=latency,
        )

    async def stream(self, request: TextGenerationRequest) -> AsyncGenerator[str, None]:
        """Yield text tokens as they arrive from the model."""
        messages = self._build_messages(request)

        async with self._semaphore:
            stream = await self.client.chat.completions.create(
                model=request.model,
                messages=messages,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                stream=True,
            )

            async for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield delta

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _build_messages(self, request: TextGenerationRequest) -> list[dict]:
        messages: list[dict] = [{"role": "system", "content": request.system_prompt}]

        if request.context_id and self.context_manager:
            ctx = self.context_manager.get_context(request.context_id)
            if ctx:
                for resource in ctx.resources:
                    messages.append(
                        {
                            "role": "system",
                            "content": f"[Context resource: {resource.name}]\n{resource.content}",
                        }
                    )
                # Include recent conversation history (last 10 turns)
                messages.extend(ctx.messages[-10:])

        messages.append({"role": "user", "content": request.prompt})
        return messages
