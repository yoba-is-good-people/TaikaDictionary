import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Define the structure for our language overview data
interface LanguageOverview {
    languageName: string;
    languageFamily: string;
    description: string;
    maintainedBy: string;
    purpose: string;
    shortHistory: string;
    speakers: string;
}

// A unique key to store and retrieve the data from the device's storage
const STORAGE_KEY = '@taika_language_overview_data';

const AboutScreen: React.FC = () => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    // State to hold the form data
    const [overviewData, setOverviewData] = useState<LanguageOverview>({
        languageName: 'Taika',
        languageFamily: '',
        description: '',
        maintainedBy: 'Open Taika Collective',
        purpose: 'To preserve Naimai',
        shortHistory: '',
        speakers: '',
    });

    // Load data from storage when the screen is first opened
    useEffect(() => {
        const loadData = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
                if (jsonValue !== null) {
                    setOverviewData(JSON.parse(jsonValue));
                }
            } catch (e) {
                console.error('Failed to load language overview data from storage.', e);
            }
        };

        loadData();
    }, []);

    // Function to handle changes in any of the text input fields
    const handleInputChange = (field: keyof LanguageOverview, value: string) => {
        setOverviewData(prevData => ({
            ...prevData,
            [field]: value,
        }));
    };

    // Function to save the current data to the device's storage
    const handleSave = async () => {
        try {
            const jsonValue = JSON.stringify(overviewData);
            await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
            Alert.alert('Success', 'Language overview has been saved!');
        } catch (e) {
            console.error('Failed to save language overview data.', e);
            Alert.alert('Error', 'There was an error saving the information.');
        }
    };

    // Helper component for creating an editable field
    const EditableField: React.FC<{
        label: string;
        value: string;
        onChangeText: (text: string) => void;
        multiline?: boolean;
        placeholder?: string;
    }> = ({ label, value, onChangeText, multiline = false, placeholder }) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, multiline && { height: 120, textAlignVertical: 'top' }]}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                placeholder={placeholder}
                placeholderTextColor={colors.subtleText}
            />
        </View>
    );

    return (
        <LinearGradient colors={colors.background} style={styles.flex_1}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>About Taika</Text>
                
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Language Overview</Text>
                    
                    <EditableField label="Language Name" value={overviewData.languageName} onChangeText={text => handleInputChange('languageName', text)} />
                    <EditableField label="Language Family" value={overviewData.languageFamily} onChangeText={text => handleInputChange('languageFamily', text)} placeholder="e.g., Proto-Solandra" />
                    <EditableField label="Description" value={overviewData.description} onChangeText={text => handleInputChange('description', text)} multiline placeholder="Describe your language..." />
                    <EditableField label="Maintained by" value={overviewData.maintainedBy} onChangeText={text => handleInputChange('maintainedBy', text)} />
                    <EditableField label="Purpose" value={overviewData.purpose} onChangeText={text => handleInputChange('purpose', text)} />
                    <EditableField label="Short History" value={overviewData.shortHistory} onChangeText={text => handleInputChange('shortHistory', text)} multiline placeholder="History of Taika" />
                    <EditableField label="Speakers" value={overviewData.speakers} onChangeText={text => handleInputChange('speakers', text)} placeholder="e.g., Thissi, Taika" />
                
                </View>

                <TouchableOpacity onPress={handleSave}>
                    <LinearGradient colors={colors.primaryGradient} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save Information</Text>
                    </LinearGradient>
                </TouchableOpacity>

            </ScrollView>
        </LinearGradient>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    flex_1: {
        flex: 1,
    },
    container: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 24,
    },
    sectionContainer: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: 8,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        color: colors.text,
        marginBottom: 8,
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        backgroundColor: colors.background,
        color: colors.text,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: 16,
    },
    saveButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AboutScreen;