import Link from "next/link";
import {
  Zap,
  Cpu,
  Network,
  ArrowRight,
  Code2,
  Database,
  Activity,
  RefreshCw,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModalityCard from "@/components/ModalityCard";
import PipelineDiagram from "@/components/PipelineDiagram";
import MultiModalDemo from "@/components/MultiModalDemo";
import CodeExample from "@/components/CodeExample";

// --- Static data ---

const MODALITIES = [
  {
    iconName: "MessageSquare",
    title: "Text Generation",
    subtitle: "LLM",
    description:
      "GPT-4o completions with SSE streaming, multi-turn context, system prompts, temperature control, and token tracking.",
    features: [
      { label: "SSE streaming via AsyncGenerator" },
      { label: "Multi-turn context with MCP sessions" },
      { label: "Moderation gate pre-call" },
      { label: "Configurable temperature & max_tokens" },
    ],
    gradient: "from-brand-500 to-brand-700",
    glowColor: "rgba(61,86,255,0.25)",
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
    gradient: "from-cyan-500 to-cyan-700",
    glowColor: "rgba(6,182,212,0.25)",
    endpoint: "POST /api/v1/vision/analyze",
  },
  {
    iconName: "Image",
    title: "Image Generation",
    subtitle: "DALL-E 3",
    description:
      "DALL-E 3 image generation with size, quality, and style control. Moderation pipeline blocks harmful prompts before the API call.",
    features: [
      { label: "1024x1024, 1792x1024, 1024x1792" },
      { label: "Standard / HD quality modes" },
      { label: "Vivid / Natural style options" },
      { label: "Prompt moderation pre-check" },
    ],
    gradient: "from-purple-500 to-purple-700",
    glowColor: "rgba(168,85,247,0.25)",
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
    gradient: "from-pink-500 to-pink-700",
    glowColor: "rgba(236,72,153,0.25)",
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
    gradient: "from-emerald-500 to-emerald-700",
    glowColor: "rgba(16,185,129,0.25)",
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
    gradient: "from-amber-500 to-amber-700",
    glowColor: "rgba(245,158,11,0.25)",
    endpoint: "POST /api/v1/moderation/check",
  },
];

const ARCH_FEATURES = [
  {
    icon: Zap,
    title: "Async-First Architecture",
    description:
      "Every I/O path uses asyncio — semaphore-controlled concurrency, asyncio.gather for batch ops, no blocking calls.",
    color: "text-brand-400",
  },
  {
    icon: Cpu,
    title: "Pydantic v2 Validation",
    description:
      "Strict input validation with custom field validators, ConfigDict, pattern constraints, and comprehensive enums.",
    color: "text-cyan-400",
  },
  {
    icon: Network,
    title: "MCP-Inspired Context",
    description:
      "LRU-evicted session store with resources, tools, and message history — based on Model Context Protocol concepts.",
    color: "text-purple-400",
  },
  {
    icon: Code2,
    title: "SSE Streaming",
    description:
      "Server-Sent Events via FastAPI StreamingResponse wrapping an AsyncGenerator — tokens stream as they arrive.",
    color: "text-emerald-400",
  },
  {
    icon: Database,
    title: "Service Layer Pattern",
    description:
      "Clean separation: routes delegate to service classes, shared state via FastAPI dependency injection.",
    color: "text-amber-400",
  },
  {
    icon: Activity,
    title: "Observability Built-in",
    description:
      "Every response includes latency_ms, tokens_used, and moderation metadata for production monitoring.",
    color: "text-pink-400",
  },
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#020617]">
      <Header />

      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            Senior Python AI Engineer Portfolio Project
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
            GenAI{" "}
            <span className="bg-gradient-to-r from-brand-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Multi-Modal
            </span>
            <br />
            API Platform
          </h1>

          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Production-grade multi-modal AI API built with FastAPI, Pydantic v2, and the OpenAI SDK.
            Demonstrates text generation with SSE streaming, GPT-4o vision, DALL-E 3 image synthesis,
            Whisper audio, async pipeline orchestration, content moderation, and MCP-inspired context
            management.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              href="/demo"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white
                         bg-gradient-to-r from-brand-600 to-cyan-600 shadow-xl shadow-brand-500/25
                         hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all"
            >
              <Play className="w-4 h-4" />
              Interactive Demo
            </Link>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white
                         border border-white/10 bg-white/5 hover:bg-white/10 hover:-translate-y-0.5
                         transition-all"
            >
              <Code2 className="w-4 h-4" />
              API Docs
            </a>
          </div>

          {/* Tech pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              "FastAPI 0.115",
              "Pydantic v2",
              "OpenAI SDK 1.x",
              "GPT-4o",
              "DALL-E 3",
              "Whisper",
              "asyncio",
              "SSE Streaming",
              "MCP Protocol",
              "Python 3.12",
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/5 text-slate-400"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* LIVE DEMO PREVIEW                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Interactive API Explorer
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Try each modality live. See the request format and simulated response for all four
              AI capabilities.
            </p>
          </div>
          <MultiModalDemo />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* MODALITIES                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section id="features" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Six Production Capabilities
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Each modality is an independently scalable service with clean interfaces, moderation
              integration, and full observability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODALITIES.map((m) => (
              <ModalityCard key={m.title} {...m} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* ARCHITECTURE                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section id="architecture" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Engineering Highlights
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Production patterns that demonstrate senior-level Python and AI engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {ARCH_FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <f.icon className={`w-8 h-8 ${f.color} mb-4`} />
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>

          {/* Streaming code */}
          <CodeExample
            title="text_generation.py + streaming.py"
            language="python"
            code={STREAMING_CODE}
            description="AsyncGenerator-based streaming with semaphore concurrency control and SSE wrapping"
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* PIPELINE                                                             */}
      {/* ------------------------------------------------------------------ */}
      <section id="pipeline" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-6">
                <RefreshCw className="w-3 h-3" />
                Pipeline Engine
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Multi-Modal Pipeline Orchestration
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Define declarative pipelines of up to 10 heterogeneous AI steps. The{" "}
                <code className="text-emerald-300 bg-white/5 px-1.5 py-0.5 rounded">
                  PipelineEngine
                </code>{" "}
                threads context between steps, propagates outputs, and handles failures gracefully
                with per-step latency tracking.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Sequential step execution with shared context dict",
                  "input_from reference for cross-step output access",
                  "Moderation gate can be inserted at any position",
                  "Automatic failure detection and pipeline abort",
                  "Per-step and total latency in milliseconds",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
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

            {/* Pipeline Diagram */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 text-center">
                Step-by-Step Execution
              </h3>
              <PipelineDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* MCP CONTEXT                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section id="context" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-6">
                <Network className="w-3 h-3" />
                MCP Protocol
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                MCP-Inspired Context Management
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Implements core Model Context Protocol concepts — Resources, Tools, Sessions, and
                Prompts — as a stateful in-memory store with LRU eviction. Context sessions are
                injected into text generation requests for multi-turn conversations with document
                context.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: "Resources", desc: "Documents, files, embeddings attached per-session" },
                  { label: "Tools", desc: "Capability descriptors the model can reference" },
                  { label: "Sessions", desc: "LRU-evicted, cap 200, ring-buffer message history" },
                  { label: "Prompts", desc: "Reusable templates with Python format() rendering" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-4 rounded-xl border border-purple-500/15 bg-purple-500/5"
                  >
                    <h4 className="text-purple-300 font-semibold text-sm mb-1">{item.label}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
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

      {/* ------------------------------------------------------------------ */}
      {/* API REFERENCE                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section id="api" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">API Reference</h2>
            <p className="text-slate-400">All endpoints, methods, and descriptions at a glance.</p>
          </div>

          <div className="rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5">
                  <th className="text-left px-6 py-4 text-slate-400 font-semibold">Method</th>
                  <th className="text-left px-6 py-4 text-slate-400 font-semibold">Endpoint</th>
                  <th className="text-left px-6 py-4 text-slate-400 font-semibold hidden md:table-cell">
                    Description
                  </th>
                  <th className="text-left px-6 py-4 text-slate-400 font-semibold hidden lg:table-cell">
                    Tag
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { method: "GET", endpoint: "/api/v1/health", desc: "Service health check", tag: "health" },
                  { method: "POST", endpoint: "/api/v1/text/generate", desc: "Text completion (streaming supported)", tag: "text" },
                  { method: "POST", endpoint: "/api/v1/vision/analyze", desc: "Single image analysis", tag: "vision" },
                  { method: "POST", endpoint: "/api/v1/vision/analyze/batch", desc: "Batch concurrent image analysis", tag: "vision" },
                  { method: "POST", endpoint: "/api/v1/image/generate", desc: "DALL-E 3 image generation", tag: "image" },
                  { method: "POST", endpoint: "/api/v1/audio/tts", desc: "Text-to-Speech (base64 audio)", tag: "audio" },
                  { method: "POST", endpoint: "/api/v1/audio/transcribe", desc: "Whisper speech transcription", tag: "audio" },
                  { method: "POST", endpoint: "/api/v1/pipelines/execute", desc: "Execute multi-modal pipeline", tag: "pipelines" },
                  { method: "POST", endpoint: "/api/v1/moderation/check", desc: "Single content moderation check", tag: "moderation" },
                  { method: "POST", endpoint: "/api/v1/moderation/check/batch", desc: "Batch content moderation", tag: "moderation" },
                  { method: "POST", endpoint: "/api/v1/context/sessions", desc: "Create MCP context session", tag: "context" },
                  { method: "GET", endpoint: "/api/v1/context/sessions", desc: "List all active sessions", tag: "context" },
                  { method: "GET", endpoint: "/api/v1/context/sessions/:id", desc: "Get session by ID", tag: "context" },
                  { method: "DELETE", endpoint: "/api/v1/context/sessions/:id", desc: "Delete session", tag: "context" },
                  { method: "POST", endpoint: "/api/v1/context/prompts", desc: "Register prompt template", tag: "context" },
                  { method: "POST", endpoint: "/api/v1/context/prompts/render", desc: "Render prompt template", tag: "context" },
                ].map((row, i) => {
                  const methodColors: Record<string, string> = {
                    GET: "bg-emerald-500/10 text-emerald-400",
                    POST: "bg-brand-500/10 text-brand-300",
                    DELETE: "bg-red-500/10 text-red-400",
                  };
                  const tagColors: Record<string, string> = {
                    health: "text-emerald-400",
                    text: "text-brand-400",
                    vision: "text-cyan-400",
                    image: "text-purple-400",
                    audio: "text-pink-400",
                    pipelines: "text-emerald-400",
                    moderation: "text-amber-400",
                    context: "text-violet-400",
                  };
                  return (
                    <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${methodColors[row.method]}`}>
                          {row.method}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-xs text-slate-300">{row.endpoint}</td>
                      <td className="px-6 py-3.5 text-slate-400 hidden md:table-cell">{row.desc}</td>
                      <td className="px-6 py-3.5 hidden lg:table-cell">
                        <span className={`text-xs font-semibold ${tagColors[row.tag]}`}>{row.tag}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Inline Play component to avoid extra import
function Play({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
