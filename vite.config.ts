import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false
    },
    server: {
      port: 3000
    },
    define: {
      // Map the GEMINI_API_KEY from Netlify to process.env.API_KEY for the SDK
      // We check GEMINI_API_KEY first as requested by the user
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY || process.env.API_KEY)
    }
  };
});