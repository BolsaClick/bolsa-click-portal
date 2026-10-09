/** @type {import('tailwindcss').Config} */

// Paleta e identidade por site vivem em app/lib/site/brands.ts — fonte única
// compartilhada com a aplicação. Antes havia uma segunda lista de cores aqui,
// que só tinha 2 das 3 chaves de SiteKey e quebrava este config no load.
const { getSiteBrand } = require('./app/lib/site/brands')

const brand = getSiteBrand(process.env.NEXT_PUBLIC_THEME)

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
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
        sans: ['var(--font-montserrat)', 'sans-serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      maxWidth: {
        'screen-lg': '1440px',
      },
      colors: {
        'bolsa-primary': brand.primary,
        'bolsa-secondary': brand.secondary,
        'bolsa-black': '#151515',
        'bolsa-white': '#FAFAFA',
        'bolsa-gray-dark': '#242424',
        'bolsa-gray-light': '#F1F1F1',
        ink: {
          900: '#0B1F3C',
          700: '#243652',
          500: '#5A6B82',
          300: '#9AA8BD',
          100: '#D7DEE8',
        },
        paper: {
          DEFAULT: '#FAF7F2',
          warm: '#F4EFE5',
          cream: '#E8DFC8',
        },
        // Neutro FRIO (não faz parte da família `paper`, que é quente) —
        // fundo da dobra do Hero: cinza muito claro puxado pro azul da
        // marca (`bolsa-primary` #023e73), conforme a decisão de produto de
        // 2026-09 sobre a dobra da home.
        mist: '#F4F6F9',
        emerald: brand.ramp,
      },
       keyframes: {
        'slide-pulse': {
          '0%': { transform: 'translateX(-100%) scale(0.98)', opacity: '0' },
          '60%': { transform: 'translateX(0) scale(1.02)', opacity: '1' },
          '100%': { transform: 'translateX(0) scale(1)', opacity: '1' },
        },
      },
      animation: {
        'slide-pulse': 'slide-pulse 0.4s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
