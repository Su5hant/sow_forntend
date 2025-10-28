import config from '../config';

const API_BASE_URL = config.API_BASE_URL;

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed && refreshed.access_token) {
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${refreshed.access_token}`
          };
          return await fetch(url, options).then(r => r.json());
        } else {
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
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
  }
  
  return data;
};

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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

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

export const getProducts = async () => {
  return await apiCall(`${API_BASE_URL}/products/`);
};

export const getProduct = async (productId) => {
  return await apiCall(`${API_BASE_URL}/products/${productId}`);
};

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

export const updateProduct = async (productId, productData) => {
  const token = localStorage.getItem('accessToken');
  
  return await apiCall(`${API_BASE_URL}/products/${productId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(productData)
  });
};

export const deleteProduct = async (productId) => {
  const token = localStorage.getItem('accessToken');
  
  return await apiCall(`${API_BASE_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  });
};

export const searchProducts = async (query) => {
  return await apiCall(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
};

const mapApiKeysToFrontendKeys = (apiTranslations, languageCode) => {
  const keyMapping = {
    'auth.login': 'sign_in',
    'auth.register': 'sign_up',
    'auth.forgot_password': 'forgot_password',
    'auth.email_placeholder': 'enter_email',
    'auth.password_placeholder': 'enter_password',
    'auth.email_validation': 'email_required',
    'auth.password_required': 'password_required',
    
    'nav.home': 'home',
    'nav.order': 'order',
    'nav.customers': 'customers',
    'nav.about': 'about',
    'nav.contact': 'contact',
    
    'language.english': 'english',
    'language.swedish': 'svenska',
    
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
    
    'brand.name': 'brand_name',
    
    'product.name': 'product_name',
    'product.price': 'price',
    'product.description': 'description',
    
    'dashboard.welcome': 'welcome_dashboard',
    'dashboard.overview': 'overview',
    
    'message.success': 'success_message',
    'message.error': 'error_message'
  };
  
  const mappedTranslations = {};
  
  Object.entries(apiTranslations).forEach(([apiKey, value]) => {
    const frontendKey = keyMapping[apiKey] || apiKey.replace(/\./g, '_');
    mappedTranslations[frontendKey] = value;
  });
  
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
  
  Object.entries(commonDefaults).forEach(([key, value]) => {
    if (!mappedTranslations[key]) {
      mappedTranslations[key] = value;
    }
  });
  
  return mappedTranslations;
};

export const getLanguagePack = async (languageCode = 'en') => {
  try {
    const url = `${API_BASE_URL}/translations/language/${languageCode}`;
    const result = await apiCall(url);
    
    if (result && result.translations && typeof result.translations === 'object') {
      const mappedTranslations = mapApiKeysToFrontendKeys(result.translations, languageCode);
      return mappedTranslations;
    } else if (typeof result === 'object' && !result.translations) {
      return mapApiKeysToFrontendKeys(result, languageCode);
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    throw error;
  }
};

export const getAvailableLanguages = async () => {
  try {
    const url = `${API_BASE_URL}/translations/languages`;
    const result = await apiCall(url);
    
    if (result && result.languages && Array.isArray(result.languages)) {
      const languageCodes = result.languages.map(lang => lang.code);
      return languageCodes;
    } else if (Array.isArray(result)) {
      return result;
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    throw error;
  }
};

export const getTranslationsByCategory = async (category, languageCode = 'en') => {
  return await apiCall(`${API_BASE_URL}/translations/category/${category}?language=${languageCode}`);
};

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