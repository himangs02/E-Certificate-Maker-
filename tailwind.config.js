/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#ebdccb',
          500: '#c59b27',
          600: '#a8801d',
          700: '#876518',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        certHeading: ['"Cinzel"', 'serif'],
        certBody: ['"Merriweather"', 'serif'],
        certScript: ['"Great Vibes"', 'cursive'],
        certSans: ['"Montserrat"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
