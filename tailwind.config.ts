import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vox: {
          bg: '#05060B',
          panel: '#101426',
          'panel-alpha': 'rgba(18,21,38,0.78)',
          stroke: 'rgba(255,255,255,0.14)',
          purple: '#7C2CFF',
          pink: '#FF2C91',
          orange: '#FF8A34',
          cyan: '#23D8FF',
          green: '#2BE28A',
          danger: '#FF4567',
          warning: '#FFB547',
          muted: '#A8ADC0',
          'deep-purple': '#120829',
          'card': 'rgba(16,20,38,0.74)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cta': 'linear-gradient(135deg, #7C2CFF 0%, #FF2C91 50%, #FF8A34 100%)',
        'gradient-hero': 'linear-gradient(180deg, #05060B 0%, #120829 50%, #05060B 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(124,44,255,0.15) 0%, rgba(255,44,145,0.15) 100%)',
        'gradient-glow': 'radial-gradient(ellipse at center, rgba(124,44,255,0.3) 0%, transparent 70%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slideUp': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
