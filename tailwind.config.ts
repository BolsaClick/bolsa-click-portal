/** @type {import('tailwindcss').Config} */

const colorsByTheme = {
  bolsaclick: {
    primary: '#023e73',
    secondary: '#f21d44',
    emerald: {
      50: '#e7f0fa',
      100: '#d0e0f5',
      200: '#a6c4e6',
      300: '#7da9d8',
      400: '#548dca',
      500: '#023e73',
      600: '#02345f',
      700: '#022a4c',
      800: '#011f39',
      900: '#011525',
      950: '#000a12',
    },
  },
  anhanguera: {
    primary: '#f94d12',
    secondary: '#17375c',
    emerald: {
      50: '#fff7f3',
      100: '#ffece6',
      200: '#ffd2c2',
      300: '#ffb299',
      400: '#fca96c',
      500: '#f94d12',
      600: '#d63c06',
      700: '#b12f03',
      800: '#8a2302',
      900: '#6b1b01',
      950: '#4a0f00',
    },
  },
}

const theme = (process.env.NEXT_PUBLIC_THEME || 'bolsaclick') as keyof typeof colorsByTheme
const emerald = colorsByTheme[theme].emerald
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
        'bolsa-primary': colorsByTheme[theme].primary,
        'bolsa-secondary': colorsByTheme[theme].secondary,
        'bolsa-black': '#151515',
        'bolsa-white': '#FAFAFA',
        'bolsa-gray-dark': '#242424',
        'bolsa-gray-light': '#F1F1F1',
        emerald: emerald,
      },
    },
  },
  plugins: [],
}
