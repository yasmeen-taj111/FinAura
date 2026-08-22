/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F1F5EE',
          card: '#FFFFFF',
          primary: '#064E3B',
          secondary: '#083C32',
          sage: '#8FAF9A',
          light: '#E8F0E8',
          gold: '#D89B24',
          ink: '#12332C',
          muted: '#65736D',
          border: '#DDE5DE',
          success: '#167A55',
          warning: '#C68A4A',
          danger: '#C64A4A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['DM Serif Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(18, 51, 44, 0.05)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
