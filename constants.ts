
export const PARTS_OF_SPEECH = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun', 'Preposition', 'Conjunction', 'Interjection', 'Other'];
export const WORD_CLASSES = ['Common', 'Archaic', 'Formal', 'Informal', 'Slang', 'Technical'];

export const CUSTOM_FIELDS_CONFIG: Record<string, { label: string; type: 'text' | 'select'; options?: string[] }[]> = {
  Noun: [
    { label: 'Gender', type: 'select', options: ['Masculine', 'Feminine', 'Neuter', 'Common'] },
    { label: 'Plural Form', type: 'text' },
  ],
  Verb: [
    { label: 'Transitivity', type: 'select', options: ['Transitive', 'Intransitive', 'Ditransitive'] },
    { label: 'Tense', type: 'text' },
    { label: 'Aspect', type: 'text' },
  ],
  Adjective: [
    { label: 'Comparative Form', type: 'text' },
    { label: 'Superlative Form', type: 'text' },
  ],
};
