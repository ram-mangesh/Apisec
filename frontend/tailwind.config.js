/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F1F5F9',
          hover: '#F8FAFC',
          selected: '#EFF6FF',
        },
        sidebar: {
          DEFAULT: '#0F172A',
          active: '#1E293B',
          text: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B',
        },
        brand: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          active: '#1E40AF',
          soft: '#EFF6FF',
          border: '#BFDBFE',
        },
        critical: {
          DEFAULT: '#DC2626',
          text: '#B91C1C',
          bg: '#FEF2F2',
          border: '#FECACA',
        },
        high: {
          DEFAULT: '#EA580C',
          text: '#C2410C',
          bg: '#FFF7ED',
          border: '#FED7AA',
        },
        medium: {
          DEFAULT: '#CA8A04',
          text: '#A16207',
          bg: '#FEFCE8',
          border: '#FEF08A',
        },
        low: {
          DEFAULT: '#16A34A',
          text: '#15803D',
          bg: '#F0FDF4',
          border: '#BBF7D0',
        },
        info: {
          DEFAULT: '#2563EB',
          text: '#1D4ED8',
          bg: '#EFF6FF',
          border: '#BFDBFE',
        },
        ai: {
          DEFAULT: '#7C3AED',
          bg: '#FAF5FF',
          border: '#DDD6FE',
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
        },
        text: {
          primary: '#0F172A',
          secondary: '#334155',
          muted: '#64748B',
          subtle: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
        '2xl': '16px',
        'pill': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(15, 23, 42, 0.05)',
        'md': '0 4px 12px rgba(15, 23, 42, 0.08)',
        'lg': '0 12px 32px rgba(15, 23, 42, 0.12)',
      },
      letterSpacing: {
        'tight-title': '-0.02em',
        'caps': '0.04em',
      }
    },
  },
  plugins: [],
}
