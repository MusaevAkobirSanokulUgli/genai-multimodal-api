"use client";

import { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";

interface CodeExampleProps {
  title: string;
  language: string;
  code: string;
  description?: string;
}

export default function CodeExample({
  title,
  language,
  code,
  description,
}: CodeExampleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "#0C0A09",
        border: "1px solid rgba(245,158,11,0.12)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          backgroundColor: "rgba(28,25,23,0.8)",
          borderBottom: "1px solid rgba(245,158,11,0.1)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(239,68,68,0.5)" }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(245,158,11,0.5)" }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(34,197,94,0.5)" }} />
          </div>
          <Terminal className="w-3.5 h-3.5" style={{ color: "#78716C" }} />
          <span className="text-sm font-medium" style={{ color: "#A8A29E" }}>
            {title}
          </span>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
            style={{
              backgroundColor: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.15)",
              color: "#F59E0B",
            }}
          >
            {language}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
          style={{
            color: copied ? "#F59E0B" : "#78716C",
            backgroundColor: copied ? "rgba(245,158,11,0.08)" : "transparent",
            border: copied ? "1px solid rgba(245,158,11,0.2)" : "1px solid transparent",
          }}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {description && (
        <div
          className="px-4 py-2.5"
          style={{
            backgroundColor: "rgba(245,158,11,0.03)",
            borderBottom: "1px solid rgba(245,158,11,0.08)",
          }}
        >
          <p className="text-xs leading-relaxed" style={{ color: "#78716C" }}>
            {description}
          </p>
        </div>
      )}

      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="p-5 text-sm leading-relaxed">
          <code
            className="font-mono whitespace-pre"
            style={{ color: "#D6D3D1" }}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
