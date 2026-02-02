import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Относительные пути (./) позволяют запускать сайт из любой папки или домена
  base: './',
  build: {
    outDir: 'dist',
  },
});