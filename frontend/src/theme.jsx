import { createTheme } from '@mui/material/styles';

// 🌗 Theme Configuration
export const getAppTheme = (mode = 'dark') => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      primary: { 
        main: isDark ? '#90caf9' : '#1976d2',
        light: isDark ? '#bbdefb' : '#42a5f5',
        dark: isDark ? '#5e92f3' : '#1565c0',
      },
      secondary: { 
        main: isDark ? '#ce93d8' : '#9c27b0',
        light: isDark ? '#e1bee7' : '#ba68c8',
        dark: isDark ? '#ab47bc' : '#7b1fa2',
      },
      background: {
        default: isDark ? '#0a0a0a' : '#f5f5f5',
        paper: isDark ? '#121212' : '#ffffff',
      },
      text: {
        primary: isDark ? '#ffffff' : '#000000',
        secondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      // Custom colors for habit tracker
      success: {
        main: isDark ? '#4caf50' : '#2e7d32',
        light: isDark ? '#81c784' : '#4caf50',
        dark: isDark ? '#388e3c' : '#1b5e20',
      },
      warning: {
        main: isDark ? '#ff9800' : '#ed6c02',
        light: isDark ? '#ffb74d' : '#ff9800',
        dark: isDark ? '#f57c00' : '#e65100',
      },
      error: {
        main: isDark ? '#f44336' : '#d32f2f',
        light: isDark ? '#e57373' : '#f44336',
        dark: isDark ? '#d32f2f' : '#c62828',
      },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: { 
        defaultProps: { variant: 'contained' },
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiCard: { 
        styleOverrides: { 
          root: { 
            overflow: 'hidden',
            borderRadius: 12,
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: isDark ? 
              '0 4px 6px rgba(0, 0, 0, 0.3)' : 
              '0 2px 8px rgba(0, 0, 0, 0.1)',
          } 
        } 
      },
      MuiAppBar: { 
        styleOverrides: { 
          root: { 
            backgroundColor: isDark ? '#0f1115' : '#1976d2',
            borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          } 
        } 
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      // Custom gradient backgrounds for cards
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  });
};
