"""
Media format utilities.

Provides helpers for base64 encoding/decoding, MIME type detection,
URL validation, and audio duration estimation.
"""

import base64
import mimetypes
import re


def get_mime_type(filename: str) -> str:
    """Return MIME type for a filename, defaulting to octet-stream."""
    mime, _ = mimetypes.guess_type(filename)
    return mime or "application/octet-stream"


def encode_base64(data: bytes) -> str:
    """Encode bytes to a URL-safe base64 string."""
    return base64.b64encode(data).decode("utf-8")


def decode_base64(data: str) -> bytes:
    """Decode a base64 string back to bytes."""
    return base64.b64decode(data)


def validate_image_url(url: str) -> bool:
    """Return True if the URL looks like an accessible image reference."""
    if url.startswith("data:image/"):
        return True
    return bool(re.match(r"^https?://", url))


def estimate_audio_duration_ms(text: str, speed: float = 1.0) -> int:
    """
    Estimate TTS audio duration in milliseconds.

    Assumes an average speaking rate of 150 words per minute,
    scaled by the requested speed multiplier.
    """
    words = len(text.split())
    wpm = max(150 * speed, 1)
    return int((words / wpm) * 60 * 1000)


def is_supported_audio_format(filename: str) -> bool:
    """Check if a filename has a supported audio extension."""
    supported = {".mp3", ".wav", ".flac", ".ogg", ".m4a", ".webm"}
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in supported


def bytes_to_data_uri(data: bytes, mime_type: str) -> str:
    """Encode raw bytes as a base64 data URI."""
    b64 = base64.b64encode(data).decode("utf-8")
    return f"data:{mime_type};base64,{b64}"
