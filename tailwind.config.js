/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        caribbean: {
          50: '#e6f7ff',
          100: '#b3e5ff',
          200: '#80d4ff',
          300: '#4dc2ff',
          400: '#1ab1ff',
          500: '#00a0e6',
          600: '#0088cc',
          700: '#006699',
          800: '#004466',
          900: '#002233',
        },
        coral: {
          50: '#fff0ed',
          100: '#ffd4c9',
          200: '#ffb8a5',
          300: '#ff9c81',
          400: '#ff805d',
          500: '#ff6439',
          600: '#e64d20',
          700: '#b33b18',
          800: '#802910',
          900: '#4d1708',
        },
        sand: {
          50: '#fffef5',
          100: '#fefce8',
          200: '#fef9db',
          300: '#fdf5ce',
          400: '#fdf2c1',
          500: '#fceeb4',
          600: '#d9c78f',
          700: '#b6a06a',
          800: '#937945',
          900: '#705220',
        }
      },
      fontFamily: {
        display: ['Baloo 2', 'cursive'],
        body: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
