import * as SQLite from 'expo-sqlite';
import { AppSettings, AudioFile, Grammar, Word } from '../types';

const db = SQLite.openDatabaseSync('taika.db');

export const initDatabase = async () => {
    await db.withTransactionAsync(async () => {
        // IMPORTANT FIX: Added date_created and date_modified columns to the words table.
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                taika_word TEXT NOT NULL,
                part_of_speech TEXT NOT NULL,
                pronunciation_ipa TEXT,
                word_class TEXT,
                definition TEXT NOT NULL,
                example_sentence TEXT,
                notes TEXT,
                tags TEXT,
                custom_fields TEXT,
                date_created TEXT,
                date_modified TEXT
            );
            CREATE TABLE IF NOT EXISTS grammar (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT UNIQUE NOT NULL,
                content TEXT
            );
            CREATE TABLE IF NOT EXISTS audio_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word_id INTEGER NOT NULL,
                audio_data TEXT NOT NULL,
                FOREIGN KEY (word_id) REFERENCES words (id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT
            );
            CREATE TABLE IF NOT EXISTS morphology (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word_id INTEGER UNIQUE NOT NULL,
                root_words TEXT,
                prefixes TEXT,
                suffixes TEXT,
                morpheme_breakdown TEXT,
                FOREIGN KEY (word_id) REFERENCES words (id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_words_taika_word ON words (taika_word);
            CREATE INDEX IF NOT EXISTS idx_words_part_of_speech ON words (part_of_speech);
        `);
    });
};

const parseWord = (row: any): Word => {
    let tags = [];
    let custom_fields = {};

    try {
        tags = JSON.parse(row.tags || '[]');
    } catch (e) {
        console.warn('Failed to parse tags, defaulting to empty array. Value was:', row.tags);
    }

    try {
        custom_fields = JSON.parse(row.custom_fields || '{}');
    } catch (e) {
        console.warn('Failed to parse custom_fields, defaulting to empty object. Value was:', row.custom_fields);
    }

    return {
        ...row,
        tags,
        custom_fields,
    };
};


export const getWords = async (filters: { searchQuery: string; posFilter: string; sortOrder: string }): Promise<Word[]> => {
  let query = 'SELECT * FROM words';
  const params: any[] = [];
  const conditions: string[] = [];

  // IMPROVEMENT: Search now includes notes, example sentences, and tags.
  if (filters.searchQuery) {
    const searchPattern = `%${filters.searchQuery}%`;
    conditions.push('(taika_word LIKE ? OR definition LIKE ? OR notes LIKE ? OR example_sentence LIKE ? OR tags LIKE ?)');
    params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
  }

  if (filters.posFilter !== 'All') {
    conditions.push('part_of_speech = ?');
    params.push(filters.posFilter);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  if (filters.sortOrder === 'Alphabetical') {
    query += ' ORDER BY taika_word COLLATE NOCASE ASC';
  } else if (filters.sortOrder === 'Newest') { // Assuming you might add this sort option
    query += ' ORDER BY date_created DESC';
  } else if (filters.sortOrder === 'Oldest') {
    query += ' ORDER BY date_created ASC';
  }

  const results = await db.getAllAsync<any>(query, params);
  return results.map(parseWord);
};

export const getWordById = async (id: number): Promise<Word | null> => {
    const row = await db.getFirstAsync<any>('SELECT * FROM words WHERE id = ?', [id]);
    return row ? parseWord(row) : null;
};

export const getAudioForWord = async (wordId: number): Promise<AudioFile | null> => {
    return await db.getFirstAsync<AudioFile>('SELECT * FROM audio_files WHERE word_id = ?', [wordId]);
};

// REFINED: Now correctly saves date fields.
export const addWord = async (word: Omit<Word, 'id'>): Promise<number> => {
    const { taika_word, part_of_speech, pronunciation_ipa, word_class, definition, example_sentence, notes, tags, custom_fields, date_created, date_modified } = word;
    const result = await db.runAsync(
        'INSERT INTO words (taika_word, part_of_speech, pronunciation_ipa, word_class, definition, example_sentence, notes, tags, custom_fields, date_created, date_modified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
            taika_word,
            part_of_speech,
            pronunciation_ipa ?? null,
            word_class ?? null,
            definition,
            example_sentence ?? null,
            notes ?? null,
            JSON.stringify(tags || []),
            JSON.stringify(custom_fields || {}),
            date_created,
            date_modified,
        ]
    );
    return result.lastInsertRowId;
};

// REFINED: Now correctly saves date fields.
export const updateWord = async (id: number, word: Word): Promise<void> => {
    const { taika_word, part_of_speech, pronunciation_ipa, word_class, definition, example_sentence, notes, tags, custom_fields, date_modified } = word;
    await db.runAsync(
        'UPDATE words SET taika_word = ?, part_of_speech = ?, pronunciation_ipa = ?, word_class = ?, definition = ?, example_sentence = ?, notes = ?, tags = ?, custom_fields = ?, date_modified = ? WHERE id = ?',
        [
            taika_word,
            part_of_speech,
            pronunciation_ipa ?? null,
            word_class ?? null,
            definition,
            example_sentence ?? null,
            notes ?? null,
            JSON.stringify(tags || []),
            JSON.stringify(custom_fields || {}),
            date_modified,
            id,
        ]
    );
};

export const deleteWord = async (id: number): Promise<void> => {
    await db.runAsync('DELETE FROM words WHERE id = ?', [id]);
};

export const saveAudioForWord = async (wordId: number, audioUri: string): Promise<void> => {
    const existing = await getAudioForWord(wordId);
    if (existing) {
        await db.runAsync('UPDATE audio_files SET audio_data = ? WHERE word_id = ?', [audioUri, wordId]);
    } else {
        await db.runAsync('INSERT INTO audio_files (word_id, audio_data) VALUES (?, ?)', [wordId, audioUri]);
    }
};

export const getStats = async () => {
    const totalResult = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM words');
    const nounsResult = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM words WHERE part_of_speech = 'Noun'");
    const verbsResult = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM words WHERE part_of_speech = 'Verb'");
    const adjectivesResult = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM words WHERE part_of_speech = 'Adjective'");
    return {
        total: totalResult?.count ?? 0,
        nouns: nounsResult?.count ?? 0,
        verbs: verbsResult?.count ?? 0,
        adjectives: adjectivesResult?.count ?? 0,
    };
};

export const getGrammarNotes = async (): Promise<Grammar[]> => {
    return await db.getAllAsync<Grammar>('SELECT * FROM grammar');
};

export const saveGrammarNote = async (category: string, content: string): Promise<void> => {
    const result = await db.getFirstAsync<Grammar>('SELECT id FROM grammar WHERE category = ?', [category]);
    if (result) {
        await db.runAsync('UPDATE grammar SET content = ? WHERE category = ?', [content, category]);
    } else {
        await db.runAsync('INSERT INTO grammar (category, content) VALUES (?, ?)', [category, content]);
    }
};

export const getSetting = async (key: string): Promise<AppSettings | null> => {
    return await db.getFirstAsync<AppSettings>('SELECT * FROM app_settings WHERE key = ?', [key]);
};

export const saveSetting = async (key: string, value: string): Promise<void> => {
    const result = await db.getFirstAsync<AppSettings>('SELECT key FROM app_settings WHERE key = ?', [key]);
    if (result) {
        await db.runAsync('UPDATE app_settings SET value = ? WHERE key = ?', [value, key]);
    } else {
        await db.runAsync('INSERT INTO app_settings (key, value) VALUES (?, ?)', [key, value]);
    }
};

export const getAllWordsForExport = async (): Promise<Word[]> => {
    const results = await db.getAllAsync<any>('SELECT * FROM words ORDER BY taika_word COLLATE NOCASE ASC');
    return results.map(parseWord);
}

export const bulkAddWords = async (words: Word[]): Promise<void> => {
    await db.withTransactionAsync(async () => {
      for (const word of words) {
        const { taika_word, part_of_speech, pronunciation_ipa, word_class, definition, example_sentence, notes, tags, custom_fields, date_created, date_modified } = word;
        await db.runAsync(
          'INSERT INTO words (taika_word, part_of_speech, pronunciation_ipa, word_class, definition, example_sentence, notes, tags, custom_fields, date_created, date_modified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
              taika_word,
              part_of_speech,
              pronunciation_ipa ?? null,
              word_class ?? null,
              definition,
              example_sentence ?? null,
              notes ?? null,
              JSON.stringify(tags || []),
              JSON.stringify(custom_fields || {}),
              date_created,
              date_modified,
          ]
        );
      }
    });
};

// ADD THIS NEW FUNCTION
export const deleteGrammarNote = async (category: string): Promise<void> => {
    await db.runAsync('DELETE FROM grammar WHERE category = ?', [category]);
};

export const dbService = {
  initDatabase,
  getWords,
  getWordById,
  addWord,
  updateWord,
  deleteWord,
  getStats,
  getGrammarNotes,
  saveGrammarNote,
  getSetting,
  saveSetting,
  getAudioForWord,
  saveAudioForWord,
  getAllWordsForExport,
  bulkAddWords,
  deleteGrammarNote,

};