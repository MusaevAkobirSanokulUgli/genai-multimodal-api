"""Audio routes — TTS and speech transcription."""

from fastapi import APIRouter, File, UploadFile, HTTPException

from app.models.schemas import (
    TextToSpeechRequest,
    TextToSpeechResponse,
    TranscriptionResponse,
)
from app.services.audio_service import AudioService
from app.utils.media import is_supported_audio_format

router = APIRouter(prefix="/audio", tags=["audio"])


@router.post(
    "/tts",
    response_model=TextToSpeechResponse,
    summary="Convert text to speech (base64-encoded audio)",
)
async def text_to_speech(request: TextToSpeechRequest) -> TextToSpeechResponse:
    service = AudioService()
    return await service.text_to_speech(request)


@router.post(
    "/transcribe",
    response_model=TranscriptionResponse,
    summary="Transcribe an uploaded audio file",
)
async def transcribe_audio(file: UploadFile = File(...)) -> TranscriptionResponse:
    filename = file.filename or "audio.wav"
    if not is_supported_audio_format(filename):
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported audio format. Supported: mp3, wav, flac, ogg, m4a, webm",
        )
    content = await file.read()
    service = AudioService()
    return await service.transcribe(content, filename=filename)
