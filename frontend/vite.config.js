import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: '.',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [fileURLToPath(new URL('./src/setupTests.js', import.meta.url))],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  },
});
