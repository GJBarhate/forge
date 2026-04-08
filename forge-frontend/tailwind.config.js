// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: '#0a0a0f',
          2: '#0f0f17',
          3: '#141420',
          4: '#1a1a2a',
        },
        surface: {
          DEFAULT: '#1e1e30',
          2: '#252538',
        },
        purple: {
          DEFAULT: '#7c6ff7',
          light: '#a89df9',
          dim: 'rgba(124,111,247,0.15)',
        },
        teal: {
          DEFAULT: '#2dd4a0',
          light: '#6ee7c4',
          dim: 'rgba(45,212,160,0.12)',
        },
        coral: {
          DEFAULT: '#f4714a',
          light: '#f99878',
          dim: 'rgba(244,113,74,0.12)',
        },
        amber: {
          DEFAULT: '#f0b429',
          light: '#fcd470',
          dim: 'rgba(240,180,41,0.12)',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease both',
        'fade-in': 'fadeIn 0.3s ease both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(139, 92, 246, 0.3)',
        'glow-md': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-lg': '0 0 30px rgba(139, 92, 246, 0.7)',
        'glow-teal': '0 0 20px rgba(45, 212, 160, 0.5)',
        'glow-coral': '0 0 20px rgba(244, 113, 74, 0.5)',
      },
    },
  },
  plugins: [],
};
