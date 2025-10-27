import config from '../config';

// API Configuration - use the API_BASE_URL directly from config
const API_BASE_URL = config.API_BASE_URL;

// Helper function to get authentication headers
const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

// Generic API call wrapper with error handling
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        // Token expired, try refresh
        const refreshed = await refreshToken();
        if (refreshed && refreshed.access_token) {
          // Retry original request with new token
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${refreshed.access_token}`
          };
          return await fetch(url, options).then(r => r.json());
        } else {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          throw new Error('Session expired. Please login again.');
        }
      }
      
      throw new Error(data.detail || data.message || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (registrationData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registrationData)
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || data.message || 'Registration failed');
  }
  
  return data;
};

// Verify email with token from email
export const verifyEmail = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || data.message || 'Email verification failed');
  }
  
  return data;
};

// Login user (requires verified email)
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || data.message || 'Login failed');
  }
  
  if (data.access_token) {
    // Store tokens in localStorage
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
  }
  
  return data;
};

// Refresh access token
export const refreshToken = async () => {
  const refresh_token = localStorage.getItem('refreshToken');
  
  if (!refresh_token) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token })
    });
    
    const data = await response.json();
    
    if (response.ok && data.access_token) {
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      return data;
    } else {
      throw new Error(data.detail || 'Token refresh failed');
    }
  } catch (error) {
    // Clear invalid tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

// Get current user information
export const getCurrentUser = async () => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No access token available');
  }
  
  return await apiCall(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders(token)
  });
};

// Request password reset
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || data.message || 'Password reset request failed');
  }
  
  return data;
};

// Reset password with token
export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || data.message || 'Password reset failed');
  }
  
  return data;
};

// Change password (authenticated user)
export const changePassword = async (currentPassword, newPassword) => {
  const token = localStorage.getItem('accessToken');
  
  return await apiCall(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ 
      current_password: currentPassword, 
      new_password: newPassword 
    })
  });
};

// ============================================================================
// PRODUCT API
// ============================================================================

// Get all products (public)
export const getProducts = async () => {
  return await apiCall(`${API_BASE_URL}/products/`);
};

// Get product by ID
export const getProduct = async (productId) => {
  return await apiCall(`${API_BASE_URL}/products/${productId}`);
};

// Create new product (auth required)
export const createProduct = async (productData) => {
  const token = localStorage.getItem('accessToken');
  
  return await apiCall(`${API_BASE_URL}/products/`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      article_number: productData.article_number,
      product: productData.product,
      in_price: productData.in_price || 0,
      price: productData.price,
      unit: productData.unit || "pcs",
      stock: productData.stock || 0,
      description: productData.description || ""
    })
  });
};

// Update existing product (auth required)
export const updateProduct = async (productId, productData) => {
  const token = localStorage.getItem('accessToken');
  
  return await apiCall(`${API_BASE_URL}/products/${productId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(productData)
  });
};

// Delete product (auth required)
export const deleteProduct = async (productId) => {
  const token = localStorage.getItem('accessToken');
  
  return await apiCall(`${API_BASE_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  });
};

// Search products
export const searchProducts = async (query) => {
  return await apiCall(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
};

// ============================================================================
// TRANSLATIONS API (i18n)
// ============================================================================

// Map API translation keys to frontend keys
const mapApiKeysToFrontendKeys = (apiTranslations, languageCode) => {
  const keyMapping = {
    // Auth translations
    'auth.login': 'sign_in',
    'auth.register': 'sign_up',
    'auth.forgot_password': 'forgot_password',
    'auth.email_placeholder': 'enter_email',
    'auth.password_placeholder': 'enter_password',
    'auth.email_validation': 'email_required',
    'auth.password_required': 'password_required',
    
    // Navigation translations
    'nav.home': 'home',
    'nav.order': 'order',
    'nav.customers': 'customers',
    'nav.about': 'about',
    'nav.contact': 'contact',
    
    // Language translations
    'language.english': 'english',
    'language.swedish': 'svenska',
    
    // UI translations
    'ui.save': 'save',
    'ui.cancel': 'cancel',
    'ui.delete': 'delete',
    'ui.edit': 'edit',
    'ui.add': 'add',
    'ui.search': 'search',
    'ui.loading': 'loading',
    'ui.yes': 'yes',
    'ui.no': 'no',
    'ui.confirm': 'confirm',
    
    // Brand translations
    'brand.name': 'brand_name',
    
    // Product translations
    'product.name': 'product_name',
    'product.price': 'price',
    'product.description': 'description',
    
    // Dashboard translations
    'dashboard.welcome': 'welcome_dashboard',
    'dashboard.overview': 'overview',
    
    // Message translations
    'message.success': 'success_message',
    'message.error': 'error_message'
  };
  
  const mappedTranslations = {};
  
  // Map API keys to frontend keys
  Object.entries(apiTranslations).forEach(([apiKey, value]) => {
    const frontendKey = keyMapping[apiKey] || apiKey.replace(/\./g, '_');
    mappedTranslations[frontendKey] = value;
  });
  
  // Add common frontend keys that might be missing
  const commonDefaults = {
    'welcome_back': languageCode === 'sv' ? 'Välkommen tillbaka' : 'Welcome Back',
    'create_account': languageCode === 'sv' ? 'Skapa konto' : 'Create Account',
    'email_address': languageCode === 'sv' ? 'E-postadress' : 'Email Address',
    'password': languageCode === 'sv' ? 'Lösenord' : 'Password',
    'full_name': languageCode === 'sv' ? 'Fullständigt namn' : 'Full Name',
    'confirm_password': languageCode === 'sv' ? 'Bekräfta lösenord' : 'Confirm Password',
    'remember_me': languageCode === 'sv' ? 'Kom ihåg mig' : 'Remember me',
    'or': languageCode === 'sv' ? 'eller' : 'or',
    'no_account': languageCode === 'sv' ? 'Har du inget konto? ' : "Don't have an account? ",
    'have_account': languageCode === 'sv' ? 'Har du redan ett konto? ' : "Already have an account? ",
    'sign_in_subtitle': languageCode === 'sv' ? 'Logga in på ditt konto för att fortsätta' : 'Sign in to your account to continue',
    'sign_up_subtitle': languageCode === 'sv' ? 'Gå med oss idag och kom igång' : 'Join us today and get started',
    'enter_full_name': languageCode === 'sv' ? 'Ange ditt fullständiga namn' : 'Enter your full name',
    'confirm_password_placeholder': languageCode === 'sv' ? 'Bekräfta ditt lösenord' : 'Confirm your password',
  };
  
  // Add defaults for missing keys
  Object.entries(commonDefaults).forEach(([key, value]) => {
    if (!mappedTranslations[key]) {
      mappedTranslations[key] = value;
    }
  });
  
  return mappedTranslations;
};

// Get all translations for a language
export const getLanguagePack = async (languageCode = 'en') => {
  try {
    const url = `${API_BASE_URL}/translations/language/${languageCode}`;
    const result = await apiCall(url);
    
    // Extract translations from the API response
    if (result && result.translations && typeof result.translations === 'object') {
      // Map API keys to frontend keys
      const mappedTranslations = mapApiKeysToFrontendKeys(result.translations, languageCode);
      return mappedTranslations;
    } else if (typeof result === 'object' && !result.translations) {
      // If API returns translations directly
      return mapApiKeysToFrontendKeys(result, languageCode);
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    // Return fallback translations for offline/backend-down scenarios
    const fallbackTranslations = {
      'en': {
        welcome_back: 'Welcome Back',
        create_account: 'Create Account',
        email_address: 'Email Address',
        password: 'Password',
        sign_in: 'Sign In',
        sign_up: 'Sign Up',
        full_name: 'Full Name',
        confirm_password: 'Confirm Password',
        remember_me: 'Remember me',
        forgot_password: 'Forgot password?',
        loading: 'Loading...',
        error: 'Error',
        or: 'or',
        continue_google: 'Continue with Google',
        continue_github: 'Continue with GitHub',
        no_account: "Don't have an account? ",
        have_account: "Already have an account? ",
        email_required: 'Email is required',
        password_required: 'Password is required',
        email_invalid: 'Please enter a valid email',
        password_min_length: 'Password must be at least 6 characters'
      },
      'sv': {
        welcome_back: 'Välkommen tillbaka',
        create_account: 'Skapa konto',
        email_address: 'E-postadress',
        password: 'Lösenord',
        sign_in: 'Logga in',
        sign_up: 'Registrera',
        full_name: 'Fullständigt namn',
        confirm_password: 'Bekräfta lösenord',
        remember_me: 'Kom ihåg mig',
        forgot_password: 'Glömt lösenord?',
        loading: 'Laddar...',
        error: 'Fel',
        or: 'eller',
        continue_google: 'Fortsätt med Google',
        continue_github: 'Fortsätt med GitHub',
        no_account: "Har du inget konto? ",
        have_account: "Har du redan ett konto? ",
        email_required: 'E-post krävs',
        password_required: 'Lösenord krävs',
        email_invalid: 'Ange en giltig e-postadress',
        password_min_length: 'Lösenordet måste vara minst 6 tecken'
      }
    };
    
    const fallback = fallbackTranslations[languageCode] || fallbackTranslations['en'];
    return fallback;
  }
};

// Get list of available languages
export const getAvailableLanguages = async () => {
  try {
    const url = `${API_BASE_URL}/translations/languages`;
    const result = await apiCall(url);
    
    // Extract language codes from the API response
    if (result && result.languages && Array.isArray(result.languages)) {
      const languageCodes = result.languages.map(lang => lang.code);
      return languageCodes;
    } else if (Array.isArray(result)) {
      // If API returns array directly
      return result;
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    return ['en', 'sv']; // Fallback languages
  }
};

// Get translations for specific category
export const getTranslationsByCategory = async (category, languageCode = 'en') => {
  return await apiCall(`${API_BASE_URL}/translations/category/${category}?language=${languageCode}`);
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const validators = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  password: (password) => {
    return password && password.length >= 6;
  },
  
  required: (value) => {
    return value !== null && value !== undefined && value !== '';
  },
  
  price: (price) => {
    return !isNaN(price) && parseFloat(price) >= 0;
  }
};

// Form validation for products
export const validateProductForm = (data) => {
  const errors = {};
  
  if (!validators.required(data.article_number)) {
    errors.article_number = 'Article number is required';
  }
  
  if (!validators.required(data.product)) {
    errors.product = 'Product name is required';
  }
  
  if (!validators.price(data.price)) {
    errors.price = 'Valid price is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};