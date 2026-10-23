/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brick-blue': '#213885',
        'navy': '#081849',
        'cream': '#ECDFD2',
        'stone': '#CCCACC',
        'plum': '#5F3475',
        'berry': '#893172',
        risk: {
          low: '#2E9E6B',
          med: '#F2B01E',
          high: '#D64545',
        },
      },
      fontFamily: {
        display: ['Fredoka', 'Baloo 2', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brick-sm': '2px 2px 0 #081849',
        'brick': '4px 4px 0 #081849',
        'brick-lg': '6px 6px 0 #081849',
        'brick-xl': '8px 8px 0 #081849',
        'brick-berry': '4px 4px 0 #893172',
        'brick-plum': '4px 4px 0 #5F3475',
        'brick-pressed': '1px 1px 0 #081849',
        'brick-inner': 'inset 0 2px 4px rgba(8, 24, 73, 0.15)',
      },
      borderWidth: {
        '3': '3px',
      },
      keyframes: {
        snapIn: {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        brickBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        studPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'snap-in': 'snapIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'brick-bounce': 'brickBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'stud-pulse': 'studPulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
