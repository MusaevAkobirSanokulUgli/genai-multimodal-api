"""
Audio service — Text-to-Speech and Speech-to-Text.

TTS:  OpenAI tts-1 / tts-1-hd, returns base64-encoded audio
STT:  OpenAI whisper-1, returns transcript + optional language tag
"""

import asyncio
import base64
import time

from openai import AsyncOpenAI

from app.config import settings
from app.models.schemas import (
    TextToSpeechRequest,
    TextToSpeechResponse,
    TranscriptionResponse,
)


class AudioService:
    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self._semaphore = asyncio.Semaphore(settings.max_concurrent_requests)

    async def text_to_speech(self, request: TextToSpeechRequest) -> TextToSpeechResponse:
        """Convert text to speech and return base64-encoded audio bytes."""
        start = time.perf_counter()

        async with self._semaphore:
            response = await self.client.audio.speech.create(
                model=request.model,
                voice=request.voice.value,
                input=request.text,
                response_format=request.format.value,
                speed=request.speed,
            )

        audio_bytes = response.content
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

        # Rough duration estimate: average 150 wpm adjusted for speed
        words = len(request.text.split())
        wpm = 150 * request.speed
        duration_est_ms = int((words / max(wpm, 1)) * 60 * 1000)

        latency = (time.perf_counter() - start) * 1000

        return TextToSpeechResponse(
            audio_base64=audio_b64,
            format=request.format,
            duration_estimate_ms=duration_est_ms,
            latency_ms=latency,
        )

    async def transcribe(
        self, audio_bytes: bytes, filename: str = "audio.wav"
    ) -> TranscriptionResponse:
        """Transcribe audio bytes to text via Whisper."""
        start = time.perf_counter()

        async with self._semaphore:
            response = await self.client.audio.transcriptions.create(
                model=settings.default_stt_model,
                file=(filename, audio_bytes),
                response_format="verbose_json",
            )

        latency = (time.perf_counter() - start) * 1000

        return TranscriptionResponse(
            text=response.text,
            language=getattr(response, "language", None),
            duration_ms=getattr(response, "duration", None),
            latency_ms=latency,
        )
