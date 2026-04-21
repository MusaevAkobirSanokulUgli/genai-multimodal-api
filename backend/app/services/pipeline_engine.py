"""
Multi-modal pipeline engine.

Executes a sequence of heterogeneous AI pipeline steps, passing outputs
between steps. Supports:
- text_generate   — LLM text completion
- image_generate  — DALL-E image generation
- image_analyze   — GPT-4o vision analysis
- audio_generate  — TTS audio synthesis
- moderate        — content safety check
- transform       — deterministic text transformations

Steps are executed sequentially; the accumulated context (dict) is
threaded through so each step can reference the output of any previous step.
"""

import asyncio
import logging
import time

from app.models.schemas import (
    ImageGenerationRequest,
    PipelineRequest,
    PipelineResponse,
    PipelineStepResult,
    PipelineStepType,
    TextGenerationRequest,
    TextToSpeechRequest,
    VisionAnalysisRequest,
)
from app.services.image_generation import ImageGenerationService
from app.services.moderation import ModerationService
from app.services.text_generation import TextGenerationService
from app.services.vision_service import VisionService

logger = logging.getLogger(__name__)


class PipelineEngine:
    """Orchestrates multi-modal AI pipelines step by step."""

    def __init__(
        self,
        text_service: TextGenerationService | None = None,
        vision_service: VisionService | None = None,
        image_service: ImageGenerationService | None = None,
        moderation: ModerationService | None = None,
    ) -> None:
        self.text_service = text_service or TextGenerationService(moderation=moderation)
        self.vision_service = vision_service or VisionService()
        self.image_service = image_service or ImageGenerationService(moderation=moderation)
        self.moderation = moderation or ModerationService()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def execute(self, request: PipelineRequest) -> PipelineResponse:
        """Run all pipeline steps and return the aggregated response."""
        total_start = time.perf_counter()
        step_results: list[PipelineStepResult] = []
        current_context: dict = dict(request.initial_input)

        for i, step in enumerate(request.steps):
            step_start = time.perf_counter()

            # Merge output from a referenced previous step
            if step.input_from is not None:
                try:
                    ref_index = int(step.input_from)
                    if 0 <= ref_index < len(step_results):
                        current_context.update(step_results[ref_index].output)
                except ValueError:
                    logger.warning("Invalid input_from reference: %s", step.input_from)

            try:
                output = await self._execute_step(
                    step.step_type, step.config, current_context
                )
                status = "completed"
            except Exception as exc:  # noqa: BLE001
                logger.error("Pipeline step %d (%s) failed: %s", i, step.step_type, exc)
                output = {"error": str(exc)}
                status = "failed"

            step_latency = (time.perf_counter() - step_start) * 1000
            result = PipelineStepResult(
                step_index=i,
                step_type=step.step_type,
                status=status,
                output=output,
                latency_ms=step_latency,
            )
            step_results.append(result)

            if status == "failed":
                break  # Abort on first failure

            current_context.update(output)

        total_latency = (time.perf_counter() - total_start) * 1000
        all_ok = all(r.status == "completed" for r in step_results)

        return PipelineResponse(
            name=request.name,
            status="completed" if all_ok else "failed",
            steps=step_results,
            final_output=current_context,
            total_latency_ms=total_latency,
        )

    # ------------------------------------------------------------------
    # Step dispatch
    # ------------------------------------------------------------------

    async def _execute_step(
        self, step_type: PipelineStepType, config: dict, ctx: dict
    ) -> dict:
        match step_type:
            case PipelineStepType.TEXT_GENERATE:
                return await self._step_text_generate(config, ctx)

            case PipelineStepType.IMAGE_GENERATE:
                return await self._step_image_generate(config, ctx)

            case PipelineStepType.IMAGE_ANALYZE:
                return await self._step_image_analyze(config, ctx)

            case PipelineStepType.AUDIO_GENERATE:
                return await self._step_audio_generate(config, ctx)

            case PipelineStepType.MODERATE:
                return await self._step_moderate(ctx)

            case PipelineStepType.TRANSFORM:
                return self._step_transform(config, ctx)

            case _:
                raise ValueError(f"Unknown pipeline step type: {step_type}")

    # ------------------------------------------------------------------
    # Step implementations
    # ------------------------------------------------------------------

    async def _step_text_generate(self, config: dict, ctx: dict) -> dict:
        prompt = config.get("prompt") or ctx.get("text", "")
        req = TextGenerationRequest(
            prompt=str(prompt),
            model=config.get("model", "gpt-4o"),
            temperature=float(config.get("temperature", 0.7)),
            max_tokens=int(config.get("max_tokens", 2000)),
            system_prompt=config.get("system_prompt", "You are a helpful assistant."),
        )
        result = await self.text_service.generate(req)
        return {"text": result.content, "tokens_used": result.tokens_used}

    async def _step_image_generate(self, config: dict, ctx: dict) -> dict:
        prompt = config.get("prompt") or ctx.get("text", "")
        req = ImageGenerationRequest(
            prompt=str(prompt),
            model=config.get("model", "dall-e-3"),
            size=config.get("size", "1024x1024"),
            quality=config.get("quality", "standard"),
            style=config.get("style", "vivid"),
        )
        result = await self.image_service.generate(req)
        return {"images": result.images}

    async def _step_image_analyze(self, config: dict, ctx: dict) -> dict:
        image_url = config.get("image_url") or ctx.get("image_url", "")
        req = VisionAnalysisRequest(
            image_url=str(image_url),
            prompt=config.get("prompt", "Describe this image in detail."),
            model=config.get("model", "gpt-4o"),
            max_tokens=int(config.get("max_tokens", 1000)),
        )
        result = await self.vision_service.analyze(req)
        return {"description": result.description, "tokens_used": result.tokens_used}

    async def _step_audio_generate(self, config: dict, ctx: dict) -> dict:
        # Lazy import to avoid circular dependency
        from app.services.audio_service import AudioService  # noqa: PLC0415

        text = config.get("text") or ctx.get("text", "")
        req = TextToSpeechRequest(
            text=str(text)[:4096],
            voice=config.get("voice", "alloy"),
            model=config.get("model", "tts-1"),
            speed=float(config.get("speed", 1.0)),
        )
        svc = AudioService()
        result = await svc.text_to_speech(req)
        return {
            "audio_base64": result.audio_base64,
            "format": result.format.value,
            "duration_estimate_ms": result.duration_estimate_ms,
        }

    async def _step_moderate(self, ctx: dict) -> dict:
        text = ctx.get("text", "")
        result = await self.moderation.check(str(text))
        return {"moderation": result.model_dump()}

    def _step_transform(self, config: dict, ctx: dict) -> dict:
        text = str(ctx.get("text", ""))
        transform = config.get("transform", "uppercase")
        match transform:
            case "uppercase":
                return {"text": text.upper()}
            case "lowercase":
                return {"text": text.lower()}
            case "title":
                return {"text": text.title()}
            case "reverse":
                return {"text": text[::-1]}
            case "summarize":
                # Truncate to first 500 chars as a demo summarization
                return {"text": text[:500] + ("..." if len(text) > 500 else "")}
            case "word_count":
                return {"text": text, "word_count": len(text.split())}
            case _:
                return {"text": text}
