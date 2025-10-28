import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from './contexts/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';
import './Terms.css';

const Terms = () => {
  const { t } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="terms-background">
      <nav className="nav-bar">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            {t('brand_name') || 'SOW'}
          </Link>
          
          <button 
            className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link to="/" className="nav-link" onClick={closeMobileMenu}>
              {t('home') || 'Home'}
            </Link>
            <Link to="/products" className="nav-link" onClick={closeMobileMenu}>
              {t('order') || 'Order'}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={closeMobileMenu}
        />
      )}

      <div className="terms-container">
        <div className="terms-card">
          <div className="terms-header">
            <h1 className="terms-title">
              {t('terms.title') || 'Terms and Conditions'}
            </h1>
          </div>
          
          <div className="terms-content">
            <p className="terms-text">
              {t('terms.full_text') || 'Terms and conditions content will appear here.'}
            </p>
          </div>
        </div>
      </div>

      <footer className="bottom-nav">
        <div className="bottom-nav-content">
          <div className="brand-name">{t('brand_name') || 'SOW'}</div>
          <div className="bottom-links">
            <Link to="/" className="bottom-link">{t('home') || 'Home'}</Link>
            <Link to="/products" className="bottom-link">{t('order') || 'Order'}</Link>
            <Link to="/terms" className="bottom-link">{t('terms.link') || 'Terms'}</Link>
          </div>
          <div className="copyright">
            © 2024 {t('brand_name') || 'SOW'}. {t('all_rights_reserved') || 'All rights reserved.'}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
