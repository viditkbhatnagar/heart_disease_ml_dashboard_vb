/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Medical Color Scheme
        primary: {
          50: '#e6f7f7',
          100: '#ccefef',
          200: '#99dfdf',
          300: '#66cfcf',
          400: '#33bfbf',
          500: '#00afaf', // Main teal
          600: '#008c8c',
          700: '#006969',
          800: '#004646',
          900: '#002323',
        },
        medical: {
          blue: '#2563eb',
          teal: '#0d9488',
          green: '#059669',
          navy: '#1e3a5f',
          lightBlue: '#e0f2fe',
          lightTeal: '#ccfbf1',
          lightGreen: '#d1fae5',
        },
        risk: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#ef4444',
          critical: '#7c2d12',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
