import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, CssBaseline, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { getAppTheme } from '../theme';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const Layout = ({ children }) => {
  const theme = getAppTheme();
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
          {user ? (
            <>
              <Typography 
                color="inherit" 
                sx={{ mr: 2, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                onClick={handleUsernameClick}
              >
                Hi, {user.name}
              </Typography>
              <Button color="inherit" onClick={handleLogoutClick}>
                LOGOUT
              </Button>
            </>
          ) : (
            <Button component={RouterLink} to="/login" color="inherit">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Dialog open={openConfirm} onClose={handleCancelLogout}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          Are you sure you want to logout?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="lg" sx={{ my: 3 }}>
        {children}
      </Container>
    </ThemeProvider>
  );
};

export default Layout;
