import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        // Football Intelligence brand colors
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22"
        },
        electric: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554"
        },
        violet: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      boxShadow: {
        "glow-emerald": "0 0 20px rgba(52, 211, 153, 0.25), 0 0 40px rgba(52, 211, 153, 0.1)",
        "glow-blue": "0 0 20px rgba(96, 165, 250, 0.25), 0 0 40px rgba(96, 165, 250, 0.1)",
        "glow-purple": "0 0 20px rgba(167, 139, 250, 0.25), 0 0 40px rgba(167, 139, 250, 0.1)",
        "glow-red": "0 0 20px rgba(248, 113, 113, 0.25), 0 0 40px rgba(248, 113, 113, 0.1)",
        "glow-amber": "0 0 20px rgba(251, 191, 36, 0.25), 0 0 40px rgba(251, 191, 36, 0.1)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
        "card-default": "0 2px 8px rgba(0,0,0,0.3)"
      },
      backdropBlur: {
        xs: "2px"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in-fast": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to: { opacity: "1", transform: "translateX(0)" }
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" }
        },
        "counter-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(52, 211, 153, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(52, 211, 153, 0)" }
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(52, 211, 153, 0.3)" },
          "50%": { borderColor: "rgba(52, 211, 153, 0.7)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out forwards",
        "fade-in-fast": "fade-in-fast 0.2s ease-out forwards",
        "slide-in-left": "slide-in-left 0.35s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "counter-up": "counter-up 0.4s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "border-glow": "border-glow 3s ease-in-out infinite"
      }
    }
  },
  plugins: [animate]
};

export default config;
