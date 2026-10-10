import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}', './providers/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
      },
      colors: {
        background: 'hsl(var(--background))',
        destructive: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        primary: 'hsl(var(--primary))',
        surface: 'hsl(var(--surface))',
      },
    },
  },
  plugins: [],
};

export default config;
