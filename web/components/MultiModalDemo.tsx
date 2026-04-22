"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  MessageSquare,
  Eye,
  ImageIcon,
  Mic,
  GitBranch,
  Shield,
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
  AlertTriangle,
  Download,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

type TabId = "text" | "vision" | "image" | "audio" | "pipeline" | "moderation";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { id: "text",       label: "Text Generation",    icon: <MessageSquare style={{ width: 15, height: 15 }} /> },
  { id: "vision",     label: "Vision Analysis",    icon: <Eye style={{ width: 15, height: 15 }} /> },
  { id: "image",      label: "Image Generation",   icon: <ImageIcon style={{ width: 15, height: 15 }} /> },
  { id: "audio",      label: "Text-to-Speech",     icon: <Mic style={{ width: 15, height: 15 }} /> },
  { id: "pipeline",   label: "Pipeline Execution", icon: <GitBranch style={{ width: 15, height: 15 }} /> },
  { id: "moderation", label: "Content Moderation", icon: <Shield style={{ width: 15, height: 15 }} /> },
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

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="flex items-start gap-2 p-3 rounded-xl text-sm"
      style={{
        backgroundColor: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.25)",
        color: "#FCA5A5",
      }}
    >
      <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}

// ─── TEXT TAB ───────────────────────────────────────────────────────────────

function TextTab() {
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("You are an expert AI systems engineer. Be precise and technical.");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(800);
  const [model, setModel] = useState<"deepseek-chat" | "deepseek-reasoner">("deepseek-chat");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [streaming, setStreaming] = useState(true);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ tokens?: number; latency?: number } | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setOutput("");
    setStats(null);
    const started = Date.now();

    try {
      const res = await fetch("/api/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemPrompt, temperature, maxTokens, model, stream: streaming }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      if (streaming && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const obj = JSON.parse(payload);
              if (obj.content) setOutput((prev) => prev + obj.content);
            } catch {}
          }
        }
        setStats({ latency: Date.now() - started });
      } else {
        const data = await res.json();
        setOutput(data.content || "");
        setStats({ tokens: data.tokens_used, latency: data.latency_ms });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label style={labelStyle}>Prompt (ozingiz yozing)</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            placeholder="Masalan: Async Python da concurrency patterns ni tushuntiring..."
            style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
          />
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs font-semibold"
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
              />
            </div>
            <div>
              <label style={labelStyle}>Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value as any)}>
                <option value="deepseek-chat">deepseek-chat (V3, tez)</option>
                <option value="deepseek-reasoner">deepseek-reasoner (R1, fikrli)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>
                Temperature: <span style={{ color: "#F59E0B" }}>{temperature}</span>
              </label>
              <input type="range" min={0} max={2} step={0.1} value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))} style={{ width: "100%" }} />
            </div>
            <div>
              <label style={labelStyle}>
                Max Tokens: <span style={{ color: "#F59E0B" }}>{maxTokens}</span>
              </label>
              <input type="range" min={50} max={4000} step={50} value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))} style={{ width: "100%" }} />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#A8A29E" }}>
              <input type="checkbox" checked={streaming} onChange={(e) => setStreaming(e.target.checked)} />
              Stream tokens (SSE)
            </label>
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
            <><ZapIcon style={{ width: 16, height: 16 }} /> Run</>
          )}
        </button>

        {error && <ErrorBanner message={error} />}
      </div>

      <div className="rounded-2xl p-5 min-h-[240px]"
        style={{ backgroundColor: "rgba(12,10,9,0.6)", border: "1px solid rgba(245,158,11,0.1)" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#57534E" }}>Output</span>
          {stats && (
            <span className="flex items-center gap-2 text-xs" style={{ color: "#F59E0B" }}>
              <CheckCircle2 style={{ width: 13, height: 13 }} />
              {stats.tokens ? `${stats.tokens} tok · ` : ""}{stats.latency}ms
            </span>
          )}
          {loading && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "#A8A29E" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#F59E0B" }} />
              Streaming...
            </span>
          )}
        </div>
        {output ? (
          <div className="text-sm leading-relaxed" style={{ color: "#D6D3D1", whiteSpace: "pre-wrap" }}>
            {output}
            {loading && <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse align-middle" style={{ backgroundColor: "#F59E0B" }} />}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm" style={{ color: "#44403C" }}>
              {loading ? "DeepSeek javob bermoqda..." : "Prompt yozing va Run tugmasini bosing"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── VISION TAB ─────────────────────────────────────────────────────────────

function VisionTab() {
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.match(/image\/(jpeg|png|gif|webp)/)) {
      setError("Faqat JPG, PNG, GIF, WEBP formatlari qo'llab-quvvatlanadi");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Rasm 4 MB dan kichik bo'lishi kerak");
      return;
    }
    setError(null);
    setImageName(file.name);
    setImageUrl("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      setImagePreview(data);
      setImageData(data);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleAnalyze = async () => {
    if (loading) return;
    if (!imageData && !imageUrl.trim()) {
      setError("Rasm URL kiriting yoki fayl yuklang");
      return;
    }
    if (!prompt.trim()) {
      setError("Tahlil uchun savol yozing");
      return;
    }
    setLoading(true);
    setError(null);
    setResult("");
    setNote(null);
    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imageUrl.trim() || undefined,
          imageData: imageData ? imageData.split(",")[1] : undefined,
          imageName,
          prompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data.analysis || "");
      setNote(data.note || null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label style={labelStyle}>Rasm URL yoki fayl yuklash</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              if (e.target.value) { setImageData(null); setImagePreview(e.target.value || null); setImageName(""); }
            }}
            placeholder="https://example.com/image.jpg"
            style={{ ...inputStyle, marginBottom: 10 }}
          />
          <div
            className={`drop-zone p-5 text-center cursor-pointer transition-all ${isDragging ? "dragging" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {imagePreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain" style={{ maxWidth: "100%" }} />
                <button onClick={(e) => { e.stopPropagation(); setImageData(null); setImagePreview(null); setImageUrl(""); setImageName(""); setResult(""); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(12,10,9,0.8)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <X style={{ width: 13, height: 13, color: "#A8A29E" }} />
                </button>
                {imageName && <p className="text-xs mt-3" style={{ color: "#78716C" }}>{imageName}</p>}
              </div>
            ) : (
              <div>
                <Upload className="mx-auto mb-3" style={{ width: 28, height: 28, color: "#57534E" }} />
                <p className="text-sm font-medium" style={{ color: "#A8A29E" }}>Drag & drop yoki click qiling</p>
                <p className="text-xs mt-1" style={{ color: "#57534E" }}>JPG, PNG, GIF, WEBP (max 4 MB)</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Tahlil savoli (ozingiz yozing)</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Masalan: Rasmdagi odam kiyim rangini aniqlang"
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        <button onClick={handleAnalyze} disabled={loading} className="btn-amber"
          style={{ width: "100%", justifyContent: "center" }}>
          {loading ? (
            <><Loader2 className="animate-spin" style={{ width: 16, height: 16 }} /> Analyzing...</>
          ) : (
            <><Eye style={{ width: 16, height: 16 }} /> Run</>
          )}
        </button>

        {error && <ErrorBanner message={error} />}
      </div>

      <div className="rounded-2xl p-5 min-h-[240px]"
        style={{ backgroundColor: "rgba(12,10,9,0.6)", border: "1px solid rgba(245,158,11,0.1)" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#57534E" }}>Analysis Result</span>
          {result && !loading && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "#F59E0B" }}>
              <CheckCircle2 style={{ width: 13, height: 13 }} />
              DeepSeek Analysis
            </span>
          )}
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Loader2 className="animate-spin" style={{ width: 24, height: 24, color: "#F59E0B" }} />
            <p className="text-sm" style={{ color: "#78716C" }}>Analyzing...</p>
          </div>
        ) : result ? (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed" style={{ color: "#D6D3D1", whiteSpace: "pre-wrap" }}>{result}</p>
            {note && (
              <p className="text-xs italic" style={{ color: "#78716C" }}>ℹ️ {note}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm" style={{ color: "#44403C" }}>Rasm va savol kiriting, Run bosing</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── IMAGE GENERATION TAB ───────────────────────────────────────────────────

function ImageTab() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [style, setImgStyle] = useState<"vivid" | "natural">("vivid");
  const [quality, setQuality] = useState<"standard" | "hd">("standard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; size: string; latency: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size, style, quality }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult({ url: data.image_url, size: data.size, latency: data.latency_ms });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label style={labelStyle}>Image Prompt (ozingiz yozing)</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            placeholder="Masalan: Bahorda Samarqand Registon maydoni, quyosh botishi, realistik..."
            style={{ ...inputStyle, resize: "vertical", minHeight: 130 }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label style={labelStyle}>Size</label>
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="512x512">512×512</option>
              <option value="1024x1024">1024×1024</option>
              <option value="1792x1024">1792×1024</option>
              <option value="1024x1792">1024×1792</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Style</label>
            <select value={style} onChange={(e) => setImgStyle(e.target.value as any)}>
              <option value="vivid">Vivid</option>
              <option value="natural">Natural</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Quality</label>
            <select value={quality} onChange={(e) => setQuality(e.target.value as any)}>
              <option value="standard">Standard</option>
              <option value="hd">HD</option>
            </select>
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="btn-amber"
          style={{ width: "100%", justifyContent: "center" }}>
          {loading ? (
            <><Loader2 className="animate-spin" style={{ width: 16, height: 16 }} /> Generating (~5-15s)...</>
          ) : (
            <><ImageIcon style={{ width: 16, height: 16 }} /> Run</>
          )}
        </button>

        {error && <ErrorBanner message={error} />}
        <p className="text-xs" style={{ color: "#57534E" }}>
          Provider: Pollinations.ai (bepul, registratsiyasiz)
        </p>
      </div>

      <div className="rounded-2xl p-5 flex flex-col items-center justify-center min-h-[300px]"
        style={{ backgroundColor: "rgba(12,10,9,0.6)", border: "1px solid rgba(245,158,11,0.1)" }}>
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin" style={{ width: 40, height: 40, color: "#F59E0B" }} />
            <p className="text-sm" style={{ color: "#A8A29E" }}>Rasm yaratilmoqda...</p>
            <p className="text-xs" style={{ color: "#57534E" }}>Bu 5-20 soniya olishi mumkin</p>
          </div>
        ) : result ? (
          <div className="w-full space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 style={{ width: 14, height: 14, color: "#F59E0B" }} />
              <span className="text-xs font-semibold" style={{ color: "#F59E0B" }}>
                {result.size} · {result.latency}ms
              </span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.url} alt={prompt} className="rounded-xl w-full object-contain" style={{ maxHeight: 500 }} />
            <a href={result.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B" }}>
              <Download style={{ width: 13, height: 13 }} /> Yangi varaqda ochish
            </a>
          </div>
        ) : (
          <div className="text-center">
            <ImageIcon style={{ width: 40, height: 40, color: "#44403C" }} className="mx-auto mb-3" />
            <p className="text-sm" style={{ color: "#44403C" }}>Prompt yozing va Run bosing</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AUDIO (TTS) TAB ────────────────────────────────────────────────────────

function AudioTab() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState<string>("");
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (v.length > 0 && !voice) setVoice(v[0].name);
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [voice]);

  const handleSpeak = () => {
    if (!text.trim()) { setError("Matn kiriting"); return; }
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setError("Brauzeringiz Web Speech API ni qo'llab-quvvatlamaydi");
      return;
    }
    setError(null);
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = speed;
    utter.pitch = pitch;
    const selectedVoice = voices.find((v) => v.name === voice);
    if (selectedVoice) utter.voice = selectedVoice;
    utter.onend = () => setPlaying(false);
    utter.onerror = (e) => { setError(`Speech error: ${e.error}`); setPlaying(false); };
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
    setPlaying(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label style={labelStyle}>Ovozga aylantirish uchun matn</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Istalgan matnni yozing — o'zbekcha, ingliz, rus va boshqa tillarda..."
            style={{ ...inputStyle, resize: "vertical", minHeight: 150 }}
          />
        </div>

        <div>
          <label style={labelStyle}>Voice ({voices.length} available)</label>
          <select value={voice} onChange={(e) => setVoice(e.target.value)}>
            {voices.map((v) => (
              <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Speed: <span style={{ color: "#F59E0B" }}>{speed.toFixed(2)}x</span></label>
          <input type="range" min={0.5} max={2} step={0.1} value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))} style={{ width: "100%" }} />
        </div>

        <div>
          <label style={labelStyle}>Pitch: <span style={{ color: "#F59E0B" }}>{pitch.toFixed(2)}</span></label>
          <input type="range" min={0.5} max={2} step={0.1} value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))} style={{ width: "100%" }} />
        </div>

        <div className="flex gap-2">
          <button onClick={handleSpeak} disabled={playing || !text.trim()} className="btn-amber flex-1"
            style={{ justifyContent: "center" }}>
            <Play style={{ width: 16, height: 16 }} /> Run
          </button>
          {playing && (
            <button onClick={handleStop} className="btn-outline-warm" style={{ justifyContent: "center" }}>
              <X style={{ width: 16, height: 16 }} /> Stop
            </button>
          )}
        </div>

        {error && <ErrorBanner message={error} />}
      </div>

      <div className="rounded-2xl p-5 min-h-[240px] flex flex-col"
        style={{ backgroundColor: "rgba(12,10,9,0.6)", border: "1px solid rgba(245,158,11,0.1)" }}>
        <span className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#57534E" }}>
          Audio Player (Browser Web Speech API)
        </span>
        <div className="flex-1 flex flex-col items-center justify-center">
          {playing ? (
            <>
              <div className="flex items-center gap-1 mb-4 h-12">
                {Array.from({ length: 20 }).map((_, i) => (
                  <span key={i} className="block w-1.5 rounded-full animate-pulse"
                    style={{ height: `${20 + Math.random() * 30}px`, backgroundColor: "#F59E0B",
                      animationDelay: `${i * 80}ms`, animationDuration: "0.8s" }} />
                ))}
              </div>
              <p className="text-sm font-semibold" style={{ color: "#F59E0B" }}>Playing...</p>
            </>
          ) : (
            <>
              <Mic style={{ width: 40, height: 40, color: "#44403C" }} className="mb-3" />
              <p className="text-sm text-center" style={{ color: "#44403C" }}>
                Matn yozib Run bosing — brauzer uni ovozga aylantiradi
              </p>
              <p className="text-xs mt-2 text-center" style={{ color: "#57534E" }}>
                Hech qanday API key kerak emas (brauzerning Web Speech API)
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PIPELINE TAB ───────────────────────────────────────────────────────────

type StepType = "moderate" | "text_generate" | "image_generate" | "vision_analyze" | "transform";

interface PipelineStep {
  id: string;
  type: StepType;
  config: Record<string, string>;
  status: "idle" | "running" | "done" | "error";
  output?: string;
  error?: string;
  latency_ms?: number;
}

const STEP_OPTIONS: { value: StepType; label: string; color: string }[] = [
  { value: "moderate",       label: "Moderate",        color: "#A8A29E" },
  { value: "text_generate",  label: "Text Generate",   color: "#F59E0B" },
  { value: "image_generate", label: "Image Generate",  color: "#FB923C" },
  { value: "vision_analyze", label: "Vision Analyze",  color: "#FBBF24" },
  { value: "transform",      label: "Transform",       color: "#78716C" },
];

let stepCounter = 0;

function PipelineTab() {
  const [initialInput, setInitialInput] = useState("");
  const [steps, setSteps] = useState<PipelineStep[]>([
    { id: `step-${++stepCounter}`, type: "moderate", config: {}, status: "idle" },
    { id: `step-${++stepCounter}`, type: "text_generate", config: { prompt: "" }, status: "idle" },
  ]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalLatency, setTotalLatency] = useState<number | null>(null);

  const addStep = (type: StepType) => {
    setSteps((prev) => [...prev, { id: `step-${++stepCounter}`, type, config: {}, status: "idle" }]);
    setShowAddMenu(false);
    setDone(false);
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    setDone(false);
  };

  const updateConfig = (id: string, key: string, value: string) => {
    setSteps((prev) => prev.map((s) => s.id === id ? { ...s, config: { ...s.config, [key]: value } } : s));
  };

  const execute = async () => {
    if (steps.length === 0 || running) return;
    setRunning(true);
    setDone(false);
    setError(null);
    setTotalLatency(null);
    setSteps((prev) => prev.map((s) => ({ ...s, status: "idle", output: undefined, error: undefined })));

    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initial_input: { text: initialInput },
          steps: steps.map((s) => ({ type: s.type, config: s.config })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setSteps((prev) => prev.map((s, idx) => {
        const r = data.steps[idx];
        if (!r) return s;
        return {
          ...s,
          status: r.status === "ok" ? "done" : "error",
          output: r.output,
          error: r.error,
          latency_ms: r.latency_ms,
        };
      }));
      setTotalLatency(data.total_latency_ms);
      setDone(true);
      if (data.status === "failed") setError("Pipeline failed — see step errors below");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label style={labelStyle}>Initial Input (pipeline kirish matni)</label>
        <textarea
          value={initialInput}
          onChange={(e) => setInitialInput(e.target.value)}
          rows={2}
          placeholder="Masalan: A serene mountain landscape at sunrise"
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const stepDef = STEP_OPTIONS.find((o) => o.value === step.type)!;
          return (
            <div key={step.id} className="flex flex-col sm:flex-row gap-3">
              <div className="flex sm:flex-col items-center gap-2 sm:gap-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: step.status === "done" ? "linear-gradient(135deg, #F59E0B, #FB923C)"
                      : step.status === "running" ? "rgba(245,158,11,0.2)"
                      : step.status === "error" ? "rgba(239,68,68,0.2)"
                      : "rgba(68,64,60,0.5)",
                    color: step.status === "done" ? "#0C0A09" : step.status === "error" ? "#FCA5A5" : stepDef.color,
                  }}>
                  {step.status === "done" ? <CheckCircle2 style={{ width: 14, height: 14 }} />
                    : step.status === "running" ? <Loader2 className="animate-spin" style={{ width: 12, height: 12 }} />
                    : step.status === "error" ? <AlertTriangle style={{ width: 12, height: 12 }} />
                    : idx + 1}
                </div>
              </div>

              <div className="flex-1 rounded-xl p-4"
                style={{ backgroundColor: "rgba(28,25,23,0.8)",
                  border: `1px solid ${step.status === "error" ? "rgba(239,68,68,0.3)" : step.status === "done" ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.08)"}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <select value={step.type} disabled={running}
                      onChange={(e) => setSteps((prev) => prev.map((s) => s.id === step.id ? { ...s, type: e.target.value as StepType, config: {} } : s))}
                      style={{ padding: "4px 28px 4px 8px", fontSize: 12 }}>
                      {STEP_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {step.latency_ms !== undefined && (
                      <span className="text-xs" style={{ color: "#78716C" }}>{step.latency_ms}ms</span>
                    )}
                  </div>
                  <button onClick={() => removeStep(step.id)} disabled={running} style={{ color: "#57534E" }}>
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>

                {step.type === "text_generate" && (
                  <input type="text" value={step.config.prompt || ""} disabled={running}
                    onChange={(e) => updateConfig(step.id, "prompt", e.target.value)}
                    placeholder="Prompt (bo'sh qoldirsangiz oldingi step outputi kirish bo'ladi)"
                    style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }} />
                )}
                {step.type === "image_generate" && (
                  <input type="text" value={step.config.prompt || ""} disabled={running}
                    onChange={(e) => updateConfig(step.id, "prompt", e.target.value)}
                    placeholder="Image prompt (bo'sh = oldingi step outputi)"
                    style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }} />
                )}
                {step.type === "vision_analyze" && (
                  <input type="text" value={step.config.prompt || ""} disabled={running}
                    onChange={(e) => updateConfig(step.id, "prompt", e.target.value)}
                    placeholder="Analysis prompt (rasm URL oldingi image_generate step dan olinadi)"
                    style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }} />
                )}
                {step.type === "transform" && (
                  <select value={step.config.transform || "uppercase"} disabled={running}
                    onChange={(e) => updateConfig(step.id, "transform", e.target.value)}
                    style={{ padding: "8px 36px 8px 12px", fontSize: 13 }}>
                    <option value="uppercase">Uppercase</option>
                    <option value="lowercase">Lowercase</option>
                    <option value="summarize">Summarize (DeepSeek)</option>
                    <option value="translate">Translate (DeepSeek)</option>
                  </select>
                )}

                {step.output && (
                  <div className="mt-3 p-3 rounded-lg text-xs"
                    style={{ backgroundColor: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.1)", color: "#A8A29E" }}>
                    <span className="font-bold" style={{ color: "#F59E0B" }}>Output: </span>
                    {step.type === "image_generate" && step.output.startsWith("http") ? (
                      <a href={step.output} target="_blank" rel="noopener noreferrer" style={{ color: "#F59E0B", textDecoration: "underline" }}>
                        {step.output.slice(0, 80)}...
                      </a>
                    ) : (
                      <span style={{ whiteSpace: "pre-wrap" }}>{step.output.slice(0, 500)}{step.output.length > 500 ? "..." : ""}</span>
                    )}
                  </div>
                )}
                {step.error && (
                  <div className="mt-3 p-2 rounded-lg text-xs" style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#FCA5A5" }}>
                    <span className="font-bold">Error: </span>{step.error}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative">
        <button onClick={() => setShowAddMenu(!showAddMenu)} disabled={running || steps.length >= 10}
          className="btn-outline-warm text-sm" style={{ width: "100%", justifyContent: "center" }}>
          <Plus style={{ width: 15, height: 15 }} />
          Add Step {steps.length >= 10 ? "(Max 10)" : ""}
        </button>
        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-10"
            style={{ backgroundColor: "#1C1917", border: "1px solid rgba(245,158,11,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
            {STEP_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => addStep(opt.value)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left"
                style={{ color: "#A8A29E" }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color }} />
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={execute} disabled={running || steps.length === 0} className="btn-amber"
        style={{ width: "100%", justifyContent: "center" }}>
        {running ? (
          <><Loader2 className="animate-spin" style={{ width: 16, height: 16 }} /> Executing Pipeline...</>
        ) : (
          <><ZapIcon style={{ width: 16, height: 16 }} /> Run Pipeline</>
        )}
      </button>

      {done && totalLatency !== null && (
        <p className="text-xs text-center" style={{ color: "#F59E0B" }}>
          Total latency: {totalLatency}ms · {steps.length} steps
        </p>
      )}

      {error && <ErrorBanner message={error} />}
    </div>
  );
}

// ─── MODERATION TAB ─────────────────────────────────────────────────────────

function ModerationTab() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ category: string; score: number; reasons: string[]; source: string; latency_ms: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const catColor = result?.category === "safe" ? "#22C55E"
    : result?.category === "flagged" ? "#F59E0B"
    : result?.category === "blocked" ? "#EF4444"
    : "#78716C";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label style={labelStyle}>Tekshiriluvchi matn</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Istalgan matnni yozing — DeepSeek uni safe/flagged/blocked deb tasniflaydi..."
            style={{ ...inputStyle, resize: "vertical", minHeight: 200 }}
          />
        </div>

        <button onClick={handleCheck} disabled={loading || !text.trim()} className="btn-amber"
          style={{ width: "100%", justifyContent: "center" }}>
          {loading ? (
            <><Loader2 className="animate-spin" style={{ width: 16, height: 16 }} /> Checking...</>
          ) : (
            <><Shield style={{ width: 16, height: 16 }} /> Run</>
          )}
        </button>

        {error && <ErrorBanner message={error} />}
      </div>

      <div className="rounded-2xl p-5 min-h-[240px]"
        style={{ backgroundColor: "rgba(12,10,9,0.6)", border: "1px solid rgba(245,158,11,0.1)" }}>
        <span className="text-xs font-bold uppercase tracking-wider mb-4 block" style={{ color: "#57534E" }}>
          Moderation Result
        </span>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Loader2 className="animate-spin" style={{ width: 24, height: 24, color: "#F59E0B" }} />
            <p className="text-sm" style={{ color: "#78716C" }}>Classifying...</p>
          </div>
        ) : result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl"
              style={{ backgroundColor: `${catColor}15`, border: `1px solid ${catColor}40` }}>
              <Shield style={{ width: 28, height: 28, color: catColor }} />
              <div>
                <div className="text-xl font-bold uppercase" style={{ color: catColor }}>
                  {result.category}
                </div>
                <div className="text-xs" style={{ color: "#A8A29E" }}>
                  Score: {result.score.toFixed(3)} · Source: {result.source} · {result.latency_ms}ms
                </div>
              </div>
            </div>
            {result.reasons && result.reasons.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase mb-2" style={{ color: "#57534E" }}>Reasons</div>
                <ul className="space-y-1">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: "#A8A29E" }}>
                      <span style={{ color: catColor }}>•</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm" style={{ color: "#44403C" }}>Matn yozing va Run bosing</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main MultiModalDemo ────────────────────────────────────────────────────

export default function MultiModalDemo() {
  const [activeTab, setActiveTab] = useState<TabId>("text");

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{
        backgroundColor: "rgba(28,25,23,0.8)",
        border: "1px solid rgba(245,158,11,0.12)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}>
      <div className="flex gap-1 p-3 overflow-x-auto"
        style={{ backgroundColor: "rgba(12,10,9,0.5)", borderBottom: "1px solid rgba(245,158,11,0.08)" }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
            style={{
              backgroundColor: activeTab === tab.id ? "rgba(245,158,11,0.12)" : "transparent",
              color: activeTab === tab.id ? "#F59E0B" : "#78716C",
              border: activeTab === tab.id ? "1px solid rgba(245,158,11,0.25)" : "1px solid transparent",
            }}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === "text"       && <TextTab />}
        {activeTab === "vision"     && <VisionTab />}
        {activeTab === "image"      && <ImageTab />}
        {activeTab === "audio"      && <AudioTab />}
        {activeTab === "pipeline"   && <PipelineTab />}
        {activeTab === "moderation" && <ModerationTab />}
      </div>
    </div>
  );
}
