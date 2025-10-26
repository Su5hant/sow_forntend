import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useI18n } from './contexts/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { t, currentLanguage, forceUpdate } = useI18n();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard" key={`dashboard-${currentLanguage}-${forceUpdate}`}>
      <LanguageSwitcher />
      
      {/* Debug info - remove in production */}
      <div style={{ 
        position: 'fixed', 
        top: '70px', 
        left: '20px', 
        fontSize: '11px', 
        color: 'rgba(255,255,255,0.9)', 
        fontFamily: 'monospace',
        background: 'rgba(0,0,0,0.7)',
        padding: '6px 10px',
        borderRadius: '4px',
        zIndex: 1000
      }}>
        🌍 Lang: {currentLanguage} | 🔄 Update: {forceUpdate}<br/>
        📝 Test: "{t('welcome_dashboard', 'FALLBACK')}"
      </div>
      
      <div className="dashboard-header">
        <h1>{t('welcome_dashboard', 'Welcome to Dashboard')}</h1>
        <button onClick={handleLogout} className="logout-button">
          {t('logout', 'Logout')}
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="user-info-card">
          <h2>{t('user_information', 'User Information')}</h2>
          <div className="user-details">
            <p><strong>{t('email', 'Email')}:</strong> {user?.email}</p>
            <p><strong>{t('user_id', 'User ID')}:</strong> {user?.id}</p>
            <p><strong>{t('account_status', 'Status')}:</strong> 
              <span className={`status ${user?.is_active ? 'active' : 'inactive'}`}>
                {user?.is_active ? t('active', 'Active') : t('inactive', 'Inactive')}
              </span>
            </p>
            <p><strong>{t('email_verified', 'Email Verified')}:</strong> 
              <span className={`status ${user?.is_verified ? 'verified' : 'unverified'}`}>
                {user?.is_verified ? t('verified', 'Verified') : t('unverified', 'Unverified')}
              </span>
            </p>
          </div>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <h3>{t('products', 'Products')}</h3>
            <p>{t('manage_products_desc', 'Manage your product catalog')}</p>
            <button className="feature-button">
              {t('view_products', 'View Products')}
            </button>
          </div>
          
          <div className="feature-card">
            <h3>{t('orders', 'Orders')}</h3>
            <p>{t('manage_orders_desc', 'Track and manage orders')}</p>
            <button className="feature-button">
              {t('view_orders', 'View Orders')}
            </button>
          </div>
          
          <div className="feature-card">
            <h3>{t('analytics', 'Analytics')}</h3>
            <p>{t('view_analytics_desc', 'View business analytics')}</p>
            <button className="feature-button">
              {t('view_analytics', 'View Analytics')}
            </button>
          </div>
          
          <div className="feature-card">
            <h3>{t('settings', 'Settings')}</h3>
            <p>{t('manage_settings_desc', 'Manage account settings')}</p>
            <button className="feature-button">
              {t('open_settings', 'Open Settings')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;