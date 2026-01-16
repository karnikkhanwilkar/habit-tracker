import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { getAppTheme } from '../theme.jsx';

/**
 * 🌗 Theme Context for Dark/Light Mode Management
 */

const ThemeContext = createContext();

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a CustomThemeProvider');
  }
  return context;
};

export const CustomThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or default to 'dark'
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('habitTracker_theme');
    return saved || 'dark';
  });

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('habitTracker_theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setLightMode = () => setThemeMode('light');
  const setDarkMode = () => setThemeMode('dark');

  const theme = getAppTheme(themeMode);

  const contextValue = {
    themeMode,
    toggleTheme,
    setLightMode,
    setDarkMode,
    isDark: themeMode === 'dark',
    isLight: themeMode === 'light',
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};