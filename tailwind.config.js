/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // antrasit — koyu zemin
        ink: {
          975: "#0A080C",
          950: "#0E0B10",
          900: "#13101480",
          850: "#16131A",
          800: "#1C181F",
          750: "#231D27",
          700: "#2A232E",
          650: "#352B3A",
          600: "#3D3242",
          500: "#574A5F",
          400: "#8C7F92",
          350: "#A99FAE",
          300: "#C9BFC4",
          200: "#E6DCDF",
          100: "#F2EDE6",
        },
        // mürdüm / bordo
        wine: {
          50: "#FBEFF2",
          100: "#F2D6DD",
          200: "#D9A4B5",
          300: "#B5708A",
          400: "#8C3A52",
          450: "#7C2F46",
          500: "#6A2839",
          600: "#54202E",
          700: "#3F1822",
          800: "#2C111A",
        },
        // mor / yumuşak
        plum: {
          200: "#D7BFD0",
          300: "#B084A1",
          400: "#8A5C7E",
          500: "#6E4564",
          600: "#503048",
        },
        // kırık beyaz vurgu
        cream: {
          300: "#F0E4CD",
          400: "#E8D4B8",
          500: "#D4BB99",
          600: "#B79B7A",
        },
      },
      boxShadow: {
        "card": "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.55)",
        "raised": "0 1px 0 rgba(255,255,255,0.06) inset, 0 30px 60px -25px rgba(0,0,0,0.85)",
        "glow": "0 0 0 1px rgba(176,132,161,0.14), 0 30px 80px -28px rgba(140,58,82,0.45)",
        "wine-glow": "0 0 0 1px rgba(140,58,82,0.45), 0 20px 55px -18px rgba(140,58,82,0.55)",
        "cream-glow": "0 0 0 1px rgba(232,212,184,0.22), 0 18px 50px -22px rgba(232,212,184,0.18)",
      },
      animation: {
        "fade-up": "fadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 0.5s ease-out both",
        "rise": "rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "toast-in": "toastIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
        "shimmer": "shimmer 3.2s linear infinite",
        "drift": "drift 9s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3.5s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        toastIn: {
          "0%": { opacity: "0", transform: "translateY(20px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(8px, -10px) scale(1.04)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
