import { NextRequest, NextResponse } from "next/server";
import { chatComplete, DeepSeekError } from "@/lib/deepseek";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = (body?.prompt ?? "Describe this image in detail").toString().trim();
  const imageUrl = (body?.imageUrl ?? "").toString().trim();
  const imageData = (body?.imageData ?? "").toString().trim();
  const imageName = (body?.imageName ?? "").toString();

  if (!imageUrl && !imageData) {
    return NextResponse.json({ error: "imageUrl or imageData (base64) is required" }, { status: 400 });
  }

  const imageMeta = imageUrl
    ? `Image URL provided: ${imageUrl}`
    : `User uploaded a base64-encoded image${imageName ? ` named "${imageName}"` : ""}. Size: ${Math.round(imageData.length / 1024)} KB.`;

  const system = `You are a vision analysis assistant. The user provided an image along with a question.
IMPORTANT: You cannot literally see pixel data, but you must help the user by:
1. If the image is accessible via a public URL, reason about it based on the URL, filename, and any metadata clues.
2. Explain what the user is likely asking about and provide the best textual analysis framework.
3. Be honest when you cannot directly perceive visual content, but still give a useful response.
4. Answer the user's specific question fully.`;

  const user = `${imageMeta}

User's analysis request: ${prompt}`;

  try {
    const result = await chatComplete(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.5, max_tokens: 800 }
    );
    return NextResponse.json({
      analysis: result.content,
      tokens_used: result.usage.total_tokens,
      latency_ms: result.latency_ms,
      note: "DeepSeek V3 is text-only; vision reasoning is inferred from URL/metadata. For true pixel analysis, a multimodal model is required.",
    });
  } catch (e) {
    if (e instanceof DeepSeekError) {
      return NextResponse.json({ error: e.message, details: e.body }, { status: e.status });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
