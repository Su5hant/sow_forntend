import React from 'react';
import { useI18n } from './contexts/I18nContext';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { currentLanguage, switchLanguage, getLanguageOptions, loading } = useI18n();

  const handleLanguageChange = async (languageCode) => {
    console.log(`LanguageSwitcher: Attempting to change language from ${currentLanguage} to ${languageCode}`);
    if (languageCode !== currentLanguage) {
      const result = await switchLanguage(languageCode);
      console.log(`LanguageSwitcher: Language switch result:`, result);
    } else {
      console.log('LanguageSwitcher: Language is already selected');
    }
  };

  if (loading) {
    return (
      <div className="language-switcher loading">
        <div className="language-spinner"></div>
      </div>
    );
  }

  let languageOptions = [];
  try {
    languageOptions = getLanguageOptions();
  } catch (error) {
    console.error('Error getting language options:', error);
    // Fallback options
    languageOptions = [
      { code: 'en', name: 'English' },
      { code: 'sv', name: 'Svenska' }
    ];
  }

  // Ensure we have at least one option
  if (!Array.isArray(languageOptions) || languageOptions.length === 0) {
    languageOptions = [{ code: 'en', name: 'English' }];
  }

  const getFlagClass = (code) => {
    return code === 'sv' ? 'swedish' : 'english';
  };

  return (
    <>
      {/* Flag-based language switcher for navigation */}
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