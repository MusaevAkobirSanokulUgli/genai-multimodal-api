"use client";

import Link from "next/link";
import { ArrowLeft, Flame, Sparkles, ExternalLink } from "lucide-react";
import MultiModalDemo from "@/components/MultiModalDemo";

export default function DemoPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0C0A09" }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{
          backgroundColor: "rgba(12,10,9,0.92)",
          borderBottomColor: "rgba(245,158,11,0.12)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium transition-colors duration-200"
            style={{ color: "#78716C" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#F5F5F4"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#78716C"; }}
          >
            <ArrowLeft style={{ width: 15, height: 15 }} />
            Back to Overview
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #FB923C)",
                boxShadow: "0 2px 10px rgba(245,158,11,0.3)",
              }}
            >
              <Flame style={{ width: 14, height: 14, color: "#0C0A09" }} />
            </div>
            <span className="text-sm font-black" style={{ color: "#F5F5F4" }}>
              GenAI <span className="text-gradient-warm">Studio</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "#F59E0B" }}
            />
            <span className="text-xs font-semibold" style={{ color: "#F59E0B" }}>
              Demo Mode
            </span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div
        className="py-16 text-center relative overflow-hidden"
        style={{ borderBottom: "1px solid rgba(245,158,11,0.08)" }}
      >
        {/* Background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center top, rgba(245,158,11,0.08) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />

        <div className="relative max-w-3xl mx-auto px-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-5"
            style={{
              backgroundColor: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              color: "#F59E0B",
            }}
          >
            <Sparkles style={{ width: 11, height: 11 }} />
            Interactive Workspace
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4" style={{ color: "#F5F5F4" }}>
            Multi-Modal API{" "}
            <span className="text-gradient-warm">Demo</span>
          </h1>
          <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{ color: "#78716C" }}>
            Explore all five modalities with real inputs — upload images, type prompts, configure
            parameters, build pipelines, and see simulated AI responses in real-time.
          </p>
        </div>
      </div>

      {/* Main Demo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MultiModalDemo />

        {/* Connect to Backend */}
        <div
          className="mt-12 p-8 rounded-2xl text-center"
          style={{
            backgroundColor: "rgba(28,25,23,0.6)",
            border: "1px solid rgba(245,158,11,0.12)",
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,146,60,0.08))",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <Flame style={{ width: 22, height: 22, color: "#F59E0B" }} />
          </div>
          <h3 className="font-black text-xl mb-3" style={{ color: "#F5F5F4" }}>
            Connect to the Live Backend
          </h3>
          <p className="text-sm max-w-2xl mx-auto mb-6 leading-relaxed" style={{ color: "#78716C" }}>
            The demos above simulate API responses. To connect to the live FastAPI backend,
            start the server locally:
          </p>
          <div
            className="inline-block mb-6 px-5 py-3 rounded-xl font-mono text-sm"
            style={{
              backgroundColor: "rgba(12,10,9,0.8)",
              border: "1px solid rgba(245,158,11,0.15)",
              color: "#A8A29E",
            }}
          >
            uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #FB923C)",
                color: "#0C0A09",
                boxShadow: "0 2px 12px rgba(245,158,11,0.3)",
              }}
            >
              <ExternalLink style={{ width: 14, height: 14 }} />
              Swagger UI Docs
            </a>
            <a
              href="http://localhost:8000/redoc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm"
              style={{
                border: "1px solid rgba(245,158,11,0.15)",
                backgroundColor: "rgba(245,158,11,0.04)",
                color: "#A8A29E",
              }}
            >
              <ExternalLink style={{ width: 14, height: 14 }} />
              ReDoc Reference
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
