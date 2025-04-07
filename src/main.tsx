import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';

// Set up global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    error: event.error
  });
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', {
    reason: event.reason,
    promise: event.promise
  });
});

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <Router>
        <App />
      </Router>
    </StrictMode>
  );
} catch (error) {
  console.error('Fatal error during application initialization:', error);
  // Render fallback UI
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="font-family: system-ui; padding: 2rem; text-align: center;">
        <h1 style="color: #e11d48;">Application Error</h1>
        <p>Sorry, the application could not be loaded. Please try refreshing the page.</p>
        <pre style="background: #f1f5f9; padding: 1rem; text-align: left; overflow: auto; margin-top: 1rem;">${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
}