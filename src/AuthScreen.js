import React, { useState } from 'react';
import './AuthScreen.css';
import { useAuth } from './contexts/AuthContext';
import { useI18n } from './contexts/I18nContext';
import { useNotification } from './contexts/NotificationContext';
import { forgotPassword } from './services/api';
import LanguageSwitcher from './LanguageSwitcher';
import config from './config';

const AuthScreen = () => {
  const { login, register } = useAuth();
  const { t, currentLanguage, forceUpdate } = useI18n();
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = t('email_required', 'Email is required');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('email_invalid', 'Please enter a valid email');
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t('password_required', 'Password is required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('password_min_length', 'Password must be at least 6 characters');
    }

    // Additional validation for signup
    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = t('first_name_required', 'First name is required');
      }
      
      if (!formData.lastName) {
        newErrors.lastName = t('last_name_required', 'Last name is required');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        // Handle login
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          showSuccess(t('login_success', 'Login successful!'), t('welcome_back', 'Welcome back'));
          // Redirect handled by auth context or parent component
        } else {
          if (result.error.includes('verify')) {
            showError(
              t('email_not_verified', 'Please verify your email address before logging in.'),
              t('verification_required', 'Verification Required')
            );
          } else {
            showError(result.error, t('login_failed', 'Login Failed'));
          }
        }
      } else {
        // Handle registration
        const registrationData = {
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName
        };
        const result = await register(registrationData);
        
        if (result.success) {
          showSuccess(
            t('registration_success_message', 'Registration successful! Please check your email to verify your account.'),
            t('registration_success', 'Registration Successful')
          );
          // Switch to login mode after successful registration
          setIsLogin(true);
          setFormData({
            email: formData.email, // Keep email for easy login
            password: '',
            firstName: '',
            lastName: ''
          });
        } else {
          showError(result.error, t('registration_failed', 'Registration Failed'));
        }
      }
    } catch (error) {
      showError(
        t('unexpected_error', 'An unexpected error occurred. Please try again.'),
        t('error', 'Error')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      showError(t('email_required_forgot', 'Please enter your email address first.'));
      return;
    }

    try {
      setIsLoading(true);
      await forgotPassword(formData.email);
      showSuccess(
        t('password_reset_sent', 'Password reset instructions have been sent to your email.'),
        t('email_sent', 'Email Sent')
      );
      setShowForgotPassword(false);
    } catch (error) {
      showError(error.message, t('error', 'Error'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    });
    setErrors({});
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="nav-bar">
        <div className="nav-content">
          <a href="#" className="nav-logo">
            {config.APP.NAME}
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
            <a href="#" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              {t('order', 'Order')}
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

      {/* Main Auth Container */}
      <div className="auth-container" key={`auth-${currentLanguage}-${forceUpdate}`}>
        <div className="auth-background">
          <div className="auth-card">
            <div className="auth-header">
              <h1 className="auth-title">
                {isLogin ? t('welcome_back', 'Welcome Back') : t('create_account', 'Create Account')}
              </h1>
              <p className="auth-subtitle">
                {isLogin 
                  ? t('sign_in_subtitle', 'Sign in to your account to continue') 
                  : t('sign_up_subtitle', 'Join us today and get started')
                }
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    {t('first_name', 'First Name')}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder={t('enter_first_name', 'Enter your first name')}
                  />
                  {errors.firstName && (
                    <span className="error-message">{errors.firstName}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    {t('last_name', 'Last Name')}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    placeholder={t('enter_last_name', 'Enter your last name')}
                  />
                  {errors.lastName && (
                    <span className="error-message">{errors.lastName}</span>
                  )}
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                {t('email_address', 'Email Address')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder={t('enter_email', 'Enter your email')}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                {t('password', 'Password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder={t('enter_password', 'Enter your password')}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>
            {isLogin && (
              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox" />
                  <span className="checkbox-text">{t('remember_me', 'Remember me')}</span>
                </label>
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="forgot-link"
                >
                  {t('forgot_password', 'Forgot password?')}
                </button>
              </div>
            )}

            <button 
              type="submit" 
              className={`submit-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                isLogin ? t('sign_in', 'Sign In') : t('create_account', 'Create Account')
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p className="toggle-text">
              {isLogin ? t('no_account', "Don't have an account? ") : t('have_account', "Already have an account? ")}
              <button 
                type="button" 
                onClick={toggleMode}
                className="toggle-button"
              >
                {isLogin ? t('sign_up', 'Sign up') : t('sign_in', 'Sign in')}
              </button>
            </p>
          </div>

          {/* Forgot Password Modal/Section */}
          {showForgotPassword && (
            <div className="forgot-password-overlay">
              <div className="forgot-password-modal">
                <h3>{t('reset_password', 'Reset Password')}</h3>
                <p>{t('reset_password_instruction', 'Enter your email address and we\'ll send you a link to reset your password.')}</p>
                <div className="form-group">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    name="email"
                    className="form-input"
                    placeholder={t('enter_email', 'Enter your email')}
                  />
                </div>
                <div className="modal-buttons">
                  <button 
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="cancel-button"
                  >
                    {t('cancel', 'Cancel')}
                  </button>
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="submit-button"
                    disabled={isLoading}
                  >
                    {isLoading ? <span className="loading-spinner"></span> : t('send_reset_link', 'Send Reset Link')}
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="bottom-nav-content">
          <div className="brand-name">{config.APP.NAME}</div>
          <div className="bottom-links">
            <a href="#" className="bottom-link">{t('home', 'Home')}</a>
            <a href="#" className="bottom-link">{t('order', 'Order')}</a>
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

export default AuthScreen;