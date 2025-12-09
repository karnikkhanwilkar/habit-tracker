import React from 'react';
import { AppBar, Toolbar, Typography, Container, CssBaseline, Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { getAppTheme } from '../theme';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const Layout = ({ children }) => {
  const theme = getAppTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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
              <Typography color="inherit" sx={{ mr: 2 }}>
                Hi, {user.name}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
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
      <Container maxWidth="lg" sx={{ my: 3 }}>
        {children}
      </Container>
    </ThemeProvider>
  );
};

export default Layout;
