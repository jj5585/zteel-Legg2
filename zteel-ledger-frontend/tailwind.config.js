/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f0f0f",
        surface: "#1a1a1a",
        "surface-2": "#222222",
        border: "#2a2a2a",
        "border-2": "#333333",
        text: "#f5f5f5",
        "text-2": "#a3a3a3",
        "text-3": "#6b6b6b",
        accent: "#f97316",
        "accent-hover": "#ea6c0a",
        "accent-muted": "#431407",
        "accent-subtle": "#1c0a03",
        income: "#22c55e",
        "income-muted": "#052e16",
        expense: "#ef4444",
        "expense-muted": "#1c0303",
      },
    },
  },
  plugins: [],
}