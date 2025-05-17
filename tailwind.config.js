/** @type {import('tailwindcss').Config} */

export default {
  content: ['./public/**/*.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#181516',
        light: '#ff5718',
        lighter: '#fed8bd',
        primary: '#3369e8',
        secondary: '#fed8bd',
        tertiary: '#f7f7f7',
        white: '#fed8bd',
        black: '#181516'
      },
      fontFamily: {
        fontFamily: {
          playfair: ['Playfair Display', 'serif'],
          sans: ['Inter', 'sans-serif']
        }
      },
      fontWeight: {
        light: 200,
        normal: 300,
        medium: 500,
        bold: 700
      },
      spacing: {
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        7: '1.75rem',
        8: '2rem'
      }
    }
  },
  plugins: []
}
