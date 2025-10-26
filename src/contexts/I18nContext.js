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

  // Initialize i18n system
  useEffect(() => {
    const initializeI18n = async () => {
      try {
        setLoading(true);
        
        // Get available languages from API
        const languages = await getAvailableLanguages();
        
        if (Array.isArray(languages) && languages.length > 0) {
          setAvailableLanguages(languages);
          
          // Get browser language or use English as fallback
          const browserLanguage = navigator.language.split('-')[0];
          const savedLanguage = localStorage.getItem('preferredLanguage');
          
          // Determine which language to use
          const languageToUse = 
            (savedLanguage && languages.includes(savedLanguage)) ? savedLanguage :
            languages.includes(browserLanguage) ? browserLanguage :
            languages[0];
          
          await loadLanguage(languageToUse);
        } else {
          throw new Error('No languages available from API');
        }
      } catch (error) {
        // Fallback to default languages
        setAvailableLanguages(['en', 'sv']);
        const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
        await loadLanguage(savedLanguage);
      } finally {
        setLoading(false);
      }
    };

    initializeI18n();
  }, []);

  // Load translations for a specific language
  const loadLanguage = async (languageCode) => {
    try {
      const languagePack = await getLanguagePack(languageCode);
      
      if (languagePack && typeof languagePack === 'object') {
        setTranslations(languagePack);
        setCurrentLanguage(languageCode);
        localStorage.setItem('preferredLanguage', languageCode);
      }
    } catch (error) {
      // Use fallback translations
      const fallback = {
        en: {
          // Common UI elements
          login: 'Login',
          register: 'Register',
          email: 'Email',
          password: 'Password',
          first_name: 'First Name',
          last_name: 'Last Name',
          confirm_password: 'Confirm Password',
          submit: 'Submit',
          cancel: 'Cancel',
          logout: 'Logout',
          loading: 'Loading...',
          
          // Navigation
          home: 'Home',
          products: 'Products',
          orders: 'Orders',
          customers: 'Customers',
          reports: 'Reports',
          about: 'About',
          contact: 'Contact',
          
          // Product related
          product_name: 'Product Name',
          product_list: 'Product List',
          product_management: 'Product Management',
          article_number: 'Article #',
          description: 'Description',
          price: 'Price',
          unit: 'Unit',
          stock: 'Stock',
          in_price: 'Cost Price',
          actions: 'Actions',
          view: 'View',
          edit: 'Edit',
          
          // Search
          search: 'Search',
          search_products: 'Search products...',
          clear_search: 'Clear',
          no_products_found: 'No products found',
          try_different_search: 'Try adjusting your search terms',
          no_products_available: 'No products available',
          
          // Pagination
          page: 'Page',
          of: 'of',
          total_products: 'total products',
          previous: 'Previous',
          next: 'Next',
          showing_results: 'Showing',
          
          // Brand
          brand_name: config.APP.BRAND_NAME
        },
        sv: {
          // Common UI elements
          login: 'Logga in',
          register: 'Registrera',
          email: 'E-post',
          password: 'Lösenord',
          first_name: 'Förnamn',
          last_name: 'Efternamn',
          confirm_password: 'Bekräfta lösenord',
          submit: 'Skicka',
          cancel: 'Avbryt',
          logout: 'Logga ut',
          loading: 'Laddar...',
          
          // Navigation
          home: 'Hem',
          products: 'Produkter',
          orders: 'Beställningar',
          customers: 'Kunder',
          reports: 'Rapporter',
          about: 'Om oss',
          contact: 'Kontakt',
          
          // Product related
          product_name: 'Produktnamn',
          product_list: 'Produktlista',
          product_management: 'Produkthantering',
          article_number: 'Artikelnr',
          description: 'Beskrivning',
          price: 'Pris',
          unit: 'Enhet',
          stock: 'Lager',
          in_price: 'Inköpspris',
          actions: 'Åtgärder',
          view: 'Visa',
          edit: 'Redigera',
          
          // Search
          search: 'Sök',
          search_products: 'Sök produkter...',
          clear_search: 'Rensa',
          no_products_found: 'Inga produkter hittades',
          try_different_search: 'Prova att justera dina söktermer',
          no_products_available: 'Inga produkter tillgängliga',
          
          // Pagination
          page: 'Sida',
          of: 'av',
          total_products: 'totalt produkter',
          previous: 'Föregående',
          next: 'Nästa',
          showing_results: 'Visar',
          
          // Brand
          brand_name: config.APP.BRAND_NAME
        }
      };
      
      setTranslations(fallback[languageCode] || fallback['en']);
      setCurrentLanguage(languageCode);
      localStorage.setItem('preferredLanguage', languageCode);
    }
  };

  // Change language function
  const changeLanguage = async (languageCode) => {
    if (languageCode !== currentLanguage) {
      setLoading(true);
      await loadLanguage(languageCode);
      setForceUpdate(prev => prev + 1);
      setLoading(false);
    }
  };

  // Translation function
  const t = (key, fallback = key) => {
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