// src/services/projectService.js
import api from './api.js';

const cache = new Map();

const getCached = (key, ttl = 30000) => {
  const cached = cache.get(key);
  if (!cached || Date.now() > cached.expiry) {
    cache.delete(key);
    return null;
  }
  return cached.value;
};

const setCached = (key, value, ttl = 30000) => {
  cache.set(key, { value, expiry: Date.now() + ttl });
};

export const projectService = {
  getAll: async () => {
    const cached = getCached('projects:all');
    if (cached) return cached;

    const { data } = await api.get('/projects');
    // Backend returns: { success: true, data: { projects } }
    const result = data.data?.projects || data.projects || data;
    setCached('projects:all', result, 30000);
    return result;
  },

  getById: async (id) => {
    // Don't cache during processing - always fetch fresh data
    const { data } = await api.get(`/projects/${id}`);
    // Backend returns: { success: true, data: { project } }
    const result = data.data?.project || data.project || data;
    
    // Only cache if NOT processing
    if (result?.status !== 'PROCESSING') {
      const cacheKey = `project:${id}`;
      setCached(cacheKey, result, 60000);
    }
    
    return result;
  },

  getIterations: async (id) => {
    const cacheKey = `iterations:${id}`;
    // Don't use cache - always fetch fresh to show real-time progress
    const { data } = await api.get(`/projects/${id}/iterations`);
    const result = data;
    return result;
  },

  reiterate: async (id, payload, retries = 3) => {
    const cleanPayload = {
      textinput: payload.textinput || payload.textInput || payload.feedback || '',
      voiceTranscript: payload.voiceTranscript || undefined,
      imageBase64: payload.imageBase64 || undefined,
      iterationType: payload.iterationType || 'general',
    };

    let lastError;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const { data } = await api.post(`/projects/${id}/reiterate`, cleanPayload);
        cache.delete(`iterations:${id}`);
        cache.delete(`project:${id}`);
        return data.data || data;
      } catch (err) {
        lastError = err;
        // If 429 (Too Many Requests) and not last attempt, wait and retry
        if (err?.response?.status === 429 && attempt < retries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.warn(`⏳ Rate limited. Retrying in ${waitTime}ms... (attempt ${attempt + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  },
};