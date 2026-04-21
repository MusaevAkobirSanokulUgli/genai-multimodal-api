# GenAI Multi-Modal API

Production-grade multi-modal AI API platform — portfolio project for a Senior Python AI Engineer position.

## What This Demonstrates

| Skill | Implementation |
|---|---|
| Multi-modal GenAI | Text (GPT-4o), Vision (GPT-4o), Image (DALL-E 3), Audio (Whisper + TTS) |
| FastAPI + Pydantic v2 | Strict schemas, field validators, ConfigDict, pattern constraints |
| Async pipeline processing | `PipelineEngine` with sequential step execution and context threading |
| MCP Protocol concepts | Session resources, tools, message history, prompt templates |
| SSE Streaming | `AsyncGenerator` + `StreamingResponse` for token-by-token output |
| Content moderation | Compiled regex hard-blocks, heuristic scoring, batch async check |
| Batch processing | `asyncio.gather` for concurrent vision analysis and moderation |
| Production patterns | Dependency injection, semaphore concurrency control, lifespan hooks |

---

## Architecture

```
genai-multimodal-api/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app, lifespan, middleware
│   │   ├── config.py                  # pydantic-settings with GENAI_ prefix
│   │   ├── models/schemas.py          # All Pydantic v2 request/response models
│   │   ├── api/
│   │   │   ├── dependencies.py        # FastAPI Depends providers
│   │   │   └── routes/
│   │   │       ├── text.py            # /text/generate (streaming + sync)
│   │   │       ├── vision.py          # /vision/analyze + /analyze/batch
│   │   │       ├── audio.py           # /audio/tts + /audio/transcribe
│   │   │       ├── image.py           # /image/generate
│   │   │       ├── pipelines.py       # /pipelines/execute
│   │   │       ├── context.py         # MCP session CRUD + prompts
│   │   │       ├── moderation.py      # /moderation/check + batch
│   │   │       └── health.py
│   │   ├── services/
│   │   │   ├── text_generation.py     # Streaming + context-aware completion
│   │   │   ├── vision_service.py      # Single + batch image analysis
│   │   │   ├── audio_service.py       # TTS + Whisper STT
│   │   │   ├── image_generation.py    # DALL-E 3 with moderation gate
│   │   │   ├── pipeline_engine.py     # Multi-modal step orchestrator
│   │   │   ├── moderation.py          # Rule-based content safety
│   │   │   └── context_protocol.py    # MCP-inspired session store
│   │   └── utils/
│   │       ├── streaming.py           # SSE wrapping utilities
│   │       └── media.py               # Base64, MIME, URL helpers
│   └── tests/
│       ├── conftest.py                # ASGI test client fixture
│       ├── test_moderation.py         # 8 moderation unit tests
│       ├── test_context.py            # 20 context manager tests
│       ├── test_pipeline.py           # 12 pipeline tests (no API calls)
│       └── test_api.py                # 20 integration tests
└── web/                               # Next.js 15 showcase site
```

---

## API Endpoints

### Text
```
POST /api/v1/text/generate
  stream: bool — SSE streaming if true
  context_id: str | null — MCP session for multi-turn context
```

### Vision
```
POST /api/v1/vision/analyze         # single image
POST /api/v1/vision/analyze/batch   # concurrent asyncio.gather
```

### Image
```
POST /api/v1/image/generate         # DALL-E 3, HD quality, size options
```

### Audio
```
POST /api/v1/audio/tts              # text → base64 MP3/WAV/FLAC/OGG
POST /api/v1/audio/transcribe       # file upload → Whisper STT
```

### Pipelines
```
POST /api/v1/pipelines/execute      # run multi-modal step sequence
```

### Moderation
```
POST /api/v1/moderation/check       # single content check
POST /api/v1/moderation/check/batch # batch async check
```

### Context (MCP)
```
POST   /api/v1/context/sessions           # create session
GET    /api/v1/context/sessions           # list all
GET    /api/v1/context/sessions/:id       # get by ID
DELETE /api/v1/context/sessions/:id       # delete
POST   /api/v1/context/sessions/:id/resources  # add resource
POST   /api/v1/context/sessions/:id/tools      # add tool
POST   /api/v1/context/prompts                 # register template
POST   /api/v1/context/prompts/render          # render template
```

---

## Quick Start

### Backend

```bash
cd backend

# Install dependencies
pip install -e ".[dev]"

# Configure environment
cp .env.example .env
# Edit .env and set GENAI_OPENAI_API_KEY=sk-...

# Run development server
uvicorn app.main:app --reload --port 8000

# Run tests (no API key required for most tests)
pytest -v
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd web
npm install
npm run dev   # http://localhost:3000
```

### Docker Compose

```bash
# Set your API key
echo "GENAI_OPENAI_API_KEY=sk-..." > backend/.env

docker-compose up --build
```

API: http://localhost:8000
Web: http://localhost:3000

---

## Key Design Decisions

### Async concurrency control
Every service uses `asyncio.Semaphore` — 10 for text/vision/audio, 5 for image generation (expensive). This prevents rate-limit cascades under load.

### Service layer pattern
Routes are thin: they resolve dependencies and delegate to service classes. Services are stateless and re-instantiated per request, receiving shared state (moderation, context) via FastAPI `Depends`.

### MCP context injection
When `context_id` is present in a text generation request, the `ContextManager` injects attached resources as system messages and the last 10 conversation turns before the user prompt. The session store uses `OrderedDict` for O(1) LRU eviction.

### Pipeline engine
`PipelineEngine._execute_step` uses Python 3.10+ `match` syntax for clean step dispatch. The accumulated context dict threads through all steps — each step's output is merged into the shared context before the next step runs.

### Moderation pipeline
Pre-compiled regex patterns are evaluated in O(n) without re-compilation per request. Hard-block patterns return immediately; soft-flag patterns accumulate a score dict for threshold comparison.

---

## Test Coverage

Tests that run without an OpenAI API key:

- `test_moderation.py` — all 8 tests (pure Python logic)
- `test_context.py` — all 20 tests (in-memory store)
- `test_pipeline.py` — transform and moderate steps (12 tests)
- `test_api.py` — health, moderation, context, pipeline transform, validation (20 tests)

Run with: `pytest tests/ -v -k "not openai"`

---

## Environment Variables

All variables use the `GENAI_` prefix:

| Variable | Default | Description |
|---|---|---|
| `GENAI_OPENAI_API_KEY` | `""` | OpenAI API key |
| `GENAI_DEFAULT_LLM` | `gpt-4o` | Default completion model |
| `GENAI_DEFAULT_IMAGE_MODEL` | `dall-e-3` | Default image model |
| `GENAI_MODERATION_ENABLED` | `true` | Enable moderation pipeline |
| `GENAI_MODERATION_THRESHOLD` | `0.5` | Flagging threshold (0–1) |
| `GENAI_MAX_CONCURRENT_REQUESTS` | `10` | Semaphore limit |
| `GENAI_DEBUG` | `false` | Debug mode |
