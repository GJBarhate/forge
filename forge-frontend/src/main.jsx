// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';
import api from './services/api.js';
import { setupRequestMonitoring } from './utils/requestMonitor.js';

// Setup request monitoring for debugging
setupRequestMonitoring(api);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2, // Reduced from 3 to avoid overwhelming rate limiter
      retryDelay: (attemptIndex) => {
        // Longer delays: 2s, 5s
        const baseDelay = 2000;
        return baseDelay * (attemptIndex + 1) + Math.random() * 1000;
      },
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1e30',
            color: '#e8e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#2dd4a0', secondary: '#0a0a0f' } },
          error: { iconTheme: { primary: '#f4714a', secondary: '#0a0a0f' } },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
