import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { Word } from '../types';
import { dbService } from './db';
// FIX: Import the legacy API
import * as FileSystem from 'expo-file-system/legacy';

// NEW DEPENDENCIES
import { Buffer } from 'buffer';
import { StorageAccessFramework } from 'expo-file-system/legacy';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';

/**
 * Save or share a file with given content.
 *
 * @param content   File content (string or Uint8Array)
 * @param fileName  File name, e.g. "words.csv"
 * @param mimeType  MIME type, e.g. "text/csv"
 * @param encoding  Encoding: 'utf8' or 'base64' (default: 'utf8')
 * @param mode      'share' (default) or 'save'
 */
export const saveAndShareFile = async (
  content: string | Uint8Array,
  fileName: string,
  mimeType: string,
  encoding: 'utf8' | 'base64' = 'utf8',
  mode: 'share' | 'save' = 'share'
) => {
  try {
    // 1. Write content to a temporary cache file first
    const fileUri = FileSystem.cacheDirectory + fileName;

    if (typeof content === 'string') {
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding:
          encoding === 'utf8'
            ? FileSystem.EncodingType.UTF8
            : FileSystem.EncodingType.Base64,
      });
    } else {
      await FileSystem.writeAsStringAsync(
        fileUri,
        Buffer.from(content).toString('base64'),
        { encoding: FileSystem.EncodingType.Base64 }
      );
    }

    // 2. Decide what to do
    if (mode === 'save') {
      if (Platform.OS === 'android') {
        // --- ANDROID SAVE ---
        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          throw new Error('Permission not granted to access storage');
        }

        // Create a new file in the picked folder
        const newFileUri = await StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          mimeType
        );

        // Read cached file as base64
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Write into public storage
        await FileSystem.writeAsStringAsync(newFileUri, fileContent, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert('Success', `Saved ${fileName} to Downloads`);
        return newFileUri;
      } else {
        // --- IOS SAVE ---
        Alert.alert(
          'Not Supported',
          'Direct save is not available on iOS. Use Share to save into Files.'
        );
        return await shareFile(fileUri, fileName, mimeType);
      }
    } else {
      // --- SHARE ---
      return await shareFile(fileUri, fileName, mimeType);
    }
  } catch (err: any) {
    console.error(`Error in saveAndShareFile for ${fileName}:`, err);
    Alert.alert('Error', `Failed to process ${fileName}: ${err.message}`);
    throw err;
  }
};

/**
 * Helper: share file with expo-sharing
 */
const shareFile = async (fileUri: string, fileName: string, mimeType: string) => {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType,
    dialogTitle: `Share ${fileName}`,
  });

  return fileUri;
};



export const exportToJson = async () => {
  try {
    const allWords = await dbService.getAllWordsForExport();
    if (allWords.length === 0) {
      Alert.alert("Info", "No words to export.");
      return;
    }
    const jsonString = JSON.stringify(allWords, null, 2);
    await saveAndShareFile(jsonString, 'taika_dictionary.json', 'application/json');
  } catch (error: any) {
    console.error('Failed to export to JSON:', error);
    Alert.alert('Export Error', `Failed to export to JSON: ${error.message}`);
  }
};

export const exportToCsv = async () => {
  try {
    const allWords = await dbService.getAllWordsForExport();
    if (allWords.length === 0) {
      Alert.alert("Info", "No words to export.");
      return;
    }

    const headers = Object.keys(allWords[0]).join(',');
    const rows = allWords.map(word => {
      return Object.values(word).map(value => {
        const val = (value === null || value === undefined) ? '' : value;
        const str = (typeof val === 'object') ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvString = [headers, ...rows].join('\n');
    await saveAndShareFile(csvString, 'taika_dictionary.csv', 'text/csv');
  } catch (error: any) {
    console.error('Failed to export to CSV:', error);
    Alert.alert('Export Error', `Failed to export to CSV: ${error.message}`);
  }
};

// --- NEW EXPORTS ---

export const exportToExcel = async () => {
  try {
    const allWords = await dbService.getAllWordsForExport();
    if (allWords.length === 0) {
      Alert.alert("Info", "No words to export.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(allWords);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Words");
    const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

    await saveAndShareFile(wbout, 'taika_dictionary.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'base64');
  } catch (error: any) {
    console.error('Failed to export to Excel:', error);
    Alert.alert('Export Error', `Failed to export to Excel: ${error.message}`);
  }
};

// --- FINAL AND CORRECTED PDF EXPORT ---
export const exportToPdf = async () => {
  try {
    const allWords = await dbService.getAllWordsForExport();
    if (allWords.length === 0) {
      Alert.alert("Info", "No words to export.");
      return;
    }

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    // FIX: rgb is now correctly imported from pdf-lib
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    
    const margin = 50;
    const pageWidth = page.getWidth() - 2 * margin;
    let y = page.getHeight() - margin;
    const lineHeight = 14;

    // --- Helper function to draw text and handle wrapping manually ---
    const drawAndWrap = (text: string, options: { font: any, size: number, x: number, y: number, color: any, maxWidth: number }) => {
        const { font, size, x, color, maxWidth } = options;
        let { y: currentY } = options;
        const words = text.split(' ');
        let currentLine = '';

        for(const word of words) {
            // Check for new page if y is too low
            if (currentY < margin) {
                page = pdfDoc.addPage();
                currentY = page.getHeight() - margin;
            }

            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const width = font.widthOfTextAtSize(testLine, size);

            if (width > maxWidth) {
                page.drawText(currentLine, { x, y: currentY, font, size, color, lineHeight: size * 1.2 });
                currentY -= size * 1.2;
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        // Draw the last remaining line
        page.drawText(currentLine, { x, y: currentY, font, size, color, lineHeight: size * 1.2 });
        return currentY - (size * 1.2);
    };

    // --- Draw Header ---
    y = drawAndWrap('Taika Dictionary', { font: boldFont, size: 18, x: margin, y, color: rgb(0, 0, 0), maxWidth: pageWidth });
    y -= 20;

    // --- Draw Word Entries ---
    for (const word of allWords) {
        if (y < margin + 60) {
            page = pdfDoc.addPage();
            y = page.getHeight() - margin;
        }

        const headerText = word.pronunciation_ipa ? `${word.taika_word}  [${word.pronunciation_ipa}]` : word.taika_word;
        y = drawAndWrap(headerText, { font: boldFont, size: 12, x: margin, y, color: rgb(0, 0, 0), maxWidth: pageWidth });

        y = drawAndWrap(`(${word.part_of_speech} - ${word.word_class})`, { font: italicFont, size: 10, x: margin, y, color: rgb(0.3, 0.3, 0.3), maxWidth: pageWidth });
        
        y = drawAndWrap(word.definition || '', { font: font, size: 10, x: margin + 10, y, color: rgb(0, 0, 0), maxWidth: pageWidth - 10 });
        
        if (word.example_sentence) {
            y = drawAndWrap(`Example: ${word.example_sentence}`, { font: italicFont, size: 10, x: margin + 10, y, color: rgb(0.2, 0.2, 0.2), maxWidth: pageWidth - 10 });
        }
        
        if (word.notes) {
            y = drawAndWrap(`Notes: ${word.notes}`, { font: font, size: 9, x: margin + 10, y, color: rgb(0.5, 0.5, 0.5), maxWidth: pageWidth - 10 });
        }
        
        // FIX: Added safety check to prevent crash on missing/invalid tags
        if (word.tags && Array.isArray(word.tags) && word.tags.length > 0) {
            y = drawAndWrap(`Tags: ${word.tags.join(', ')}`, { font: italicFont, size: 9, x: margin + 10, y, color: rgb(0, 0.4, 0.6), maxWidth: pageWidth - 10 });
        }
        
        y -= 10; // Space between entries
    }

    const pdfBytes = await pdfDoc.save();
    await saveAndShareFile(pdfBytes, 'taika_dictionary.pdf', 'application/pdf');

  } catch (error: any) {
    console.error('Failed to export to PDF:', error);
    Alert.alert('Export Error', `Failed to export to PDF: ${error.message}`);
  }
};


export const exportToAnki = async () => {
  try {
    const allWords = await dbService.getAllWordsForExport();
    if (allWords.length === 0) {
      Alert.alert("Info", "No words to export.");
      return;
    }

    // Export as TSV for Anki
    const headers = Object.keys(allWords[0]).join('\t');
    const rows = allWords.map(word => {
      return Object.values(word).map(value => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      }).join('\t');
    });

    const tsvString = [headers, ...rows].join('\n');
    await saveAndShareFile(tsvString, 'taika_dictionary.txt', 'text/plain');
  } catch (error: any) {
    console.error('Failed to export to Anki:', error);
    Alert.alert('Export Error', `Failed to export to Anki: ${error.message}`);
  }
};

// --- IMPORT LOGIC ---

const pickAndReadFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) return null;

    const uri = result.assets[0].uri;
    const text = await FileSystem.readAsStringAsync(uri);
    return text;
  } catch (error) {
    console.error("Error picking or reading file:", error);
    return null;
  }
};

export const importFromJson = async (): Promise<boolean> => {
  try {
    const content = await pickAndReadFile();
    if (!content) return false;

    const words: Word[] = JSON.parse(content);
    if (!Array.isArray(words)) throw new Error('Invalid JSON format.');

    await dbService.bulkAddWords(words);
    return true;
  } catch (error: any) {
    console.error('JSON Import failed:', error);
    Alert.alert('Import Failed', `Import failed: ${error.message}`);
    return false;
  }
};

export const importFromCsv = async (): Promise<boolean> => {
  try {
    const content = await pickAndReadFile();
    if (!content) return false;

    const lines = content.split('\n').filter((line: string) => line.trim() !== '');
    const headers = lines[0].split(',').map((h: string) => h.trim().replace(/^"|"$/g, ''));
    const words: Word[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const wordObj: any = {};
      headers.forEach((header: string, index: number) => {
        const key = header as keyof Word;
        let value: any = values[index]?.trim().replace(/^"|"$/g, '').replace(/""/g, '"');
        if ((key === 'tags' || key === 'custom_fields') && typeof value === 'string') {
          try {
            value = JSON.parse(value);
          } catch { /* keep as string if parsing fails */ }
        }
        wordObj[key] = value;
      });
      words.push(wordObj as Word);
    }

    await dbService.bulkAddWords(words);
    return true;
  } catch (error: any) {
    console.error('CSV Import failed:', error);
    Alert.alert('Import Failed', `Import failed: ${error.message}`);
    return false;
  }
};

export const importFromExcel = async (): Promise<boolean> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
    });

    if (result.canceled || !result.assets?.length) return false;

    const uri = result.assets[0].uri;
    const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const workbook = XLSX.read(b64, { type: 'base64' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json: any[] = XLSX.utils.sheet_to_json(worksheet);

    await dbService.bulkAddWords(json as Word[]);
    return true;
  } catch (error: any) {
    console.error('Excel Import failed:', error);
    Alert.alert('Import Failed', `Import failed: ${error.message}`);
    return false;
  }
};
