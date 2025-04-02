# Frontend Cloud Run Deployment Fix

## Issue Summary

The frontend deployment in Cloud Run was successfully building but encountering a JavaScript runtime error when running:

```
Uncaught TypeError: l.jsxDEV is not a function
```

This error occurs because:
1. The production build wasn't properly transforming JSX
2. React's development features were being referenced in the production build
3. There were configuration issues with environment variables

## Solution

We implemented several fixes to address these issues:

1. **Updated Vite Configuration**
   - Added explicit React production settings
   - Configured proper JSX runtime mode
   - Improved build optimization

2. **Added Runtime Environment Configuration**
   - Created a dynamic `env-config.js` file generated at container startup
   - Added environment variable fallbacks
   - Added explicit React global references

3. **Updated React Initialization**
   - Modified main entry point to use explicit React createElement calls
   - Added global React references for debugging
   - Added robust error handling

4. **Improved Build Process**
   - Created a specialized production build script
   - Added Babel dependencies for proper JSX transformation
   - Set NODE_ENV explicitly to production

## Implementation Details

### 1. Vite Configuration Updates

Updated `vite.config.ts` to explicitly handle React production mode:

```typescript
plugins: [
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
],
```

Added build optimization settings:

```typescript
build: {
  // Output source maps for easier debugging
  sourcemap: true,
  // Add additional minification options
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: false,
      drop_debugger: true
    }
  },
  // Avoid empty chunks in production
  rollupOptions: {
    output: {
      manualChunks: undefined
    }
  }
}
```

### 2. Runtime Environment Configuration

Created a runtime configuration script in `docker-entrypoint.sh`:

```bash
# Create runtime environment JS file
mkdir -p /usr/share/nginx/html/assets
cat > /usr/share/nginx/html/assets/env-config.js << EOF
// Runtime environment configuration - updated at container startup
window.RUNTIME_CONFIG = {
  AUTH_SERVICE_URL: "${AUTH_SERVICE_URL}",
  BACKEND_SERVICE_URL: "${BACKEND_SERVICE_URL}",
  NODE_ENV: "production",
  REACT_APP_ENV: "production",
  USE_NETLIFY_REDIRECTS: false
};
EOF
```

Updated `index.html` to load and apply this configuration:

```html
<!-- Load runtime environment configuration -->
<script src="/assets/env-config.js"></script>

<!-- Ensure React is available in production -->
<script>
  // Set production mode explicitly and load runtime config
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  window.process.env.NODE_ENV = 'production';
  
  // Apply runtime config if available
  if (window.RUNTIME_CONFIG) {
    Object.keys(window.RUNTIME_CONFIG).forEach(function(key) {
      window.process.env[key] = window.RUNTIME_CONFIG[key];
    });
    console.log('Runtime config applied:', window.RUNTIME_CONFIG);
  }
</script>
```

### 3. React Initialization Updates

Modified `main.tsx` to use explicit React APIs:

```javascript
import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

// Ensure React is available in the global scope for debugging
window.React = React;
window.ReactDOM = ReactDOM;

// Use ReactDOM explicitly and createElement instead of JSX
const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(StrictMode, null, 
    React.createElement(Router, null,
      React.createElement(QueryClientProvider, { client: queryClient },
        React.createElement(App, null)
      )
    )
  )
);
```

### 4. Production Build Script

Created a specialized `production-build.sh` script:

```bash
#!/bin/bash
# Production-optimized build script for React frontend

# Set environment variables
export NODE_ENV=production
export REACT_ENV=production
export VITE_APP_ENV=production
export VITE_USE_NETLIFY_REDIRECTS=false
export BABEL_ENV=production

# Install required Babel dependencies if not present
npm install --save-dev @babel/preset-react @babel/plugin-transform-react-jsx terser

# Run production build
npx vite build --mode production

# Generate runtime environment script
cat > dist/assets/env-config.js << EOF
// Runtime environment configuration
window.RUNTIME_CONFIG = {
  AUTH_SERVICE_URL: "${AUTH_SERVICE_URL:-PLACEHOLDER_AUTH_URL}",
  BACKEND_SERVICE_URL: "${BACKEND_SERVICE_URL:-PLACEHOLDER_BACKEND_URL}",
  NODE_ENV: "production",
  REACT_APP_ENV: "production",
  USE_NETLIFY_REDIRECTS: false
};
console.log('Runtime config loaded:', window.RUNTIME_CONFIG);
EOF
```

## Why This Works

The primary issue was that the React JSX development functions (`jsxDEV`) were being referenced in the production build, causing runtime errors. Our fixes address this by:

1. Ensuring the React production mode is correctly set
2. Using explicit `React.createElement` calls instead of JSX in critical places
3. Making React available globally for debugging
4. Properly setting environment variables

This approach ensures that:
- JSX is properly transformed for production
- React runtime is correctly configured
- Environment variables are properly set at runtime
- The application is more resilient to errors

## Testing

The deployment can be tested by deploying to Cloud Run and verifying:
1. The application loads without JavaScript errors
2. The runtime configuration is correctly applied
3. API calls work correctly through the Nginx proxy