import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env vars regardless of prefix, 
  // or 'REACT_APP_' to specificially load those. We'll use 'REACT_APP_' to match CRA.
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  return {
    plugins: [react()],
    base: './',
    define: {
      // Expose env vars to the client
      'process.env': env
    }
  }
})
