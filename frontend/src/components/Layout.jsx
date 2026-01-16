import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Button, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleLogoutClick = () => {
    setOpenConfirm(true);
  };

  const handleConfirmLogout = () => {
    setOpenConfirm(false);
    logout();
    navigate('/');
  };

  const handleCancelLogout = () => {
    setOpenConfirm(false);
  };

  const handleUsernameClick = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1 }}
            component={RouterLink}
            to="/"
            color="inherit"
            style={{ textDecoration: 'none' }}
          >
            Habit Tracker
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1}>
            {/* 🌗 Theme Toggle */}
            <ThemeToggle size="medium" />
            
            {user ? (
              <>
                <Typography 
                  color="inherit" 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { textDecoration: 'underline' },
                    mr: 2 
                  }}
                  onClick={handleUsernameClick}
                >
                  Welcome, {user.name}
                </Typography>
                <Button color="inherit" onClick={handleLogoutClick}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={RouterLink} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={RouterLink} to="/signup">
                  Signup
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="xl" sx={{ py: 2, minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </Container>

      {/* Logout Confirmation Dialog */}
      <Dialog open={openConfirm} onClose={handleCancelLogout}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} color="primary" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Layout;
