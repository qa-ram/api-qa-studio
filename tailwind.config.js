/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#090b10',
          900: '#0f131d',
          850: '#151b29',
          800: '#1b2335',
          700: '#26324a',
          600: '#344565'
        },
        brand: {
          500: '#6366f1',
          600: '#4f46e5',
          cyan: '#06b6d4',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b'
        }
      }
    },
  },
  plugins: [],
}
