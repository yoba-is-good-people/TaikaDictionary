import { Picker } from '@react-native-picker/picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MicrophoneIcon, PlayIcon, StopIcon } from '../components/icons';
// NOTE: We define the new options here. You should move these to your /constants.ts file later.
// import { PARTS_OF_SPEECH, WORD_CLASSES } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { dbService } from '../services/db';
import { RootStackParamList, Word } from '../types';

// TODO: Move these arrays to your `constants.ts` file
const NEW_PARTS_OF_SPEECH = [ 'Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun', 'Preposition', 'Conjunction', 'Interjection', 'Particle', 'Affix', 'Other' ];
const NEW_WORD_CLASSES = [ 'Standalone word', 'Root morpheme/noun', 'Prefix', 'Suffix', 'Grammatical Particle', 'Compound Word', 'Derived Word' ];

type AddEditWordScreenRouteProp = RouteProp<RootStackParamList, 'AddEditWord'>;

const AddEditWordScreen: React.FC = () => {
    const route = useRoute<AddEditWordScreenRouteProp>();
    const navigation = useNavigation();
    const { colors } = useTheme();
    const wordId = route.params?.wordId;
    
    // Updated formData state to include new fields
    const [formData, setFormData] = useState<Partial<Word>>({
        taika_word: '',
        pronunciation_ipa: '',
        part_of_speech: 'Noun',
        word_class: 'Standalone word',
        definition: '',
        example_sentence: '', // New field
        notes: '', // New field
        tags: [],
        custom_fields: {},
    });

    const [tagInput, setTagInput] = useState(''); // State for the comma-separated tags input
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [recording, setRecording] = useState<Audio.Recording | undefined>();
    const [sound, setSound] = useState<Audio.Sound | undefined>();
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        navigation.setOptions({ title: wordId ? 'Edit Word' : 'Add Word' });
        if (wordId) {
            const loadWord = async () => {
                const wordToEdit = await dbService.getWordById(wordId);
                const audioFile = await dbService.getAudioForWord(wordId);
                if (wordToEdit) {
                    setFormData(wordToEdit);
                    // Convert tags array back to a string for the input field
                    if (wordToEdit.tags) {
                        setTagInput(wordToEdit.tags.join(', '));
                    }
                }
                if (audioFile) setAudioUri(audioFile.audio_data);
            };
            loadWord();
        }
    }, [wordId, navigation]);

    const handleChange = (field: keyof Word, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.taika_word || !formData.definition) {
            Alert.alert('Error', 'Taika Word and Contextual Meaning are required.');
            return;
        }

        // Convert the tag input string into an array of strings
        const tagsArray = tagInput.split(',').map(tag => tag.trim()).filter(Boolean);

        const now = new Date().toISOString();
        const dataToSave = {
            ...formData,
            tags: tagsArray, // Use the processed array
            date_modified: now,
            date_created: formData.id ? formData.date_created : now,
        } as Word;

        try {
            if (formData.id) {
                await dbService.updateWord(formData.id, dataToSave);
                if (audioUri) await dbService.saveAudioForWord(formData.id, audioUri);
            } else {
                const newId = await dbService.addWord(dataToSave);
                if (audioUri) await dbService.saveAudioForWord(newId, audioUri);
            }
            navigation.goBack();
        } catch (error) {
            console.error('Failed to save word:', error);
            Alert.alert('Error', 'Could not save word. Note: The database may need to be updated to support new fields.');
        }
    };
    
    async function startRecording() {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(recording);
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    async function stopRecording() {
        if (!recording) return;
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);
        setRecording(undefined);
    }
    
    async function playSound() {
        if (!audioUri) return;
        if (sound) {
            await sound.replayAsync();
            setIsPlaying(true);
            return;
        }
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
        newSound.setOnPlaybackStatusUpdate(status => {
            if (status.isLoaded && !status.isPlaying) {
                 setIsPlaying(false);
            }
        });
        setSound(newSound);
        await newSound.playAsync();
        setIsPlaying(true);
    }

    useEffect(() => {
        return sound ? () => { sound.unloadAsync(); } : undefined;
    }, [sound]);

    const styles = getStyles(colors);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Input 
                label="Taika Word" 
                value={formData.taika_word} 
                onChangeText={(text: string) => handleChange('taika_word', text)} 
                colors={colors} 
            />
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Lala Script</Text>
                <TextInput
                    style={[styles.input, styles.disabledInput]}
                    placeholder="Coming Soon"
                    editable={false}
                    placeholderTextColor={colors.subtleText}
                />
            </View>

            <Input 
                label="Pronunciation (IPA)" 
                value={formData.pronunciation_ipa} 
                onChangeText={(text: string) => handleChange('pronunciation_ipa', text)} 
                colors={colors} 
            />

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Audio</Text>
                <View style={styles.audioControls}>
                    <TouchableOpacity onPress={isRecording ? stopRecording : startRecording} style={styles.iconButton}>
                        {isRecording ? <StopIcon color={colors.accent} /> : <MicrophoneIcon color={colors.text} />}
                    </TouchableOpacity>
                    {audioUri && (
                        <TouchableOpacity onPress={playSound} style={styles.iconButton} disabled={isPlaying}>
                           <PlayIcon color={isPlaying ? colors.accent : colors.text} />
                        </TouchableOpacity>
                    )}
                </View>
                 {isRecording && <Text style={{color: colors.accent}}>Recording...</Text>}
            </View>
            
            <Text style={styles.label}>Part of Speech</Text>
            <View style={styles.pickerContainer}>
                <Picker 
                    selectedValue={formData.part_of_speech} 
                    onValueChange={(val: string) => handleChange('part_of_speech', val)} 
                    style={{color: colors.text}}
                >
                    {NEW_PARTS_OF_SPEECH.map(pos => <Picker.Item key={pos} label={pos} value={pos} />)}
                </Picker>
            </View>

            <Text style={styles.label}>Word Class</Text>
            <View style={styles.pickerContainer}>
                <Picker 
                    selectedValue={formData.word_class} 
                    onValueChange={(val: string) => handleChange('word_class', val)} 
                    style={{color: colors.text}}
                >
                    {NEW_WORD_CLASSES.map(wc => <Picker.Item key={wc} label={wc} value={wc} />)}
                </Picker>
            </View>
            
            <Input 
                label="Contextual Meaning" 
                value={formData.definition} 
                onChangeText={(text: string) => handleChange('definition', text)} 
                multiline 
                colors={colors} 
            />

            <Input 
                label="Example Sentence" 
                value={formData.example_sentence} 
                onChangeText={(text: string) => handleChange('example_sentence', text)} 
                multiline 
                colors={colors} 
            />

            <Input 
                label="Notes (etymology, usage, etc.)" 
                value={formData.notes} 
                onChangeText={(text: string) => handleChange('notes', text)} 
                multiline 
                colors={colors} 
            />

            <Input 
                label="Tags (comma separated)" 
                value={tagInput} 
                onChangeText={setTagInput} 
                colors={colors}
                placeholder="e.g. formal, mythology"
            />

            <TouchableOpacity onPress={handleSave} style={{ marginBottom: 40 }}>
                <LinearGradient colors={colors.primaryGradient} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save Word</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
};

interface InputProps {
    label: string;
    value?: string;
    onChangeText: (text: string) => void;
    multiline?: boolean;
    colors: any;
    placeholder?: string;
}

const Input: React.FC<InputProps> = ({label, colors, multiline, ...props}) => {
    const styles = getStyles(colors);
    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput 
                style={[styles.input, multiline && {height: 100, textAlignVertical: 'top'}]} 
                placeholderTextColor={colors.subtleText} 
                multiline={multiline}
                {...props} 
            />
        </View>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundSimple },
    contentContainer: { padding: 16 },
    inputGroup: { marginBottom: 16 },
    label: { color: colors.text, marginBottom: 8, fontSize: 16, fontWeight: '600' },
    input: { 
        backgroundColor: colors.surface, 
        color: colors.text, 
        paddingHorizontal: 12, 
        paddingVertical: 10, 
        borderRadius: 8, 
        borderWidth: 1, 
        borderColor: colors.border, 
        fontSize: 16 
    },
    disabledInput: {
        backgroundColor: colors.border,
        color: colors.subtleText
    },
    saveButton: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    section: { marginTop: 10, marginBottom: 16, padding: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 8 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.subtleText, marginBottom: 10 },
    audioControls: { flexDirection: 'row', gap: 20, alignItems: 'center' },
    iconButton: { padding: 10 },
    pickerContainer: { 
        borderWidth: 1, 
        borderColor: colors.border, 
        borderRadius: 8, 
        backgroundColor: colors.surface, 
        marginBottom: 16,
        justifyContent: 'center'
    }
});

export default AddEditWordScreen;