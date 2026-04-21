"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Eye,
  Image,
  Mic,
  GitBranch,
  Shield,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

type DemoId =
  | "text"
  | "vision"
  | "image"
  | "audio_tts"
  | "pipeline"
  | "moderation";

interface DemoConfig {
  id: DemoId;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  description: string;
  requestLabel: string;
  request: string;
  response: string;
  latency: number;
}

// ------------------------------------------------------------------
// Demo data
// ------------------------------------------------------------------

const DEMOS: DemoConfig[] = [
  {
    id: "text",
    title: "Text Generation",
    subtitle: "GPT-4o · Streaming",
    icon: <MessageSquare className="w-5 h-5" />,
    gradient: "from-brand-500 to-brand-700",
    description:
      "Generate text completions with GPT-4o. Supports SSE streaming, context injection, system prompts, and moderation gating.",
    requestLabel: "POST /api/v1/text/generate",
    request: JSON.stringify(
      {
        prompt: "Explain async programming in Python in 3 bullet points",
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 300,
        stream: false,
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        id: "3f8d1a2b-4c5e-6789-abcd-ef0123456789",
        content:
          "• **Event Loop**: Python's asyncio runs on a single-threaded event loop that switches between coroutines when they await I/O operations, achieving concurrency without multi-threading.\n\n• **Coroutines**: Defined with `async def`, coroutines pause at `await` expressions, yielding control back to the event loop while waiting for I/O — perfect for network calls and file operations.\n\n• **Semaphores**: Use `asyncio.Semaphore` to limit concurrent coroutines, preventing resource exhaustion when batching API calls or database queries.",
        model: "gpt-4o",
        tokens_used: 127,
        latency_ms: 834.2,
        moderation: { flagged: false, category: "safe", scores: { safe: 1.0 } },
      },
      null,
      2
    ),
    latency: 834,
  },
  {
    id: "vision",
    title: "Vision Analysis",
    subtitle: "GPT-4o Vision",
    icon: <Eye className="w-5 h-5" />,
    gradient: "from-cyan-500 to-cyan-700",
    description:
      "Analyze images from URLs or data-URIs with GPT-4o vision. Batch analysis processes multiple images concurrently via asyncio.gather.",
    requestLabel: "POST /api/v1/vision/analyze",
    request: JSON.stringify(
      {
        image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",
        prompt: "Describe this image in detail, including any technical aspects",
        model: "gpt-4o",
        max_tokens: 500,
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        id: "7b8c9d0e-1f2a-3456-bcde-f01234567890",
        description:
          "The image demonstrates PNG transparency through a checkered pattern that serves as a visual indicator of transparent regions. The image contains several overlapping circular shapes with varying levels of opacity, showcasing alpha channel capabilities. The leftmost region shows full opacity with solid colors, while moving rightward reveals increasingly transparent areas where the checkerboard background shows through. This is a standard test image used in image processing and web development to verify transparency rendering.",
        model: "gpt-4o",
        tokens_used: 98,
        latency_ms: 1247.8,
      },
      null,
      2
    ),
    latency: 1247,
  },
  {
    id: "image",
    title: "Image Generation",
    subtitle: "DALL-E 3",
    icon: <Image className="w-5 h-5" />,
    gradient: "from-purple-500 to-purple-700",
    description:
      "Generate images with DALL-E 3. Supports multiple sizes, HD quality, and vivid/natural style options. Prompts are moderated before submission.",
    requestLabel: "POST /api/v1/image/generate",
    request: JSON.stringify(
      {
        prompt: "A futuristic data center with glowing server racks, neural network visualizations floating in the air, cinematic lighting",
        model: "dall-e-3",
        size: "1792x1024",
        quality: "hd",
        style: "vivid",
        n: 1,
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        id: "a1b2c3d4-e5f6-7890-cdef-012345678901",
        images: [
          {
            url: "https://oaidalleapiprodscus.blob.core.windows.net/private/org-abc/user-xyz/img-demo.png",
            revised_prompt:
              "A hyper-realistic futuristic data center interior with rows of illuminated server racks in deep blue and cyan hues, holographic neural network visualizations floating above the hardware, dramatic volumetric lighting casting light beams through cool mist, photorealistic cinematic quality.",
          },
        ],
        model: "dall-e-3",
        moderation: { flagged: false, category: "safe", scores: { safe: 1.0 } },
        latency_ms: 3521.4,
      },
      null,
      2
    ),
    latency: 3521,
  },
  {
    id: "audio_tts",
    title: "Text-to-Speech",
    subtitle: "OpenAI TTS",
    icon: <Mic className="w-5 h-5" />,
    gradient: "from-pink-500 to-pink-700",
    description:
      "Convert text to natural-sounding speech with 6 voice options, 4 output formats, and adjustable speed. Returns base64-encoded audio.",
    requestLabel: "POST /api/v1/audio/tts",
    request: JSON.stringify(
      {
        text: "Welcome to the GenAI Multi-Modal API. This platform demonstrates production-grade AI integration patterns for text, vision, audio, and image generation.",
        voice: "nova",
        model: "tts-1",
        format: "mp3",
        speed: 1.0,
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        id: "c2d3e4f5-6789-0abc-def0-123456789012",
        audio_base64: "SUQzBAAAAAAAI1RTU0UAAAAPAAAD...[truncated base64 encoded MP3]",
        format: "mp3",
        duration_estimate_ms: 5200,
        latency_ms: 1087.3,
      },
      null,
      2
    ),
    latency: 1087,
  },
  {
    id: "pipeline",
    title: "Pipeline Execution",
    subtitle: "Multi-Modal Orchestration",
    icon: <GitBranch className="w-5 h-5" />,
    gradient: "from-emerald-500 to-emerald-700",
    description:
      "Execute declarative multi-step AI pipelines. Context flows between steps, enabling complex workflows like text → image generation → vision analysis → audio narration.",
    requestLabel: "POST /api/v1/pipelines/execute",
    request: JSON.stringify(
      {
        name: "content-to-speech",
        steps: [
          { step_type: "moderate", config: {} },
          {
            step_type: "transform",
            config: { transform: "uppercase" },
          },
          {
            step_type: "transform",
            config: { transform: "summarize" },
          },
        ],
        initial_input: { text: "multi-modal ai processing pipeline" },
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        id: "d3e4f5a6-789b-0cde-f012-345678901234",
        name: "content-to-speech",
        status: "completed",
        steps: [
          {
            step_index: 0,
            step_type: "moderate",
            status: "completed",
            output: { moderation: { flagged: false, category: "safe", scores: { safe: 1.0 } } },
            latency_ms: 0.4,
          },
          {
            step_index: 1,
            step_type: "transform",
            status: "completed",
            output: { text: "MULTI-MODAL AI PROCESSING PIPELINE" },
            latency_ms: 0.1,
          },
          {
            step_index: 2,
            step_type: "transform",
            status: "completed",
            output: { text: "MULTI-MODAL AI PROCESSING PIPELINE" },
            latency_ms: 0.1,
          },
        ],
        final_output: {
          text: "MULTI-MODAL AI PROCESSING PIPELINE",
          moderation: { flagged: false, category: "safe", scores: { safe: 1.0 } },
        },
        total_latency_ms: 0.8,
      },
      null,
      2
    ),
    latency: 1,
  },
  {
    id: "moderation",
    title: "Content Moderation",
    subtitle: "Safety Pipeline",
    icon: <Shield className="w-5 h-5" />,
    gradient: "from-amber-500 to-amber-700",
    description:
      "Multi-layer content safety with compiled regex hard-blocks and heuristic scoring. Batch mode processes multiple texts concurrently.",
    requestLabel: "POST /api/v1/moderation/check",
    request: JSON.stringify(
      {
        content: "How do I build a machine learning pipeline for text classification?",
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        flagged: false,
        category: "safe",
        scores: { safe: 1.0 },
        details: null,
      },
      null,
      2
    ),
    latency: 1,
  },
];

// ------------------------------------------------------------------
// DemoCard component
// ------------------------------------------------------------------

function DemoCard({ demo }: { demo: DemoConfig }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showRequest, setShowRequest] = useState(true);
  const [success, setSuccess] = useState(false);

  const run = async () => {
    setRunning(true);
    setResult(null);
    const delay = Math.max(300, demo.latency * 0.3 + Math.random() * 400);
    await new Promise((r) => setTimeout(r, delay));
    setResult(demo.response);
    setSuccess(true);
    setRunning(false);
    setShowRequest(false);
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0a0f1e] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${demo.gradient} flex items-center justify-center text-white shadow-lg`}
            >
              {demo.icon}
            </div>
            <div>
              <h3 className="text-white font-bold">{demo.title}</h3>
              <p className="text-slate-500 text-xs">{demo.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {success && !running && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                200 OK
              </span>
            )}
            <button
              onClick={run}
              disabled={running}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm
                bg-gradient-to-r ${demo.gradient} text-white shadow-md
                hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calling API...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run
                </>
              )}
            </button>
          </div>
        </div>
        <p className="mt-3 text-slate-400 text-sm leading-relaxed">{demo.description}</p>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowRequest(true)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              showRequest
                ? "bg-white/10 text-white"
                : "text-slate-500 hover:text-white"
            }`}
          >
            Request
          </button>
          <button
            onClick={() => setShowRequest(false)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !showRequest
                ? "bg-white/10 text-white"
                : "text-slate-500 hover:text-white"
            }`}
          >
            Response
          </button>
        </div>

        {showRequest ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-500/10 text-brand-300">
                POST
              </span>
              <code className="text-xs font-mono text-slate-400">
                {demo.requestLabel.replace("POST ", "")}
              </code>
            </div>
            <pre className="bg-[#070b14] rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto border border-white/5 leading-relaxed">
              {demo.request}
            </pre>
          </div>
        ) : (
          <div>
            {running && (
              <div className="flex items-center justify-center py-12 gap-3">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                <span className="text-slate-500 text-sm">
                  Waiting for response... (~{demo.latency}ms)
                </span>
              </div>
            )}
            {!running && result && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-semibold">
                    200 OK — {demo.latency}ms
                  </span>
                </div>
                <pre className="bg-[#070b14] rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto border border-white/5 leading-relaxed">
                  {result}
                </pre>
              </div>
            )}
            {!running && !result && (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-600 text-sm">
                  Press Run to see the response
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Demo Page
// ------------------------------------------------------------------

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#020617]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </Link>
          <h1 className="text-white font-bold text-sm">Interactive Demo</h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-semibold">API Ready</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="py-16 text-center border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            API Interactive{" "}
            <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
              Demo
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Simulate real API calls for all six capabilities. Each card shows the exact request
            body and the expected response format from the live FastAPI backend.
          </p>
        </div>
      </div>

      {/* Demo Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {DEMOS.map((demo) => (
            <DemoCard key={demo.id} demo={demo} />
          ))}
        </div>

        {/* Architecture note */}
        <div className="mt-16 p-8 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
          <h3 className="text-white font-bold text-xl mb-3">Connect to the Live Backend</h3>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto mb-6 leading-relaxed">
            The demos above simulate API responses. To connect to the live FastAPI backend:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-600 to-cyan-600
                         text-white hover:opacity-90 transition-opacity shadow-lg"
            >
              Swagger UI Docs
            </a>
            <a
              href="http://localhost:8000/redoc"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-xl font-semibold text-sm border border-white/10 bg-white/5
                         text-white hover:bg-white/10 transition-colors"
            >
              ReDoc Reference
            </a>
            <code className="px-4 py-2.5 rounded-xl text-xs font-mono bg-white/5 border border-white/5 text-slate-400">
              uvicorn app.main:app --reload
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
