/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "320px",
      sm: "640px",
      md: "768px",
      lg: "1080px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        montserrat: ["var(--font-montserrat)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        heartbeat: "heartbeat 2s ease-in-out infinite",
        shake: "shake 0.8s ease-in-out",
      },
      keyframes: {
        heartbeat: {
          "0%": { transform: "scale(1)", opacity: "0.4" },
          "14%": { transform: "scale(1.1)", opacity: "0.8" },
          "28%": { transform: "scale(1)", opacity: "0.6" },
          "42%": { transform: "scale(1.15)", opacity: "0.95" },
          "70%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1)", opacity: "0.4" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-8px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(8px)" },
        },
      },
    },
  },
  plugins: [],
};
