/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: "rgba(255, 255, 255, 0.1)",
        glassBorder: "rgba(255, 255, 255, 0.2)",
        glassText: "rgba(255, 255, 255, 0.9)",
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}