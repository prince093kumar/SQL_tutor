import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export const useIdleTimeout = (timeoutMinutes = 5) => {
  const logout = useAuthStore(state => state.logout);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const timeoutId = useRef<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const timeoutMs = timeoutMinutes * 60 * 1000;

    const handleIdle = () => {
      logout();
      alert('You have been logged out due to 5 minutes of inactivity.');
    };

    const resetTimer = () => {
      if (timeoutId.current) {
        window.clearTimeout(timeoutId.current);
      }
      timeoutId.current = window.setTimeout(handleIdle, timeoutMs);
    };

    // Events that denote user activity
    const events = [
      'mousemove',
      'keydown',
      'wheel',
      'mousedown',
      'touchstart',
      'touchmove'
    ];

    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Initialize timer
    resetTimer();

    return () => {
      if (timeoutId.current) {
        window.clearTimeout(timeoutId.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, timeoutMinutes, logout]);
};
