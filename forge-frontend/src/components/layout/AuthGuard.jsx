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
          console.log('🔄 [AuthGuard] Attempting to refresh token...');
          const { accessToken, user } = await authService.refresh();
          
          if (user && accessToken) {
            // Refresh successful, update auth with fresh token
            console.log('✅ [AuthGuard] Token refreshed successfully for:', user.email);
            setAuth(user, accessToken);
          } else {
            // No user/token in refresh response, clear auth
            console.warn('⚠️ [AuthGuard] No user/token in refresh response');
            clearAuth();
          }
        } catch (refreshErr) {
          // Refresh failed (no valid refresh token or network error)
          // Check if we have cached auth from localStorage
          console.warn('⚠️ [AuthGuard] Refresh failed:', refreshErr?.message);
          
          // If localStorage has auth data, try to use it temporarily
          // The app can work with the access token even if refresh fails
          // as long as the token isn't expired
          const savedToken = localStorage.getItem('forge_auth_token');
          if (savedToken) {
            console.log('💾 [AuthGuard] Using cached token from localStorage');
            // Keep the auth state as-is, just mark loading as complete
            // The app will use the cached token until it expires
          } else {
            clearAuth();
          }
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
