// src/hooks/useAuth.js
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { authService } from '../services/authService.js';

export const useInitAuth = () => {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      try {
        const { accessToken, user } = await authService.refresh();
        setAuth(user, accessToken);
      } catch {
        clearAuth();
      }
    };
    init();
  }, []);
};

export const useLogout = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
    }
  };
};
