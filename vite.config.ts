import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
const config = {
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 절대 경로 alias 설정
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['all'],
    proxy: {
      '/api': {
        target: 'http://ec2-3-39-135-118.ap-northeast-2.compute.amazonaws.com:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
        // 필요하다면 경로 재작성 활성화
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
};

export default defineConfig(config);
