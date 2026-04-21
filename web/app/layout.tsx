import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GenAI Multi-Modal API | AI Studio",
  description:
    "Production-grade multi-modal AI API showcasing text generation with streaming, GPT-4o vision analysis, DALL-E 3 image generation, Whisper STT/TTS, async pipeline orchestration, content moderation, and MCP-inspired context management.",
  keywords: [
    "GenAI",
    "Multi-Modal AI",
    "FastAPI",
    "OpenAI",
    "GPT-4o",
    "DALL-E",
    "Whisper",
    "Python",
    "MCP",
    "AI API",
    "AI Studio",
  ],
  openGraph: {
    title: "GenAI Multi-Modal API — AI Studio",
    description: "Production-grade multi-modal AI API — text, vision, audio, image + pipeline orchestration",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased" style={{ backgroundColor: "#0C0A09" }}>
        {children}
      </body>
    </html>
  );
}
