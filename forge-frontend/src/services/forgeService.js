// src/services/forgeService.js
import api from './api.js';

export const forgeService = {
  generate: async (payload) => {
    const { data } = await api.post('/forge/generate', payload);
    return data.data;
  },

  fork: async (iterationId, projectId) => {
    const { data } = await api.post('/forge/fork', { iterationId, projectId });
    return data.data;
  },

  getJobStatus: async (jobId) => {
    const { data } = await api.get(`/forge/jobs/${jobId}`);
    return data.data;
  },
};

export const audioService = {
  transcribe: async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    const { data } = await api.post('/audio/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.transcript;
  },
};

export const competitorService = {
  analyze: async (url) => {
    const { data } = await api.post('/competitor/analyze', { url });
    return data.data;
  },
};
