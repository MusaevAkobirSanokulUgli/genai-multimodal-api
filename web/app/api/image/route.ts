import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const SIZE_MAP: Record<string, { width: number; height: number }> = {
  "256x256": { width: 256, height: 256 },
  "512x512": { width: 512, height: 512 },
  "1024x1024": { width: 1024, height: 1024 },
  "1792x1024": { width: 1792, height: 1024 },
  "1024x1792": { width: 1024, height: 1792 },
};

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = (body?.prompt ?? "").toString().trim();
  if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

  const size = SIZE_MAP[body?.size] ?? SIZE_MAP["1024x1024"];
  const style = body?.style === "natural" ? "" : "vivid";
  const quality: "standard" | "hd" = body?.quality === "hd" ? "hd" : "standard";
  const seed = Math.floor(Math.random() * 1_000_000);

  const suffix = style ? `, ${style} style, cinematic lighting` : "";
  const enhanced = `${prompt}${suffix}`;
  const encoded = encodeURIComponent(enhanced);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${size.width}&height=${size.height}&seed=${seed}&nologo=true&enhance=${quality === "hd" ? "true" : "false"}`;

  const started = Date.now();
  try {
    const imgRes = await fetch(url, { method: "GET" });
    const latency_ms = Date.now() - started;
    if (!imgRes.ok) {
      return NextResponse.json({ error: `Image provider error ${imgRes.status}` }, { status: 502 });
    }
    return NextResponse.json({
      image_url: url,
      prompt: enhanced,
      size: `${size.width}x${size.height}`,
      quality,
      style: style || "natural",
      seed,
      latency_ms,
      provider: "pollinations.ai (free)",
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
