
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './context/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { dbService } from './services/db';

export default function App() {
  useEffect(() => {
    const initializeDb = async () => {
      try {
        await dbService.initDatabase();
      } catch (e) {
        console.error("Failed to initialize database", e);
      }
    };
    initializeDb();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}