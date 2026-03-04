/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      colors: {
        bg: '#0D0D0F',
        card: '#16161A',
        cardHover: '#1E1E24',
        border: '#2A2A35',
        accent: '#FFD93D',
        green: '#6BCB77',
        red: '#FF6B6B',
        blue: '#4ECDC4',
        muted: '#8888A0',
      },
    },
  },
  plugins: [],
};
