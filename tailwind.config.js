/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          50: '#f0f9f4',
          100: '#dcf3e6',
          200: '#bce5cf',
          300: '#8dd0ad',
          400: '#58b486',
          500: '#359869',
          600: '#267a52',
          700: '#206243',
          800: '#1b4f38',
          900: '#18412f',
        },
        accent: {
          light: '#e8f5e9',
          DEFAULT: '#4caf50',
          dark: '#2e7d32',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
