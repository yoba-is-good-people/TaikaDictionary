import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Word } from '../types';
import { EditIcon, TrashIcon } from './icons';

interface WordCardProps {

  word?: Word; 
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const WordCard: React.FC<WordCardProps> = ({ word, onEdit, onDelete }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);


  if (!word || !word.id) {
    return null; 
  }


  const tagsToDisplay = Array.isArray(word.tags) ? word.tags : [];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.wordTitle}>{word.taika_word}</Text>
          <Text style={styles.wordDetails}>
            {word.pronunciation_ipa && `[${word.pronunciation_ipa}] · `}
            <Text style={{ fontWeight: '600' }}>{word.part_of_speech}</Text>
          </Text>
        </View>
        <View style={styles.actions}>
          {/* Note: the check at the top guarantees word.id exists here */}
          <TouchableOpacity onPress={() => onEdit(word.id!)} style={styles.actionButton}>
            <EditIcon color={colors.subtleText} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(word.id!)} style={styles.actionButton}>
            <TrashIcon color={colors.subtleText} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.body}>
        <Text style={styles.definition}>{word.definition}</Text>
        {word.example_sentence && (
          <Text style={styles.example}>"{word.example_sentence}"</Text>
        )}
        
        {/* Use the safe tagsToDisplay variable here */}
        {tagsToDisplay.length > 0 && (
          <View style={styles.tagsContainer}>
            {tagsToDisplay.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

// ... (getStyles function remains the same) ...
const getStyles = (colors: any) => StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    headerTextContainer: {
      flex: 1,
    },
    wordTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    wordDetails: {
      fontSize: 14,
      color: colors.subtleText,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
    },
    actionButton: {
      padding: 8,
    },
    body: {},
    definition: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 22,
    },
    example: {
      fontSize: 14,
      color: colors.subtleText,
      fontStyle: 'italic',
      marginTop: 8,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 12,
    },
    tag: {
      backgroundColor: colors.primaryGradient[0] + '20',
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 10,
      marginRight: 6,
      marginBottom: 6,
    },
    tagText: {
      color: colors.primaryGradient[0],
      fontSize: 12,
      fontWeight: '600',
    },
  });

export default WordCard;