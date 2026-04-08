// src/services/api.js
import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Rate limiting state
let rateLimitState = {
  retryAfter: 0,
  queue: [],
  processing: false,
};

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send HttpOnly refresh token cookie
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach access token & handle rate limiting
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // Check if we're rate limited
  if (rateLimitState.retryAfter > Date.now()) {
    const delay = rateLimitState.retryAfter - Date.now();
    console.warn(`⏳ Rate limited. Retrying after ${Math.ceil(delay / 1000)}s`);
    return new Promise((resolve) => {
      setTimeout(() => resolve(config), Math.min(delay, 5000));
    });
  }
  
  return config;
});

// Response interceptor — refresh token on 401 & handle rate limiting
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Reset rate limit on successful response
    rateLimitState.retryAfter = 0;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // ✅ Handle 429 (Too Many Requests) - rate limiting
    if (status === 429) {
      const retryAfter = parseInt(error.response?.headers['retry-after'] || '1', 10);
      rateLimitState.retryAfter = Date.now() + retryAfter * 1000;
      console.warn(`⚠️ 429 Rate Limited! Retry after: ${retryAfter}s`);
      
      // Retry the request after delay
      const delay = Math.min(retryAfter * 1000, 5000);
      return new Promise((resolve) => {
        setTimeout(() => {
          api(originalRequest).then(resolve).catch((err) => {
            console.error('Retry failed after rate limit:', err.message);
            Promise.reject(err);
          });
        }, delay);
      });
    }

    // ✅ Handle 401 (Unauthorized) - token refresh
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.get(`${BASE_URL}/auth/refresh`, {
          withCredentials: true,
        });
        const newToken = data.data.accessToken;
        const user = data.data.user;
        useAuthStore.getState().setAuth(user, newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
