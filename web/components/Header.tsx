"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Zap, Menu, X, Github } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Architecture", href: "#architecture" },
  { label: "Pipeline", href: "#pipeline" },
  { label: "MCP Context", href: "#context" },
  { label: "API Docs", href: "#api" },
  { label: "Demo", href: "/demo" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-shadow">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">
              GenAI{" "}
              <span className="text-gradient bg-gradient-to-r from-brand-400 to-accent-cyan bg-clip-text text-transparent">
                Multi-Modal
              </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-600 to-accent-cyan text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-brand-500/20"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <button
              className="md:hidden text-slate-400 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/5">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-slate-300 hover:text-white py-2 text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
