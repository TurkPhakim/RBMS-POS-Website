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
          DEFAULT: "var(--color-primary)", // #f97316 — สีหลัก
          dark: "var(--color-primary-dark)", // #ea580c — hover / gradient end
          light: "var(--color-primary-light)", // #fed7aa — border อ่อน
          subtle: "var(--color-primary-subtle)", // #fff7ed — row hover / bg อ่อนมาก
          badge: "var(--color-primary-badge)", // #fb923c — icon fill / badge
          text: "var(--color-primary-text)", // #7c2d12 — text บน bg ส้มอ่อน
        },

        // ─── Surface (Slate) ────────────────────────────────────────────
        // ใช้: bg-surface, bg-surface-card, text-surface-dark, bg-sidebar
        surface: {
          DEFAULT: "var(--color-surface)", // #f8fafc — page background
          hover: "#eef2f7", // เข้มกว่า page bg เล็กน้อย (placeholder bg)
          card: "var(--color-surface-card)", // #ffffff — card / table body
          border: "var(--color-surface-border)", // #e2e8f0 — divider / border
          muted: "var(--color-surface-muted)", // #cbd5e1 — disabled element
          sub: "var(--color-surface-sub)", // #64748b — secondary text
          dark: "var(--color-surface-dark)", // #334155 — primary text
          sidebar: "var(--color-surface-sidebar)", // #1e293b — sidebar / header dark bg
        },

        // ─── Status Colors ──────────────────────────────────────────────
        // ใช้: bg-success, text-success, bg-success-bg ฯลฯ
        success: {
          DEFAULT: "var(--color-success)", // #14b8a6 — teal active/available
          dark: "var(--color-success-dark)", // #0d9488 — darker teal
          bg: "var(--color-success-bg)", // #ccfbf1 — badge background
          text: "var(--color-success-text)", // #0f766e — badge text
        },
        danger: {
          DEFAULT: "var(--color-danger)", // #f43f5e — delete / error / locked
          bg: "var(--color-danger-bg)", // #fff1f2 — badge background
          dark: "var(--color-danger-dark)", // #be123c — hover
          soft: "var(--color-danger-soft)", // rgba — semi-transparent for time badge
        },
        warning: {
          DEFAULT: "var(--color-warning)", // #fbbf24 — pending
          bg: "var(--color-warning-bg)", // #fef3c7 — badge background
          dark: "var(--color-warning-dark)", // #d97706 — hover
          soft: "var(--color-warning-soft)", // rgba — semi-transparent for time badge
        },
        info: {
          DEFAULT: "var(--color-info)", // #3B82F6 — blue info / digital
          bg: "var(--color-info-bg)", // #EFF6FF — badge background
        },
        billing: {
          DEFAULT: "var(--color-billing)", // #8B5CF6 — violet billing
          dark: "var(--color-billing-dark)", // #7C3AED — gradient end
        },

        // ─── Gender Colors ──────────────────────────────────────────────
        // ใช้: text-gender-male, text-gender-female
        gender: {
          male: "var(--color-gender-male)", // #60A5FA — น้ำเงิน
          female: "var(--color-gender-female)", // #F472B6 — ชมพู
        },
      },

      // ─── Font ──────────────────────────────────────────────────────────
      // Sarabun: อ่านง่าย Thai+English เหมาะกับ POS / food app
      fontFamily: {
        sans: ["Sarabun", "sans-serif"],
      },

      // ─── Animation ──────────────────────────────────────────────────────
      keyframes: {
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-3px, 3px)" },
          "40%": { transform: "translate(3px, -3px)" },
          "60%": { transform: "translate(-2px, -2px)" },
          "80%": { transform: "translate(2px, 2px)" },
        },
        "bell-ring": {
          "0%": { transform: "rotate(0deg)" },
          "10%": { transform: "rotate(14deg)" },
          "20%": { transform: "rotate(-14deg)" },
          "30%": { transform: "rotate(10deg)" },
          "40%": { transform: "rotate(-10deg)" },
          "50%": { transform: "rotate(6deg)" },
          "60%": { transform: "rotate(-4deg)" },
          "70%": { transform: "rotate(2deg)" },
          "80%": { transform: "rotate(-1deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        glitch: "glitch 0.3s ease-in-out infinite",
        "bell-ring": "bell-ring 0.6s ease-in-out",
        "slide-in-right": "slide-in-right 0.25s ease-out",
      },

      // ─── Typography Tokens ─────────────────────────────────────────────
      // ใช้: text-page-title, text-section-title, text-card-title
      fontSize: {
        "page-title": [
          "2.25rem",
          {
            lineHeight: "2.5rem",
            fontWeight: "700",
            letterSpacing: "-0.025em",
          },
        ],
        "section-title": [
          "1.125rem",
          { lineHeight: "1.75rem", fontWeight: "600" },
        ],
        "card-title": ["1rem", { lineHeight: "1.5rem", fontWeight: "600" }],
      },
    },
  },

  plugins: [
    // ─── Typography Token Colors ──────────────────────────────────────
    // fontSize utility ไม่รองรับ color → ใช้ addComponents เพิ่มสีให้ token
    plugin(function ({ addComponents }) {
      addComponents({
        ".text-page-title": {
          color: "var(--color-primary-text)",
        },
      });
    }),

    // ─── CSS Variables (:root) ─────────────────────────────────────────
    plugin(function ({ addBase }) {
      addBase({
        ":root": {
          // Primary
          "--color-primary": "#f97316",
          "--color-primary-dark": "#ea580c",
          "--color-primary-light": "#fed7aa",
          "--color-primary-subtle": "#fff7ed",
          "--color-primary-badge": "#fb923c",
          "--color-primary-text": "#7c2d12",

          // Surface
          "--color-surface": "#fff7ed",
          "--color-surface-card": "#ffffff",
          "--color-surface-border": "#e2e8f0",
          "--color-surface-muted": "#cbd5e1",
          "--color-surface-sub": "#64748b",
          "--color-surface-dark": "#334155",
          "--color-surface-sidebar": "#1e293b",

          // Status
          "--color-success": "#14b8a6",
          "--color-success-dark": "#0d9488",
          "--color-success-bg": "#ccfbf1",
          "--color-success-text": "#0f766e",

          "--color-danger": "#f43f5e",
          "--color-danger-bg": "#fff1f2",
          "--color-danger-dark": "#be123c",
          "--color-danger-soft": "#fb7185",

          "--color-warning": "#fbbf24",
          "--color-warning-bg": "#fef3c7",
          "--color-warning-dark": "#d97706",
          "--color-warning-soft": "#f9b230",

          "--color-info": "#3B82F6",
          "--color-info-bg": "#EFF6FF",

          // Billing
          "--color-billing": "#8B5CF6",
          "--color-billing-dark": "#7C3AED",

          // Gender
          "--color-gender-male": "#93C5FD",
          "--color-gender-female": "#F9A8D4",
        },
      });
    }),
  ],
};
