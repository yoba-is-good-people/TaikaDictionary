import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// A unique key to store and retrieve the notes from the device's storage
const NOTES_STORAGE_KEY = '@taika_license_notes';

export default function LicenseScreen() {
  const { colors } = useTheme();
  
  // State to hold the content of the editable notes section
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Load saved notes from storage when the component first renders
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const savedNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
        if (savedNotes !== null) {
          setAdditionalNotes(savedNotes);
        }
      } catch (e) {
        console.error('Failed to load license notes from storage.', e);
      }
    };

    loadNotes();
  }, []);

  // Function to save the current notes to the device's storage
  const handleSaveNotes = async () => {
    try {
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, additionalNotes);
      Alert.alert('Success', 'Your additional notes have been saved!');
    } catch (e) {
      console.error('Failed to save license notes.', e);
      Alert.alert('Error', 'There was an error saving your notes.');
    }
  };
  
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.header}>License & Legal</Text>
        <Text style={styles.subHeader}>Legal information about the use and distribution of your language and this application.</Text>

        {/* --- Static Sections (No Changes Here) --- */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Ionicons name="apps-outline" size={24} color={colors.primary} />
            <Text style={styles.sectionTitleText}>Application License</Text>
          </View>
          <Text style={styles.bodyText}>
            This Taika Dictionary application is open source software released under the MIT License.
          </Text>
          <Text style={styles.preformattedText}>
            MIT License{'\n\n'}
            Copyright (c) 2025 Taika Dictionary Project{'\n\n'}
            Permission is hereby granted... (rest of the license text)
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Ionicons name="language-outline" size={24} color={colors.primary} />
            <Text style={styles.sectionTitleText}>Taika Language License</Text>
          </View>
          <View style={styles.licenseBox}>
              <Text style={styles.ccTitle}>Creative Commons Attribution 4.0</Text>
              <Text style={styles.bodyText}><Text style={styles.boldText}>Maintainer:</Text> Open Taika Collective</Text>
              <Text style={styles.bodyText}><Text style={styles.boldText}>License:</Text> CC BY 4.0 International</Text>
              {/* ... other CC license details ... */}
              <Text style={styles.link} onPress={() => Linking.openURL('https://creativecommons.org/licenses/by/4.0/')}>
                View Full License Details
              </Text>
          </View>
        </View>

        {/* --- NEW Editable Section --- */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Ionicons name="document-text-outline" size={24} color={colors.primary} />
            <Text style={styles.sectionTitleText}>Additional Language Usage Notes</Text>
          </View>
          <TextInput
            style={styles.notesInput}
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            multiline
            placeholder="Add any additional notes about language usage here..."
            placeholderTextColor={colors.subtleText}
          />
          <TouchableOpacity onPress={handleSaveNotes}>
            <LinearGradient colors={colors.primaryGradient} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save Notes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

// NOTE: Added new styles for the editable section
const getStyles = (colors: any) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      padding: 20,
    },
    header: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    subHeader: {
      fontSize: 16,
      color: colors.subtleText,
      marginBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 16,
    },
    section: {
      marginBottom: 24,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitleText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.primary,
      marginLeft: 8,
    },
    bodyText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
    },
    preformattedText: {
      fontFamily: 'monospace',
      fontSize: 14,
      color: colors.subtleText,
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 8,
      marginVertical: 12,
    },
    licenseBox: {
        backgroundColor: colors.background,
        padding: 16,
        borderRadius: 8,
        marginTop: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#48bb78'
    },
    ccTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#48bb78',
        marginBottom: 8,
    },
    boldText: {
        fontWeight: 'bold',
    },
    link: {
        color: colors.primary,
        textDecorationLine: 'underline',
        marginTop: 12,
        fontWeight: 'bold',
    },
    notesInput: {
        backgroundColor: colors.background,
        color: colors.text,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: 16,
        height: 150,
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    saveButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});