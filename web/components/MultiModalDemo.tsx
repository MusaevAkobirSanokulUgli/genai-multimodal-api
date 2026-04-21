"use client";

import { useState } from "react";
import { MessageSquare, Eye, Image, Mic, Play, Loader2 } from "lucide-react";

type Tab = "text" | "vision" | "image" | "audio";

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  color: string;
  ring: string;
}

const TABS: TabConfig[] = [
  {
    id: "text",
    label: "Text Generation",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "from-brand-500 to-brand-700",
    ring: "ring-brand-500/30",
  },
  {
    id: "vision",
    label: "Vision Analysis",
    icon: <Eye className="w-4 h-4" />,
    color: "from-cyan-500 to-cyan-700",
    ring: "ring-cyan-500/30",
  },
  {
    id: "image",
    label: "Image Generation",
    icon: <Image className="w-4 h-4" />,
    color: "from-purple-500 to-purple-700",
    ring: "ring-purple-500/30",
  },
  {
    id: "audio",
    label: "Text-to-Speech",
    icon: <Mic className="w-4 h-4" />,
    color: "from-pink-500 to-pink-700",
    ring: "ring-pink-500/30",
  },
];

const MOCK_RESPONSES: Record<Tab, string> = {
  text: `{
  "id": "8f3a2c1d-...",
  "content": "Multi-modal AI refers to artificial intelligence systems capable of processing and generating content across multiple data types — text, images, audio, and video. GPT-4o exemplifies this by natively handling all modalities in a unified model architecture.",
  "model": "gpt-4o",
  "tokens_used": 68,
  "latency_ms": 847.3,
  "moderation": {
    "flagged": false,
    "category": "safe",
    "scores": {"safe": 1.0}
  }
}`,
  vision: `{
  "id": "a1b2c3d4-...",
  "description": "The image shows a modern API architecture diagram with multiple interconnected microservices. A central API gateway routes requests to specialized services for text generation, image analysis, and audio processing. Each service communicates via async message queues with sub-100ms response times indicated by green SLO indicators.",
  "model": "gpt-4o",
  "tokens_used": 124,
  "latency_ms": 1203.7
}`,
  image: `{
  "id": "d4e5f6g7-...",
  "images": [
    {
      "url": "https://oaidalleapi.blob.core.windows.net/...",
      "revised_prompt": "A futuristic neural network visualization with glowing blue nodes interconnected by luminous data pathways, set against a deep space background with constellation-like patterns representing multi-modal AI processing."
    }
  ],
  "model": "dall-e-3",
  "latency_ms": 3412.1
}`,
  audio: `{
  "id": "h8i9j0k1-...",
  "audio_base64": "SUQzBAAAAAAAI1RTU0UAAAAPAAAD...",
  "format": "mp3",
  "duration_estimate_ms": 4200,
  "latency_ms": 1087.4
}`,
};

const SAMPLE_REQUESTS: Record<Tab, string> = {
  text: `POST /api/v1/text/generate
Content-Type: application/json

{
  "prompt": "Explain multi-modal AI in 2 sentences",
  "model": "gpt-4o",
  "temperature": 0.7,
  "max_tokens": 200,
  "stream": false
}`,
  vision: `POST /api/v1/vision/analyze
Content-Type: application/json

{
  "image_url": "https://example.com/architecture.png",
  "prompt": "Describe this system architecture diagram",
  "model": "gpt-4o",
  "max_tokens": 500
}`,
  image: `POST /api/v1/image/generate
Content-Type: application/json

{
  "prompt": "Neural network visualization, futuristic",
  "model": "dall-e-3",
  "size": "1024x1024",
  "quality": "hd",
  "style": "vivid"
}`,
  audio: `POST /api/v1/audio/tts
Content-Type: application/json

{
  "text": "Welcome to the GenAI Multi-Modal API",
  "voice": "nova",
  "model": "tts-1",
  "format": "mp3",
  "speed": 1.0
}`,
};

export default function MultiModalDemo() {
  const [activeTab, setActiveTab] = useState<Tab>("text");
  const [loading, setLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setShowResponse(false);
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
    setLoading(false);
    setShowResponse(true);
  };

  const tab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#0a0f1e]">
      {/* Tab Bar */}
      <div className="flex gap-1 p-3 bg-white/[0.02] border-b border-white/5 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id);
              setShowResponse(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${
                activeTab === t.id
                  ? `bg-gradient-to-r ${t.color} text-white shadow-lg ring-2 ${t.ring}`
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Request */}
        <div className="p-5 border-b lg:border-b-0 lg:border-r border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Request
            </span>
            <button
              onClick={handleRun}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold
                bg-gradient-to-r ${tab.color} text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed
                hover:opacity-90 transition-opacity`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  Run
                </>
              )}
            </button>
          </div>
          <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto bg-white/[0.02] rounded-lg p-4 border border-white/5">
            {SAMPLE_REQUESTS[activeTab]}
          </pre>
        </div>

        {/* Response */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Response
            </span>
            {showResponse && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                200 OK
              </span>
            )}
          </div>
          <div className="min-h-[200px] bg-white/[0.02] rounded-lg p-4 border border-white/5">
            {loading && (
              <div className="flex flex-col items-center justify-center h-full py-8 gap-3">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                <span className="text-slate-500 text-sm">Calling API...</span>
              </div>
            )}
            {!loading && showResponse && (
              <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
                {MOCK_RESPONSES[activeTab]}
              </pre>
            )}
            {!loading && !showResponse && (
              <div className="flex items-center justify-center h-full py-8">
                <p className="text-slate-600 text-sm">
                  Press Run to see the API response
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
