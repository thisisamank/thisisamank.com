/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./themes/minimal-thisisamank/layouts/**/*.html",
    "./content/**/*.md",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        secondary: '#42516A',
      },
      fontFamily: {
        'sans': ['IBM Plex Sans', 'system-ui', '-apple-system', 'sans-serif'],
        'serif': ['Merriweather', 'Georgia', 'serif'],
        'mono': ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 