/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        acmBlue: '#0085CA',
        acmTeal: '#00B4A0',
        acmPurple: '#6C63FF',
        acmDark: '#050816',
        acmDarkAlt: '#050B1A'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

