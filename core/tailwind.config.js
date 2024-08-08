/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '!./node_modules/**', // Exclude everything in node_modules to speed up builds
  ],
  theme: {
    extend: {
      colors: {
        secondary: '#3071EF',
        gray: {
          100: '#F1F3F5',
          200: '#CFD8DC',
          300: '#AFBAC5',
          400: '#90A4AE',
          500: '#546E7A',
          600: '#091D45',
        },

        // @todo accent
        // @todo warning
        // @todo info
        // @todo background
        // @todo foreground
        // @todo contrast

        // ✅ DONE
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          highlight: 'color-mix(in oklab, hsl(var(--primary)), white 60%)',
          shadow: 'color-mix(in oklab, hsl(var(--primary)), black 60%)',
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          highlight: 'color-mix(in oklab, hsl(var(--error)), white 60%)',
          shadow: 'color-mix(in oklab, hsl(var(--error)), black 60%)',
          // @todo change to highlight?
          secondary: '#C62828',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          highlight: 'color-mix(in oklab, hsl(var(--success)), white 60%)',
          shadow: 'color-mix(in oklab, hsl(var(--success)), black 60%)',
          // @todo change to highlight?
          secondary: '#388E3C',
        },
      },
      fontFamily: {
        // @todo heading
        // @todo body
        sans: ['var(--font-inter)'],
        // @todo mono
      },
      borderColor: {
        DEFAULT: '#CFD8DC',
      },
      keyframes: {
        revealVertical: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0%)' },
        },
      },
      animation: {
        revealVertical: 'revealVertical 400ms forwards cubic-bezier(0, 1, 0.25, 1)',
      },
    },
  },

  plugins: [
    // @ts-ignore

    require('tailwindcss-radix')(),
    require('tailwindcss-animate'),
    require('@tailwindcss/container-queries'),
  ],
};

module.exports = config;
