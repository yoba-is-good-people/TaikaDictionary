import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
// Image component is now imported
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import WordCard from '../components/WordCard'; // Adjusted path assuming location
import { PlusIcon } from '../components/icons'; // Adjusted path assuming location
import { useTheme } from '../context/ThemeContext'; // Adjusted path assuming location
import { dbService } from '../services/db'; // Adjusted path assuming location
import type { Word } from '../types'; // Adjusted path assuming location


const LexiconScreen: React.FC = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [stats, setStats] = useState({ total: 0, nouns: 0, verbs: 0, adjectives: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [posFilter, setPosFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Alphabetical');

  const fetchWords = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedWords = await dbService.getWords({ searchQuery, posFilter, sortOrder });
      const fetchedStats = await dbService.getStats();
      setWords(fetchedWords);
      setStats(fetchedStats);
    } catch (error) {
      console.error("Failed to fetch words:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, posFilter, sortOrder]);

  useFocusEffect(
    useCallback(() => {
      fetchWords();
    }, [fetchWords])
  );

  const handleDeleteWord = async (id: number) => {
    await dbService.deleteWord(id);
    fetchWords(); 
  };
  
  const handleEditWord = (wordId: number) => {
    router.push({ pathname: '/AddEditWord', params: { wordId: wordId.toString() } });
  };
  
  const handleAddWord = () => {
    router.push('/AddEditWord');
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {/* HEADER UPDATED with LOGO */}
      <View style={styles.header}>
        <Image
          // The require function needs a static string, it cannot be a variable.
          source={require('../assets/images/yoba_logo.png')} 
          style={styles.logo}
        />
      </View>

      {/* Stats Bar (Unchanged) */}
      <View style={styles.statsRow}>
        <StatCard label="Total" value={stats.total} colors={colors} />
        <StatCard label="Nouns" value={stats.nouns} colors={colors} />
        <StatCard label="Verbs" value={stats.verbs} colors={colors} />
        <StatCard label="Adjectives" value={stats.adjectives} colors={colors} />
      </View>

      {/* Search & Controls (Unchanged) */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search words..."
        placeholderTextColor={colors.subtleText}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primaryGradient[0]} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item) => item.id!.toString()}
          renderItem={({ item }) => (
            <WordCard word={item} onEdit={() => handleEditWord(item.id!)} onDelete={() => handleDeleteWord(item.id!)} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No words found.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 80, paddingTop: 10 }}
        />
      )}
      
      <TouchableOpacity onPress={handleAddWord} style={styles.fab}>
        <LinearGradient colors={colors.primaryGradient} style={styles.fabGradient}>
          <PlusIcon color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const StatCard: React.FC<{label: string, value: number, colors: any}> = ({ label, value, colors }) => (
    <View style={[getStyles(colors).statCard, {flex: 1}]}>
        <Text style={getStyles(colors).statLabel}>{label}</Text>
        <Text style={getStyles(colors).statValue}>{value}</Text>
    </View>
);

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSimple, paddingHorizontal: 16 },
  header: { paddingVertical: 16, alignItems: 'center' },
  // HEADER TITLE REMOVED
  logo: {
    width: 50, // Set the size of your logo
    height: 50,
    borderRadius: 25, // Make it a circle
    borderWidth: 2,
    borderColor: colors.border, // Optional: add a border
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 8 },
  statCard: { backgroundColor: colors.surface, padding: 12, borderRadius: 8, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  statLabel: { color: colors.subtleText, fontSize: 12 },
  statValue: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
  searchInput: { backgroundColor: colors.surface, color: colors.text, padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: colors.subtleText, fontSize: 16 },
  fab: { position: 'absolute', bottom: 30, right: 30, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 8 },
  fabGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' }
});

export default LexiconScreen;