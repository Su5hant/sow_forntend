import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLanguagePack, getAvailableLanguages } from '../services/api';
import config from '../config';

const I18nContext = createContext();

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const I18nProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [availableLanguages, setAvailableLanguages] = useState(['en', 'sv']);
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    const initializeI18n = async () => {
      try {
        setLoading(true);
        
        const languages = await getAvailableLanguages();
        
        if (Array.isArray(languages) && languages.length > 0) {
          setAvailableLanguages(languages);
          
          const savedLanguage = localStorage.getItem('preferredLanguage');
          const browserLanguage = navigator.language.split('-')[0];
          
          const languageToUse = 
            (savedLanguage && languages.includes(savedLanguage)) ? savedLanguage :
            languages.includes(browserLanguage) ? browserLanguage :
            languages[0];
          
          await loadLanguage(languageToUse);
        } else {
          throw new Error('No languages available from API');
        }
      } catch (error) {
        setAvailableLanguages(['en', 'sv']);
        const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
        await loadLanguage(savedLanguage);
      } finally {
        setLoading(false);
      }
    };

    initializeI18n();
  }, []);

  const loadLanguage = async (languageCode) => {
    try {
      const languagePack = await getLanguagePack(languageCode);
      
      if (languagePack && typeof languagePack === 'object') {
        setTranslations(languagePack);
        setCurrentLanguage(languageCode);
        localStorage.setItem('preferredLanguage', languageCode);
      }
    } catch (error) {
      setTranslations({});
      setCurrentLanguage(languageCode);
      localStorage.setItem('preferredLanguage', languageCode);
    }
  };

  const changeLanguage = async (languageCode) => {
    if (languageCode !== currentLanguage) {
      setLoading(true);
      await loadLanguage(languageCode);
      setForceUpdate(prev => prev + 1);
      setLoading(false);
    }
  };

  const t = (key, fallback = key) => {
    if (Object.keys(translations).length === 0) {
      return `[${key}]`;
    }
    return translations[key] || fallback;
  };

  const value = {
    currentLanguage,
    availableLanguages,
    loading,
    translations,
    forceUpdate,
    t,
    changeLanguage
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};