/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      maxWidth: {
        'screen-lg': '1440px',
      },
      colors: {
        'bolsa-primary': '#064E3B',
        'bolsa-secondary': '#059669',
        'bolsa-black': '#151515',
        'bolsa-white': '#FAFAFA',
        'bolsa-gray-dark': '#242424',
        'bolsa-gray-light': '#F1F1F1',
      },
    },
  },
  plugins: [],
}
