/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'],
      },
      colors: {
        glass: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          dark: 'rgba(15,23,42,0.55)'
        }
      }
    },
  },
  plugins: [],
}