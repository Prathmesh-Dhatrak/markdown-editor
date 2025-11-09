import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-codemirror': ['@uiw/react-codemirror', '@codemirror/lang-markdown', '@codemirror/language-data'],
          'vendor-markdown': ['react-markdown', 'remark-gfm', 'rehype-highlight'],
          'vendor-ui': ['lucide-react', 'daisyui'],
          'vendor-db': ['idb', 'uuid'],
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});
