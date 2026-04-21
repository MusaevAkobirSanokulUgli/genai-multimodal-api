import { Zap, Github } from "lucide-react";

const TECH_STACK = [
  "FastAPI", "Pydantic v2", "OpenAI SDK", "asyncio",
  "GPT-4o", "DALL-E 3", "Whisper", "SSE Streaming",
  "Next.js 15", "TypeScript", "Tailwind CSS", "Docker",
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#020617]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">GenAI Multi-Modal API</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Production-grade multi-modal AI API demonstrating advanced Python engineering
              for Senior AI Engineer roles.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-white font-semibold mb-4">Technology Stack</h3>
            <div className="flex flex-wrap gap-2">
              {TECH_STACK.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-slate-400 text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* API Endpoints */}
          <div>
            <h3 className="text-white font-semibold mb-4">API Endpoints</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              {[
                "POST /api/v1/text/generate",
                "POST /api/v1/vision/analyze",
                "POST /api/v1/image/generate",
                "POST /api/v1/audio/tts",
                "POST /api/v1/audio/transcribe",
                "POST /api/v1/pipelines/execute",
                "POST /api/v1/moderation/check",
                "GET  /api/v1/health",
              ].map((ep) => (
                <li key={ep} className="font-mono text-xs text-slate-500 hover:text-slate-300 transition-colors">
                  {ep}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            Portfolio project — Senior Python AI Engineer ($6,000/month)
          </p>
          <p className="text-slate-600 text-xs font-mono">
            Python 3.12 · FastAPI 0.115 · Pydantic v2 · OpenAI SDK 1.x
          </p>
        </div>
      </div>
    </footer>
  );
}
