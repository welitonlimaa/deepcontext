/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#6600FF',
          dark: '#3D007A',
          black: '#000000',
        }
      },
      fontFamily: {
        sans: ['Arial Black', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
