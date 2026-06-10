/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,jsx,mdx}',
    './src/components/**/*.{js,jsx,mdx}',
    './src/data/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2rem', xl: '2.5rem' },
      screens: { '2xl': '1320px' },
    },
    extend: {
      colors: {
        // Warm near-black "ink" for backgrounds and text
        ink: {
          DEFAULT: '#121013',
          50: '#f6f5f6',
          100: '#e7e5e7',
          200: '#c9c5c9',
          300: '#a39ea3',
          400: '#726c73',
          500: '#4a454b',
          600: '#332f34',
          700: '#252127',
          800: '#1a171c',
          900: '#121013',
          950: '#0a080b',
        },
        // Ivory / champagne neutrals
        cream: {
          DEFAULT: '#F7F2E9',
          50: '#FDFBF6',
          100: '#F7F2E9',
          200: '#EFE7D6',
          300: '#E4D7BE',
          400: '#D6C39E',
        },
        // Gold accent scale
        gold: {
          DEFAULT: '#C8A24A',
          50: '#FBF6E9',
          100: '#F4E9C8',
          200: '#E9D196',
          300: '#DDB965',
          400: '#D2A949',
          500: '#C8A24A',
          600: '#A9842F',
          700: '#866527',
          800: '#634a21',
          900: '#43321a',
        },
        champagne: '#E8D9BE',
        wine: '#5A1F2B',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        script: ['var(--font-script)', 'cursive'],
      },
      fontSize: {
        '7xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        '8xl': ['6rem', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      letterSpacing: {
        widest: '0.25em',
        luxe: '0.35em',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      boxShadow: {
        luxe: '0 30px 60px -25px rgba(18, 16, 19, 0.45)',
        'luxe-gold': '0 20px 60px -20px rgba(200, 162, 74, 0.35)',
        card: '0 12px 40px -12px rgba(18, 16, 19, 0.18)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #E9D196 0%, #C8A24A 45%, #A9842F 100%)',
        'ink-radial': 'radial-gradient(120% 120% at 50% 0%, #1a171c 0%, #121013 55%, #0a080b 100%)',
        'sheen': 'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1.05) translate3d(0,0,0)' },
          '100%': { transform: 'scale(1.18) translate3d(-1.5%, -1.5%, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 1s ease both',
        'ken-burns': 'ken-burns 16s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        marquee: 'marquee 32s linear infinite',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
