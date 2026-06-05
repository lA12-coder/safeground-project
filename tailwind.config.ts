import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          'dark': '#7B2D00',
          'medium': '#8B3A0F',
          'light': '#F5F0EB'
        },
        'background': {
          'page': '#F5F2EE'
        },
        'muted': {
          'light': '#FFD4A8',
          'lighter': 'rgba(255,255,255,0.18)',
          'lightest': 'rgba(255,255,255,0.12)'
        }
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'sans': ['DM Sans', 'sans-serif']
      },
      borderRadius: {
        'logo': '50%',
        'icon-box': '8px',
        'form-input': '9px',
        'form-button': '10px',
        'testimonial': '12px'
      },
      boxShadow: {
        'focus': '0 0 0 3px rgba(139,58,15,0.1)'
      }
    },
  },
  plugins: [
    plugin(function({ addBase }) {
      // Add custom font faces if needed
    })
  ],
};

export default config;