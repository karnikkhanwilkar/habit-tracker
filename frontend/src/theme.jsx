import { createTheme } from '@mui/material/styles';

export const getAppTheme = () =>
  createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#90caf9' },
      secondary: { main: '#ce93d8' },
      background: {
        default: '#0a0a0a',
        paper: '#121212',
      },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiButton: { defaultProps: { variant: 'contained' } },
      MuiCard: { styleOverrides: { root: { overflow: 'hidden' } } },
      MuiAppBar: { styleOverrides: { colorPrimary: { backgroundColor: '#0f1115' } } },
    },
  });
