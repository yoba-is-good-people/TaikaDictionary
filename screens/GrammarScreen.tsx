import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ChevronDownIcon, TrashIcon } from '../components/icons';
import { useTheme } from '../context/ThemeContext';
import { dbService } from '../services/db';
import { Grammar } from '../types';

// Accordion Item component with new props for deletion and modification status
const AccordionItem: React.FC<{
    title: string;
    content: string;
    onContentChange: (newContent: string) => void;
    onDelete: () => void;
    isModified: boolean;
    colors: any;
}> = ({ title, content, onContentChange, onDelete, isModified, colors }) => {
    const [isOpen, setIsOpen] = useState(false);
    const styles = getStyles(colors);

    return (
        <View style={styles.accordionContainer}>
            <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.accordionHeader}>
                <View style={styles.accordionTitleContainer}>
                    {isModified && <View style={styles.modifiedDot} />}
                    <Text style={styles.accordionTitle}>{title}</Text>
                </View>
                <View style={styles.accordionIcons}>
                    <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                        <TrashIcon color={colors.subtleText} width={20} height={20} />
                    </TouchableOpacity>
                    <ChevronDownIcon color={colors.text} style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }} />
                </View>
            </TouchableOpacity>
            {isOpen && (
                <View style={styles.accordionContent}>
                    <TextInput
                        value={content}
                        onChangeText={onContentChange}
                        multiline
                        style={styles.textArea}
                        placeholder={`Notes on ${title}...`}
                        placeholderTextColor={colors.subtleText}
                    />
                </View>
            )}
        </View>
    );
};

const GrammarScreen: React.FC = () => {
    const { colors } = useTheme();
    const [grammarNotes, setGrammarNotes] = useState<Grammar[]>([]);
    const [modifiedCategories, setModifiedCategories] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const hasUnsavedChanges = useMemo(() => modifiedCategories.size > 0, [modifiedCategories]);

    const fetchNotes = useCallback(async () => {
        setIsLoading(true);
        const notesFromDb = await dbService.getGrammarNotes();
        setGrammarNotes(notesFromDb.sort((a, b) => a.category.localeCompare(b.category)));
        setIsLoading(false);
    }, []);

    useFocusEffect(useCallback(() => { fetchNotes(); }, [fetchNotes]));

    const handleContentChange = (category: string, newContent: string) => {
        setGrammarNotes(prev => prev.map(note => note.category === category ? { ...note, content: newContent } : note));
        setModifiedCategories(prev => new Set(prev).add(category));
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const promises = Array.from(modifiedCategories).map(category => {
                const note = grammarNotes.find(n => n.category === category);
                return dbService.saveGrammarNote(category, note?.content || '');
            });
            await Promise.all(promises);
            setModifiedCategories(new Set()); // Clear modified flags after saving
            Alert.alert('Success', 'Your changes have been saved.');
        } catch (error) {
            console.error("Failed to save grammar notes:", error);
            Alert.alert('Error', 'Failed to save notes.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddCategory = () => {
        const trimmedName = newCategoryName.trim();
        if (!trimmedName) {
            Alert.alert('Error', 'Category name cannot be empty.');
            return;
        }
        if (grammarNotes.some(note => note.category.toLowerCase() === trimmedName.toLowerCase())) {
            Alert.alert('Error', 'This category already exists.');
            return;
        }

        const newNote: Grammar = { category: trimmedName, content: '' };
        setGrammarNotes(prev => [...prev, newNote].sort((a, b) => a.category.localeCompare(b.category)));
        setModifiedCategories(prev => new Set(prev).add(trimmedName)); // Mark as needing save
        setIsModalVisible(false);
        setNewCategoryName('');
    };

    const handleDeleteCategory = (category: string) => {
        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete the "${category}" section? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await dbService.deleteGrammarNote(category);
                        setGrammarNotes(prev => prev.filter(note => note.category !== category));
                        setModifiedCategories(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(category);
                            return newSet;
                        });
                    },
                },
            ]
        );
    };

    const styles = getStyles(colors);

    if (isLoading) {
        return <ActivityIndicator size="large" color={colors.primaryGradient[0]} style={{ flex: 1, backgroundColor: colors.backgroundSimple }} />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.backgroundSimple }}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.header}>
                    <Text style={styles.title}>Grammar Notes</Text>
                    <TouchableOpacity onPress={handleSave} disabled={isSaving || !hasUnsavedChanges}>
                        <LinearGradient 
                            colors={hasUnsavedChanges ? colors.primaryGradient : ['#9ca3af', '#6b7280']} 
                            style={styles.saveButton}
                        >
                            <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {grammarNotes.length === 0 ? (
                    <View style={styles.emptyStateContainer}>
                        <Text style={styles.emptyStateText}>No grammar sections found.</Text>
                        <Text style={styles.emptyStateSubText}>Tap "Add Category" to start documenting your language!</Text>
                    </View>
                ) : (
                    grammarNotes.map(note => (
                        <AccordionItem
                            key={note.category}
                            title={note.category}
                            content={note.content}
                            onContentChange={(newContent) => handleContentChange(note.category, newContent)}
                            onDelete={() => handleDeleteCategory(note.category)}
                            isModified={modifiedCategories.has(note.category)}
                            colors={colors}
                        />
                    ))
                )}
            </ScrollView>

            <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.fab}>
                <LinearGradient colors={colors.primaryGradient} style={styles.fabGradient}>
                    <Text style={styles.fabText}>+</Text>
                </LinearGradient>
            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={isModalVisible}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Add New Category</Text>
                        <TextInput
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            style={styles.modalInput}
                            placeholder="e.g., Noun Cases"
                            placeholderTextColor={colors.subtleText}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAddCategory}>
                                <LinearGradient colors={colors.primaryGradient} style={[styles.modalButton, styles.addButton]}>
                                    <Text style={styles.saveButtonText}>Add</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.text },
    saveButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
    saveButtonText: { color: '#fff', fontWeight: 'bold' },
    accordionContainer: { backgroundColor: colors.surface, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    accordionTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    accordionTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
    accordionIcons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    deleteButton: { padding: 4 },
    modifiedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
    accordionContent: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
    textArea: { backgroundColor: colors.background, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, height: 200, textAlignVertical: 'top', fontSize: 16 },
    emptyStateContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, opacity: 0.7 },
    emptyStateText: { fontSize: 18, fontWeight: '600', color: colors.text },
    emptyStateSubText: { fontSize: 14, color: colors.subtleText, marginTop: 8, textAlign: 'center' },
    fab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
    fabGradient: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 30 },
    fabText: { fontSize: 32, color: '#fff', lineHeight: 34 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { backgroundColor: colors.surface, borderRadius: 12, padding: 20, width: '90%', elevation: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
    modalInput: { backgroundColor: colors.background, color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    modalButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    cancelButton: { backgroundColor: colors.border },
    cancelButtonText: { color: colors.text, fontWeight: 'bold' },
    addButton: {},
});

export default GrammarScreen;