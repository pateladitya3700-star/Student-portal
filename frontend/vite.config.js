import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
    // Proxy removed - use environment variables instead
    // For local development, set VITE_API_URL=http://localhost:5000/api in .env
    // For production, set VITE_API_URL=https://your-backend.onrender.com/api
  },
  // Make sure environment variables are exposed to the client
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
  }
})
