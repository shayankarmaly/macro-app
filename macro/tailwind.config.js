/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#F0F2F5",
        primary: "#3B82F6",
        "primary-dark": "#2563EB",
        card: "#FFFFFF",
        "text-primary": "#111827",
        "text-secondary": "#6B7280",
        "text-muted": "#9CA3AF",
        energy: "#22C55E",
        protein: "#EF4444",
        carbs: "#3B82F6",
        fat: "#F59E0B",
        "energy-bg": "#DCFCE7",
        "protein-bg": "#FEE2E2",
        "carbs-bg": "#DBEAFE",
        "fat-bg": "#FEF3C7",
        border: "#E5E7EB",
        "shortcut-bg": "#EDE9FE",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
