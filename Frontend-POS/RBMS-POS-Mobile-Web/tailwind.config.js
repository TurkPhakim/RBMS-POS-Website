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
          hover:   "#eef2f7",
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
          soft:    "var(--color-danger-soft)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          bg:      "var(--color-warning-bg)",
          dark:    "var(--color-warning-dark)",
          soft:    "var(--color-warning-soft)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          bg:      "var(--color-info-bg)",
        },
        billing: {
          DEFAULT: "var(--color-billing)",
          dark:    "var(--color-billing-dark)",
          bg:      "var(--color-billing-bg)",
        },
        cleaning: {
          DEFAULT: "var(--color-cleaning)",
        },
        amber: {
          DEFAULT: "var(--color-amber)",
          bg:      "var(--color-amber-bg)",
        },

        // ─── Category Colors ──────────────────────────────────────────
        cat: {
          food:    { DEFAULT: "var(--color-cat-food)",    dark: "var(--color-cat-food-dark)" },
          drink:   { DEFAULT: "var(--color-cat-drink)",   dark: "var(--color-cat-drink-dark)" },
          dessert: { DEFAULT: "var(--color-cat-dessert)", dark: "var(--color-cat-dessert-dark)" },
        },

        // ─── Menu Tags ────────────────────────────────────────────────
        tag: {
          recommend: "var(--color-tag-recommend)",
          seasonal:  "var(--color-tag-seasonal)",
          slow:      "var(--color-tag-slow)",
          pin:       "var(--color-tag-pin)",
        },

        // ─── Gender Colors ──────────────────────────────────────────────
        gender: {
          male:   "var(--color-gender-male)",
          female: "var(--color-gender-female)",
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
          "--color-success":      "#10b924",
          "--color-success-dark": "#0d9e1e",
          "--color-success-bg":   "#DCFCE7",
          "--color-success-text": "#166534",

          "--color-danger":      "#f43f5e",
          "--color-danger-bg":   "#fff1f2",
          "--color-danger-dark": "#be123c",
          "--color-danger-soft": "#fb7185",

          "--color-warning":      "#fbbf24",
          "--color-warning-bg":   "#fef3c7",
          "--color-warning-dark": "#d97706",
          "--color-warning-soft": "#f9b230",

          "--color-info":    "#3B82F6",
          "--color-info-bg": "#EFF6FF",

          // Billing
          "--color-billing":      "#8B5CF6",
          "--color-billing-dark": "#7C3AED",
          "--color-billing-bg":   "#F5F3FF",

          // Cleaning
          "--color-cleaning": "#14b8a6",

          // Amber
          "--color-amber":    "#F59E0B",
          "--color-amber-bg": "#FFFBEB",

          // Category
          "--color-cat-food":         "#f97316",
          "--color-cat-food-dark":    "#ea580c",
          "--color-cat-drink":        "#0EA5E9",
          "--color-cat-drink-dark":   "#0284C7",
          "--color-cat-dessert":      "#EC4899",
          "--color-cat-dessert-dark": "#DB2777",

          // Tag
          "--color-tag-recommend": "#EF4444",
          "--color-tag-seasonal":  "#22C55E",
          "--color-tag-slow":      "#F59E0B",
          "--color-tag-pin":       "#F97316",

          // Gender
          "--color-gender-male":   "#93C5FD",
          "--color-gender-female": "#F9A8D4",
        },
      });
    }),
  ],
};
