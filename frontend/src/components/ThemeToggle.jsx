import React from 'react';
import { IconButton, Tooltip, useTheme as useMuiTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useAppTheme } from '../contexts/ThemeContext.jsx';

/**
 * 🌗 Theme Toggle Button Component
 * Allows users to switch between light and dark mode
 */
const ThemeToggle = ({ size = 'medium', showTooltip = true }) => {
  const { themeMode, toggleTheme } = useAppTheme();
  const muiTheme = useMuiTheme();

  const button = (
    <IconButton
      onClick={toggleTheme}
      size={size}
      sx={{
        color: muiTheme.palette.text.primary,
        '&:hover': {
          backgroundColor: muiTheme.palette.action.hover,
          transform: 'scale(1.1)',
        },
        transition: 'all 0.2s ease-in-out',
      }}
      aria-label="Toggle theme"
    >
      {themeMode === 'dark' ? (
        <Brightness7 sx={{ fontSize: size === 'small' ? 20 : 24 }} />
      ) : (
        <Brightness4 sx={{ fontSize: size === 'small' ? 20 : 24 }} />
      )}
    </IconButton>
  );

  if (showTooltip) {
    return (
      <Tooltip title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`} arrow>
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default ThemeToggle;