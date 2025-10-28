import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './EmailVerification.css';
import { verifyEmail } from './services/api';
import { useI18n } from './contexts/I18nContext';

const EmailVerification = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      handleVerifyEmail(tokenFromUrl);
    } else {
      setVerificationStatus('error');
      setMessage(t('no_verification_token', 'No verification token found in URL'));
    }
  }, [searchParams, t]);

  const handleVerifyEmail = async (verificationToken) => {
    try {
      setVerificationStatus('loading');
      const response = await verifyEmail(verificationToken);
      
      setVerificationStatus('success');
      setMessage(t('email_verified_success', 'Your email has been successfully verified! You can now log in.'));
    } catch (error) {
      setVerificationStatus('error');
      setMessage(
        error.message || 
        t('email_verification_failed', 'Email verification failed. The token may be expired or invalid.')
      );
    }
  };

  const handleRetryVerification = () => {
    if (token) {
      handleVerifyEmail(token);
    }
  };

  const goToLogin = () => {
    navigate('/');
  };

  return (
    <div className="email-verification-container">
      <div className="verification-card">
        <div className="verification-header">
          <h1>{t('email_verification', 'Email Verification')}</h1>
        </div>

        <div className="verification-content">
          {verificationStatus === 'loading' && (
            <div className="verification-loading">
              <div className="loading-spinner"></div>
              <p>{t('verifying_email', 'Verifying your email address...')}</p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="verification-success">
              <div className="success-icon"></div>
              <h2>{t('verification_successful', 'Verification Successful!')}</h2>
              <p>{message}</p>
              <button onClick={goToLogin} className="btn-primary">
                {t('go_to_login', 'Go to Login')}
              </button>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="verification-error">
              <div className="error-icon"></div>
              <h2>{t('verification_failed', 'Verification Failed')}</h2>
              <p>{message}</p>
              <div className="verification-actions">
                <button onClick={handleRetryVerification} className="btn-secondary">
                  {t('retry_verification', 'Retry Verification')}
                </button>
                <button onClick={goToLogin} className="btn-primary">
                  {t('back_to_login', 'Back to Login')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="verification-footer">
          <p>{t('verification_help', 'Having trouble? Contact support for assistance.')}</p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;