"use client";

import { useState } from "react";
import {
  MessageSquare,
  Image,
  Eye,
  Mic,
  Shield,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface PipelineStepDef {
  id: string;
  label: string;
  type: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  description: string;
}

const PIPELINE_STEPS: PipelineStepDef[] = [
  {
    id: "input",
    label: "Initial Input",
    type: "DATA",
    icon: <ArrowRight className="w-4 h-4" />,
    color: "text-slate-300",
    bg: "bg-slate-700/40",
    border: "border-slate-600/40",
    description: "Text, image URL, or structured data",
  },
  {
    id: "moderate",
    label: "Moderation Gate",
    type: "MODERATE",
    icon: <Shield className="w-4 h-4" />,
    color: "text-amber-300",
    bg: "bg-amber-900/30",
    border: "border-amber-700/40",
    description: "Rule-based + heuristic safety check",
  },
  {
    id: "text_gen",
    label: "Text Generate",
    type: "TEXT_GENERATE",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "text-brand-300",
    bg: "bg-brand-900/30",
    border: "border-brand-700/40",
    description: "GPT-4o completion with context injection",
  },
  {
    id: "img_gen",
    label: "Image Generate",
    type: "IMAGE_GENERATE",
    icon: <Image className="w-4 h-4" />,
    color: "text-purple-300",
    bg: "bg-purple-900/30",
    border: "border-purple-700/40",
    description: "DALL-E 3 image from text prompt",
  },
  {
    id: "vision",
    label: "Vision Analysis",
    type: "IMAGE_ANALYZE",
    icon: <Eye className="w-4 h-4" />,
    color: "text-cyan-300",
    bg: "bg-cyan-900/30",
    border: "border-cyan-700/40",
    description: "GPT-4o multimodal image understanding",
  },
  {
    id: "tts",
    label: "Audio Generate",
    type: "AUDIO_GENERATE",
    icon: <Mic className="w-4 h-4" />,
    color: "text-pink-300",
    bg: "bg-pink-900/30",
    border: "border-pink-700/40",
    description: "OpenAI TTS narration of results",
  },
];

export default function PipelineDiagram() {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);

  const runDemo = async () => {
    setRunning(true);
    setCompleted([]);
    for (const step of PIPELINE_STEPS) {
      setActiveStep(step.id);
      await new Promise((r) => setTimeout(r, 600));
      setCompleted((prev) => [...prev, step.id]);
    }
    setActiveStep(null);
    setRunning(false);
  };

  return (
    <div className="relative">
      <div className="flex flex-col items-center gap-0">
        {PIPELINE_STEPS.map((step, i) => (
          <div key={step.id} className="flex flex-col items-center w-full max-w-sm">
            {/* Step Card */}
            <div
              className={`w-full rounded-xl p-4 border transition-all duration-300 cursor-pointer
                ${step.bg} ${step.border}
                ${activeStep === step.id ? "scale-105 shadow-2xl ring-2 ring-white/20" : ""}
                ${completed.includes(step.id) ? "opacity-60" : "opacity-100"}
              `}
              onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${step.bg} border ${step.border}`}
                >
                  <span className={step.color}>{step.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold text-sm ${step.color}`}>
                      {step.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-600 uppercase">
                        {step.type}
                      </span>
                      {completed.includes(step.id) && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                      {activeStep === step.id && running && (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      )}
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">{step.description}</p>
                </div>
              </div>
            </div>

            {/* Connector */}
            {i < PIPELINE_STEPS.length - 1 && (
              <div className="flex flex-col items-center py-1">
                <div className="w-px h-4 bg-gradient-to-b from-white/20 to-transparent" />
                <ArrowDown className="w-3 h-3 text-slate-600" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Run Button */}
      <div className="mt-8 text-center">
        <button
          onClick={runDemo}
          disabled={running}
          className="px-8 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-600 to-accent-cyan
                     text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Pipeline...
            </span>
          ) : (
            "Simulate Pipeline Execution"
          )}
        </button>
      </div>
    </div>
  );
}
