/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Futura', 'Schibsted Grotesk', 'sans-serif'],
        futura: ['Futura', 'sans-serif'],
        grotesk: ['Schibsted Grotesk', 'sans-serif'],
      },
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        'light-gray': 'rgb(245, 245, 245)',
      },
      animation: {
        'page-load-fade-in': 'pageLoadFadeIn 0.3s ease-in-out',
      },
      keyframes: {
        pageLoadFadeIn: {
          from: {opacity: '0.95'},
          to: {opacity: '1'},
        },
      },
      screens: {
        xs: '480px',
        sm: '500px',
        md: '600px',
        tablet: '762px',
        lg: '768px',
        'lg-wide': '800px',
        xl: '900px',
        desktop: '1024px',
        wide: '1200px',
      },
    },
  },
  plugins: [],
};
