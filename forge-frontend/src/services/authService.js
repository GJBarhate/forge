// src/services/authService.js
import api from './api.js';

export const authService = {
  register: async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data.data;
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data;
  },

  refresh: async () => {
    const { data } = await api.get('/auth/refresh');
    return data.data; // Returns { accessToken, user }
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  me: async () => {
    const { data } = await api.get('/auth/me');
    return data.data;
  },
};
