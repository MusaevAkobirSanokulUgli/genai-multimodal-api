import { NextRequest, NextResponse } from "next/server";
import { chatComplete, chatStream, DeepSeekError } from "@/lib/deepseek";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = (body?.prompt ?? "").toString().trim();
  if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

  const systemPrompt = (body?.systemPrompt ?? "You are a helpful, precise assistant.").toString();
  const temperature = Math.max(0, Math.min(2, Number(body?.temperature ?? 0.7)));
  const maxTokens = Math.max(50, Math.min(4000, Number(body?.maxTokens ?? 800)));
  const model = body?.model === "deepseek-reasoner" ? "deepseek-reasoner" : "deepseek-chat";
  const stream = Boolean(body?.stream);

  const messages = [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: prompt },
  ];

  try {
    if (stream) {
      const rs = await chatStream(messages, { model, temperature, max_tokens: maxTokens });
      return new Response(rs, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }
    const result = await chatComplete(messages, { model, temperature, max_tokens: maxTokens });
    return NextResponse.json({
      content: result.content,
      tokens_used: result.usage.total_tokens,
      latency_ms: result.latency_ms,
      model,
    });
  } catch (e) {
    if (e instanceof DeepSeekError) {
      return NextResponse.json({ error: e.message, details: e.body }, { status: e.status });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
