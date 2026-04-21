import Link from "next/link";
import {
  Zap,
  Cpu,
  Network,
  Code2,
  Database,
  Activity,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  Eye,
  ImageIcon,
  Mic,
  GitBranch,
  Shield,
  Flame,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModalityCard from "@/components/ModalityCard";
import PipelineDiagram from "@/components/PipelineDiagram";
import MultiModalDemo from "@/components/MultiModalDemo";
import CodeExample from "@/components/CodeExample";

// ─── Static Data ────────────────────────────────────────────────────────────

const MODALITIES = [
  {
    iconName: "MessageSquare",
    title: "Text Generation",
    subtitle: "LLM · SSE",
    description:
      "GPT-4o completions with SSE streaming, multi-turn context, system prompts, temperature control, and token tracking.",
    features: [
      { label: "SSE streaming via AsyncGenerator" },
      { label: "Multi-turn context with MCP sessions" },
      { label: "Moderation gate pre-call" },
      { label: "Configurable temperature & max_tokens" },
    ],
    gradient: "from-amber-500 to-amber-700",
    glowColor: "rgba(245,158,11,0.25)",
    endpoint: "POST /api/v1/text/generate",
  },
  {
    iconName: "Eye",
    title: "Vision Analysis",
    subtitle: "Multimodal",
    description:
      "GPT-4o vision for image understanding. Accepts URLs or data URIs. Batch analysis via asyncio.gather for concurrent processing.",
    features: [
      { label: "URL and data-URI image support" },
      { label: "Batch concurrent analysis" },
      { label: "Configurable detail level" },
      { label: "Token and latency reporting" },
    ],
    gradient: "from-orange-400 to-orange-600",
    glowColor: "rgba(251,146,60,0.25)",
    endpoint: "POST /api/v1/vision/analyze",
  },
  {
    iconName: "Image",
    title: "Image Generation",
    subtitle: "DALL-E 3",
    description:
      "DALL-E 3 image generation with size, quality, and style control. Moderation pipeline blocks harmful prompts before the API call.",
    features: [
      { label: "1024×1024, 1792×1024, 1024×1792" },
      { label: "Standard / HD quality modes" },
      { label: "Vivid / Natural style options" },
      { label: "Prompt moderation pre-check" },
    ],
    gradient: "from-amber-400 to-amber-600",
    glowColor: "rgba(251,191,36,0.25)",
    endpoint: "POST /api/v1/image/generate",
    badge: "DALL-E 3",
  },
  {
    iconName: "Mic",
    title: "Audio (TTS & STT)",
    subtitle: "Whisper + TTS",
    description:
      "Text-to-Speech with 6 voice options and speed control. Speech-to-Text via Whisper with language detection and duration output.",
    features: [
      { label: "6 voices: alloy, echo, fable, onyx, nova, shimmer" },
      { label: "MP3, WAV, FLAC, OGG output formats" },
      { label: "Whisper STT with language detection" },
      { label: "Base64-encoded audio response" },
    ],
    gradient: "from-orange-500 to-orange-700",
    glowColor: "rgba(249,115,22,0.25)",
    endpoint: "POST /api/v1/audio/tts",
  },
  {
    iconName: "GitBranch",
    title: "Pipeline Orchestration",
    subtitle: "Async Pipeline",
    description:
      "Chain heterogeneous AI steps into declarative pipelines. Context propagates between steps; any step failure triggers graceful abort.",
    features: [
      { label: "Up to 10 steps per pipeline" },
      { label: "Cross-step output propagation" },
      { label: "Per-step latency tracking" },
      { label: "Graceful failure handling" },
    ],
    gradient: "from-amber-500 to-orange-500",
    glowColor: "rgba(245,158,11,0.25)",
    endpoint: "POST /api/v1/pipelines/execute",
  },
  {
    iconName: "Shield",
    title: "Content Moderation",
    subtitle: "Safety",
    description:
      "Multi-layer moderation: compiled regex patterns for hard blocks, heuristic scoring for soft flags, and batch async processing.",
    features: [
      { label: "Compiled regex hard-block patterns" },
      { label: "Heuristic risk scoring" },
      { label: "Batch concurrent moderation" },
      { label: "Safe / Flagged / Blocked categories" },
    ],
    gradient: "from-stone-500 to-stone-600",
    glowColor: "rgba(168,162,158,0.2)",
    endpoint: "POST /api/v1/moderation/check",
  },
];

const ARCH_FEATURES = [
  {
    icon: Zap,
    title: "Async-First Architecture",
    description:
      "Every I/O path uses asyncio — semaphore-controlled concurrency, asyncio.gather for batch ops, no blocking calls.",
    accent: "#F59E0B",
  },
  {
    icon: Cpu,
    title: "Pydantic v2 Validation",
    description:
      "Strict input validation with custom field validators, ConfigDict, pattern constraints, and comprehensive enums.",
    accent: "#FB923C",
  },
  {
    icon: Network,
    title: "MCP-Inspired Context",
    description:
      "LRU-evicted session store with resources, tools, and message history — based on Model Context Protocol concepts.",
    accent: "#FBBF24",
  },
  {
    icon: Code2,
    title: "SSE Streaming",
    description:
      "Server-Sent Events via FastAPI StreamingResponse wrapping an AsyncGenerator — tokens stream as they arrive.",
    accent: "#F97316",
  },
  {
    icon: Database,
    title: "Service Layer Pattern",
    description:
      "Clean separation: routes delegate to service classes, shared state via FastAPI dependency injection.",
    accent: "#F59E0B",
  },
  {
    icon: Activity,
    title: "Observability Built-in",
    description:
      "Every response includes latency_ms, tokens_used, and moderation metadata for production monitoring.",
    accent: "#FB923C",
  },
];

const TECH_PILLS = [
  "FastAPI 0.115", "Pydantic v2", "OpenAI SDK 1.x", "GPT-4o",
  "DALL-E 3", "Whisper", "asyncio", "SSE Streaming", "MCP Protocol", "Python 3.12",
];

const PIPELINE_CODE = `# Declarative multi-modal pipeline — one HTTP call
POST /api/v1/pipelines/execute
{
  "name": "text-to-image-to-narration",
  "steps": [
    {
      "step_type": "moderate",
      "config": {}
    },
    {
      "step_type": "text_generate",
      "config": {
        "prompt": "Write a vivid scene description",
        "temperature": 0.9
      }
    },
    {
      "step_type": "image_generate",
      "config": {
        "model": "dall-e-3",
        "size": "1792x1024",
        "quality": "hd"
      }
    },
    {
      "step_type": "audio_generate",
      "config": {
        "voice": "nova",
        "speed": 1.1
      }
    }
  ],
  "initial_input": {
    "text": "A lone lighthouse at dusk"
  }
}`;

const STREAMING_CODE = `# services/text_generation.py — streaming implementation

async def stream(
    self, request: TextGenerationRequest
) -> AsyncGenerator[str, None]:
    messages = self._build_messages(request)

    async with self._semaphore:          # concurrency control
        stream = await self.client.chat.completions.create(
            model=request.model,
            messages=messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=True,                  # SSE from OpenAI
        )

        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta               # token-by-token

# utils/streaming.py — SSE wrapper
async def sse_stream(
    generator: AsyncGenerator[str, None]
) -> AsyncGenerator[str, None]:
    async for chunk in generator:
        yield f"data: {json.dumps({'content': chunk})}\\n\\n"
    yield "data: [DONE]\\n\\n"`;

const MCP_CODE = `# MCP-inspired context session workflow

# 1. Create a session with resources
POST /api/v1/context/sessions
{
  "resources": [{
    "uri": "file:///docs/api-guide.md",
    "name": "API Guide",
    "description": "Internal API documentation",
    "mime_type": "text/markdown",
    "content": "# API Guide\\n..."
  }]
}
# → { "id": "sess_abc123", ... }

# 2. Use context in text generation
POST /api/v1/text/generate
{
  "prompt": "Summarize the authentication flow",
  "context_id": "sess_abc123",
  "model": "gpt-4o"
}
# Model receives the API Guide as context

# 3. Register reusable prompt template
POST /api/v1/context/prompts
{
  "name": "code_review",
  "template": "Review this {language} code:\\n{code}",
  "description": "Code review prompt"
}`;

const API_ROWS = [
  { method: "GET",    endpoint: "/api/v1/health",                    desc: "Service health check",              tag: "health" },
  { method: "POST",   endpoint: "/api/v1/text/generate",             desc: "Text completion (streaming)",       tag: "text" },
  { method: "POST",   endpoint: "/api/v1/vision/analyze",            desc: "Single image analysis",             tag: "vision" },
  { method: "POST",   endpoint: "/api/v1/vision/analyze/batch",      desc: "Batch concurrent image analysis",   tag: "vision" },
  { method: "POST",   endpoint: "/api/v1/image/generate",            desc: "DALL-E 3 image generation",         tag: "image" },
  { method: "POST",   endpoint: "/api/v1/audio/tts",                 desc: "Text-to-Speech (base64 audio)",     tag: "audio" },
  { method: "POST",   endpoint: "/api/v1/audio/transcribe",          desc: "Whisper speech transcription",      tag: "audio" },
  { method: "POST",   endpoint: "/api/v1/pipelines/execute",         desc: "Execute multi-modal pipeline",      tag: "pipelines" },
  { method: "POST",   endpoint: "/api/v1/moderation/check",          desc: "Single content moderation check",   tag: "moderation" },
  { method: "POST",   endpoint: "/api/v1/moderation/check/batch",    desc: "Batch content moderation",          tag: "moderation" },
  { method: "POST",   endpoint: "/api/v1/context/sessions",          desc: "Create MCP context session",        tag: "context" },
  { method: "GET",    endpoint: "/api/v1/context/sessions",          desc: "List all active sessions",          tag: "context" },
  { method: "GET",    endpoint: "/api/v1/context/sessions/:id",      desc: "Get session by ID",                 tag: "context" },
  { method: "DELETE", endpoint: "/api/v1/context/sessions/:id",      desc: "Delete session",                    tag: "context" },
  { method: "POST",   endpoint: "/api/v1/context/prompts",           desc: "Register prompt template",          tag: "context" },
  { method: "POST",   endpoint: "/api/v1/context/prompts/render",    desc: "Render prompt template",            tag: "context" },
];

const METHOD_STYLES: Record<string, { bg: string; color: string }> = {
  GET:    { bg: "rgba(245,158,11,0.08)", color: "#F59E0B" },
  POST:   { bg: "rgba(251,146,60,0.08)", color: "#FB923C" },
  DELETE: { bg: "rgba(239,68,68,0.08)", color: "#EF4444" },
};

const TAG_COLORS: Record<string, string> = {
  health:     "#A8A29E",
  text:       "#F59E0B",
  vision:     "#FB923C",
  image:      "#FBBF24",
  audio:      "#F97316",
  pipelines:  "#FB923C",
  moderation: "#A8A29E",
  context:    "#F59E0B",
};

// ─── Modality Icon row for hero ──────────────────────────────────────────────

const HERO_ICONS = [
  { icon: MessageSquare, label: "Text",     delay: "0s" },
  { icon: Eye,           label: "Vision",   delay: "0.4s" },
  { icon: ImageIcon,     label: "Image",    delay: "0.8s" },
  { icon: Mic,           label: "Audio",    delay: "1.2s" },
  { icon: GitBranch,     label: "Pipeline", delay: "1.6s" },
  { icon: Shield,        label: "Safety",   delay: "2s" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0C0A09" }}>
      <Header />

      {/* ─── HERO ─── */}
      <section className="relative pt-36 pb-28 overflow-hidden">
        {/* Background warm glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="absolute top-20 right-1/4 w-80 h-80 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="absolute bottom-10 left-1/4 w-64 h-64 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(245,158,11,0.8) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
            style={{
              backgroundColor: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              color: "#F59E0B",
            }}
          >
            <Flame style={{ width: 14, height: 14 }} />
            Senior Python AI Engineer Portfolio
          </div>

          {/* Heading */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6 tracking-tight"
            style={{ color: "#F5F5F4" }}
          >
            GenAI{" "}
            <span className="text-gradient-warm">Multi-Modal</span>
            <br />
            <span style={{ color: "#A8A29E", fontWeight: 800 }}>API Platform</span>
          </h1>

          <p
            className="text-lg max-w-3xl mx-auto mb-10 leading-relaxed"
            style={{ color: "#78716C" }}
          >
            Production-grade multi-modal AI API built with FastAPI, Pydantic v2, and the OpenAI SDK.
            Demonstrates text generation with SSE streaming, GPT-4o vision, DALL-E 3 image synthesis,
            Whisper audio, async pipeline orchestration, content moderation, and MCP-inspired context
            management.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              href="/demo"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #F59E0B 0%, #FB923C 100%)",
                color: "#0C0A09",
                boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
              }}
            >
              <Sparkles style={{ width: 16, height: 16 }} />
              Interactive Demo
            </Link>
            <a
              href="https://github.com/MusaevAkobirSanokulUgli/genai-multimodal-api"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200"
              style={{
                color: "#A8A29E",
                border: "1px solid rgba(245,158,11,0.15)",
                backgroundColor: "rgba(245,158,11,0.04)",
              }}
            >
              <Code2 style={{ width: 16, height: 16 }} />
              View on GitHub
            </a>
          </div>

          {/* Animated modality icons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            {HERO_ICONS.map(({ icon: Icon, label, delay }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2"
                style={{
                  animation: `float 6s ease-in-out ${delay} infinite`,
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,146,60,0.08))",
                    border: "1px solid rgba(245,158,11,0.18)",
                    boxShadow: "0 4px 16px rgba(245,158,11,0.1)",
                  }}
                >
                  <Icon style={{ width: 24, height: 24, color: "#F59E0B" }} />
                </div>
                <span className="text-xs font-medium" style={{ color: "#57534E" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Tech pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {TECH_PILLS.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: "rgba(28,25,23,0.8)",
                  border: "1px solid rgba(245,158,11,0.1)",
                  color: "#78716C",
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <div
        className="border-y py-8"
        style={{ borderColor: "rgba(245,158,11,0.1)", backgroundColor: "rgba(28,25,23,0.4)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: "6", unit: "Modalities", sub: "Text · Vision · Image · Audio · Pipeline · Safety" },
              { val: "16", unit: "API Endpoints", sub: "Full REST API surface" },
              { val: "10", unit: "Pipeline Steps", sub: "Max chain length" },
              { val: "6", unit: "TTS Voices", sub: "Alloy · Echo · Fable · Onyx · Nova · Shimmer" },
            ].map(({ val, unit, sub }) => (
              <div key={unit}>
                <div
                  className="text-4xl font-black mb-1 text-gradient-warm"
                  style={{ lineHeight: 1 }}
                >
                  {val}
                </div>
                <div className="text-sm font-bold" style={{ color: "#D6D3D1" }}>{unit}</div>
                <div className="text-xs mt-1" style={{ color: "#57534E" }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── INTERACTIVE DEMO ─── */}
      <section className="py-24" style={{ borderTop: "1px solid rgba(245,158,11,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
              style={{
                backgroundColor: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
                color: "#F59E0B",
              }}
            >
              <Sparkles style={{ width: 12, height: 12 }} />
              Live Demo
            </div>
            <h2
              className="text-3xl sm:text-4xl font-black mb-4"
              style={{ color: "#F5F5F4" }}
            >
              Interactive API Workspace
            </h2>
            <p className="max-w-2xl mx-auto text-base" style={{ color: "#78716C" }}>
              Try each modality with real inputs — upload images, enter text, configure parameters,
              build pipelines, and see results in real-time.
            </p>
          </div>
          <MultiModalDemo />
        </div>
      </section>

      {/* ─── MODALITIES ─── */}
      <section
        id="features"
        className="py-24"
        style={{ borderTop: "1px solid rgba(245,158,11,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "#F5F5F4" }}>
              Six Production Capabilities
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: "#78716C" }}>
              Each modality is an independently scalable service with clean interfaces, moderation
              integration, and full observability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODALITIES.map((m) => (
              <ModalityCard key={m.title} {...m} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── ARCHITECTURE ─── */}
      <section
        id="architecture"
        className="py-24"
        style={{ borderTop: "1px solid rgba(245,158,11,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "#F5F5F4" }}>
              Engineering Highlights
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: "#78716C" }}>
              Production patterns demonstrating senior-level Python and AI engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {ARCH_FEATURES.map((f) => (
              <div
                key={f.title}
                className="arch-card p-6 rounded-2xl"
                style={{
                  backgroundColor: "rgba(28,25,23,0.6)",
                  border: "1px solid rgba(245,158,11,0.08)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: `${f.accent}12`,
                    border: `1px solid ${f.accent}25`,
                  }}
                >
                  <f.icon style={{ width: 20, height: 20, color: f.accent }} />
                </div>
                <h3 className="font-bold mb-2 text-sm" style={{ color: "#F5F5F4" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#78716C" }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>

          <CodeExample
            title="text_generation.py + streaming.py"
            language="python"
            code={STREAMING_CODE}
            description="AsyncGenerator-based streaming with semaphore concurrency control and SSE wrapping"
          />
        </div>
      </section>

      {/* ─── PIPELINE ─── */}
      <section
        id="pipeline"
        className="py-24"
        style={{ borderTop: "1px solid rgba(245,158,11,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
                style={{
                  backgroundColor: "rgba(245,158,11,0.08)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  color: "#F59E0B",
                }}
              >
                <RefreshCw style={{ width: 12, height: 12 }} />
                Pipeline Engine
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-6" style={{ color: "#F5F5F4" }}>
                Multi-Modal Pipeline Orchestration
              </h2>
              <p className="leading-relaxed mb-6 text-sm" style={{ color: "#78716C" }}>
                Define declarative pipelines of up to 10 heterogeneous AI steps. The{" "}
                <code
                  className="px-1.5 py-0.5 rounded"
                  style={{
                    color: "#F59E0B",
                    backgroundColor: "rgba(245,158,11,0.08)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  PipelineEngine
                </code>{" "}
                threads context between steps, propagates outputs, and handles failures gracefully.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Sequential step execution with shared context dict",
                  "input_from reference for cross-step output access",
                  "Moderation gate can be inserted at any position",
                  "Automatic failure detection and pipeline abort",
                  "Per-step and total latency in milliseconds",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm" style={{ color: "#A8A29E" }}>
                    <ChevronRight
                      style={{ width: 14, height: 14, color: "#F59E0B", flexShrink: 0, marginTop: 2 }}
                    />
                    {item}
                  </div>
                ))}
              </div>
              <CodeExample
                title="Pipeline request"
                language="json"
                code={PIPELINE_CODE}
              />
            </div>

            <div>
              <h3
                className="text-lg font-bold mb-6 text-center"
                style={{ color: "#F5F5F4" }}
              >
                Step-by-Step Execution
              </h3>
              <PipelineDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* ─── MCP CONTEXT ─── */}
      <section
        id="context"
        className="py-24"
        style={{ borderTop: "1px solid rgba(245,158,11,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
                style={{
                  backgroundColor: "rgba(251,146,60,0.08)",
                  border: "1px solid rgba(251,146,60,0.2)",
                  color: "#FB923C",
                }}
              >
                <Network style={{ width: 12, height: 12 }} />
                MCP Protocol
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-6" style={{ color: "#F5F5F4" }}>
                MCP-Inspired Context Management
              </h2>
              <p className="leading-relaxed mb-6 text-sm" style={{ color: "#78716C" }}>
                Implements core Model Context Protocol concepts — Resources, Tools, Sessions, and
                Prompts — as a stateful in-memory store with LRU eviction.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: "Resources", desc: "Documents, files, embeddings attached per-session" },
                  { label: "Tools",     desc: "Capability descriptors the model can reference" },
                  { label: "Sessions",  desc: "LRU-evicted, cap 200, ring-buffer message history" },
                  { label: "Prompts",   desc: "Reusable templates with Python format() rendering" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-4 rounded-2xl"
                    style={{
                      backgroundColor: "rgba(28,25,23,0.6)",
                      border: "1px solid rgba(245,158,11,0.1)",
                    }}
                  >
                    <h4 className="font-bold text-sm mb-1" style={{ color: "#F59E0B" }}>
                      {item.label}
                    </h4>
                    <p className="text-xs leading-relaxed" style={{ color: "#78716C" }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <CodeExample
              title="MCP Context API"
              language="http"
              code={MCP_CODE}
              description="Full session lifecycle: create → attach resources → generate with context"
            />
          </div>
        </div>
      </section>

      {/* ─── API REFERENCE ─── */}
      <section
        id="api"
        className="py-24"
        style={{ borderTop: "1px solid rgba(245,158,11,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: "#F5F5F4" }}>
              API Reference
            </h2>
            <p style={{ color: "#78716C" }}>
              All endpoints, methods, and descriptions at a glance.
            </p>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "rgba(28,25,23,0.7)",
              border: "1px solid rgba(245,158,11,0.1)",
            }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "rgba(12,10,9,0.5)", borderBottom: "1px solid rgba(245,158,11,0.08)" }}>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "#57534E" }}>
                    Method
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: "#57534E" }}>
                    Endpoint
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider hidden md:table-cell" style={{ color: "#57534E" }}>
                    Description
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider hidden lg:table-cell" style={{ color: "#57534E" }}>
                    Tag
                  </th>
                </tr>
              </thead>
              <tbody>
                {API_ROWS.map((row, i) => (
                  <tr
                    key={i}
                    className="api-row"
                    style={{ borderBottom: "1px solid rgba(245,158,11,0.04)" }}
                  >
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-black"
                        style={{
                          backgroundColor: (METHOD_STYLES[row.method] || METHOD_STYLES.GET).bg,
                          color: (METHOD_STYLES[row.method] || METHOD_STYLES.GET).color,
                        }}
                      >
                        {row.method}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs" style={{ color: "#A8A29E" }}>
                      {row.endpoint}
                    </td>
                    <td className="px-5 py-3.5 text-sm hidden md:table-cell" style={{ color: "#78716C" }}>
                      {row.desc}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: TAG_COLORS[row.tag] || "#78716C" }}
                      >
                        {row.tag}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CTA */}
          <div
            className="mt-8 p-8 rounded-2xl text-center"
            style={{
              backgroundColor: "rgba(28,25,23,0.5)",
              border: "1px solid rgba(245,158,11,0.1)",
            }}
          >
            <h3 className="font-bold text-lg mb-3" style={{ color: "#F5F5F4" }}>
              Ready to Explore?
            </h3>
            <p className="text-sm mb-6 max-w-xl mx-auto" style={{ color: "#78716C" }}>
              Browse the full source code and README on GitHub, or try the interactive demo workspace above.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://github.com/MusaevAkobirSanokulUgli/genai-multimodal-api"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: "linear-gradient(135deg, #F59E0B, #FB923C)",
                  color: "#0C0A09",
                  boxShadow: "0 2px 12px rgba(245,158,11,0.3)",
                }}
              >
                View on GitHub
                <ArrowRight style={{ width: 14, height: 14 }} />
              </a>
              <Link
                href="/demo"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm"
                style={{
                  border: "1px solid rgba(245,158,11,0.2)",
                  backgroundColor: "rgba(245,158,11,0.04)",
                  color: "#A8A29E",
                }}
              >
                Try Demo
                <Sparkles style={{ width: 14, height: 14 }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
