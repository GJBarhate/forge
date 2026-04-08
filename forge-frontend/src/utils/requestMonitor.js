// src/utils/requestMonitor.js

/**
 * Request monitoring utility for debugging and tracking API calls
 * Shows request/response activity in console for development
 */

const requestLog = {
  pendingRequests: new Map(),
  stats: {
    total: 0,
    success: 0,
    errors: 0,
    rateLimited: 0,
    avgResponseTime: 0,
  },
};

export const setupRequestMonitoring = (api) => {
  // Log outgoing requests
  api.interceptors.request.use((config) => {
    const requestId = `${config.method.toUpperCase()} ${config.url}`;
    const startTime = performance.now();
    
    requestLog.pendingRequests.set(requestId, {
      startTime,
      method: config.method.toUpperCase(),
      url: config.url,
      timestamp: new Date().toLocaleTimeString(),
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 ${requestId}`);
    }

    return config;
  });

  // Log responses
  api.interceptors.response.use(
    (response) => {
      const requestId = `${response.config.method.toUpperCase()} ${response.config.url}`;
      const request = requestLog.pendingRequests.get(requestId);
      
      if (request) {
        const duration = performance.now() - request.startTime;
        requestLog.stats.total++;
        requestLog.stats.success++;
        requestLog.stats.avgResponseTime = 
          (requestLog.stats.avgResponseTime + duration) / 2;

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `✅ ${requestId} ${response.status} (${Math.round(duration)}ms)`
          );
        }
        
        requestLog.pendingRequests.delete(requestId);
      }

      return response;
    },
    (error) => {
      const requestId = `${error.config?.method?.toUpperCase() || 'UNKNOWN'} ${error.config?.url || 'unknown'}`;
      const request = requestLog.pendingRequests.get(requestId);
      
      if (request) {
        const duration = performance.now() - request.startTime;
        requestLog.stats.total++;
        requestLog.stats.errors++;

        if (error.response?.status === 429) {
          requestLog.stats.rateLimited++;
          console.warn(
            `⏳ ${requestId} 429 Rate Limited (${Math.round(duration)}ms)`
          );
        } else {
          console.error(
            `❌ ${requestId} ${error.response?.status || 'Error'} (${Math.round(duration)}ms)`
          );
        }

        requestLog.pendingRequests.delete(requestId);
      }

      return Promise.reject(error);
    }
  );
};

export const getRequestStats = () => requestLog.stats;
export const getPendingRequests = () => Array.from(requestLog.pendingRequests.values());

// Expose global debugging function
if (typeof window !== 'undefined') {
  window.__requestDebug = {
    stats: () => getRequestStats(),
    pending: () => getPendingRequests(),
    clear: () => requestLog.pendingRequests.clear(),
  };
}
