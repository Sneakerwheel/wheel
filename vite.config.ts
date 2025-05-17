import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from 'tailwindcss'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/wheel/',
  plugins: [react()],
  server: {
    host: '127.0.0.1'
  },
  css: {
    postcss: {
      plugins: [tailwindcss('./tailwind.config.js')]
    }
  }
})
