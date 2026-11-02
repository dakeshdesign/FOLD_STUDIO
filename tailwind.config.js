/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fold: {
          bg: "#F5F3EE",
          card: "#ffffff",
          dark: "#202020",
          black: "#111111",
          muted: "#666666",
          subtle: "#888888",
          border: "#E5E2DA",
          stone: "#D8D5CC",
        }
      },
      fontFamily: {
        serif: ['Bodoni Moda', 'Didot', 'Bodoni MT', 'Bodoni', 'Georgia', 'serif'],
        display: ['Bodoni Moda', 'Didot', 'Bodoni MT', 'Bodoni', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.02em',
        widest: '0.2em',
      },
    },
  },
  plugins: [],
}
