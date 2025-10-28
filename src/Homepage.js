import React, { useState, useEffect } from 'react';
import './Homepage.css';
import { useI18n } from './contexts/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';

const Homepage = () => {
  const { t, currentLanguage, forceUpdate } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    setProducts([]);
    setLoading(false);
  }, []);

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="nav-bar">
        <div className="nav-content">
          <a href="#" className="nav-logo">
            123 Fakturera
          </a>
          
          {/* Hamburger Menu Button */}
          <button 
            className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          {/* Navigation Links */}
          <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <a href="#" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              {t('home', 'Home')}
            </a>
            <a href="#products" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              {t('products', 'Products')}
            </a>
            <a href="#" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              {t('customers', 'Our Customers')}
            </a>
            <a href="#" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              {t('about', 'About us')}
            </a>
            <a href="#" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              {t('contact', 'Contact Us')}
            </a>
            <div className="language-switcher">
              <LanguageSwitcher />
            </div>
          </div>
          
          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="mobile-menu-overlay" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="homepage-container" key={`homepage-${currentLanguage}-${forceUpdate}`}>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              {t('hero_title', 'Professional Invoice Management Solutions')}
            </h1>
            <p className="hero-subtitle">
              {t('hero_subtitle', 'Streamline your business with our comprehensive invoicing and management tools')}
            </p>
            <div className="hero-buttons">
              <button className="cta-button primary">
                {t('get_started', 'Get Started')}
              </button>
              <button className="cta-button secondary">
                {t('learn_more', 'Learn More')}
              </button>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="products-section">
          <div className="section-header">
            <h2 className="section-title">
              {t('our_products', 'Our Products & Services')}
            </h2>
            <p className="section-subtitle">
              {t('products_subtitle', 'Choose the perfect solution for your business needs')}
            </p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading products from backend...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products-message">
              <h3>No Products Available</h3>
              <p>Unable to load products from the backend server. Please check the backend connection.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-header">
                    <h3 className="product-name">{product.name}</h3>
                    <span className="product-category">{product.category}</span>
                  </div>
                  <p className="product-description">{product.description}</p>
                  <div className="product-price">{product.price}</div>
                  <ul className="product-features">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <button className="product-button">
                    {t('choose_plan', 'Choose Plan')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="section-header">
            <h2 className="section-title">
              {t('why_choose_us', 'Why Choose 123 Fakturera?')}
            </h2>
          </div>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon"></div>
              <h3>{t('easy_to_use', 'Easy to Use')}</h3>
              <p>{t('easy_to_use_desc', 'Intuitive interface designed for businesses of all sizes')}</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"></div>
              <h3>{t('secure', 'Secure & Reliable')}</h3>
              <p>{t('secure_desc', 'Bank-level security with 99.9% uptime guarantee')}</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"></div>
              <h3>{t('fast_setup', 'Fast Setup')}</h3>
              <p>{t('fast_setup_desc', 'Get started in minutes with our quick setup process')}</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"></div>
              <h3>{t('support', '24/7 Support')}</h3>
              <p>{t('support_desc', 'Expert support team available whenever you need help')}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="bottom-nav-content">
          <div className="brand-name">123 Fakturera</div>
          <div className="bottom-links">
            <a href="#" className="bottom-link">{t('home', 'Home')}</a>
            <a href="#products" className="bottom-link">{t('products', 'Products')}</a>
            <a href="#" className="bottom-link">{t('contact', 'Contact us')}</a>
          </div>
          <div className="copyright">
            © {t('brand_name', 'Lättfaktura')}, CRO nr. 638537, 2025. {t('footer_copyright', 'All rights reserved.')}.
          </div>
        </div>
      </nav>
    </>
  );
};

export default Homepage;