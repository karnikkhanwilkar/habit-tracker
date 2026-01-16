import React, { useEffect, useState } from 'react';
import { Alert, Button, Snackbar } from '@mui/material';

/**
 * 🔄 Service Worker Update Manager
 * Handles service worker updates and caching
 */
const PWAUpdater = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available, show update prompt
                  setWaitingWorker(newWorker);
                  setShowUpdatePrompt(true);
                }
              });
            }
          });

          // Listen for controller change (when new SW takes over)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          setShowUpdatePrompt(true);
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  return (
    <Snackbar
      open={showUpdatePrompt}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        severity="info"
        action={
          <div>
            <Button color="inherit" size="small" onClick={handleUpdate}>
              Update
            </Button>
            <Button color="inherit" size="small" onClick={handleDismiss}>
              Later
            </Button>
          </div>
        }
      >
        New version available! Update now for the latest features.
      </Alert>
    </Snackbar>
  );
};

export default PWAUpdater;