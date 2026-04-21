"use client";

import { Flame, Github } from "lucide-react";

const TECH_STACK = [
  "FastAPI", "Pydantic v2", "OpenAI SDK", "asyncio",
  "GPT-4o", "DALL-E 3", "Whisper", "SSE Streaming",
  "Next.js 15", "TypeScript", "Tailwind CSS", "Docker",
];

const ENDPOINTS = [
  "POST /api/v1/text/generate",
  "POST /api/v1/vision/analyze",
  "POST /api/v1/image/generate",
  "POST /api/v1/audio/tts",
  "POST /api/v1/audio/transcribe",
  "POST /api/v1/pipelines/execute",
  "POST /api/v1/moderation/check",
  "GET  /api/v1/health",
];

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        backgroundColor: "#0C0A09",
        borderTopColor: "rgba(245,158,11,0.1)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #F59E0B 0%, #FB923C 100%)",
                  boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
                }}
              >
                <Flame className="w-4.5 h-4.5" style={{ width: 18, height: 18, color: "#0C0A09" }} />
              </div>
              <div>
                <p className="font-black text-white text-sm">GenAI Studio</p>
                <p className="text-stone-500 text-[10px] uppercase tracking-widest">Multi-Modal API</p>
              </div>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">
              Production-grade multi-modal AI API demonstrating advanced Python engineering
              patterns for Senior AI Engineer roles.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/MusaevAkobirSanokulUgli/genai-multimodal-api"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm transition-colors duration-200"
                style={{ color: "#78716C" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#F5F5F4"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#78716C"; }}
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-white font-bold mb-5 text-sm uppercase tracking-widest" style={{ color: "#A8A29E" }}>
              Technology Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {TECH_STACK.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.12)",
                    color: "#A8A29E",
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Endpoints */}
          <div>
            <h3 className="font-bold mb-5 text-sm uppercase tracking-widest" style={{ color: "#A8A29E" }}>
              API Endpoints
            </h3>
            <ul className="space-y-2">
              {ENDPOINTS.map((ep) => (
                <li
                  key={ep}
                  className="font-mono text-xs transition-colors duration-200 cursor-default"
                  style={{ color: "#57534E" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#A8A29E"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#57534E"; }}
                >
                  {ep}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "#57534E" }}>
            Portfolio project — Senior Python AI Engineer{" "}
            <span style={{ color: "#F59E0B" }}>($6,000/month)</span>
          </p>
          <p className="text-xs font-mono" style={{ color: "#44403C" }}>
            Python 3.12 · FastAPI 0.115 · Pydantic v2 · OpenAI SDK 1.x
          </p>
        </div>
      </div>
    </footer>
  );
}
