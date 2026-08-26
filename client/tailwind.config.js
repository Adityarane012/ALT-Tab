/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        acmBlue: '#0085CA',
        acmTeal: '#00B4A0',
        acmPurple: '#6C63FF',
        acmDark: '#050816',
        acmDarkAlt: '#050B1A',
        acmSurface: '#0a0f1e',
        acmBorder: '#1a2035'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'slide-right': 'slideRight 0.25s ease-out forwards',
        'pulse-dot': 'pulseDot 1.4s infinite ease-in-out both',
        'bounce-dot': 'bounceDot 1.4s infinite ease-in-out',
        'spin-slow': 'spin 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        pulseDot: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.5' },
          '40%': { transform: 'scale(1)', opacity: '1' }
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-6px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 180, 160, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 180, 160, 0.4)' }
        }
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.5)',
        'glow-teal': '0 0 20px rgba(0, 180, 160, 0.15)',
        'glow-purple': '0 0 20px rgba(108, 99, 255, 0.15)',
        'glow-blue': '0 0 20px rgba(0, 133, 202, 0.15)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};
