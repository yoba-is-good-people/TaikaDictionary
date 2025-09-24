
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  colors: Record<string, any>;
}

const lightColors = {
    primaryGradient: ['#667eea', '#764ba2'],
    background: ['#f5f7fa', '#c3cfe2'],
    backgroundSimple: '#f5f7fa',
    surface: '#ffffff',
    text: '#2d3748',
    subtleText: '#4a5568',
    accent: '#ed64a6',
    border: '#e2e8f0',
};

const darkColors = {
    primaryGradient: ['#4c51bf', '#553c9a'],
    background: ['#1a202c', '#2d3748'],
    backgroundSimple: '#1a202c',
    surface: '#2d3748',
    text: '#f7fafc',
    subtleText: '#a0aec0',
    accent: '#f687b3',
    border: '#4a5568',
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemTheme || 'light');

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('taika-theme') as Theme | null;
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        setTheme(systemTheme || 'light');
      }
    };
    loadTheme();
  }, [systemTheme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem('taika-theme', newTheme);
      return newTheme;
    });
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
