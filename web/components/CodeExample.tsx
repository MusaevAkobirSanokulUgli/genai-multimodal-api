"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

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
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-white/5 bg-[#0a0f1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-slate-400 text-sm font-medium">{title}</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-500 uppercase">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {description && (
        <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5">
          <p className="text-slate-500 text-xs">{description}</p>
        </div>
      )}

      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code className="font-mono text-slate-300 whitespace-pre">{code}</code>
        </pre>
      </div>
    </div>
  );
}
