import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env vars regardless of prefix, 
  // or 'REACT_APP_' to specificially load those. We'll use 'REACT_APP_' to match CRA.
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  // Ensure NODE_ENV is set (critical for React in production)
  env.NODE_ENV = mode;

  // Shim for Vercel/System envs: merge process.env values into the loaded env
  // avoiding conflicts with existing keys if already loaded, but Vercel injected vars should likely take precedence or exist where files don't.
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('REACT_APP_')) {
      env[key] = process.env[key];
    }
  });

  return {
    plugins: [react()],
    base: './',
    define: {
      // Expose env vars to the client
      'process.env': env
    }
  }
})
