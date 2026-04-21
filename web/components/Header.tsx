"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Flame, Menu, X, Github, Sparkles } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Architecture", href: "#architecture" },
  { label: "Pipeline", href: "#pipeline" },
  { label: "API Docs", href: "#api" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl border-b shadow-2xl"
          : "bg-transparent"
      }`}
      style={
        scrolled
          ? {
              backgroundColor: "rgba(12,10,9,0.92)",
              borderBottomColor: "rgba(245,158,11,0.12)",
            }
          : {}
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #F59E0B 0%, #FB923C 100%)",
                boxShadow: "0 4px 16px rgba(245,158,11,0.35)",
              }}
            >
              <Flame className="w-4.5 h-4.5 text-stone-950" style={{ width: 18, height: 18 }} />
            </div>
            <div className="leading-none">
              <span className="font-black text-white text-sm tracking-tight block">
                GenAI{" "}
                <span className="text-gradient-warm">Studio</span>
              </span>
              <span className="text-stone-500 text-[10px] font-medium tracking-widest uppercase">
                Multi-Modal API
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ color: "#A8A29E" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#F5F5F4";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(245,158,11,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#A8A29E";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-sm transition-colors duration-200"
              style={{ color: "#78716C" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#F5F5F4"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#78716C"; }}
            >
              <Github className="w-4 h-4" />
            </a>

            <Link
              href="/demo"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #F59E0B 0%, #FB923C 100%)",
                color: "#0C0A09",
                boxShadow: "0 2px 12px rgba(245,158,11,0.3)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Try Demo
            </Link>

            <button
              className="md:hidden transition-colors duration-200"
              style={{ color: "#78716C" }}
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
        <div
          className="md:hidden backdrop-blur-xl border-b"
          style={{
            backgroundColor: "rgba(12,10,9,0.97)",
            borderBottomColor: "rgba(245,158,11,0.1)",
          }}
        >
          <nav className="max-w-7xl mx-auto px-4 py-5 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 px-4 rounded-xl text-sm font-medium transition-colors"
                style={{ color: "#D6D3D1" }}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/demo"
              onClick={() => setMenuOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
              style={{
                background: "linear-gradient(135deg, #F59E0B 0%, #FB923C 100%)",
                color: "#0C0A09",
              }}
            >
              <Sparkles className="w-4 h-4" />
              Try Interactive Demo
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
