import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
 
  server: {
    proxy: {
      // Todas as requisições a /create-paymentintent serão encaminhadas
      // para o seu Flask rodando em localhost:5000
      '/create-payment-intent': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
