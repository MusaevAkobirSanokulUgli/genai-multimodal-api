import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        stone: {
          950: "#0C0A09",
          900: "#1C1917",
          800: "#292524",
          700: "#44403C",
          600: "#57534E",
          500: "#78716C",
          400: "#A8A29E",
          300: "#D6D3D1",
          200: "#E7E5E4",
          100: "#F5F5F4",
          50:  "#FAFAF9",
        },
        amber: {
          950: "#451A03",
          900: "#78350F",
          800: "#92400E",
          700: "#B45309",
          600: "#D97706",
          500: "#F59E0B",
          400: "#FBBF24",
          300: "#FCD34D",
          200: "#FDE68A",
          100: "#FEF3C7",
          50:  "#FFFBEB",
        },
        orange: {
          950: "#431407",
          900: "#7C2D12",
          800: "#9A3412",
          700: "#C2410C",
          600: "#EA580C",
          500: "#F97316",
          400: "#FB923C",
          300: "#FDBA74",
          200: "#FED7AA",
          100: "#FFEDD5",
          50:  "#FFF7ED",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "warm-mesh":
          "radial-gradient(at 30% 20%, rgba(245,158,11,0.12) 0, transparent 50%), radial-gradient(at 80% 10%, rgba(251,146,60,0.08) 0, transparent 50%), radial-gradient(at 10% 70%, rgba(251,191,36,0.06) 0, transparent 50%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "float-slow": "float 8s ease-in-out 1s infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "typing": "typing 1.5s steps(20) infinite",
        "wave": "wave 1.5s ease-in-out infinite",
        "slide-up": "slideUp 0.4s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "spin-slow": "spin 8s linear infinite",
        "shimmer-warm": "shimmerWarm 2.5s linear infinite",
        "progress-fill": "progressFill 1s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(245,158,11,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(245,158,11,0.6)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.5)" },
          "50%": { transform: "scaleY(1.5)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmerWarm: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        progressFill: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      boxShadow: {
        "amber-glow": "0 0 30px rgba(245,158,11,0.25)",
        "amber-glow-lg": "0 0 60px rgba(245,158,11,0.35)",
        "orange-glow": "0 0 30px rgba(251,146,60,0.25)",
        "warm-card": "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.08)",
        "warm-card-hover": "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
