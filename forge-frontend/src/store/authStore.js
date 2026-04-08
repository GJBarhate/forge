// src/store/authStore.js
import { create } from 'zustand';

// Key for localStorage
const AUTH_TOKEN_KEY = 'forge_auth_token';
const AUTH_USER_KEY = 'forge_auth_user';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  // Set full auth data after login — also persist to localStorage
  setAuth: (user, accessToken) => {
    // Store in localStorage for persistence across page reloads
    if (accessToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    }
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
  },

  // Clear everything on logout — also clear localStorage
  clearAuth: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },

  // Initialize from localStorage on app startup
  initializeAuth: () => {
    try {
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      
      if (savedToken && savedUser) {
        const user = JSON.parse(savedUser);
        set({ user, accessToken: savedToken, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('Failed to initialize auth from localStorage:', err);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      set({ isLoading: false });
    }
  },

  // Update only user info (useful for profile page later)
  updateUser: (updatedUser) =>
    set((state) => ({
      user: { ...state.user, ...updatedUser },
    })),

  setLoading: (isLoading) => set({ isLoading }),

  getToken: () => get().accessToken,

  // Get user's personal Gemini API key
  getGeminiApiKey: () => get().user?.geminiApiKey || null,

  // Update user's Gemini API key in store
  setGeminiApiKey: (geminiApiKey) =>
    set((state) => ({
      user: { ...state.user, geminiApiKey },
    })),
}));