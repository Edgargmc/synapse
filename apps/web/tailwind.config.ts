import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#050816',
        panel: '#11182b',
        border: '#283247',
        accent: '#7c9cff',
        accentSoft: '#1c2440',
        success: '#4ade80',
        warning: '#f59e0b',
        danger: '#f87171',
        muted: '#94a3b8',
      },
      boxShadow: {
        panel: '0 20px 45px rgba(5, 8, 22, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
