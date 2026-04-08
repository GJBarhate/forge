// src/components/layout/AuthGuard.jsx
import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { authService } from '../../services/authService.js';

export default function AuthGuard() {
  const { isAuthenticated, isLoading, setAuth, clearAuth, setLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Step 1: Initialize from localStorage (synchronous)
        initializeAuth();
        
        // Step 2: Try to refresh token to validate session
        // This checks if the refresh token cookie is still valid
        try {
          const { accessToken, user } = await authService.refresh();
          
          if (user && accessToken) {
            // Refresh successful, update auth with fresh token
            setAuth(user, accessToken);
          } else {
            // No user/token in refresh response, clear auth
            clearAuth();
          }
        } catch (refreshErr) {
          // Refresh failed (no valid refresh token or network error)
          // Just clear auth, don't redirect - let AuthGuard handle it
          clearAuth();
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        clearAuth();
      } finally {
        // Mark loading as complete
        setLoading(false);
      }
    };

    initAuth();
  }, [setAuth, clearAuth, setLoading, initializeAuth]);

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
