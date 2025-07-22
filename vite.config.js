import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
 
  server: {
    proxy: {
      // Todas as requisições a /create-paymentintent serão encaminhadas
      // para o seu Flask rodando em localhost:5000
      '/api': {
        target: 'https://experience-x53b.onrender.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
