"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  MessageSquare,
  Eye,
  ImageIcon,
  Mic,
  GitBranch,
  Loader2,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Plus,
  Trash2,
  Play,
  ZapIcon,
  CheckCircle2,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

type TabId = "text" | "vision" | "image" | "audio" | "pipeline";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { id: "text",     label: "Text Generation",  icon: <MessageSquare style={{ width: 15, height: 15 }} /> },
  { id: "vision",   label: "Vision Analysis",  icon: <Eye style={{ width: 15, height: 15 }} /> },
  { id: "image",    label: "Image Generation", icon: <ImageIcon style={{ width: 15, height: 15 }} /> },
  { id: "audio",    label: "Audio (TTS)",       icon: <Mic style={{ width: 15, height: 15 }} /> },
  { id: "pipeline", label: "Pipeline Builder", icon: <GitBranch style={{ width: 15, height: 15 }} /> },
];

// ─── Shared Styles ──────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  backgroundColor: "rgba(12,10,9,0.8)",
  border: "1px solid rgba(245,158,11,0.15)",
  color: "#F5F5F4",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 14,
  width: "100%",
  transition: "border-color 0.2s",
  fontFamily: "Inter, sans-serif",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#78716C",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

// ─── Helper ─────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ─── TEXT TAB ───────────────────────────────────────────────────────────────

const STREAMING_TEXT = `Multi-modal AI refers to artificial intelligence systems capable of processing and generating content across multiple data types simultaneously — text, images, audio, and video. GPT-4o exemplifies this by natively handling all modalities in a unified model architecture, enabling seamless cross-modal reasoning.

The key technical advantages include:

• **Unified embedding space**: All modalities share a common latent representation, enabling cross-modal attention mechanisms that align text tokens with visual patches and audio frames.

• **AsyncGenerator streaming**: Each token is yielded individually via Server-Sent Events, allowing the client to render partial responses in real-time without waiting for full completion.

• **Semaphore concurrency control**: The service layer wraps all OpenAI API calls behind an asyncio.Semaphore to prevent resource exhaustion under concurrent load.`;

function TextTab() {
  const [prompt, setPrompt] = useState("Explain multi-modal AI and how streaming works in Python asyncio");
  const [systemPrompt, setSystemPrompt] = useState("You are an expert AI systems engineer. Be precise and technical.");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(400);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [done, setDone] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setOutput("");
    setDone(false);
    await sleep(400);

    const words = STREAMING_TEXT.split("");
    for (let i = 0; i < words.length; i++) {
      await sleep(12 + Math.random() * 8);
      setOutput((prev) => prev + words[i]);
    }
    setDone(true);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Inputs */}
      <div className="space-y-4">
        <div>
          <label style={labelStyle}>Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="Enter your prompt..."
            style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.45)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.15)"; }}
          />
        </div>

        {/* Advanced settings toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs font-semibold transition-colors"
          style={{ color: "#78716C" }}
        >
          {showAdvanced ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
          Advanced Settings
        </button>

        {showAdvanced && (
          <div className="space-y-4 pl-2 border-l-2" style={{ borderColor: "rgba(245,158,11,0.15)" }}>
            <div>
              <label style={labelStyle}>System Prompt</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={2}
                style={{ ...inputStyle, resize: "vertical" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.45)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.15)"; }}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Temperature: <span style={{ color: "#F59E0B" }}>{temperature}</span>
              </label>
              <input
                type="range"
                min={0} max={2} step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                style={{ width: "100%" }}
              />
              <div className="flex justify-between text-[10px] mt-1" style={{ color: "#57534E" }}>
                <span>Precise (0)</span><span>Creative (2)</span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>
                Max Tokens: <span style={{ color: "#F59E0B" }}>{maxTokens}</span>
              </label>
              <input
                type="range"
                min={50} max={2000} step={50}
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="btn-amber w-full justify-center"
          style={{ width: "100%", justifyContent: "center" }}
        >
          {loading ? (
            <><Loader2 className="animate-spin" style={{ width: 16, height: 16 }} /> Generating...</>
          ) : (
            <><ZapIcon style={{ width: 16, height: 16 }} /> Generate</>
          )}
        </button>
      </div>

      {/* Right: Output */}
      <div
        className="rounded-2xl p-5 min-h-[240px] relative"
        style={{
          backgroundColor: "rgba(12,10,9,0.6)",
          border: "1px solid rgba(245,158,11,0.1)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#57534E" }}>
            Output
          </span>
          {done && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "#F59E0B" }}>
              <CheckCircle2 style={{ width: 13, height: 13 }} />
              Complete
            </span>
          )}
          {loading && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "#A8A29E" }}>
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: "#F59E0B" }}
              />
              Streaming...
            </span>
          )}
        </div>

        {output ? (
          <div
            className="text-sm leading-relaxed"
            style={{ color: "#D6D3D1", whiteSpace: "pre-wrap" }}
          >
            {output}
            {loading && (
              <span
                className="inline-block w-0.5 h-4 ml-0.5 animate-pulse align-middle"
                style={{ backgroundColor: "#F59E0B" }}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm" style={{ color: "#44403C" }}>
              {loading ? "Streaming response..." : "Press Generate to see output"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── VISION TAB ─────────────────────────────────────────────────────────────

const VISION_ANALYSES: string[] = [
  `This image shows a vibrant and detailed scene with rich visual composition. The photograph captures natural textures with excellent depth of field — the foreground subjects are sharp while background elements create a pleasing bokeh effect. The color palette is warm with golden hour lighting casting soft shadows across the frame. Technical quality is high, suggesting professional or semi-professional camera equipment.`,

  `The uploaded image displays a complex urban landscape with architectural elements dominating the foreground. Geometric patterns of glass and steel facades reflect surrounding structures, creating recursive visual layers. The perspective emphasizes vertical scale, drawing the viewer's eye upward through converging lines. Natural and artificial lighting coexist, with warm interior light contrasting against cool exterior daylight.`,

  `This appears to be a technical diagram or data visualization with structured information presented in a clear hierarchical layout. Node-edge relationships are visible with connective pathways indicating data flow or process dependencies. Color coding is used systematically to distinguish categories — warm hues for primary elements, cooler tones for secondary or derived components.`,
];

function VisionTab() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzePrompt, setAnalyzePrompt] = useState("Describe this image in detail");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.match(/image\/(jpeg|png|gif|webp)/)) return;
    setImageFile(file);
    setResult("");
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setResult("");
    await sleep(1200 + Math.random() * 600);
    const analysis = VISION_ANALYSES[Math.floor(Math.random() * VISION_ANALYSES.length)];
    setResult(analysis);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {/* Drop zone */}
        <div>
          <label style={labelStyle}>Image Upload</label>
          <div
            className={`drop-zone p-6 text-center cursor-pointer transition-all ${isDragging ? "dragging" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {imagePreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Uploaded preview"
                  className="max-h-48 mx-auto rounded-xl object-contain"
                  style={{ maxWidth: "100%" }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                    setImagePreview(null);
                    setResult("");
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(12,10,9,0.8)", border: "1px solid rgba(245,158,11,0.2)" }}
                >
                  <X style={{ width: 13, height: 13, color: "#A8A29E" }} />
                </button>
                <p className="text-xs mt-3" style={{ color: "#78716C" }}>
                  {imageFile?.name} · Click to replace
                </p>
              </div>
            ) : (
              <div>
                <Upload
                  className="mx-auto mb-3"
                  style={{ width: 28, height: 28, color: "#57534E" }}
                />
                <p className="text-sm font-medium" style={{ color: "#A8A29E" }}>
                  Drag & drop or click to upload
                </p>
                <p className="text-xs mt-1" style={{ color: "#57534E" }}>
                  Supports JPG, PNG, GIF, WEBP
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Analysis Prompt</label>
          <textarea
            value={analyzePrompt}
            onChange={(e) => setAnalyzePrompt(e.target.value)}
            rows={2}
            style={{ ...inputStyle, resize: "vertical" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.45)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.15)"; }}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || (!imageFile && !imagePreview)}
          className="btn-amber"
          style={{ width: "100%", justifyContent: "center" }}
        >
          {loading ? (
            <><Loader2 className="animate-spin" style={{ width: 16, height: 16 }} /> Analyzing...</>
          ) : (
            <><Eye style={{ width: 16, height: 16 }} /> Analyze Image</>
          )}
        </button>
        {!imageFile && !imagePreview && (
          <p className="text-xs text-center" style={{ color: "#57534E" }}>
            Upload an image first to enable analysis
          </p>
        )}
      </div>

      {/* Result */}
      <div
        className="rounded-2xl p-5 min-h-[240px]"
        style={{
          backgroundColor: "rgba(12,10,9,0.6)",
          border: "1px solid rgba(245,158,11,0.1)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#57534E" }}>
            Analysis Result
          </span>
          {result && !loading && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "#F59E0B" }}>
              <CheckCircle2 style={{ width: 13, height: 13 }} />
              GPT-4o Vision
            </span>
          )}
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Loader2 className="animate-spin" style={{ width: 24, height: 24, color: "#F59E0B" }} />
            <p className="text-sm" style={{ color: "#78716C" }}>Analyzing image with GPT-4o...</p>
          </div>
        ) : result ? (
          <p className="text-sm leading-relaxed" style={{ color: "#D6D3D1" }}>
            {result}
          </p>
        ) : (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm" style={{ color: "#44403C" }}>
              Upload an image and press Analyze
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── IMAGE GENERATION TAB ───────────────────────────────────────────────────

const IMG_GRADIENTS = [
  "linear-gradient(135deg, #F59E0B 0%, #92400E 50%, #0C0A09 100%)",
  "linear-gradient(135deg, #7C2D12 0%, #FB923C 50%, #FBBF24 100%)",
  "linear-gradient(135deg, #1C1917 0%, #44403C 40%, #F59E0B 100%)",
  "linear-gradient(135deg, #0C0A09 0%, #78350F 50%, #FBBF24 100%)",
];

function ImageTab() {
  const [imgPrompt, setImgPrompt] = useState("A lone lighthouse at dusk on a dramatic rocky coastline, warm golden light, cinematic atmosphere");
  const [size, setSize] = useState("1024x1024");
  const [style, setImgStyle] = useState("vivid");
  const [quality, setQuality] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [gradientIdx, setGradientIdx] = useState(0);

  const handleGenerate = async () => {
    setLoading(true);
    setGenerated(false);
    await sleep(2400 + Math.random() * 800);
    setGradientIdx(Math.floor(Math.random() * IMG_GRADIENTS.length));
    setGenerated(true);
    setLoading(false);
  };

  const aspectClass = size === "1792x1024"
    ? { width: "100%", paddingBottom: "57.1%" }
    : size === "1024x1792"
    ? { width: "60%", paddingBottom: "107%", margin: "0 auto" }
    : { width: "100%", paddingBottom: "100%" };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label style={labelStyle}>Image Prompt</label>
          <textarea
            value={imgPrompt}
            onChange={(e) => setImgPrompt(e.target.value)}
            rows={4}
            placeholder="Describe the image you want to generate..."
            style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.45)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.15)"; }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              <option value="256x256">256×256</option>
              <option value="512x512">512×512</option>
              <option value="1024x1024">1024×1024</option>
              <option value="1792x1024">1792×1024 (Wide)</option>
              <option value="1024x1792">1024×1792 (Tall)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Style</label>
            <select value={style} onChange={(e) => setImgStyle(e.target.value)}>
              <option value="vivid">Vivid</option>
              <option value="natural">Natural</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Quality</label>
            <select value={quality} onChange={(e) => setQuality(e.target.value)}>
              <option value="standard">Standard</option>
              <option value="hd">HD</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !imgPrompt.trim()}
          className="btn-amber"
          style={{ width: "100%", justifyContent: "center" }}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
              Generating Image...
            </>
          ) : (
            <>
              <ImageIcon style={{ width: 16, height: 16 }} />
              Generate with DALL-E 3
            </>
          )}
        </button>
      </div>

      {/* Image Preview */}
      <div
        className="rounded-2xl p-5 flex flex-col items-center justify-center min-h-[300px]"
        style={{
          backgroundColor: "rgba(12,10,9,0.6)",
          border: "1px solid rgba(245,158,11,0.1)",
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse"
              style={{ background: "linear-gradient(135deg, #F59E0B, #FB923C)" }}
            >
              <ImageIcon style={{ width: 28, height: 28, color: "#0C0A09" }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: "#A8A29E" }}>
                DALL-E 3 is rendering...
              </p>
              <p className="text-xs mt-1" style={{ color: "#57534E" }}>
                Usually 2–5 seconds
              </p>
            </div>
          </div>
        ) : generated ? (
          <div className="w-full">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 style={{ width: 14, height: 14, color: "#F59E0B" }} />
              <span className="text-xs font-semibold" style={{ color: "#F59E0B" }}>
                Image Generated · {size} · {quality.toUpperCase()} · {style}
              </span>
            </div>
            {/* Gradient placeholder simulating an image */}
            <div
              className="relative rounded-xl overflow-hidden w-full"
              style={{ ...aspectClass, position: "relative" }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: IMG_GRADIENTS[gradientIdx],
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  padding: 16,
                  background: "linear-gradient(to top, rgba(12,10,9,0.7) 0%, transparent 50%)",
                }}
              >
                <p
                  className="text-xs text-center italic leading-relaxed"
                  style={{ color: "rgba(245,245,244,0.85)", maxWidth: 220 }}
                >
                  &ldquo;{imgPrompt.slice(0, 80)}{imgPrompt.length > 80 ? "..." : ""}&rdquo;
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                backgroundColor: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.12)",
              }}
            >
              <ImageIcon style={{ width: 26, height: 26, color: "#44403C" }} />
            </div>
            <p className="text-sm" style={{ color: "#44403C" }}>
              Generated image will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AUDIO TAB ──────────────────────────────────────────────────────────────

const VOICE_OPTIONS = ["Alloy", "Echo", "Fable", "Onyx", "Nova", "Shimmer"];
const FORMAT_OPTIONS = ["MP3", "WAV", "FLAC", "OGG"];

function WaveformViz({ playing }: { playing: boolean }) {
  const bars = Array.from({ length: 32 }, (_, i) => ({
    height: 20 + Math.sin(i * 0.8) * 15 + Math.random() * 20,
    delay: i * 0.04,
  }));

  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="waveform-bar"
          style={{
            height: playing ? `${bar.height}px` : "4px",
            animationName: playing ? "wave" : "none",
            animationDuration: `${0.8 + (i % 5) * 0.15}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: `${bar.delay}s`,
            transition: "height 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

function AudioTab() {
  const [text, setText] = useState("Welcome to the GenAI Multi-Modal API. This platform demonstrates production-grade AI integration patterns for text, vision, audio, and image generation — all orchestrated through async Python.");
  const [voice, setVoice] = useState("Nova");
  const [speed, setSpeed] = useState(1.0);
  const [format, setFormat] = useState("MP3");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    setLoading(true);
    setGenerated(false);
    setPlaying(false);
    setProgress(0);
    await sleep(1000 + Math.random() * 500);
    setGenerated(true);
    setLoading(false);
  };

  const handlePlayPause = async () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    setPlaying(true);
    const duration = (text.split(" ").length / 2.5) * (1 / speed) * 1000;
    const steps = 60;
    const stepDuration = duration / steps;
    for (let i = 1; i <= steps; i++) {
      await sleep(stepDuration);
      setProgress((i / steps) * 100);
    }
    setPlaying(false);
    setProgress(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label style={labelStyle}>Text to Speak</label>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setGenerated(false); }}
            rows={5}
            placeholder="Enter text to convert to speech..."
            style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.45)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.15)"; }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Voice</label>
            <select value={voice} onChange={(e) => { setVoice(e.target.value); setGenerated(false); }}>
              {VOICE_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              {FORMAT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>
            Speed: <span style={{ color: "#F59E0B" }}>{speed.toFixed(2)}x</span>
          </label>
          <input
            type="range"
            min={0.25} max={4} step={0.25}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
          <div className="flex justify-between text-[10px] mt-1" style={{ color: "#57534E" }}>
            <span>0.25x</span><span>4x</span>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !text.trim()}
          className="btn-amber"
          style={{ width: "100%", justifyContent: "center" }}
        >
          {loading ? (
            <><Loader2 className="animate-spin" style={{ width: 16, height: 16 }} /> Synthesizing...</>
          ) : (
            <><Mic style={{ width: 16, height: 16 }} /> Generate Audio</>
          )}
        </button>
      </div>

      {/* Audio Player */}
      <div
        className="rounded-2xl p-5 flex flex-col justify-center"
        style={{
          backgroundColor: "rgba(12,10,9,0.6)",
          border: "1px solid rgba(245,158,11,0.1)",
          minHeight: 240,
        }}
      >
        {loading ? (
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto mb-3" style={{ width: 28, height: 28, color: "#F59E0B" }} />
            <p className="text-sm" style={{ color: "#78716C" }}>Synthesizing with {voice} voice...</p>
          </div>
        ) : generated ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 style={{ width: 14, height: 14, color: "#F59E0B" }} />
              <span className="text-xs font-semibold" style={{ color: "#F59E0B" }}>
                Audio Ready · {voice} · {speed}x · {format}
              </span>
            </div>

            {/* Waveform */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: "rgba(28,25,23,0.8)", border: "1px solid rgba(245,158,11,0.08)" }}
            >
              <WaveformViz playing={playing} />
            </div>

            {/* Progress */}
            <div className="progress-warm">
              <div className="progress-warm-fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePlayPause}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: playing
                    ? "rgba(245,158,11,0.15)"
                    : "linear-gradient(135deg, #F59E0B, #FB923C)",
                  color: playing ? "#F59E0B" : "#0C0A09",
                  border: playing ? "1px solid rgba(245,158,11,0.3)" : "none",
                  boxShadow: playing ? "none" : "0 2px 12px rgba(245,158,11,0.3)",
                }}
              >
                {playing ? (
                  <>
                    <span className="w-3 h-3 flex gap-0.5">
                      <span className="w-1 h-3 rounded-sm" style={{ backgroundColor: "#F59E0B" }} />
                      <span className="w-1 h-3 rounded-sm" style={{ backgroundColor: "#F59E0B" }} />
                    </span>
                    Pause
                  </>
                ) : (
                  <>
                    <Play style={{ width: 14, height: 14 }} />
                    Play
                  </>
                )}
              </button>
              <span className="text-xs font-mono" style={{ color: "#57534E" }}>
                ~{Math.round((text.split(" ").length / 2.5) * (1 / speed))}s estimated
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                backgroundColor: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.12)",
              }}
            >
              <Mic style={{ width: 26, height: 26, color: "#44403C" }} />
            </div>
            <p className="text-sm" style={{ color: "#44403C" }}>
              Audio player will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PIPELINE BUILDER TAB ───────────────────────────────────────────────────

type StepType = "text_generate" | "image_generate" | "vision_analyze" | "moderate" | "transform";

interface PipelineStep {
  id: string;
  type: StepType;
  config: Record<string, string>;
  status: "idle" | "running" | "done" | "error";
  output?: string;
}

const STEP_OPTIONS: { value: StepType; label: string; color: string }[] = [
  { value: "text_generate", label: "Text Generate",    color: "#F59E0B" },
  { value: "image_generate", label: "Image Generate",  color: "#FB923C" },
  { value: "vision_analyze", label: "Vision Analyze",  color: "#FBBF24" },
  { value: "moderate",       label: "Moderate",        color: "#A8A29E" },
  { value: "transform",      label: "Transform",       color: "#78716C" },
];

const STEP_OUTPUTS: Record<StepType, string> = {
  text_generate:  "Generated text output from GPT-4o model based on pipeline context.",
  image_generate: "DALL-E 3 image generated from the accumulated text context.",
  vision_analyze: "GPT-4o vision analysis: image depicts complex visual composition with layered elements.",
  moderate:       "Moderation passed: safe (score: 1.0). No harmful content detected.",
  transform:      "Input transformed successfully. Output propagated to next pipeline step.",
};

let stepCounter = 0;

function PipelineTab() {
  const [steps, setSteps] = useState<PipelineStep[]>([
    { id: `step-${++stepCounter}`, type: "moderate", config: {}, status: "idle" },
    { id: `step-${++stepCounter}`, type: "text_generate", config: { prompt: "Describe an AI-powered future" }, status: "idle" },
  ]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [running, setRunning] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [done, setDone] = useState(false);

  const addStep = (type: StepType) => {
    setSteps((prev) => [
      ...prev,
      { id: `step-${++stepCounter}`, type, config: {}, status: "idle" },
    ]);
    setShowAddMenu(false);
    setDone(false);
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    setDone(false);
  };

  const updateConfig = (id: string, key: string, value: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, config: { ...s.config, [key]: value } } : s))
    );
  };

  const execute = async () => {
    if (steps.length === 0) return;
    setRunning(true);
    setDone(false);
    setOverallProgress(0);
    setSteps((prev) => prev.map((s) => ({ ...s, status: "idle", output: undefined })));

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setSteps((prev) =>
        prev.map((s) => (s.id === step.id ? { ...s, status: "running" } : s))
      );
      await sleep(600 + Math.random() * 400);
      setSteps((prev) =>
        prev.map((s) =>
          s.id === step.id
            ? { ...s, status: "done", output: STEP_OUTPUTS[s.type] }
            : s
        )
      );
      setOverallProgress(Math.round(((i + 1) / steps.length) * 100));
    }
    setRunning(false);
    setDone(true);
  };

  return (
    <div className="space-y-5">
      {/* Pipeline steps */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const stepDef = STEP_OPTIONS.find((o) => o.value === step.type)!;
          return (
            <div key={step.id} className="flex flex-col sm:flex-row gap-3">
              {/* Step number + connector */}
              <div className="flex sm:flex-col items-center gap-2 sm:gap-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: step.status === "done"
                      ? "linear-gradient(135deg, #F59E0B, #FB923C)"
                      : step.status === "running"
                      ? "rgba(245,158,11,0.2)"
                      : "rgba(68,64,60,0.5)",
                    color: step.status === "done" ? "#0C0A09" : stepDef.color,
                    border: step.status === "running" ? `1px solid ${stepDef.color}` : "none",
                  }}
                >
                  {step.status === "done" ? (
                    <CheckCircle2 style={{ width: 14, height: 14 }} />
                  ) : step.status === "running" ? (
                    <Loader2 className="animate-spin" style={{ width: 12, height: 12 }} />
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className="hidden sm:block w-px flex-1"
                    style={{
                      height: 20,
                      background: step.status === "done"
                        ? "linear-gradient(to bottom, #F59E0B, rgba(245,158,11,0.1))"
                        : "rgba(68,64,60,0.3)",
                    }}
                  />
                )}
              </div>

              {/* Step card */}
              <div
                className="flex-1 rounded-xl p-4"
                style={{
                  backgroundColor: "rgba(28,25,23,0.8)",
                  border: `1px solid ${
                    step.status === "running"
                      ? `${stepDef.color}60`
                      : step.status === "done"
                      ? "rgba(245,158,11,0.2)"
                      : "rgba(245,158,11,0.08)"
                  }`,
                  boxShadow: step.status === "running" ? `0 0 16px ${stepDef.color}20` : "none",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-sm font-bold px-2.5 py-1 rounded-lg"
                    style={{
                      backgroundColor: `${stepDef.color}10`,
                      color: stepDef.color,
                      border: `1px solid ${stepDef.color}25`,
                    }}
                  >
                    {stepDef.label}
                  </span>
                  <button
                    onClick={() => removeStep(step.id)}
                    disabled={running}
                    className="text-xs transition-colors"
                    style={{ color: "#57534E" }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>

                {/* Configurable fields */}
                {step.type === "text_generate" && (
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 4 }}>Prompt</label>
                    <input
                      type="text"
                      value={step.config.prompt || ""}
                      onChange={(e) => updateConfig(step.id, "prompt", e.target.value)}
                      placeholder="Enter generation prompt..."
                      style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.45)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.15)"; }}
                    />
                  </div>
                )}
                {step.type === "transform" && (
                  <div>
                    <label style={{ ...labelStyle, marginBottom: 4 }}>Transform Type</label>
                    <select
                      value={step.config.transform || "uppercase"}
                      onChange={(e) => updateConfig(step.id, "transform", e.target.value)}
                      style={{ padding: "8px 36px 8px 12px", fontSize: 13 }}
                    >
                      <option value="uppercase">Uppercase</option>
                      <option value="summarize">Summarize</option>
                      <option value="translate">Translate</option>
                    </select>
                  </div>
                )}

                {/* Output */}
                {step.output && (
                  <div
                    className="mt-3 p-3 rounded-lg text-xs"
                    style={{
                      backgroundColor: "rgba(245,158,11,0.04)",
                      border: "1px solid rgba(245,158,11,0.1)",
                      color: "#A8A29E",
                    }}
                  >
                    <span className="font-bold" style={{ color: "#F59E0B" }}>Output: </span>
                    {step.output}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add step */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          disabled={running || steps.length >= 10}
          className="btn-outline-warm text-sm"
          style={{ width: "100%", justifyContent: "center" }}
        >
          <Plus style={{ width: 15, height: 15 }} />
          Add Step {steps.length >= 10 ? "(Max 10)" : ""}
        </button>
        {showAddMenu && (
          <div
            className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-10"
            style={{
              backgroundColor: "#1C1917",
              border: "1px solid rgba(245,158,11,0.2)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {STEP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => addStep(opt.value)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors"
                style={{ color: "#A8A29E" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(245,158,11,0.06)";
                  (e.currentTarget as HTMLElement).style.color = "#F5F5F4";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#A8A29E";
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: opt.color }}
                />
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Progress */}
      {(running || done) && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs" style={{ color: "#78716C" }}>
            <span>Pipeline Progress</span>
            <span style={{ color: "#F59E0B" }}>{overallProgress}%</span>
          </div>
          <div className="progress-warm">
            <div className="progress-warm-fill" style={{ width: `${overallProgress}%` }} />
          </div>
          {done && (
            <p className="text-xs text-center" style={{ color: "#F59E0B" }}>
              Pipeline executed successfully — {steps.length} steps completed
            </p>
          )}
        </div>
      )}

      {/* Execute button */}
      <button
        onClick={execute}
        disabled={running || steps.length === 0}
        className="btn-amber"
        style={{ width: "100%", justifyContent: "center" }}
      >
        {running ? (
          <><Loader2 className="animate-spin" style={{ width: 16, height: 16 }} /> Executing Pipeline...</>
        ) : (
          <><ZapIcon style={{ width: 16, height: 16 }} /> Execute Pipeline</>
        )}
      </button>
    </div>
  );
}

// ─── Main MultiModalDemo ────────────────────────────────────────────────────

export default function MultiModalDemo() {
  const [activeTab, setActiveTab] = useState<TabId>("text");

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        backgroundColor: "rgba(28,25,23,0.8)",
        border: "1px solid rgba(245,158,11,0.12)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}
    >
      {/* Tab bar */}
      <div
        className="flex gap-1 p-3 overflow-x-auto"
        style={{
          backgroundColor: "rgba(12,10,9,0.5)",
          borderBottom: "1px solid rgba(245,158,11,0.08)",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200"
            style={{
              backgroundColor: activeTab === tab.id
                ? "rgba(245,158,11,0.12)"
                : "transparent",
              color: activeTab === tab.id ? "#F59E0B" : "#78716C",
              border: activeTab === tab.id
                ? "1px solid rgba(245,158,11,0.25)"
                : "1px solid transparent",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">
        {activeTab === "text"     && <TextTab />}
        {activeTab === "vision"   && <VisionTab />}
        {activeTab === "image"    && <ImageTab />}
        {activeTab === "audio"    && <AudioTab />}
        {activeTab === "pipeline" && <PipelineTab />}
      </div>
    </div>
  );
}
