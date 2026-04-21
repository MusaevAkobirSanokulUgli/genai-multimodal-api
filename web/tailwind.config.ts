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
        brand: {
          50: "#f0f4ff",
          100: "#dce6ff",
          200: "#bfcfff",
          300: "#93aeff",
          400: "#6080ff",
          500: "#3d56ff",
          600: "#2430f5",
          700: "#1c22e0",
          800: "#1c20b5",
          900: "#1d218f",
          950: "#121456",
        },
        accent: {
          cyan: "#06b6d4",
          purple: "#a855f7",
          pink: "#ec4899",
          emerald: "#10b981",
          amber: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-mesh":
          "radial-gradient(at 40% 20%, hsla(228,100%,74%,0.15) 0, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.12) 0, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.08) 0, transparent 50%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        "gradient-x": "gradient-x 15s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-x": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
