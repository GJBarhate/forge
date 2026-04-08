// forge-frontend/src/hooks/useSocket.js
import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

console.log(`\n🔌 [Socket] Configuration`);
console.log(`  URL: ${SOCKET_URL}`);
console.log(`\n`);

let socketInstance = null;

export const useSocket = () => {
  const token = useAuthStore((s) => s.accessToken);
  const socketRef = useRef(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      console.log('❌ [Socket] No token available');
      return;
    }

    if (!socketInstance || !socketInstance.connected) {
      console.log('🔌 [Socket] Creating new socket connection to:', SOCKET_URL);
      socketInstance = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketInstance.on('connect', () => {
        console.log(`✅ [Socket] Connected! ID: ${socketInstance.id}`);
        connectedRef.current = true;
      });

      socketInstance.on('disconnect', () => {
        console.log('❌ [Socket] Disconnected');
        connectedRef.current = false;
      });

      socketInstance.on('error', (error) => {
        console.error('⚠️ [Socket] Error:', error);
      });
    }

    socketRef.current = socketInstance;

    return () => {
      // Keep socket alive across pages (singleton)
    };
  }, [token]);

  const joinJob = useCallback((jobId) => {
    if (!socketInstance) {
      console.error('[Socket] Cannot joinJob - socket instance not initialized');
      return;
    }
    
    // If not connected, wait for connection before joining
    if (!socketInstance.connected) {
      console.warn('[Socket] Socket not connected, waiting before joining room...');
      socketInstance.once('connect', () => {
        console.log('[Socket] Connected! Now joining job room:', `forge-job:${jobId}`);
        socketInstance.emit('join:job', jobId);
      });
    } else {
      console.log('[Socket] Joining job room immediately:', `forge-job:${jobId}`);
      socketInstance.emit('join:job', jobId);
    }
  }, []);

  const leaveJob = useCallback((jobId) => {
    if (!socketInstance) return;
    console.log('[Socket] Leaving job room:', `forge-job:${jobId}`);
    socketInstance.emit('leave:job', jobId);
  }, []);

  const onJobProgress = useCallback((cb) => {
    // Use socketInstance directly (global singleton) instead of ref
    if (!socketInstance) {
      console.warn('[Socket] Progress: Socket instance not available');
      return () => {};
    }
    
    const handler = (data) => {
      console.log('[Socket] Progress event received:', data);
      cb({
        progress: data.progress || 0,
        step: data.step || '',
        projectId: data.projectId,
        iterationId: data.iterationId,
      });
    };
    
    // Register listener immediately, even if not connected
    console.log('[Socket] Registering listener for job:progress events');
    socketInstance.on('job:progress', handler);
    
    return () => {
      console.log('[Socket] Removing job:progress listener');
      socketInstance.off('job:progress', handler);
    };
  }, []);

  const onJobComplete = useCallback((cb) => {
    // Use socketInstance directly (global singleton) instead of ref
    if (!socketInstance) {
      console.warn('[Socket] Complete: Socket instance not available');
      return () => {};
    }
    
    console.log('[Socket] Listening for job:complete events');
    const handler = (data) => {
      console.log('[Socket] Complete event received:', data);
      cb(data);
    };
    
    socketInstance.on('job:complete', handler);
    return () => {
      console.log('[Socket] Removing job:complete listener');
      socketInstance.off('job:complete', handler);
    };
  }, []);

  const onJobFailed = useCallback((cb) => {
    // Use socketInstance directly (global singleton) instead of ref
    if (!socketInstance) {
      console.warn('[Socket] Failed: Socket instance not available');
      return () => {};
    }
    
    console.log('[Socket] Listening for job:failed events');
    const handler = (data) => {
      console.log('[Socket] Failed event received:', data);
      cb(data);
    };
    
    socketInstance.on('job:failed', handler);
    return () => {
      console.log('[Socket] Removing job:failed listener');
      socketInstance.off('job:failed', handler);
    };
  }, []);

  return { 
    joinJob, 
    leaveJob, 
    onJobProgress, 
    onJobComplete, 
    onJobFailed,
    socket: socketRef.current 
  };
};