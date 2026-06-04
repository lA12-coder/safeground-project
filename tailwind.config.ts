import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // SafeGround Brand Colors
        brand: {
          primary: '#92400E', // Warm brown
          darker: '#78350F', // Darker brown
          light: '#F5DEB3', // Light tan
        },
        danger: '#B91C1C', // Deep red for panic
        success: '#166534', // Forest green
        background: '#FAFAF9', // Warm cream
        card: '#FFFFFF', // White for cards
      },
      fontFamily: {
        sans: 'var(--font-geist-sans)',
        serif: 'var(--font-noto-serif)',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
