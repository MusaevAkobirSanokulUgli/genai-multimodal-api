import { NextRequest, NextResponse } from "next/server";
import { chatComplete, DeepSeekError } from "@/lib/deepseek";

export const runtime = "nodejs";
export const maxDuration = 60;

const HARD_BLOCK = [
  /\b(child\s*porn|csam|terror attack plan|how to make (a )?bomb)\b/i,
  /\b(kill\s+yourself|suicide method)\b/i,
];

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = (body?.text ?? "").toString();
  if (!text.trim()) return NextResponse.json({ error: "Text is required" }, { status: 400 });

  for (const pattern of HARD_BLOCK) {
    if (pattern.test(text)) {
      return NextResponse.json({
        category: "blocked",
        score: 1.0,
        reasons: ["Hard-block regex match (local pre-filter)"],
        source: "regex",
        latency_ms: 0,
      });
    }
  }

  const system = `You are a strict content-moderation classifier. You MUST respond with a single JSON object only (no prose, no code fences) in this exact schema:
{"category":"safe"|"flagged"|"blocked","score":0..1,"reasons":[string,...]}
Guidance:
- "blocked": content involves CSAM, credible threats, explicit weaponization, or illegal instructions.
- "flagged": content has hate speech, harassment, self-harm content, or mild unsafe material.
- "safe": otherwise.
Score is risk confidence (1.0 = fully blocked, 0.0 = fully safe).`;

  try {
    const result = await chatComplete(
      [
        { role: "system", content: system },
        { role: "user", content: `Classify this text:\n\n${text}` },
      ],
      { temperature: 0, max_tokens: 200 }
    );
    let parsed: any = null;
    try {
      const cleaned = result.content.trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { category: "safe", score: 0, reasons: ["Classifier returned non-JSON, defaulting to safe"] };
    }
    const category = ["safe", "flagged", "blocked"].includes(parsed.category) ? parsed.category : "safe";
    return NextResponse.json({
      category,
      score: Number(parsed.score ?? 0),
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
      source: "deepseek",
      latency_ms: result.latency_ms,
      tokens_used: result.usage.total_tokens,
    });
  } catch (e) {
    if (e instanceof DeepSeekError) {
      return NextResponse.json({ error: e.message, details: e.body }, { status: e.status });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
