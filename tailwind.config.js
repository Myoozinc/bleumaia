/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        bleu: {
          50: "#eff8ff",
          100: "#dbeefe",
          200: "#bfdffe",
          300: "#93cbfd",
          400: "#60aef9",
          500: "#3b8ff2",
          600: "#2572e5",
          700: "#1d5bce",
          800: "#1e4ca8",
          900: "#1e4184",
          950: "#0b162c",
        },
        midnight: {
          900: "#060913",
          800: "#0b1120",
          700: "#111b33",
          600: "#182544",
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)' },
        }
      }
    },
  },
  plugins: [],
};
