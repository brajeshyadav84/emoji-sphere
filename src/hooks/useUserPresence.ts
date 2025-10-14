import { useEffect, useCallback } from 'react';
import { 
  useSetUserOnlineMutation,
  useSetUserOfflineMutation, 
  useSendHeartbeatMutation
} from '@/store/api/presenceApi';

/**
 * Custom hook to manage user presence/online status
 * Automatically sets user online on mount, sends heartbeats, and handles cleanup
 */
export const useUserPresence = () => {
  const [setUserOnline] = useSetUserOnlineMutation();
  const [setUserOffline] = useSetUserOfflineMutation();
  const [sendHeartbeat] = useSendHeartbeatMutation();

  const handleSetOnline = useCallback(async () => {
    try {
      await setUserOnline().unwrap();
      console.log('User set online');
    } catch (error) {
      console.warn('Failed to set user online:', error);
    }
  }, [setUserOnline]);

  const handleSetOffline = useCallback(async () => {
    try {
      await setUserOffline().unwrap();
      console.log('User set offline');
    } catch (error) {
      console.warn('Failed to set user offline:', error);
    }
  }, [setUserOffline]);

  const handleHeartbeat = useCallback(async () => {
    try {
      await sendHeartbeat().unwrap();
      console.log('Heartbeat sent');
    } catch (error) {
      console.warn('Failed to send heartbeat:', error);
    }
  }, [sendHeartbeat]);

  useEffect(() => {
    let heartbeatInterval: NodeJS.Timeout;

    // Set user online when component mounts
    handleSetOnline();

    // Send heartbeat every 2 minutes to maintain online status
    heartbeatInterval = setInterval(() => {
      handleHeartbeat();
    }, 120000); // 2 minutes

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched to another tab - keep online but reduce heartbeat frequency
        clearInterval(heartbeatInterval);
        // Send heartbeat every 5 minutes when tab is hidden
        heartbeatInterval = setInterval(() => {
          handleHeartbeat();
        }, 300000); // 5 minutes
      } else {
        // User is back - resume normal heartbeat frequency
        clearInterval(heartbeatInterval);
        handleSetOnline(); // Ensure we're online
        heartbeatInterval = setInterval(() => {
          handleHeartbeat();
        }, 120000); // 2 minutes
      }
    };

    // Handle page unload - set user offline
    const handleBeforeUnload = () => {
      // Use sendBeacon for more reliable offline signal on page unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/user/status/offline', '{}');
      } else {
        handleSetOffline();
      }
    };

    // Handle window focus/blur for better presence detection
    const handleFocus = () => {
      handleSetOnline();
    };

    const handleBlur = () => {
      // Don't immediately set offline on blur, just reduce heartbeat frequency
      clearInterval(heartbeatInterval);
      heartbeatInterval = setInterval(() => {
        handleHeartbeat();
      }, 300000); // 5 minutes when window loses focus
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      
      // Set user offline when unmounting
      handleSetOffline();
    };
  }, [handleSetOnline, handleSetOffline, handleHeartbeat]);

  return {
    setOnline: handleSetOnline,
    setOffline: handleSetOffline,
    sendHeartbeat: handleHeartbeat,
  };
};

export default useUserPresence;