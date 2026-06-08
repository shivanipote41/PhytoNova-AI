import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const resendKey = env.VITE_RESEND_API_KEY;

  return {
    plugins: [react()],
    server: {
      host: true,
      proxy: {
        '/api/email': {
          target: 'https://api.resend.com',
          changeOrigin: true,
          rewrite: (path) => '/emails',
          headers: resendKey ? { 'Authorization': 'Bearer ' + resendKey } : undefined,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});