"use client";

import { useState } from "react";
import {
  MessageSquare,
  ImageIcon,
  Eye,
  Mic,
  Shield,
  ArrowDown,
  CheckCircle2,
  Loader2,
  Zap,
} from "lucide-react";

interface PipelineStepDef {
  id: string;
  label: string;
  type: string;
  icon: React.ReactNode;
  accentColor: string;
  glowColor: string;
  description: string;
}

const PIPELINE_STEPS: PipelineStepDef[] = [
  {
    id: "input",
    label: "Initial Input",
    type: "DATA",
    icon: <Zap style={{ width: 16, height: 16 }} />,
    accentColor: "#A8A29E",
    glowColor: "rgba(168,162,158,0.15)",
    description: "Text, image URL, or structured data",
  },
  {
    id: "moderate",
    label: "Moderation Gate",
    type: "MODERATE",
    icon: <Shield style={{ width: 16, height: 16 }} />,
    accentColor: "#FBBF24",
    glowColor: "rgba(251,191,36,0.15)",
    description: "Rule-based + heuristic safety check",
  },
  {
    id: "text_gen",
    label: "Text Generate",
    type: "TEXT_GENERATE",
    icon: <MessageSquare style={{ width: 16, height: 16 }} />,
    accentColor: "#F59E0B",
    glowColor: "rgba(245,158,11,0.15)",
    description: "GPT-4o completion with context injection",
  },
  {
    id: "img_gen",
    label: "Image Generate",
    type: "IMAGE_GENERATE",
    icon: <ImageIcon style={{ width: 16, height: 16 }} />,
    accentColor: "#FB923C",
    glowColor: "rgba(251,146,60,0.15)",
    description: "DALL-E 3 image from text prompt",
  },
  {
    id: "vision",
    label: "Vision Analysis",
    type: "IMAGE_ANALYZE",
    icon: <Eye style={{ width: 16, height: 16 }} />,
    accentColor: "#F97316",
    glowColor: "rgba(249,115,22,0.15)",
    description: "GPT-4o multimodal image understanding",
  },
  {
    id: "tts",
    label: "Audio Generate",
    type: "AUDIO_GENERATE",
    icon: <Mic style={{ width: 16, height: 16 }} />,
    accentColor: "#FBBF24",
    glowColor: "rgba(251,191,36,0.15)",
    description: "OpenAI TTS narration of results",
  },
];

export default function PipelineDiagram() {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [latencies, setLatencies] = useState<Record<string, number>>({});

  const runDemo = async () => {
    setRunning(true);
    setCompleted([]);
    setActiveStep(null);
    setLatencies({});

    for (const step of PIPELINE_STEPS) {
      setActiveStep(step.id);
      const ms = 400 + Math.random() * 300;
      await new Promise((r) => setTimeout(r, ms));
      setCompleted((prev) => [...prev, step.id]);
      setLatencies((prev) => ({ ...prev, [step.id]: Math.round(ms) }));
    }
    setActiveStep(null);
    setRunning(false);
  };

  const totalLatency = Object.values(latencies).reduce((a, b) => a + b, 0);

  return (
    <div className="relative">
      <div className="flex flex-col items-center gap-0">
        {PIPELINE_STEPS.map((step, i) => {
          const isActive = activeStep === step.id;
          const isDone = completed.includes(step.id);

          return (
            <div key={step.id} className="flex flex-col items-center w-full max-w-sm">
              {/* Step card */}
              <div
                className="w-full rounded-2xl p-4 transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: isActive
                    ? "rgba(41,37,36,0.95)"
                    : isDone
                    ? "rgba(28,25,23,0.5)"
                    : "rgba(28,25,23,0.8)",
                  border: `1px solid ${
                    isActive
                      ? step.accentColor
                      : isDone
                      ? `${step.accentColor}40`
                      : "rgba(245,158,11,0.1)"
                  }`,
                  boxShadow: isActive
                    ? `0 0 24px ${step.glowColor}, 0 8px 24px rgba(0,0,0,0.4)`
                    : "none",
                  transform: isActive ? "scale(1.03)" : "scale(1)",
                  opacity: isDone && !isActive ? 0.7 : 1,
                }}
                onClick={() => !running && setActiveStep(activeStep === step.id ? null : step.id)}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: isActive || isDone
                        ? `${step.accentColor}20`
                        : "rgba(28,25,23,0.6)",
                      border: `1px solid ${step.accentColor}30`,
                      color: step.accentColor,
                    }}
                  >
                    {step.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: isActive ? step.accentColor : "#D6D3D1" }}
                      >
                        {step.label}
                      </span>
                      <div className="flex items-center gap-2">
                        {isDone && latencies[step.id] && (
                          <span className="text-[10px] font-mono" style={{ color: "#57534E" }}>
                            {latencies[step.id]}ms
                          </span>
                        )}
                        <span
                          className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${step.accentColor}10`,
                            color: `${step.accentColor}90`,
                          }}
                        >
                          {step.type}
                        </span>
                        {isDone && (
                          <CheckCircle2
                            style={{ width: 15, height: 15, color: "#F59E0B" }}
                          />
                        )}
                        {isActive && running && (
                          <Loader2
                            className="animate-spin"
                            style={{ width: 15, height: 15, color: step.accentColor }}
                          />
                        )}
                      </div>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "#57534E" }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Connector arrow */}
              {i < PIPELINE_STEPS.length - 1 && (
                <div className="flex flex-col items-center py-1.5">
                  <div
                    className="w-px h-4"
                    style={{
                      background: isDone
                        ? `linear-gradient(to bottom, ${step.accentColor}60, ${PIPELINE_STEPS[i + 1].accentColor}20)`
                        : "linear-gradient(to bottom, rgba(245,158,11,0.2), transparent)",
                    }}
                  />
                  <ArrowDown
                    style={{
                      width: 12,
                      height: 12,
                      color: isDone ? step.accentColor : "#44403C",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completed summary */}
      {completed.length === PIPELINE_STEPS.length && !running && (
        <div
          className="mt-6 p-4 rounded-2xl text-center animate-fade-in"
          style={{
            backgroundColor: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "#FBBF24" }}>
            Pipeline Complete — {totalLatency}ms total
          </p>
          <p className="text-xs mt-1" style={{ color: "#78716C" }}>
            {PIPELINE_STEPS.length} steps executed sequentially
          </p>
        </div>
      )}

      {/* Run Button */}
      <div className="mt-6 text-center">
        <button
          onClick={runDemo}
          disabled={running}
          className="btn-amber"
          style={{
            opacity: running ? 0.6 : 1,
            cursor: running ? "not-allowed" : "pointer",
          }}
        >
          {running ? (
            <>
              <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
              Running Pipeline...
            </>
          ) : (
            <>
              <Zap style={{ width: 16, height: 16 }} />
              Simulate Pipeline Execution
            </>
          )}
        </button>
      </div>
    </div>
  );
}
