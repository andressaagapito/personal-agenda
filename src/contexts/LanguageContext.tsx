import { createContext, useContext, useState, ReactNode } from 'react';
import { Language, translations, getTranslation } from '../utils/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.pt) => string | string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (!enabled) return 'pt';
    const saved = localStorage.getItem('agenda-language');
    return (saved as Language) || 'pt';
  });

  const handleSetLanguage = (lang: Language) => {
    if (!enabled) return;
    setLanguage(lang);
    localStorage.setItem('agenda-language', lang);
  };

  const t = (key: keyof typeof translations.pt) => {
    if (!enabled) {
      return getTranslation('pt', key);
    }
    return getTranslation(language, key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

