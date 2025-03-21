import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Log configuration
  console.log(`🚀 Vite Config: ${mode} mode`);
  
  return {
    plugins: [react()],
    server: {
      historyApiFallback: true,
      proxy: {
        // Proxy API requests to remote backend when not using Netlify redirects
        '/api/v1': {
          target: env.VITE_BACKEND_URL || 'https://backend-415554190254.us-central1.run.app',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/v1/, '/v1'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Proxying:', req.method, req.url, '→', proxyReq.path);
            });
          },
        },
        // Proxy auth requests
        '/api/auth': {
          target: env.VITE_AUTH_URL || 'https://authentication-415554190254.us-central1.run.app',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/auth/, '/api/auth'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Auth proxy error:', err);
            });
          },
        },
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    define: {
      // Provide fallback values for required environment variables
      'process.env.VITE_AUTH_URL': JSON.stringify(env.VITE_AUTH_URL || 'http://localhost:4000'),
      'process.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL || 'http://localhost:3000'),
      'process.env.VITE_SUBSCRIPTION_WORKER': JSON.stringify(env.VITE_SUBSCRIPTION_WORKER || 'http://localhost:5000'),
      'process.env.VITE_ENABLE_LOGGING': JSON.stringify(env.VITE_ENABLE_LOGGING || 'false'),
      'process.env.VITE_ENV': JSON.stringify(env.VITE_ENV || 'development'),
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || 'production'),
      'process.env.VITE_APP_ENV': JSON.stringify(env.VITE_APP_ENV || 'production'),
      'process.env.VITE_USE_NETLIFY_REDIRECTS': JSON.stringify(env.VITE_USE_NETLIFY_REDIRECTS || 'true')
    }
  };
});