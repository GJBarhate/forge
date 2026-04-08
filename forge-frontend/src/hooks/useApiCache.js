// src/hooks/useApiCache.js
import { useRef, useCallback } from 'react';

/**
 * Simple in-memory cache for API calls to prevent duplicate requests
 * Reduces 429 errors by caching responses for a configurable TTL
 */
export function useApiCache(ttl = 5000) {
  const cacheRef = useRef(new Map());

  const get = useCallback((key) => {
    const cached = cacheRef.current.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiry) {
      cacheRef.current.delete(key);
      return null;
    }
    return cached.value;
  }, []);

  const set = useCallback((key, value) => {
    cacheRef.current.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }, [ttl]);

  const clear = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return { get, set, clear };
}

/**
 * Hook to memoize API calls and prevent multiple identical requests
 * Usage: const response = useApiMemoize(() => api.get('/users/profile'), []);
 */
export function useApiMemoize(apiCall, dependencies = []) {
  const resultRef = useRef(null);
  const promiseRef = useRef(null);

  return useCallback(() => {
    // If already in flight, return the same promise
    if (promiseRef.current) {
      return promiseRef.current;
    }

    // If already cached and dependencies haven't changed, return cached result
    if (resultRef.current) {
      return Promise.resolve(resultRef.current);
    }

    // Make the new request
    promiseRef.current = apiCall().then((result) => {
      resultRef.current = result;
      promiseRef.current = null;
      return result;
    });

    return promiseRef.current;
  }, dependencies);
}
