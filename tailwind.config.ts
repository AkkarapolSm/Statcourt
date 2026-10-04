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
        // Brand tokens: see docs/STATCOURT_BRAND_DIRECTION.md
        brand: {
          primary: "#AF101A", // Crimson (white text 7.21:1)
          crimson: "#8E0D15", // Crimson pressed / hover
          subtle: "#FFDAD6",  // Primary fixed (Crimson on it 5.58:1)
          signal: "#FF7A7A",  // Signal Red: text/icons on Court Ink only (6.80:1)
        },
        surface: {
          base: "#F8F9FF",      // Ice
          container: "#FFFFFF", // Pure White
          muted: "#F1F5F9",     // Slate 100
          dark: "#0B1C30",      // Court Ink
          card: "#FFFFFF",
        },
        borderNeutral: "#DFE2EB", // Line (decorative dividers only)
        borderStrong: "#7F8A9E",  // Border Strong (controls, >= 3:1)
        textHeading: "#0B1C30",   // Court Ink
        textSecondary: "#5B6574", // Secondary text (5.62:1 on Ice)
        textMuted: "#94A3B8",     // Slate 400 (decorative only, fails 4.5:1 as text)
        mutedOnInk: "#A9B6C8",    // Secondary text on Court Ink (8.35:1)
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
        secondary: "#5b6574",
        outline: "#7f8a9e",
        "primary-container": "#af101a",
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
        "outline-variant": "#dfe2eb",
        background: "#f8f9ff",
        "on-background": "#0b1c30",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#5b6574",
      },
      fontFamily: {
        // Two families only: Barlow Condensed (Latin display/numerals) and Noto Sans Thai (content).
        // Barlow Condensed has no Thai glyphs, so Noto Sans Thai is always the fallback.
        barlow: ["Barlow Condensed", "Noto Sans Thai", "sans-serif"],
        thai: ["Noto Sans Thai", "sans-serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        "headline-xl": ["Barlow Condensed", "Noto Sans Thai", "sans-serif"],
        "headline-lg": ["Barlow Condensed", "Noto Sans Thai", "sans-serif"],
        "headline-md": ["Barlow Condensed", "Noto Sans Thai", "sans-serif"],
        "headline-sm": ["Barlow Condensed", "Noto Sans Thai", "sans-serif"],
        "title-stat": ["Barlow Condensed", "Noto Sans Thai", "sans-serif"],
        "body-lg": ["Noto Sans Thai", "sans-serif"],
        "body-md": ["Noto Sans Thai", "sans-serif"],
        "body-sm": ["Noto Sans Thai", "sans-serif"],
        "label-caps": ["Barlow Condensed", "Noto Sans Thai", "sans-serif"],
        "label-badge": ["Barlow Condensed", "Noto Sans Thai", "sans-serif"],
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
