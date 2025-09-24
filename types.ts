
export type Screen = 'Lexicon' | 'Grammar' | 'About' | 'Settings';

export interface Word {
  id?: number;
  taika_word: string;
  part_of_speech: string;
  pronunciation_ipa?: string;
  word_class: string;
  definition: string;
  example_sentence?: string;
  notes?: string;
  tags: string[]; // JSON string array
  custom_fields: Record<string, any>; // JSON object
  date_created: string; // ISO 8601
  date_modified: string; // ISO 8601
}

export interface Grammar {
  id?: number;
  category: string;
  content: string;
}

export interface LanguageInfo {
  id?: number;
  key: string;
  value: string;
}

export interface FounderInfo {
  id?: number;
  key: string;
  value: string;
}

export interface LicenseInfo {
  id?: number;
  key: string;
  value: string;
}

export interface AudioFile {
  id?: number;
  word_id: number;
  audio_data: string; // file URI or Base64 string
}

export interface AppSettings {
  id?: number; // Not used for key-value store in SQLite
  key: 'custom-logo' | 'theme';
  value: string;
}

export interface WordRelationship {
  id?: number;
  source_word_id: number;
  target_word_id: number;
  relationship_type: 'synonym' | 'antonym' | 'etymology' | 'related';
}

export interface Morphology {
    id?: number;
    word_id: number;
    root_words: string;
    prefixes: string;
    suffixes: string;
    morpheme_breakdown: string;
}

// For React Navigation
export type RootStackParamList = {
  MainTabs: undefined;
  AddEditWord: { wordId?: number };
};

export type BottomTabParamList = {
  Lexicon: undefined;
  Grammar: undefined;
  About: undefined;
  Settings: undefined;
};
