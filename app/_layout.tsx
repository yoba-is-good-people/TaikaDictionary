import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';


import { ThemeProvider } from '../context/ThemeContext';
import { dbService } from '../services/db';


export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [isDbReady, setIsDbReady] = useState(false);

  // FIX: Add logic to initialize the database when the app starts
  useEffect(() => {
    async function prepareApp() {
      try {
        await dbService.initDatabase();
        console.log("Database initialized successfully!");
      } catch (e) {
        console.warn("Error initializing database", e);
      } finally {
        setIsDbReady(true);
      }
    }

    prepareApp();
  }, []);

  // While the database is initializing, don't render the app to prevent errors
  if (!isDbReady) {
    return null; // Or you can return a loading spinner here
  }

  return (
    // FIX: Wrap the ENTIRE app in YOUR ThemeProvider
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

// FIX: Create a separate component for navigation to use the theme context
function RootLayoutNav() {
  return (
    <>
      <Stack>
        {/* This is your main tab navigator */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* FIX: The line for the modal screen has been REMOVED */}
      </Stack>
      {/* The StatusBar component is fine */}
      <StatusBar style="auto" />
    </>
  );
}