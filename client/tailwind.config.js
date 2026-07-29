import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // App shell / dashboard — ink navy, functional surface
        ink: {
          950: "#0D0F14",
          900: "#12151C",
          800: "#181C26",
          700: "#242938",
          600: "#333A4D",
        },
        // Wall / widget — cool paper, not the warm-cream cliché
        paper: {
          100: "#F6F7F8",
          200: "#EEF0F2",
          300: "#E2E5E9",
          400: "#C7CCD3",
        },
        // Seal-gold — default accent, configurable per business
        seal: {
          300: "#E0B564",
          400: "#CE9F45",
          500: "#C08A2E",
          600: "#9C6F22",
        },
        // Voice-teal — secondary accent for waveform/rating fills
        voice: {
          400: "#4CB3A3",
          500: "#2F8F82",
          600: "#236F65",
        },
        ok: "#3FA66B",
        warn: "#D69A3A",
        danger: "#D14B4B",

        // --- shadcn/ui semantic tokens ---
        // HSL triplets defined in index.css :root, mapped to our own
        // ink/paper/seal palette (not shadcn's default slate/zinc), so
        // components pulled from the registry inherit this app's look
        // instead of the generic shadcn theme.
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["\"IBM Plex Mono\"", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        seal: "0 0 0 1px rgba(192,138,46,0.35), 0 8px 24px -8px rgba(192,138,46,0.35)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        stampIn: {
          "0%": { opacity: 0, transform: "scale(1.4) rotate(-8deg)" },
          "60%": { opacity: 1, transform: "scale(0.92) rotate(-8deg)" },
          "100%": { opacity: 1, transform: "scale(1) rotate(-8deg)" },
        },
        // --- ReactBits StarBorder requires these ---
        "star-movement-bottom": {
          "0%": { transform: "translate(0%, 0%)", opacity: "1" },
          "100%": { transform: "translate(-100%, 0%)", opacity: "0" },
        },
        "star-movement-top": {
          "0%": { transform: "translate(0%, 0%)", opacity: "1" },
          "100%": { transform: "translate(100%, 0%)", opacity: "0" },
        },
      },
      animation: {
        rise: "rise 0.5s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 2.5s linear infinite",
        stampIn: "stampIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "star-movement-bottom": "star-movement-bottom linear infinite alternate",
        "star-movement-top": "star-movement-top linear infinite alternate",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
