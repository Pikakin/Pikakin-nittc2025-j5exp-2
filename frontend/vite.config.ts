import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // ← 全てのIPアドレスで待ち受け（Docker内で必須）
    port: 3000,        // ← このポートがDockerで公開されている必要あり
  },
});

