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
          primary: "#DC2626", // Red 600
          crimson: "#991B1B", // Red 800
          subtle: "#FEE2E2",  // Red 100
          glow: "#EF4444",    // Red 500
        },
        surface: {
          base: "#F8FAFC",      // Slate 50
          container: "#FFFFFF", // Pure White
          muted: "#F1F5F9",     // Slate 100
          dark: "#0F172A",      // Slate 900
          card: "#FFFFFF",
        },
        borderNeutral: "#E2E8F0", // Slate 200
        textHeading: "#0F172A",   // Slate 900
        textSecondary: "#475569", // Slate 600
        textMuted: "#94A3B8",     // Slate 400
        verifiedGreen: {
          DEFAULT: "#15803D", // Green 700
          light: "#DCFCE7",
        },
        pendingAmber: {
          DEFAULT: "#B45309", // Amber 700
          light: "#FEF3C7",
        },
        // Design System Tokens from User Mockup
        primary: "#af101a",
        "on-primary": "#ffffff",
        secondary: "#5b5e66",
        outline: "#8f6f6c",
        "primary-container": "#d32f2f",
        "on-primary-container": "#fff2f0",
        "primary-fixed": "#ffdad6",
        "primary-fixed-dim": "#ffb3ac",
        "on-primary-fixed-variant": "#930010",
        "inverse-surface": "#213145",
        "inverse-on-surface": "#eaf1ff",
        "inverse-primary": "#ffb3ac",
        "surface-dim": "#cbdbf5",
        "surface-bright": "#f8f9ff",
        "surface-variant": "#d3e4fe",
        "surface-container": "#e5eeff",
        "surface-container-low": "#eff4ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        "tertiary-fixed-dim": "#fbbc30",
        "tertiary-fixed": "#ffdea5",
        "tertiary-container": "#916900",
        "on-tertiary-fixed": "#271900",
        "on-tertiary-container": "#fff3e4",
        "secondary-fixed": "#dfe2eb",
        "secondary-fixed-dim": "#c3c6cf",
        "secondary-container": "#dfe2eb",
        "on-secondary-container": "#61646c",
        "outline-variant": "#e4beba",
        background: "#f8f9ff",
        "on-background": "#0b1c30",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#5b403d",
      },
      fontFamily: {
        bebas: ["var(--font-bebas)", "Bebas Neue", "sans-serif"],
        barlow: ["var(--font-barlow)", "Barlow Condensed", "sans-serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        "headline-xl": ["var(--font-bebas)", "Bebas Neue", "sans-serif"],
        "headline-lg": ["var(--font-bebas)", "Bebas Neue", "sans-serif"],
        "headline-md": ["var(--font-bebas)", "Bebas Neue", "sans-serif"],
        "headline-sm": ["var(--font-barlow)", "Barlow Condensed", "sans-serif"],
        "title-stat": ["var(--font-bebas)", "Bebas Neue", "sans-serif"],
        "body-lg": ["var(--font-barlow)", "Barlow Condensed", "sans-serif"],
        "body-md": ["var(--font-barlow)", "Barlow Condensed", "sans-serif"],
        "body-sm": ["var(--font-barlow)", "Barlow Condensed", "sans-serif"],
        "label-caps": ["var(--font-barlow)", "Barlow Condensed", "sans-serif"],
        "label-badge": ["var(--font-barlow)", "Barlow Condensed", "sans-serif"],
      },
      spacing: {
        "gutter-desktop": "1.5rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "0.875rem",
        "space-lg": "1.25rem",
        "space-xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
