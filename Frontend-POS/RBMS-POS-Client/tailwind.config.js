const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        // ─── Primary (Orange) ───────────────────────────────────────────
        // ใช้: bg-primary, hover:bg-primary-dark, from-primary to-primary-dark
        primary: {
          DEFAULT: "var(--color-primary)",       // #f97316 — สีหลัก
          dark:    "var(--color-primary-dark)",   // #ea580c — hover / gradient end
          light:   "var(--color-primary-light)",  // #fed7aa — border อ่อน
          subtle:  "var(--color-primary-subtle)", // #fff7ed — row hover / bg อ่อนมาก
          badge:   "var(--color-primary-badge)",  // #fb923c — icon fill / badge
          text:    "var(--color-primary-text)",   // #7c2d12 — text บน bg ส้มอ่อน
        },

        // ─── Surface (Slate) ────────────────────────────────────────────
        // ใช้: bg-surface, bg-surface-card, text-surface-dark, bg-sidebar
        surface: {
          DEFAULT: "var(--color-surface)",          // #f8fafc — page background
          card:    "var(--color-surface-card)",     // #ffffff — card / table body
          border:  "var(--color-surface-border)",   // #e2e8f0 — divider / border
          muted:   "var(--color-surface-muted)",    // #cbd5e1 — disabled element
          sub:     "var(--color-surface-sub)",      // #64748b — secondary text
          dark:    "var(--color-surface-dark)",     // #334155 — primary text
          sidebar: "var(--color-surface-sidebar)",  // #1e293b — sidebar / header dark bg
        },

        // ─── Status Colors ──────────────────────────────────────────────
        // ใช้: bg-success, text-success, bg-success-bg ฯลฯ
        success: {
          DEFAULT: "var(--color-success)",          // #14b8a6 — teal active/available
          bg:      "var(--color-success-bg)",       // #ccfbf1 — badge background
          text:    "var(--color-success-text)",     // #0f766e — badge text
        },
        danger: {
          DEFAULT: "var(--color-danger)",           // #f43f5e — delete / error / locked
          bg:      "var(--color-danger-bg)",        // #fff1f2 — badge background
          dark:    "var(--color-danger-dark)",      // #be123c — hover
        },
        warning: {
          DEFAULT: "var(--color-warning)",          // #fbbf24 — pending
          bg:      "var(--color-warning-bg)",       // #fef3c7 — badge background
          dark:    "var(--color-warning-dark)",     // #d97706 — hover
        },
      },

      // ─── Font ──────────────────────────────────────────────────────────
      // Sarabun: อ่านง่าย Thai+English เหมาะกับ POS / food app
      fontFamily: {
        sans: ["Sarabun", "sans-serif"],
      },

      // ─── Animation ──────────────────────────────────────────────────────
      keyframes: {
        'wave-bounce': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '1' },
          '50%':      { transform: 'translateY(-12px)', opacity: '0.5' },
        },
      },
      animation: {
        'wave-bounce': 'wave-bounce 0.8s ease-in-out infinite',
      },

      // ─── Typography Tokens ─────────────────────────────────────────────
      // ใช้: text-page-title, text-section-title, text-card-title
      fontSize: {
        "page-title":    ["1.75rem",  { lineHeight: "2.25rem", fontWeight: "700" }],
        "section-title": ["1.125rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        "card-title":    ["1rem",     { lineHeight: "1.5rem",  fontWeight: "600" }],
      },
    },
  },

  plugins: [
    // ─── CSS Variables (:root) ─────────────────────────────────────────
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
          "--color-success-bg":   "#ccfbf1",
          "--color-success-text": "#0f766e",

          "--color-danger":    "#f43f5e",
          "--color-danger-bg": "#fff1f2",
          "--color-danger-dark": "#be123c",

          "--color-warning":      "#fbbf24",
          "--color-warning-bg":   "#fef3c7",
          "--color-warning-dark": "#d97706",
        },
      });
    }),
  ],
};
