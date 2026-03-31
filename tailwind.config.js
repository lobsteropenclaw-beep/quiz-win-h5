/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6200ee",
        secondary: "#9c27b0",
      },
      borderRadius: {
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}