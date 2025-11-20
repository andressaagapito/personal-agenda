import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
function getBasePath(): string {
  if (typeof process !== 'undefined' && process.env.BASE_PATH) {
    return process.env.BASE_PATH
  }
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
    return '/personal-agenda/'
  }
  return '/'
}

export default defineConfig({
  plugins: [react()],
  base: getBasePath(),
})
