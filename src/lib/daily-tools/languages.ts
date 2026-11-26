/** Output languages for the AI tools. `instruction` is what the model is told; it is never user-supplied. */

export interface Language { id: string; label: string; native: string; instruction: string }

export const LANGUAGES: Language[] = [
  { id: 'en', label: 'English', native: 'English', instruction: 'English' },
  { id: 'hinglish', label: 'Hinglish', native: 'Hinglish', instruction: 'Hinglish: Hindi written in Roman (English) letters, the way people type on WhatsApp in India, mixing common English words naturally. Do not use Devanagari script' },
  { id: 'hi', label: 'Hindi', native: 'हिन्दी', instruction: 'Hindi in Devanagari script' },
  { id: 'ta', label: 'Tamil', native: 'தமிழ்', instruction: 'Tamil in Tamil script' },
  { id: 'te', label: 'Telugu', native: 'తెలుగు', instruction: 'Telugu in Telugu script' },
  { id: 'bn', label: 'Bengali', native: 'বাংলা', instruction: 'Bengali in Bengali script' },
  { id: 'mr', label: 'Marathi', native: 'मराठी', instruction: 'Marathi in Devanagari script' },
  { id: 'gu', label: 'Gujarati', native: 'ગુજરાતી', instruction: 'Gujarati in Gujarati script' },
  { id: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', instruction: 'Kannada in Kannada script' },
  { id: 'ml', label: 'Malayalam', native: 'മലയാളം', instruction: 'Malayalam in Malayalam script' },
  { id: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', instruction: 'Punjabi in Gurmukhi script' },
  { id: 'ur', label: 'Urdu', native: 'اردو', instruction: 'Urdu in Urdu (Nastaliq/Arabic) script' },
];

export const DEFAULT_LANGUAGE = 'en';

export function getLanguage(id: unknown): Language | undefined {
  return typeof id === 'string' ? LANGUAGES.find((l) => l.id === id) : undefined;
}
