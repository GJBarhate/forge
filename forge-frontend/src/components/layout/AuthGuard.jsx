// src/components/layout/AuthGuard.jsx
import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { authService } from '../../services/authService.js';

export default function AuthGuard() {
  const { isAuthenticated, isLoading, setAuth, clearAuth, setLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth from localStorage first
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // If already authenticated, don't refresh
    if (isAuthenticated) {
      setLoading(false);
      return;
    }

    // Only try to refresh if not loading and not already authenticated
    if (isLoading) {
      const init = async () => {
        try {
          const response = await authService.refresh();
          const { accessToken, user } = response;
          
          if (user && accessToken) {
            setAuth(user, accessToken);
            setLoading(false);
          } else {
            clearAuth();
            setLoading(false);
          }
        } catch (err) {
          console.error('Auth refresh failed:', err);
          clearAuth();
          setLoading(false);
        }
      };
      
      init();
    }
  }, [isAuthenticated, isLoading, setAuth, clearAuth, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-purple/30 border-t-purple rounded-full animate-spin" />
          <p className="text-[#5f5f80] text-sm font-mono">Loading Forge...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
