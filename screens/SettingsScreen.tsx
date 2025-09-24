import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { dbService } from '../services/db';
// Import ALL the new functions from your working service file
import {
  exportToAnki,
  exportToCsv,
  exportToExcel,
  exportToJson,
  exportToPdf,
  importFromCsv,
  importFromExcel,
  importFromJson
} from '../services/importExportService';

const SettingsScreen: React.FC = () => {
  const { toggleTheme, colors, isDark } = useTheme();
  const [logoUri, setLogoUri] = useState<string | null>(null);

  const loadLogo = useCallback(async () => {
    const logoSetting = await dbService.getSetting('custom-logo');
    if (logoSetting) {
      setLogoUri(logoSetting.value);
    }
  }, []);

  useEffect(() => {
    loadLogo();
  }, [loadLogo]);

  const handleLogoUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync();
    if (pickerResult.canceled) return;
    
    if (pickerResult.assets && pickerResult.assets.length > 0) {
        const uri = pickerResult.assets[0].uri;
        await dbService.saveSetting('custom-logo', uri);
        setLogoUri(uri);
        Alert.alert("Success", "Logo updated successfully!");
    }
  };

  // This is a more robust way to handle any import function
  const handleImport = async (importer: () => Promise<boolean>) => {
    const success = await importer();
    if (success) {
      Alert.alert("Import Successful", "Your dictionary has been updated.");
    }
    // Error alerts are already handled inside your service file
  };

  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Settings</Text>

      {/* --- APPEARANCE SECTION (Unchanged) --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Dark Mode</Text>
          <Switch
            trackColor={{ false: '#767577', true: colors.primaryGradient[1] }}
            thumbColor={isDark ? colors.primaryGradient[0] : '#f4f3f4'}
            onValueChange={toggleTheme}
            value={isDark}
          />
        </View>
        <View style={styles.row}>
            <Text style={styles.rowLabel}>Custom Logo</Text>
            <TouchableOpacity onPress={handleLogoUpload}>
                <Text style={styles.buttonText}>Upload Image</Text>
            </TouchableOpacity>
        </View>
        {logoUri && <Image source={{ uri: logoUri }} style={styles.logoPreview} />}
      </View>

      {/* --- DATA MANAGEMENT SECTION (Redesigned) --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <Text style={styles.subSectionTitle}>Import</Text>
        <View style={styles.buttonContainer}>
            <ActionButton label="Import from JSON" onPress={() => handleImport(importFromJson)} colors={colors} />
            <ActionButton label="Import from CSV" onPress={() => handleImport(importFromCsv)} colors={colors} />
            <ActionButton label="Import from Excel" onPress={() => handleImport(importFromExcel)} colors={colors} />
        </View>

        <Text style={styles.subSectionTitle}>Export</Text>
        <View style={styles.buttonContainer}>
            <ActionButton label="Export to JSON" onPress={exportToJson} colors={colors} isExport />
            <ActionButton label="Export to CSV" onPress={exportToCsv} colors={colors} isExport />
            <ActionButton label="Export to Excel" onPress={exportToExcel} colors={colors} isExport />
            <ActionButton label="Export to PDF" onPress={exportToPdf} colors={colors} isExport />
            <ActionButton label="Export for Anki (.txt)" onPress={exportToAnki} colors={colors} isExport />
        </View>
      </View>
    </ScrollView>
  );
};

const ActionButton: React.FC<{label: string, onPress: () => void, colors: any, isExport?: boolean}> = ({label, onPress, colors, isExport}) => {
    const gradient = isExport ? ['#2563eb', '#1d4ed8'] as const : ['#16a34a', '#15803d'] as const;
    return (
        <TouchableOpacity onPress={onPress}>
            <LinearGradient colors={gradient} style={getStyles(colors).actionButton}>
                <Text style={getStyles(colors).actionButtonText}>{label}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};


const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSimple, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginVertical: 24 },
  section: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.primaryGradient[0], borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8, marginBottom: 8 },
  subSectionTitle: { fontSize: 16, fontWeight: '500', color: colors.subtleText, marginTop: 12, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  rowLabel: { fontSize: 16, color: colors.text },
  buttonText: { fontSize: 16, color: colors.primaryGradient[0], fontWeight: '600' },
  logoPreview: { width: 50, height: 50, borderRadius: 8, alignSelf: 'center', marginTop: 10 },
  buttonContainer: { gap: 12 },
  actionButton: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default SettingsScreen;