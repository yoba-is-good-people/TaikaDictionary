import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from '../../context/ThemeContext'; // Using YOUR theme context

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primaryGradient[0], 
        tabBarInactiveTintColor: colors.subtleText,
        headerShown: false, // We can hide the default header
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border, // Add a border color for style
        },
      }}>
      
      {/* Tab 1: Lexicon (your main dictionary screen) */}
      <Tabs.Screen
        name="index" // This corresponds to the file `app/(tabs)/index.tsx`
        options={{
          title: 'Lexicon', // The text displayed on the tab
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      
      {/* Tab 2: Grammar */}
      <Tabs.Screen
        name="grammar" // This corresponds to the file `app/(tabs)/grammar.tsx`
        options={{
          title: 'Grammar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school" size={size} color={color} />
          ),
        }}
      />
      
      {/* Tab 3: About */}
      <Tabs.Screen
        name="about" // This corresponds to the file `app/(tabs)/about.tsx`
        options={{
          title: 'About',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="information-circle-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Tab 4: Settings */}
      <Tabs.Screen
        name="Settings" // This corresponds to the file `app/(tabs)/Settings.tsx`
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Tab 5: License (NEW) */}
      <Tabs.Screen
        name="license" // This will correspond to a NEW file `app/(tabs)/license.tsx`
        options={{
          title: 'License',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}