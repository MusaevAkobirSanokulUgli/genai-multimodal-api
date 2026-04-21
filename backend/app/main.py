"""
GenAI Multi-Modal API — application entry point.

Lifecycle:
- Startup: initialise shared services (moderation, context manager)
- Routes: text, vision, audio, image, pipelines, context, moderation, health
- CORS:   wide-open for development; tighten in production
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import audio, context, health, image, moderation, pipelines, text, vision
from app.config import settings
from app.services.context_protocol import ContextManager
from app.services.moderation import ModerationService


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    app.state.moderation = ModerationService(threshold=settings.moderation_threshold)
    app.state.context_manager = ContextManager(max_sessions=200)
    yield
    # --- Shutdown (nothing to clean up for now) ---


app = FastAPI(
    title=settings.app_name,
    description=(
        "Production-grade multi-modal AI API demonstrating text generation with "
        "streaming, vision analysis, text-to-speech, image generation, async "
        "pipeline orchestration, content moderation, and MCP-inspired context management."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"

app.include_router(health.router, prefix=PREFIX)
app.include_router(text.router, prefix=PREFIX)
app.include_router(vision.router, prefix=PREFIX)
app.include_router(audio.router, prefix=PREFIX)
app.include_router(image.router, prefix=PREFIX)
app.include_router(pipelines.router, prefix=PREFIX)
app.include_router(context.router, prefix=PREFIX)
app.include_router(moderation.router, prefix=PREFIX)
