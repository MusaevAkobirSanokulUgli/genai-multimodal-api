import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GenAI Multi-Modal API | Senior Python AI Engineer Portfolio",
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
  ],
  openGraph: {
    title: "GenAI Multi-Modal API",
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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#020617] antialiased">{children}</body>
    </html>
  );
}
