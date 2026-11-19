import '@/utils/storage';
import { useLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { isLanguage, languageDirection, resolveLanguage, translate, type Language, type Translator } from './messages';

const preferenceKey = 'addressbook.language.v1';
const LanguageContext = createContext<{
  language: Language;
  direction: 'rtl' | 'ltr';
  preference: Language | null;
  setLanguage: (language: Language | null) => void;
  t: Translator;
} | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locales = useLocales();
  const [preference, setPreference] = useState<Language | null>(() => {
    try {
      const saved = localStorage.getItem(preferenceKey);
      return isLanguage(saved) ? saved : null;
    } catch { return null; }
  });
  const language = preference ?? resolveLanguage(locales.map(locale => locale.languageTag));
  const direction = languageDirection(language);
  const t: Translator = useCallback((key, values) => translate(language, key, values), [language]);
  const setLanguage = useCallback((next: Language | null) => {
    if (next === null) localStorage.removeItem(preferenceKey);
    else localStorage.setItem(preferenceKey, next);
    setPreference(next);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      document.documentElement.lang = language;
      document.documentElement.dir = direction;
    }
  }, [language, direction]);

  return <LanguageContext.Provider value={{ language, direction, preference, setLanguage, t }}>
    {children}
  </LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('LanguageProvider is required');
  return context;
}
