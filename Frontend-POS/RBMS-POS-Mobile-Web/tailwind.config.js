const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      // ─── Custom breakpoint สำหรับ mobile ──────────────────────────────
      screens: {
        'xs': '480px',
      },

      colors: {
        // ─── Primary (Orange) ───────────────────────────────────────────
        primary: {
          DEFAULT: "var(--color-primary)",
          dark:    "var(--color-primary-dark)",
          light:   "var(--color-primary-light)",
          subtle:  "var(--color-primary-subtle)",
          badge:   "var(--color-primary-badge)",
          text:    "var(--color-primary-text)",
        },

        // ─── Surface (Slate) ────────────────────────────────────────────
        surface: {
          DEFAULT: "var(--color-surface)",
          card:    "var(--color-surface-card)",
          border:  "var(--color-surface-border)",
          muted:   "var(--color-surface-muted)",
          sub:     "var(--color-surface-sub)",
          dark:    "var(--color-surface-dark)",
          sidebar: "var(--color-surface-sidebar)",
        },

        // ─── Status Colors ──────────────────────────────────────────────
        success: {
          DEFAULT: "var(--color-success)",
          dark:    "var(--color-success-dark)",
          bg:      "var(--color-success-bg)",
          text:    "var(--color-success-text)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          bg:      "var(--color-danger-bg)",
          dark:    "var(--color-danger-dark)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          bg:      "var(--color-warning-bg)",
          dark:    "var(--color-warning-dark)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          dark:    "var(--color-info-dark)",
          bg:      "var(--color-info-bg)",
        },
        billing: {
          DEFAULT: "var(--color-billing)",
          dark:    "var(--color-billing-dark)",
        },
      },

      fontFamily: {
        sans: ["Sarabun", "sans-serif"],
      },

      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
      },

      fontSize: {
        "page-title":    ["1.75rem", { lineHeight: "2rem", fontWeight: "700" }],
        "section-title": ["1.125rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        "card-title":    ["1rem",     { lineHeight: "1.5rem",  fontWeight: "600" }],
      },
    },
  },

  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        ":root": {
          // Primary
          "--color-primary":        "#f97316",
          "--color-primary-dark":   "#ea580c",
          "--color-primary-light":  "#fed7aa",
          "--color-primary-subtle": "#fff7ed",
          "--color-primary-badge":  "#fb923c",
          "--color-primary-text":   "#7c2d12",

          // Surface
          "--color-surface":         "#fff7ed",
          "--color-surface-card":    "#ffffff",
          "--color-surface-border":  "#e2e8f0",
          "--color-surface-muted":   "#cbd5e1",
          "--color-surface-sub":     "#64748b",
          "--color-surface-dark":    "#334155",
          "--color-surface-sidebar": "#1e293b",

          // Status
          "--color-success":      "#14b8a6",
          "--color-success-dark": "#0d9488",
          "--color-success-bg":   "#ccfbf1",
          "--color-success-text": "#0f766e",

          "--color-danger":      "#f43f5e",
          "--color-danger-bg":   "#fff1f2",
          "--color-danger-dark": "#be123c",

          "--color-warning":      "#fbbf24",
          "--color-warning-bg":   "#fef3c7",
          "--color-warning-dark": "#d97706",

          "--color-info":      "#3B82F6",
          "--color-info-dark": "#2563EB",
          "--color-info-bg":   "#EFF6FF",

          "--color-billing":      "#8B5CF6",
          "--color-billing-dark": "#7C3AED",
        },
      });
    }),
  ],
};
