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
          bg: '#0a0b10',       // Ultra deep space dark background
          card: '#131520',     // Dark slate card
          primary: '#4f46e5',  // Indigo accent
          secondary: '#06b6d4',// Cyan accent
          success: '#10b981',  // Emerald accent
          warning: '#f59e0b',  // Gold accent
          danger: '#ef4444',   // Rose red accent
          muted: '#94a3b8',    // Slate text muted
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(79, 70, 229, 0.15)',
        'glow-secondary': '0 0 20px rgba(6, 182, 212, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
