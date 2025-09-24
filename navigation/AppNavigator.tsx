import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useTheme } from '../context/ThemeContext';

import AboutScreen from '../screens/AboutScreen';
import AddEditWordScreen from '../screens/AddEditWordScreen';
import GrammarScreen from '../screens/GrammarScreen';
import LexiconScreen from '../screens/LexiconScreen';
import SettingsScreen from '../screens/SettingsScreen';

import { BookOpenIcon, CogIcon, InformationCircleIcon, ScaleIcon } from '../components/icons';
import { BottomTabParamList, RootStackParamList } from '../types';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function BottomTabs() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryGradient[0],
        tabBarInactiveTintColor: colors.subtleText,
        tabBarStyle: {
          backgroundColor: isDark ? '#2d3748' : '#ffffff',
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Lexicon') return <BookOpenIcon color={color} width={size} height={size} />;
          if (route.name === 'Grammar') return <ScaleIcon color={color} width={size} height={size} />;
          if (route.name === 'About') return <InformationCircleIcon color={color} width={size} height={size} />;
          if (route.name === 'Settings') return <CogIcon color={color} width={size} height={size} />;
          return null;
        },
      })}
    >
      <Tab.Screen 
        name="Lexicon" 
        component={LexiconScreen as React.ComponentType<any>} 
      />
      <Tab.Screen 
        name="Grammar" 
        component={GrammarScreen as React.ComponentType<any>} 
      />
      <Tab.Screen 
        name="About" 
        component={AboutScreen as React.ComponentType<any>} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen as React.ComponentType<any>} 
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
    const { colors, isDark } = useTheme();

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: colors.surface,
                        borderBottomColor: colors.border,
                        shadowOpacity: 0,
                    },
                    headerTintColor: colors.text,
                    cardStyle: { backgroundColor: colors.backgroundSimple }
                }}
            >
                <Stack.Screen name="MainTabs" component={BottomTabs} options={{ headerShown: false }} />
                <Stack.Screen
                    name="AddEditWord"
                    component={AddEditWordScreen}
                    options={{
                        presentation: 'modal',
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}