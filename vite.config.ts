import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Log configuration
  console.log(`🚀 Vite Config: ${mode} mode`);
  
  // Add visualizer plugin for bundle analysis in analyze mode
  const plugins = [
    react({
      // Use React production mode in production builds
      jsxRuntime: mode === 'production' ? 'automatic' : 'classic',
      // Use Babel to ensure proper JSX transformation
      babel: {
        presets: ['@babel/preset-react'],
        plugins: ['@babel/plugin-transform-react-jsx'],
        babelrc: false,
        configFile: false,
      }
    }),
  ];
  
  if (mode === 'analyze') {
    plugins.push(
      visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      })
    );
  }
  
  return {
    plugins,
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
        '@': path.resolve(__dirname, './src'),
        '@api': path.resolve(__dirname, './src/api'),
        '@features': path.resolve(__dirname, './src/features'),
        '@design-system': path.resolve(__dirname, './src/design-system'),
        '@store': path.resolve(__dirname, './src/store'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@components': path.resolve(__dirname, './src/components'),
        '@utils': path.resolve(__dirname, './src/utils'),
      }
    },
    define: {
      // Provide fallback values for required environment variables
      'process.env.VITE_AUTH_URL': JSON.stringify(env.VITE_AUTH_URL || 'http://localhost:4000'),
      'process.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL || 'http://localhost:3000'),
      'process.env.VITE_SUBSCRIPTION_WORKER': JSON.stringify(env.VITE_SUBSCRIPTION_WORKER || 'http://localhost:5000'),
      'process.env.VITE_ENABLE_LOGGING': JSON.stringify(env.VITE_ENABLE_LOGGING || 'false'),
      'process.env.VITE_ENV': JSON.stringify(env.VITE_ENV || 'production'),
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
      'process.env.VITE_APP_ENV': JSON.stringify(env.VITE_APP_ENV || 'production'),
      'process.env.VITE_USE_NETLIFY_REDIRECTS': JSON.stringify(env.VITE_USE_NETLIFY_REDIRECTS || 'false'),
      // Add React production settings explicitly
      '__VITE_DEV_MODE__': mode !== 'production',
      'React.jsxDEV': mode !== 'production'
    },
    // Make build more robust
    build: {
      // Output source maps for easier debugging
      sourcemap: true,
      // Add additional minification options
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // Only drop console in production
          drop_debugger: true
        }
      },
      // Split chunks for better caching
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Split vendor chunks
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('scheduler') || id.includes('prop-types')) {
                return 'vendor-react';
              }
              if (id.includes('@tanstack/react-query')) {
                return 'vendor-query';
              }
              if (id.includes('radix')) {
                return 'vendor-radix';
              }
              if (id.includes('lucide')) {
                return 'vendor-icons';
              }
              return 'vendor';
            }
            
            // Split feature chunks
            if (id.includes('/features/')) {
              const feature = id.split('/features/')[1].split('/')[0];
              return `feature-${feature}`;
            }
          }
        },
        external: ['/assets/env-config.js'] // Mark env-config.js as external
      }
    },
    // Improve development experience
    esbuild: {
      // Speed up builds in development
      legalComments: 'none',
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    }
  };
});