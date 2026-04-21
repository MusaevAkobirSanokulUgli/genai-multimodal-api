from pydantic import BaseModel, Field, ConfigDict, field_validator
from enum import Enum
from datetime import datetime
from uuid import UUID, uuid4


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class Modality(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VISION = "vision"


class ImageSize(str, Enum):
    SMALL = "256x256"
    MEDIUM = "512x512"
    LARGE = "1024x1024"
    WIDE = "1792x1024"
    TALL = "1024x1792"


class AudioVoice(str, Enum):
    ALLOY = "alloy"
    ECHO = "echo"
    FABLE = "fable"
    ONYX = "onyx"
    NOVA = "nova"
    SHIMMER = "shimmer"


class AudioFormat(str, Enum):
    MP3 = "mp3"
    WAV = "wav"
    FLAC = "flac"
    OGG = "ogg"


class PipelineStepType(str, Enum):
    TEXT_GENERATE = "text_generate"
    IMAGE_GENERATE = "image_generate"
    IMAGE_ANALYZE = "image_analyze"
    AUDIO_GENERATE = "audio_generate"
    AUDIO_TRANSCRIBE = "audio_transcribe"
    MODERATE = "moderate"
    TRANSFORM = "transform"


class ContentCategory(str, Enum):
    SAFE = "safe"
    FLAGGED = "flagged"
    BLOCKED = "blocked"


# ---------------------------------------------------------------------------
# Text Generation
# ---------------------------------------------------------------------------


class TextGenerationRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    prompt: str = Field(..., min_length=1, max_length=10000)
    system_prompt: str = Field(default="You are a helpful assistant.", max_length=5000)
    model: str = "gpt-4o"
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=2000, ge=1, le=16384)
    stream: bool = False
    context_id: str | None = None

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Prompt cannot be empty")
        return v.strip()


class TextGenerationResponse(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    content: str
    model: str
    tokens_used: int | None = None
    moderation: dict | None = None
    context_id: str | None = None
    latency_ms: float


# ---------------------------------------------------------------------------
# Vision Analysis
# ---------------------------------------------------------------------------


class VisionAnalysisRequest(BaseModel):
    image_url: str = Field(..., min_length=1)
    prompt: str = Field(default="Describe this image in detail.")
    model: str = "gpt-4o"
    max_tokens: int = Field(default=1000, ge=1, le=4096)


class VisionAnalysisResponse(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    description: str
    model: str
    tokens_used: int | None = None
    latency_ms: float


# ---------------------------------------------------------------------------
# Image Generation
# ---------------------------------------------------------------------------


class ImageGenerationRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    prompt: str = Field(..., min_length=1, max_length=4000)
    model: str = "dall-e-3"
    size: ImageSize = ImageSize.LARGE
    quality: str = Field(default="standard", pattern="^(standard|hd)$")
    n: int = Field(default=1, ge=1, le=4)
    style: str = Field(default="vivid", pattern="^(vivid|natural)$")


class ImageGenerationResponse(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    images: list[dict]  # [{url, revised_prompt}]
    model: str
    moderation: dict | None = None
    latency_ms: float


# ---------------------------------------------------------------------------
# Audio
# ---------------------------------------------------------------------------


class TextToSpeechRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4096)
    voice: AudioVoice = AudioVoice.ALLOY
    model: str = "tts-1"
    format: AudioFormat = AudioFormat.MP3
    speed: float = Field(default=1.0, ge=0.25, le=4.0)


class TextToSpeechResponse(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    audio_base64: str
    format: AudioFormat
    duration_estimate_ms: int
    latency_ms: float


class TranscriptionResponse(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    text: str
    language: str | None = None
    duration_ms: float | None = None
    latency_ms: float


# ---------------------------------------------------------------------------
# Multi-modal Pipeline
# ---------------------------------------------------------------------------


class PipelineStep(BaseModel):
    step_type: PipelineStepType
    config: dict = Field(default_factory=dict)
    input_from: str | None = None  # Reference to previous step output by index


class PipelineRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=200)
    steps: list[PipelineStep] = Field(..., min_length=1, max_length=10)
    initial_input: dict = Field(default_factory=dict)

    @field_validator("steps")
    @classmethod
    def validate_steps(cls, v: list[PipelineStep]) -> list[PipelineStep]:
        if not v:
            raise ValueError("Pipeline must have at least one step")
        return v


class PipelineStepResult(BaseModel):
    step_index: int
    step_type: PipelineStepType
    status: str
    output: dict
    latency_ms: float


class PipelineResponse(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    status: str
    steps: list[PipelineStepResult] = Field(default_factory=list)
    final_output: dict = Field(default_factory=dict)
    total_latency_ms: float


# ---------------------------------------------------------------------------
# MCP-inspired Context
# ---------------------------------------------------------------------------


class ContextResource(BaseModel):
    uri: str
    name: str
    description: str
    mime_type: str
    content: str


class ContextTool(BaseModel):
    name: str
    description: str
    parameters: dict


class ContextSession(BaseModel):
    id: str
    resources: list[ContextResource] = Field(default_factory=list)
    tools: list[ContextTool] = Field(default_factory=list)
    messages: list[dict] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)


# ---------------------------------------------------------------------------
# Moderation
# ---------------------------------------------------------------------------


class ModerationResult(BaseModel):
    flagged: bool
    category: ContentCategory
    scores: dict[str, float]
    details: str | None = None


# ---------------------------------------------------------------------------
# Batch
# ---------------------------------------------------------------------------


class BatchVisionRequest(BaseModel):
    requests: list[VisionAnalysisRequest] = Field(..., min_length=1, max_length=20)


class BatchVisionResponse(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    results: list[VisionAnalysisResponse]
    total_latency_ms: float


class BatchModerationRequest(BaseModel):
    contents: list[str] = Field(..., min_length=1, max_length=50)


class BatchModerationResponse(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    results: list[ModerationResult]
    total_latency_ms: float


# ---------------------------------------------------------------------------
# Context session management (API-level schemas)
# ---------------------------------------------------------------------------


class CreateSessionRequest(BaseModel):
    resources: list[ContextResource] = Field(default_factory=list)
    tools: list[ContextTool] = Field(default_factory=list)


class AddResourceRequest(BaseModel):
    resource: ContextResource


class AddToolRequest(BaseModel):
    tool: ContextTool


class RegisterPromptRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    template: str = Field(..., min_length=1)
    description: str = ""


class RenderPromptRequest(BaseModel):
    name: str
    variables: dict = Field(default_factory=dict)
