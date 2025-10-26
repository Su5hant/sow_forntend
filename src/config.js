// config.js - Centralized configuration for production
const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api',
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'production',
  
  // API Endpoints
  ENDPOINTS: {
    PRODUCTS: '/products/',
    AUTH: {
      LOGIN: '/auth/login/',
      REGISTER: '/auth/register/',
      LOGOUT: '/auth/logout/',
      REFRESH: '/auth/refresh/'
    },
    TRANSLATIONS: '/translations/'
  },
  
  // Pagination settings
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100
  },
  
  // App settings
  APP: {
    NAME: '123 Fakturera',
    VERSION: '1.0.0',
    BRAND_NAME: 'Lättfaktura'
  }
};

// Disable console logs in production
if (config.ENVIRONMENT === 'production') {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

export default config;