import React from 'react';
import { useI18n } from './contexts/I18nContext';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage, availableLanguages, loading } = useI18n();

  const handleLanguageChange = async (languageCode) => {
    if (languageCode !== currentLanguage) {
      await changeLanguage(languageCode);
    }
  };

  if (loading) {
    return (
      <div className="language-switcher loading">
        <div className="language-spinner"></div>
      </div>
    );
  }

  const getLanguageOptions = () => {
    return availableLanguages.map(code => ({
      code,
      name: code === 'sv' ? 'Svenska' : 'English'
    }));
  };

  let languageOptions = getLanguageOptions();

  if (!Array.isArray(languageOptions) || languageOptions.length === 0) {
    languageOptions = [{ code: 'en', name: 'English' }];
  }

  const getFlagClass = (code) => {
    return code === 'sv' ? 'swedish' : 'english';
  };

  return (
    <>
      {languageOptions.map((option) => (
        <button
          key={option.code}
          onClick={() => handleLanguageChange(option.code)}
          className={`language-button ${currentLanguage === option.code ? 'active' : ''}`}
          title={`Switch to ${option.name}`}
        >
          <span className={`flag ${getFlagClass(option.code)}`}></span>
          {option.name}
        </button>
      ))}
    </>
  );
};

export default LanguageSwitcher;