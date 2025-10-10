import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    hmr: {
      port: 5173,
    },
  },
  // ✅ Configuration des variables d'environnement
  define: {
    // Si vous avez absolument besoin de process.env quelque part
    'process.env': {},
  },
  // ✅ Variables d'environnement exposées au client
  envPrefix: 'VITE_',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
