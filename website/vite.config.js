import { defineConfig } from 'vite';

export default defineConfig({
  // Fully static build: no SSR, no server functions.
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
