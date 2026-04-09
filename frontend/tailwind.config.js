/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        siren: {
          '0%, 100%': {
            backgroundColor: 'rgba(127, 29, 29, 0.28)',
            borderColor: 'rgba(252, 165, 165, 0.45)',
            color: 'rgb(252, 165, 165)',
            boxShadow: '0 0 0 rgba(239, 68, 68, 0)',
            transform: 'scale(1)',
          },
          '50%': {
            backgroundColor: 'rgba(239, 68, 68, 0.9)',
            borderColor: 'rgba(254, 202, 202, 0.95)',
            color: 'rgb(255, 255, 255)',
            boxShadow: '0 0 18px rgba(239, 68, 68, 0.75)',
            transform: 'scale(1.03)',
          },
        },
      },
      animation: {
        siren: 'siren 0.85s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
