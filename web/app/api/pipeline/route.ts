import { NextRequest, NextResponse } from "next/server";
import { chatComplete, DeepSeekError } from "@/lib/deepseek";

export const runtime = "nodejs";
export const maxDuration = 120;

type StepType = "moderate" | "text_generate" | "image_generate" | "vision_analyze" | "transform";

interface StepInput {
  type: StepType;
  config?: Record<string, any>;
}

interface StepResult {
  type: StepType;
  status: "ok" | "error";
  output: string;
  meta?: Record<string, any>;
  latency_ms: number;
  error?: string;
}

const HARD_BLOCK = [/\b(child\s*porn|csam|how to make (a )?bomb)\b/i];

async function runModerate(ctx: { text: string }): Promise<StepResult> {
  const started = Date.now();
  for (const pattern of HARD_BLOCK) {
    if (pattern.test(ctx.text)) {
      return {
        type: "moderate",
        status: "error",
        output: "blocked",
        error: "Content blocked by moderation",
        latency_ms: Date.now() - started,
      };
    }
  }
  try {
    const result = await chatComplete(
      [
        { role: "system", content: 'Return only JSON: {"category":"safe"|"flagged"|"blocked","score":0..1}' },
        { role: "user", content: `Classify: ${ctx.text.slice(0, 2000)}` },
      ],
      { temperature: 0, max_tokens: 80 }
    );
    let parsed: any = { category: "safe", score: 0 };
    try {
      parsed = JSON.parse(result.content.trim().replace(/^```(?:json)?\s*|\s*```$/g, ""));
    } catch {}
    const blocked = parsed.category === "blocked";
    return {
      type: "moderate",
      status: blocked ? "error" : "ok",
      output: `${parsed.category} (score: ${parsed.score})`,
      meta: parsed,
      latency_ms: Date.now() - started,
      error: blocked ? "Pipeline aborted: content blocked" : undefined,
    };
  } catch (e) {
    return {
      type: "moderate",
      status: "error",
      output: "moderation failed",
      error: (e as Error).message,
      latency_ms: Date.now() - started,
    };
  }
}

async function runTextGenerate(ctx: { prompt: string; temperature?: number; maxTokens?: number }): Promise<StepResult> {
  const started = Date.now();
  try {
    const r = await chatComplete(
      [
        { role: "system", content: "You are a concise expert assistant." },
        { role: "user", content: ctx.prompt },
      ],
      { temperature: ctx.temperature ?? 0.7, max_tokens: ctx.maxTokens ?? 500 }
    );
    return {
      type: "text_generate",
      status: "ok",
      output: r.content,
      meta: { tokens_used: r.usage.total_tokens },
      latency_ms: Date.now() - started,
    };
  } catch (e) {
    return {
      type: "text_generate",
      status: "error",
      output: "",
      error: (e as Error).message,
      latency_ms: Date.now() - started,
    };
  }
}

async function runImageGenerate(ctx: { prompt: string; size?: string }): Promise<StepResult> {
  const started = Date.now();
  const sizeKey = (ctx.size && /^\d+x\d+$/.test(ctx.size)) ? ctx.size : "1024x1024";
  const [w, h] = sizeKey.split("x").map(Number);
  const seed = Math.floor(Math.random() * 1_000_000);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(ctx.prompt)}?width=${w}&height=${h}&seed=${seed}&nologo=true`;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Provider ${r.status}`);
    return {
      type: "image_generate",
      status: "ok",
      output: url,
      meta: { size: sizeKey, seed },
      latency_ms: Date.now() - started,
    };
  } catch (e) {
    return {
      type: "image_generate",
      status: "error",
      output: "",
      error: (e as Error).message,
      latency_ms: Date.now() - started,
    };
  }
}

async function runVisionAnalyze(ctx: { imageUrl: string; prompt?: string }): Promise<StepResult> {
  const started = Date.now();
  if (!ctx.imageUrl) {
    return { type: "vision_analyze", status: "error", output: "", error: "No image URL from prior step", latency_ms: 0 };
  }
  try {
    const r = await chatComplete(
      [
        { role: "system", content: "You analyze images indirectly via URL/metadata context. Be useful and honest." },
        { role: "user", content: `Image URL: ${ctx.imageUrl}\n\n${ctx.prompt ?? "Describe this image."}` },
      ],
      { temperature: 0.5, max_tokens: 400 }
    );
    return {
      type: "vision_analyze",
      status: "ok",
      output: r.content,
      latency_ms: Date.now() - started,
    };
  } catch (e) {
    return { type: "vision_analyze", status: "error", output: "", error: (e as Error).message, latency_ms: Date.now() - started };
  }
}

async function runTransform(ctx: { input: string; transform?: string }): Promise<StepResult> {
  const started = Date.now();
  const mode = ctx.transform ?? "uppercase";
  if (mode === "uppercase") {
    return { type: "transform", status: "ok", output: ctx.input.toUpperCase(), latency_ms: Date.now() - started };
  }
  if (mode === "lowercase") {
    return { type: "transform", status: "ok", output: ctx.input.toLowerCase(), latency_ms: Date.now() - started };
  }
  try {
    const instruction = mode === "summarize"
      ? `Summarize the following text in 2 sentences:\n\n${ctx.input}`
      : mode === "translate"
      ? `Translate the following text to English (or to another language if already English, then to Uzbek):\n\n${ctx.input}`
      : `Apply transform "${mode}" to:\n\n${ctx.input}`;
    const r = await chatComplete(
      [{ role: "user", content: instruction }],
      { temperature: 0.3, max_tokens: 400 }
    );
    return { type: "transform", status: "ok", output: r.content, latency_ms: Date.now() - started };
  } catch (e) {
    return { type: "transform", status: "error", output: "", error: (e as Error).message, latency_ms: Date.now() - started };
  }
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawSteps: StepInput[] = Array.isArray(body?.steps) ? body.steps : [];
  if (rawSteps.length === 0) return NextResponse.json({ error: "steps array is required" }, { status: 400 });
  if (rawSteps.length > 10) return NextResponse.json({ error: "max 10 steps per pipeline" }, { status: 400 });

  const initialInput: string = (body?.initial_input?.text ?? body?.initial_input ?? "").toString();

  const results: StepResult[] = [];
  let context = initialInput;
  let lastImageUrl: string | undefined;
  const totalStart = Date.now();

  for (const step of rawSteps) {
    const cfg = step.config ?? {};
    let result: StepResult;
    switch (step.type) {
      case "moderate":
        result = await runModerate({ text: cfg.text ?? context });
        break;
      case "text_generate":
        result = await runTextGenerate({
          prompt: cfg.prompt ?? (context ? `Continue: ${context}` : "Say hello"),
          temperature: cfg.temperature,
          maxTokens: cfg.maxTokens,
        });
        if (result.status === "ok") context = result.output;
        break;
      case "image_generate":
        result = await runImageGenerate({ prompt: cfg.prompt ?? context ?? "abstract art", size: cfg.size });
        if (result.status === "ok") lastImageUrl = result.output;
        break;
      case "vision_analyze":
        result = await runVisionAnalyze({ imageUrl: cfg.imageUrl ?? lastImageUrl ?? "", prompt: cfg.prompt });
        if (result.status === "ok") context = result.output;
        break;
      case "transform":
        result = await runTransform({ input: cfg.input ?? context, transform: cfg.transform });
        if (result.status === "ok") context = result.output;
        break;
      default:
        result = { type: step.type as any, status: "error", output: "", error: `Unknown step type: ${step.type}`, latency_ms: 0 };
    }
    results.push(result);
    if (result.status === "error") break;
  }

  return NextResponse.json({
    steps: results,
    total_latency_ms: Date.now() - totalStart,
    completed: results.length,
    status: results.some((r) => r.status === "error") ? "failed" : "success",
    final_context: context,
  });
}
