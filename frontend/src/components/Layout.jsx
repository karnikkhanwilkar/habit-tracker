import React from 'react';
import { AppBar, Toolbar, Typography, Container, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { getAppTheme } from '../theme';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const Layout = ({ children }) => {
  const theme = getAppTheme();
  const { user } = useAuth();

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
            <Typography
              component={RouterLink}
              to="/dashboard"
              color="inherit"
              sx={{ mr: 2, textDecoration: 'none', fontWeight: 600 }}
            >
              {user.name || user.username || user.email}
            </Typography>
          ) : (
            <Typography
              component={RouterLink}
              to="/login"
              color="inherit"
              sx={{ mr: 2, textDecoration: 'none' }}
            >
              Login
            </Typography>
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
