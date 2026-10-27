'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: typeof translations['si'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('si');

  useEffect(() => {
    const saved = (localStorage.getItem('ceylon_wood_lang') || localStorage.getItem('chinthaka_lang')) as Language;
    if (saved === 'si' || saved === 'en') {
      setLanguage(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const next = language === 'si' ? 'en' : 'si';
    setLanguage(next);
    localStorage.setItem('ceylon_wood_lang', next);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
