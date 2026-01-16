import React, { useState, useEffect } from 'react';
import { 
  Alert, 
  Button, 
  IconButton, 
  Snackbar, 
  Typography, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Close, GetApp, PhoneIphone, Computer } from '@mui/icons-material';

/**
 * 📱 PWA Install Prompt Component
 * Handles app installation prompting and offline notifications
 */
const PWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineSnackbar, setShowOfflineSnackbar] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        setIsInstalled(true);
      }
    };
    checkInstalled();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt after a delay (if not dismissed before)
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed && !isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 10000); // Show after 10 seconds
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      setShowInstallDialog(false);
      setIsInstalled(true);
      localStorage.setItem('pwa-installed', 'true');
    };

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineSnackbar(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineSnackbar(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show manual install instructions for iOS and other platforms
      setShowInstallDialog(true);
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const getInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      return (
        <Box>
          <Typography variant="body2" gutterBottom>
            To install this app on your iOS device:
          </Typography>
          <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
            <li>Tap the share button at the bottom of the screen</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" to confirm</li>
          </Typography>
        </Box>
      );
    } else if (isAndroid) {
      return (
        <Box>
          <Typography variant="body2" gutterBottom>
            To install this app on your Android device:
          </Typography>
          <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
            <li>Tap the menu button (three dots) in your browser</li>
            <li>Select "Add to Home screen" or "Install app"</li>
            <li>Follow the prompts to install</li>
          </Typography>
        </Box>
      );
    } else {
      return (
        <Box>
          <Typography variant="body2" gutterBottom>
            To install this app:
          </Typography>
          <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
            <li>Look for an install button in your browser's address bar</li>
            <li>Or check your browser's menu for "Install" or "Add to Desktop" options</li>
          </Typography>
        </Box>
      );
    }
  };

  if (isInstalled) {
    return null; // Don't show anything if already installed
  }

  return (
    <>
      {/* Install Prompt Snackbar */}
      <Snackbar
        open={showInstallPrompt}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 2 }}
      >
        <Alert
          severity="info"
          action={
            <Box>
              <Button color="inherit" size="small" onClick={handleInstallClick}>
                Install
              </Button>
              <IconButton size="small" onClick={handleDismissInstall} color="inherit">
                <Close fontSize="small" />
              </IconButton>
            </Box>
          }
          sx={{ width: '100%', maxWidth: 400 }}
        >
          <Typography variant="body2">
            📱 Install Habit Tracker for easy access and offline use!
          </Typography>
        </Alert>
      </Snackbar>

      {/* Manual Install Instructions Dialog */}
      <Dialog open={showInstallDialog} onClose={() => setShowInstallDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {isMobile ? <PhoneIphone /> : <Computer />}
            Install Habit Tracker
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Get the best experience with our Progressive Web App!
          </Typography>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            {getInstallInstructions()}
          </Box>

          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            <strong>Benefits:</strong>
            • Offline access to your habits
            • Faster loading
            • App-like experience
            • Works without internet connection
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInstallDialog(false)}>
            Maybe Later
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setShowInstallDialog(false)}
            startIcon={<GetApp />}
          >
            Got It
          </Button>
        </DialogActions>
      </Dialog>

      {/* Offline Notification */}
      <Snackbar
        open={showOfflineSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={6000}
        onClose={() => setShowOfflineSnackbar(false)}
      >
        <Alert severity="warning" onClose={() => setShowOfflineSnackbar(false)}>
          You're offline. Some features may be limited.
        </Alert>
      </Snackbar>
    </>
  );
};

export default PWAPrompt;